package com.library.controller;

import com.library.dto.request.CopyRequest;
import com.library.entity.Book;
import com.library.entity.Copy;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.CopyRepository;
import com.library.security.AuthUser;
import com.library.util.ResponseMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/copies")
public class CopyController {

    private final CopyRepository copyRepository;
    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;
    private final ResponseMapper mapper;

    public CopyController(CopyRepository copyRepository, BookRepository bookRepository,
                          BorrowRepository borrowRepository, ResponseMapper mapper) {
        this.copyRepository = copyRepository;
        this.bookRepository = bookRepository;
        this.borrowRepository = borrowRepository;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) Long book_id,
                                   @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (book_id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "book_id requis"));
        }
        Book book = bookRepository.findById(book_id).orElse(null);
        if (book == null) return ResponseEntity.status(404).body(Map.of("error", "Livre non trouvé"));

        List<Map<String, Object>> copies = copyRepository.findByBookOrderByCodeAsc(book)
                .stream().map(mapper::copyToMap).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("copies", copies));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CopyRequest req,
                                     @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (req.getBook_id() == null || req.getCode() == null || req.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "book_id et code requis"));
        }
        if (copyRepository.existsByCode(req.getCode())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ce code exemplaire existe déjà"));
        }
        Book book = bookRepository.findById(req.getBook_id()).orElse(null);
        if (book == null) return ResponseEntity.status(404).body(Map.of("error", "Livre non trouvé"));

        Copy copy = new Copy();
        copy.setBook(book);
        copy.setCode(req.getCode());
        copy.setLocation(req.getLocation());
        copy.setStatus(Copy.CopyStatus.available);
        copyRepository.save(copy);
        return ResponseEntity.status(201).body(Map.of("copy", mapper.copyToMap(copy)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CopyRequest req,
                                     @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (req.getCode() == null || req.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code requis"));
        }
        if (copyRepository.existsByCodeAndIdNot(req.getCode(), id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ce code existe déjà"));
        }
        Copy copy = copyRepository.findById(id).orElse(null);
        if (copy == null) return ResponseEntity.status(404).body(Map.of("error", "Exemplaire non trouvé"));

        copy.setCode(req.getCode());
        copy.setLocation(req.getLocation());
        if (req.getStatus() != null) {
            try {
                copy.setStatus(Copy.CopyStatus.valueOf(req.getStatus()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide"));
            }
        }
        copyRepository.save(copy);
        return ResponseEntity.ok(Map.of("copy", mapper.copyToMap(copy)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        Copy copy = copyRepository.findById(id).orElse(null);
        if (copy == null) return ResponseEntity.status(404).body(Map.of("error", "Exemplaire non trouvé"));

        boolean activeBorrow = borrowRepository.existsByCopyAndStatusIn(
                copy, List.of(com.library.entity.Borrow.BorrowStatus.active));
        if (activeBorrow) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Impossible de supprimer un exemplaire emprunté"));
        }
        copyRepository.delete(copy);
        return ResponseEntity.ok(Map.of("message", "Exemplaire supprimé"));
    }
}
