package com.library.controller;

import com.library.dto.request.CreateReservationRequest;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ResponseMapper mapper;
    private final CopyRepository copyRepository;

    public ReservationController(ReservationRepository reservationRepository,
            BookRepository bookRepository,
            BorrowRepository borrowRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ResponseMapper mapper,
            CopyRepository copyRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.borrowRepository = borrowRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mapper = mapper;
        this.copyRepository = copyRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null)
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        List<Map<String, Object>> result;
        if (authUser.isStaff()) {
            result = reservationRepository.findAllWithDetails().stream()
                    .map(r -> mapper.reservationToMap(r, true))
                    .collect(Collectors.toList());
        } else {
            User user = userRepository.findById(authUser.getId()).orElseThrow();
            result = reservationRepository.findByUserWithDetails(user).stream()
                    .map(r -> mapper.reservationToMap(r, false))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(Map.of("reservations", result));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody @Valid CreateReservationRequest req,
            @AuthenticationPrincipal AuthUser authUser) {

        if (authUser == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Non authentifié"));
        }

        User user = userRepository.findById(authUser.getId()).orElseThrow();

        Book book = bookRepository.findById(req.getBook_id()).orElse(null);

        if (book == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Livre non trouvé"));
        }

        boolean hasAvailableCopy = copyRepository
                .findFirstAvailableByBook(book)
                .isPresent();

        if (hasAvailableCopy) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Ce livre est disponible. Veuillez l'emprunter directement à la bibliothèque."));
        }

        boolean alreadyReserved = reservationRepository.findByUserAndBookAndStatusIn(
                user,
                book,
                List.of(
                        Reservation.ReservationStatus.pending,
                        Reservation.ReservationStatus.confirmed))
                .isPresent();

        if (alreadyReserved) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Vous avez déjà une réservation pour ce livre"));
        }

        boolean alreadyBorrowed = borrowRepository.existsByUserAndBookAndStatus(
                user,
                book,
                Borrow.BorrowStatus.active);

        if (alreadyBorrowed) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Vous avez déjà emprunté ce livre"));
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setStatus(Reservation.ReservationStatus.confirmed);
        reservation.setExpiresAt(LocalDateTime.now().plusDays(7));

        reservationRepository.save(reservation);

        notificationService.create(
                user,
                "Réservation créée",
                "Votre réservation a été enregistrée. Vous serez notifié dès qu'un exemplaire sera disponible.",
                Notification.NotifType.info);

        return ResponseEntity.status(201)
                .body(Map.of("reservation", mapper.reservationToMap(reservation, false)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> cancel(@PathVariable Long id,
            @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null)
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        Reservation reservation = reservationRepository.findById(id).orElse(null);
        if (reservation == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Réservation non trouvée"));
        }

        boolean isOwner = reservation.getUser().getId().equals(authUser.getId());
        if (!isOwner && !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }

        if (reservation.getCopy() != null
                && reservation.getStatus() == Reservation.ReservationStatus.confirmed) {
            Copy copy = reservation.getCopy();
            copy.setStatus(Copy.CopyStatus.available);
        }

        reservation.setStatus(Reservation.ReservationStatus.cancelled);
        reservationRepository.save(reservation);
        return ResponseEntity.ok(Map.of("message", "Réservation annulée"));
    }
}
