package com.library.controller;

import com.library.dto.request.CategoryRequest;
import com.library.entity.Category;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.security.AuthUser;
import com.library.util.ResponseMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final ResponseMapper mapper;

    public CategoryController(CategoryRepository categoryRepository, BookRepository bookRepository,
                               ResponseMapper mapper) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<Map<String, Object>> categories = categoryRepository.findAllOrderByName().stream()
                .map(c -> {
                    long count = bookRepository.countByCategoryId(c.getId());
                    return mapper.categoryToMap(c, count);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("categories", categories));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid CategoryRequest req,
                                     @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (categoryRepository.existsByName(req.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Catégorie déjà existante"));
        }
        Category category = new Category();
        category.setName(req.getName());
        category.setDescription(req.getDescription());
        categoryRepository.save(category);
        return ResponseEntity.status(201).body(Map.of("category", mapper.categoryToMap(category, 0)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody @Valid CategoryRequest req,
                                     @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (categoryRepository.existsByNameAndIdNot(req.getName(), id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ce nom existe déjà"));
        }
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return ResponseEntity.status(404).body(Map.of("error", "Catégorie non trouvée"));

        category.setName(req.getName());
        category.setDescription(req.getDescription());
        categoryRepository.save(category);
        long count = bookRepository.countByCategoryId(id);
        return ResponseEntity.ok(Map.of("category", mapper.categoryToMap(category, count)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        long bookCount = bookRepository.countByCategoryId(id);
        if (bookCount > 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Impossible de supprimer une catégorie contenant des livres"));
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Catégorie supprimée"));
    }
}
