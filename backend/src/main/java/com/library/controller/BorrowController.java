package com.library.controller;

import com.library.dto.request.CreateBorrowRequest;
import com.library.entity.*;
import com.library.repository.*;
import com.library.security.AuthUser;
import com.library.service.NotificationService;
import com.library.util.ResponseMapper;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    private final BorrowRepository borrowRepository;
    private final CopyRepository copyRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;
    private final ResponseMapper mapper;

    public BorrowController(BorrowRepository borrowRepository, CopyRepository copyRepository,
            BookRepository bookRepository, UserRepository userRepository,
            ReservationRepository reservationRepository,
            NotificationService notificationService, ResponseMapper mapper) {
        this.borrowRepository = borrowRepository;
        this.copyRepository = copyRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String status,
            @RequestParam(required = false) Long user_id,
            @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null)
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        List<Borrow> borrows;
        if (authUser.isStaff()) {
            if (status != null && !status.isBlank()) {
                try {
                    Borrow.BorrowStatus s = Borrow.BorrowStatus.valueOf(status);
                    borrows = borrowRepository.findByStatusWithDetails(s);
                } catch (IllegalArgumentException e) {
                    borrows = borrowRepository.findAllWithDetails();
                }
            } else if (user_id != null) {
                User user = userRepository.findById(user_id).orElse(null);
                borrows = user != null ? borrowRepository.findByUserWithDetails(user) : List.of();
            } else {
                borrows = borrowRepository.findAllWithDetails();
            }
            List<Map<String, Object>> result = borrows.stream()
                    .map(b -> mapper.borrowToMap(b, true))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("borrows", result));
        } else {
            User user = userRepository.findById(authUser.getId()).orElseThrow();
            borrows = borrowRepository.findByUserWithDetails(user);
            List<Map<String, Object>> result = borrows.stream()
                    .map(b -> mapper.borrowToMap(b, false))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("borrows", result));
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody @Valid CreateBorrowRequest req,
            @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null)
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        if (!authUser.isStaff())
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));

        if (req.getUser_id() == null || req.getCopy_id() == null || req.getDue_date() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "user_id, copy_id et due_date requis"));
        }

        Copy copy = copyRepository.findById(req.getCopy_id()).orElse(null);
        if (copy == null || copy.getStatus() != Copy.CopyStatus.available) {
            return ResponseEntity.badRequest().body(Map.of("error", "Exemplaire non disponible"));
        }

        User user = userRepository.findById(req.getUser_id()).orElse(null);
        if (user == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Utilisateur non trouvé"));

        boolean alreadyBorrowed = borrowRepository.existsByUserAndBookAndStatus(
                user, copy.getBook(), Borrow.BorrowStatus.active);
        if (alreadyBorrowed) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cet utilisateur a déjà emprunté ce livre"));
        }

        Borrow borrow = new Borrow();
        borrow.setUser(user);
        borrow.setCopy(copy);
        borrow.setBook(copy.getBook());
        borrow.setDueDate(req.getDue_date());
        borrow.setStatus(Borrow.BorrowStatus.active);
        borrowRepository.save(borrow);

        copy.setStatus(Copy.CopyStatus.borrowed);
        copyRepository.save(copy);

        Book book = copy.getBook();
        book.setBorrowCount(book.getBorrowCount() + 1);
        bookRepository.save(book);

        reservationRepository.markAsDoneByUserAndBook(user, copy.getBook());

        notificationService.create(user, "Emprunt enregistré",
                "Votre emprunt a été enregistré. Retour prévu le " + req.getDue_date() + ".",
                Notification.NotifType.info);

        return ResponseEntity.status(201).body(Map.of("borrow", mapper.borrowToMap(borrow, false)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> returnBorrow(@PathVariable Long id,
            @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }

        Borrow borrow = borrowRepository.findByIdAndStatusIn(id,
                List.of(Borrow.BorrowStatus.active, Borrow.BorrowStatus.overdue)).orElse(null);
        if (borrow == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Emprunt non trouvé ou déjà retourné"));
        }

        LocalDate now = LocalDate.now();
        LocalDate dueDate = borrow.getDueDate();
        double fine = 0;
        if (now.isAfter(dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(dueDate, now);
            fine = daysLate * 0.5;
        }

        borrow.setReturnedAt(LocalDateTime.now());
        borrow.setStatus(Borrow.BorrowStatus.returned);
        borrow.setFineAmount(BigDecimal.valueOf(fine).setScale(2, RoundingMode.HALF_UP));
        borrowRepository.save(borrow);

        Copy copy = borrow.getCopy();
        copy.setStatus(Copy.CopyStatus.available);
        copyRepository.save(copy);

        Reservation pending = reservationRepository.findFirstPendingByBook(borrow.getBook()).orElse(null);
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println("----------------------------------- pending");
        System.out.println(pending);
        
        if (pending != null) {
            copy.setStatus(Copy.CopyStatus.reserved);
            copyRepository.save(copy);

            pending.setStatus(Reservation.ReservationStatus.confirmed);
            pending.setCopy(copy);
            pending.setExpiresAt(LocalDateTime.now().plusDays(3));
            pending.setNotified(true);
            reservationRepository.save(pending);
            System.out.println("------------------- pending.getUser()");
            System.out.println("------------------- pending.getUser()");
            System.out.println("------------------- pending.getUser()");
            System.out.println("------------------- pending.getUser()");
            System.out.println(pending.getUser());

            notificationService.create(pending.getUser(), "Livre disponible",
                    "Le livre que vous avez réservé est maintenant disponible. Venez le récupérer dans 3 jours.",
                    Notification.NotifType.success);
        }

        if (fine > 0) {
            notificationService.create(borrow.getUser(), "Retard de retour",
                    String.format("Votre retour est en retard. Une amende de %.2f € a été appliquée.", fine),
                    Notification.NotifType.warning);
        }

        return ResponseEntity.ok(Map.of("message", "Retour enregistré", "fine", fine));
    }
}
