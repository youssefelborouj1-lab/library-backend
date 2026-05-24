package com.library.controller;

import com.library.dto.request.UpdateProfileRequest;
import com.library.entity.Book;
import com.library.entity.Notification;
import com.library.entity.User;
import com.library.repository.*;
import com.library.security.AuthUser;
import com.library.service.NotificationService;
import com.library.service.RecommendationService;
import com.library.util.ResponseMapper;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final BorrowRepository borrowRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;
    private final RecommendationService recommendationService;
    private final CopyRepository copyRepository;
    private final PasswordEncoder passwordEncoder;
    private final ResponseMapper mapper;

    public UserController(UserRepository userRepository, BorrowRepository borrowRepository,
                          ReservationRepository reservationRepository,
                          NotificationService notificationService,
                          RecommendationService recommendationService,
                          CopyRepository copyRepository,
                          PasswordEncoder passwordEncoder,
                          ResponseMapper mapper) {
        this.userRepository = userRepository;
        this.borrowRepository = borrowRepository;
        this.reservationRepository = reservationRepository;
        this.notificationService = notificationService;
        this.recommendationService = recommendationService;
        this.copyRepository = copyRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        User user = userRepository.findById(authUser.getId()).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));

        long totalBorrows = borrowRepository.countByUser(user);
        long activeBorrows = borrowRepository.countByUserAndStatus(user, com.library.entity.Borrow.BorrowStatus.active);
        long overdueBorrows = borrowRepository.countByUserAndStatus(user, com.library.entity.Borrow.BorrowStatus.overdue);
        long activeReservations = reservationRepository.countActiveByUser(user);

        Map<String, Object> stats = Map.of(
                "total_borrows", totalBorrows,
                "active_borrows", activeBorrows,
                "overdue_borrows", overdueBorrows,
                "active_reservations", activeReservations
        );

        return ResponseEntity.ok(Map.of(
                "profile", mapper.userToProfileMap(user),
                "stats", stats
        ));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest req,
                                            @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        if (req.getName() == null || req.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nom requis"));
        }

        User user = userRepository.findById(authUser.getId()).orElseThrow();

        if (req.getNew_password() != null && !req.getNew_password().isBlank()) {
            if (req.getCurrent_password() == null
                    || !passwordEncoder.matches(req.getCurrent_password(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Mot de passe actuel incorrect"));
            }
            user.setPassword(passwordEncoder.encode(req.getNew_password()));
        }

        user.setName(req.getName());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("user", mapper.userToPublicMap(user)));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        User user = userRepository.findById(authUser.getId()).orElseThrow();
        List<Map<String, Object>> notifications = notificationService.getForUser(user).stream()
                .map(mapper::notificationToMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("notifications", notifications));
    }

    @PutMapping("/notifications")
    @Transactional
    public ResponseEntity<?> markNotificationsRead(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        User user = userRepository.findById(authUser.getId()).orElseThrow();
        notificationService.markAllRead(user);
        return ResponseEntity.ok(Map.of("message", "Notifications marquées comme lues"));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        User user = userRepository.findById(authUser.getId()).orElseThrow();
        List<Book> recs = recommendationService.generate(user);

        List<Map<String, Object>> result = recs.stream()
                .map(b -> {
                    long avail = copyRepository.countAvailableByBook(b);
                    return mapper.bookToMapSimple(b, avail);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("recommendations", result));
    }
}
