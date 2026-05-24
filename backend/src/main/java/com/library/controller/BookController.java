package com.library.controller;

import com.library.entity.Book;
import com.library.entity.Category;
import com.library.entity.Copy;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.CopyRepository;
import com.library.security.AuthUser;
import com.library.service.FileStorageService;
import com.library.service.SearchService;
import com.library.util.ResponseMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final CopyRepository copyRepository;
    private final SearchService searchService;
    private final FileStorageService fileStorageService;
    private final ResponseMapper mapper;

    public BookController(BookRepository bookRepository, CategoryRepository categoryRepository,
                          CopyRepository copyRepository, SearchService searchService,
                          FileStorageService fileStorageService, ResponseMapper mapper) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.copyRepository = copyRepository;
        this.searchService = searchService;
        this.fileStorageService = fileStorageService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "popular") String sort) {

        List<Book> books;
        if (category != null) {
            Category cat = categoryRepository.findById(category).orElse(null);
            books = cat != null ? bookRepository.findByCategoryOrderByBorrowCountDesc(cat)
                                : bookRepository.findAllOrderByBorrowCountDesc();
        } else {
            books = bookRepository.findAllOrderByBorrowCountDesc();
        }

        List<Book> result;
        if (search != null && !search.isBlank()) {
            result = searchService.searchBooks(books, search);
        } else if ("recent".equals(sort)) {
            result = books.stream()
                    .sorted(Comparator.comparing(Book::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .collect(Collectors.toList());
        } else if ("alpha".equals(sort)) {
            result = books.stream()
                    .sorted(Comparator.comparing(Book::getTitle, String.CASE_INSENSITIVE_ORDER))
                    .collect(Collectors.toList());
        } else {
            result = books;
        }

        int total = result.size();
        int offset = (page - 1) * limit;
        List<Book> paginated = result.stream().skip(offset).limit(limit).collect(Collectors.toList());

        List<Map<String, Object>> bookMaps = paginated.stream()
                .map(b -> {
                    long avail = copyRepository.countAvailableByBook(b);
                    long tot = copyRepository.countByBook(b);
                    return mapper.bookToMap(b, avail, tot);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "books", bookMaps,
                "total", total,
                "page", page,
                "limit", limit
        ));
    }

    @PostMapping(consumes = {"multipart/form-data", "application/json", "application/x-www-form-urlencoded"})
    public ResponseEntity<?> create(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) Long category_id,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String publisher,
            @RequestParam(required = false) Integer published_year,
            @RequestParam(required = false) Integer pages,
            @RequestParam(required = false, defaultValue = "Français") String language,
            @RequestParam(required = false) MultipartFile cover_image) {

        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (title == null || title.isBlank() || author == null || author.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Titre et auteur requis"));
        }

        String coverPath = null;
        try {
            coverPath = fileStorageService.store(cover_image);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn != null && !isbn.isBlank() ? isbn : null);
        book.setDescription(description);
        book.setCoverImage(coverPath);
        book.setPublisher(publisher);
        book.setPublishedYear(published_year);
        book.setPages(pages);
        book.setLanguage(language != null ? language : "Français");
        book.setBorrowCount(0);

        if (category_id != null) {
            categoryRepository.findById(category_id).ifPresent(book::setCategory);
        }

        bookRepository.save(book);
        return ResponseEntity.status(201).body(Map.of("book", mapper.bookToMap(book, 0L, 0L)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.status(404).body(Map.of("error", "Livre non trouvé"));

        long avail = copyRepository.countAvailableByBook(book);
        long total = copyRepository.countByBook(book);

        List<Copy> copies = copyRepository.findByBookOrderByStatusAscCodeAsc(book);
        List<Map<String, Object>> copyMaps = copies.stream().map(mapper::copyToMap).collect(Collectors.toList());

        List<Map<String, Object>> similar = List.of();
        if (book.getCategory() != null) {
            similar = bookRepository.findSimilar(book.getCategory(), book.getId()).stream()
                    .map(b -> {
                        long a = copyRepository.countAvailableByBook(b);
                        return mapper.bookToMapSimple(b, a);
                    })
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(Map.of(
                "book", mapper.bookToMap(book, avail, total),
                "copies", copyMaps,
                "similar", similar
        ));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data", "application/json", "application/x-www-form-urlencoded"})
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) Long category_id,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String publisher,
            @RequestParam(required = false) Integer published_year,
            @RequestParam(required = false) Integer pages,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) MultipartFile cover_image) {

        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        if (title == null || title.isBlank() || author == null || author.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Titre et auteur requis"));
        }

        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.status(404).body(Map.of("error", "Livre non trouvé"));

        if (cover_image != null && !cover_image.isEmpty()) {
            fileStorageService.delete(book.getCoverImage());
            try {
                book.setCoverImage(fileStorageService.store(cover_image));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }

        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn != null && !isbn.isBlank() ? isbn : null);
        book.setDescription(description);
        book.setPublisher(publisher);
        book.setPublishedYear(published_year);
        book.setPages(pages);
        book.setLanguage(language != null ? language : "Français");
        book.setCategory(null);
        if (category_id != null) {
            categoryRepository.findById(category_id).ifPresent(book::setCategory);
        }

        bookRepository.save(book);
        long avail = copyRepository.countAvailableByBook(book);
        long total = copyRepository.countByBook(book);
        return ResponseEntity.ok(Map.of("book", mapper.bookToMap(book, avail, total)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null || !authUser.isStaff()) {
            return ResponseEntity.status(403).body(Map.of("error", "Accès refusé"));
        }
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) return ResponseEntity.status(404).body(Map.of("error", "Livre non trouvé"));

        List<Copy> copies = copyRepository.findByBookOrderByCodeAsc(book);
        boolean anyBorrowed = copies.stream().anyMatch(c -> c.getStatus() == Copy.CopyStatus.borrowed);
        if (anyBorrowed) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Impossible de supprimer un livre avec des emprunts actifs"));
        }

        fileStorageService.delete(book.getCoverImage());
        bookRepository.delete(book);
        return ResponseEntity.ok(Map.of("message", "Livre supprimé"));
    }
}
