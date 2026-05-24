package com.library.controller;

import com.library.dto.request.LoginRequest;
import com.library.dto.request.RegisterRequest;
import com.library.entity.Notification;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import com.library.security.AuthUser;
import com.library.security.JwtUtil;
import com.library.service.NotificationService;
import com.library.util.ResponseMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final ResponseMapper mapper;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                          NotificationService notificationService, ResponseMapper mapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
        this.mapper = mapper;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest req, HttpServletResponse res) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects"));
        }
        if (!user.getIsActive()) {
            return ResponseEntity.status(403).body(Map.of("error", "Compte désactivé"));
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects"));
        }
        String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getEmail(), user.getRole().getName());
        res.addCookie(jwtUtil.createAuthCookie(token));
        return ResponseEntity.ok(Map.of("user", mapper.userToPublicMap(user)));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req, HttpServletResponse res) {
        if (req.getName() == null || req.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tous les champs sont requis"));
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cet email est déjà utilisé"));
        }
        Role role = roleRepository.findByName("utilisateur")
                .orElseThrow(() -> new RuntimeException("Role not found"));
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getEmail(), user.getRole().getName());
        res.addCookie(jwtUtil.createAuthCookie(token));
        return ResponseEntity.status(201).body(Map.of("user", mapper.userToPublicMap(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse res) {
        res.addCookie(jwtUtil.createClearCookie());
        return ResponseEntity.ok(Map.of("message", "Déconnecté"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }
        User user = userRepository.findById(authUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));
        }
        long unread = notificationService.countUnread(user);
        return ResponseEntity.ok(Map.of("user", mapper.userToMeMap(user, unread)));
    }
}
