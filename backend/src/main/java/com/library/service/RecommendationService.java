package com.library.service;

import com.library.entity.Book;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.CopyRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final BorrowRepository borrowRepository;
    private final BookRepository bookRepository;
    private final CopyRepository copyRepository;
    private final SearchService searchService;

    public RecommendationService(BorrowRepository borrowRepository,
                                  BookRepository bookRepository,
                                  CopyRepository copyRepository,
                                  SearchService searchService) {
        this.borrowRepository = borrowRepository;
        this.bookRepository = bookRepository;
        this.copyRepository = copyRepository;
        this.searchService = searchService;
    }

    public List<Book> generate(User user) {
        List<Book> borrowedBooks = borrowRepository.findRecentByUser(user)
                .stream().map(b -> b.getBook()).collect(Collectors.toList());

        if (borrowedBooks.isEmpty()) {
            return bookRepository.findTopByBorrowCount();
        }

        List<Long> borrowedIds = borrowedBooks.stream().map(Book::getId).distinct().collect(Collectors.toList());
        Set<Long> categoryIds = borrowedBooks.stream()
                .filter(b -> b.getCategory() != null)
                .map(b -> b.getCategory().getId())
                .collect(Collectors.toSet());

        Set<String> keywords = new HashSet<>();
        borrowedBooks.stream().limit(5).forEach(b -> {
            keywords.addAll(searchService.tokenize(b.getTitle()));
            if (b.getDescription() != null) {
                keywords.addAll(searchService.tokenize(b.getDescription()));
            }
        });

        List<Book> candidates = bookRepository.findCandidatesExcluding(
                borrowedIds.isEmpty() ? List.of(0L) : borrowedIds
        );

        return candidates.stream()
                .map(book -> {
                    double score = 0;
                    if (book.getCategory() != null && categoryIds.contains(book.getCategory().getId())) score += 5;
                    score += Math.min(book.getBorrowCount() / 10.0, 3.0);
                    List<String> bookTokens = new ArrayList<>();
                    bookTokens.addAll(searchService.tokenize(book.getTitle()));
                    if (book.getDescription() != null) bookTokens.addAll(searchService.tokenize(book.getDescription()));
                    for (String kw : keywords) {
                        if (bookTokens.contains(kw)) score += 1;
                    }
                    return Map.entry(book, score);
                })
                .filter(e -> e.getValue() > 0)
                .sorted((a, z) -> Double.compare(z.getValue(), a.getValue()))
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
