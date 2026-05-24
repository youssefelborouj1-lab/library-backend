package com.library.controller;

import com.library.dto.request.UpdateUserRequest;
import com.library.entity.*;
import com.library.repository.*;
import com.library.security.AuthUser;
import com.library.service.NotificationService;
import com.library.util.ResponseMapper;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;
    private final CopyRepository copyRepository;
    private final ReservationRepository reservationRepository;
    private final CategoryRepository categoryRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ResponseMapper mapper;

    public AdminController(UserRepository userRepository, BookRepository bookRepository,
                           BorrowRepository borrowRepository, CopyRepository copyRepository,
                           ReservationRepository reservationRepository,
                           CategoryRepository categoryRepository, RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder, ResponseMapper mapper) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.borrowRepository = borrowRepository;
        this.copyRepository = copyRepository;
        this.reservationRepository = reservationRepository;
        this.categoryRepository = categoryRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }

        long totalBooks = bookRepository.count();
        long totalUsers = userRepository.findAllUsers().size();
        long activeBorrows = borrowRepository.countActive();
        long overdueBorrows = borrowRepository.countOverdue();
        long activeReservations = reservationRepository.countAllActive();
        long availableCopies = copyRepository.countAllAvailable();
        long totalCopies = copyRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total_books", totalBooks);
        stats.put("total_users", totalUsers);
        stats.put("active_borrows", activeBorrows);
        stats.put("overdue_borrows", overdueBorrows);
        stats.put("active_reservations", activeReservations);
        stats.put("available_copies", availableCopies);
        stats.put("total_copies", totalCopies);

        List<Map<String, Object>> popularBooks = bookRepository.findAllOrderByBorrowCountDesc()
                .stream()
                .limit(5)
                .map(b -> {
                    long avail = copyRepository.countAvailableByBook(b);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", b.getId());
                    m.put("title", b.getTitle());
                    m.put("author", b.getAuthor());
                    m.put("cover_image", b.getCoverImage());
                    m.put("borrow_count", b.getBorrowCount());
                    m.put("category_name", b.getCategory() != null ? b.getCategory().getName() : null);
                    m.put("available_copies", avail);
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> overdueList = borrowRepository.findOverdueList().stream()
                .map(mapper::overdueToMap)
                .collect(Collectors.toList());

        List<Map<String, Object>> recentBorrows = borrowRepository.findRecentBorrows().stream()
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", b.getId());
                    m.put("title", b.getBook().getTitle());
                    m.put("author", b.getBook().getAuthor());
                    m.put("user_name", b.getUser().getName());
                    m.put("borrowed_at", b.getBorrowedAt());
                    m.put("due_date", b.getDueDate());
                    m.put("returned_at", b.getReturnedAt());
                    m.put("status", b.getStatus().name());
                    return m;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> categoryStats = categoryRepository.findAllOrderByName().stream()
                .map(c -> {
                    long bookCount = bookRepository.countByCategoryId(c.getId());
                    long totalBorrows = bookRepository.findByCategoryOrderByBorrowCountDesc(c)
                            .stream().mapToLong(Book::getBorrowCount).sum();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", c.getName());
                    m.put("book_count", bookCount);
                    m.put("total_borrows", totalBorrows);
                    return m;
                })
                .sorted((a, z) -> Long.compare((Long) z.get("total_borrows"), (Long) a.get("total_borrows")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "stats", stats,
                "popularBooks", popularBooks,
                "overdueList", overdueList,
                "recentBorrows", recentBorrows,
                "categoryStats", categoryStats
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }

        List<Map<String, Object>> users = userRepository.findAllWithRole().stream()
                .map(u -> {
                    long activeBorrows = borrowRepository.countByUserAndStatus(u, Borrow.BorrowStatus.active);
                    long overdueBorrows = borrowRepository.countByUserAndStatus(u, Borrow.BorrowStatus.overdue);
                    return mapper.adminUserToMap(u, activeBorrows, overdueBorrows);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("users", users));
    }

    @PutMapping("/users")
    @Transactional
    public ResponseEntity<?> updateUser(@RequestParam Long id,
                                         @RequestBody UpdateUserRequest req,
                                         @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isAdmin()) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Seul un admin peut modifier les utilisateurs"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));

        if (req.getRole() != null) {
            Role role = roleRepository.findByName(req.getRole()).orElse(null);
            if (role == null) return ResponseEntity.badRequest().body(Map.of("error", "Rôle invalide"));
            user.setRole(role);
        }

        if (req.getName() != null) user.setName(req.getName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getIs_active() != null) user.setIsActive(req.getIs_active());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Utilisateur mis à jour"));
    }

    @DeleteMapping("/users")
    @Transactional
    public ResponseEntity<?> deleteUser(@RequestParam Long id,
                                         @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isAdmin()) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Seul un admin peut supprimer des utilisateurs"));
        }
        if (id.equals(authUser.getId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Vous ne pouvez pas supprimer votre propre compte"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));

        long activeBorrows = borrowRepository.countByUserAndStatus(user, Borrow.BorrowStatus.active);
        if (activeBorrows > 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Impossible de supprimer un utilisateur avec des emprunts actifs"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé"));
    }
}
