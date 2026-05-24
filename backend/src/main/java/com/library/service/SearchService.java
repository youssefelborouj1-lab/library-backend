package com.library.service;

import com.library.entity.Book;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "le","la","les","de","du","des","un","une","et","ou","en",
        "au","aux","par","pour","sur","dans","avec","que","qui",
        "est","sont","ont","the","of","in","to","and","for",
        "an","is","it","at","be","as","was","we","our","their",
        "ce","cet","cette","ces","mon","ton","son","ma","ta","sa",
        "il","elle","ils","elles","on","nous","vous","je","tu",
        "se","si","ne","pas","plus","tres","bien","mais","car"
    ));

    public List<String> tokenize(String text) {
        if (text == null || text.isBlank()) return List.of();
        String normalized = Normalizer.normalize(text.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^a-z0-9\\s]", " ");
        return Arrays.stream(normalized.split("\\s+"))
                .filter(w -> w.length() > 2 && !STOP_WORDS.contains(w))
                .collect(Collectors.toList());
    }

    public double scoreBook(Book book, List<String> queryTokens, Long categoryId) {
        double score = 0;
        List<String> titleTokens = tokenize(book.getTitle());
        List<String> descTokens = tokenize(book.getDescription() != null ? book.getDescription() : "");
        List<String> authorTokens = tokenize(book.getAuthor() != null ? book.getAuthor() : "");

        for (String qt : queryTokens) {
            for (String tt : titleTokens) {
                if (tt.equals(qt)) { score += 5; break; }
                if (tt.contains(qt) || qt.contains(tt)) { score += 3; break; }
            }
            for (String dt : descTokens) {
                if (dt.equals(qt)) { score += 3; break; }
                if (dt.contains(qt) || qt.contains(dt)) { score += 1; break; }
            }
            for (String at : authorTokens) {
                if (at.equals(qt)) { score += 4; break; }
                if (at.contains(qt) || qt.contains(at)) { score += 2; break; }
            }
        }

        if (categoryId != null && book.getCategory() != null && book.getCategory().getId().equals(categoryId)) {
            score += 2;
        }

        score += Math.min(book.getBorrowCount() / 10.0, 5.0);
        return score;
    }

    public List<Book> searchBooks(List<Book> books, String rawQuery) {
        List<String> queryTokens = tokenize(rawQuery);
        if (queryTokens.isEmpty()) return books;

        Long categoryId = books.stream()
                .filter(b -> b.getCategory() != null &&
                        queryTokens.stream().anyMatch(t -> tokenize(b.getCategory().getName()).contains(t)))
                .map(b -> b.getCategory().getId())
                .findFirst()
                .orElse(null);

        return books.stream()
                .map(b -> Map.entry(b, scoreBook(b, queryTokens, categoryId)))
                .filter(e -> e.getValue() > 0)
                .sorted((a, z) -> Double.compare(z.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
