package com.library.util;

import com.library.entity.*;
import com.library.repository.BorrowRepository;
import com.library.repository.CopyRepository;
import com.library.repository.ReservationRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Component
public class ResponseMapper {

    private final CopyRepository copyRepository;
    private final BorrowRepository borrowRepository;
    private final ReservationRepository reservationRepository;

    public ResponseMapper(CopyRepository copyRepository,
                          BorrowRepository borrowRepository,
                          ReservationRepository reservationRepository) {
        this.copyRepository = copyRepository;
        this.borrowRepository = borrowRepository;
        this.reservationRepository = reservationRepository;
    }

    public Map<String, Object> bookToMap(Book book) {
        long availableCopies = copyRepository.countAvailableByBook(book);
        long totalCopies = copyRepository.countByBook(book);
        return bookToMap(book, availableCopies, totalCopies);
    }

    public Map<String, Object> bookToMap(Book book, long availableCopies, long totalCopies) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", book.getId());
        m.put("title", book.getTitle());
        m.put("author", book.getAuthor());
        m.put("isbn", book.getIsbn());
        m.put("category_id", book.getCategory() != null ? book.getCategory().getId() : null);
        m.put("category_name", book.getCategory() != null ? book.getCategory().getName() : null);
        m.put("description", book.getDescription());
        m.put("cover_image", book.getCoverImage());
        m.put("publisher", book.getPublisher());
        m.put("published_year", book.getPublishedYear());
        m.put("pages", book.getPages());
        m.put("language", book.getLanguage());
        m.put("borrow_count", book.getBorrowCount());
        m.put("available_copies", availableCopies);
        m.put("total_copies", totalCopies);
        m.put("created_at", book.getCreatedAt());
        m.put("updated_at", book.getUpdatedAt());
        return m;
    }

    public Map<String, Object> bookToMapSimple(Book book, long availableCopies) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", book.getId());
        m.put("title", book.getTitle());
        m.put("author", book.getAuthor());
        m.put("isbn", book.getIsbn());
        m.put("category_id", book.getCategory() != null ? book.getCategory().getId() : null);
        m.put("category_name", book.getCategory() != null ? book.getCategory().getName() : null);
        m.put("description", book.getDescription());
        m.put("cover_image", book.getCoverImage());
        m.put("publisher", book.getPublisher());
        m.put("published_year", book.getPublishedYear());
        m.put("pages", book.getPages());
        m.put("language", book.getLanguage());
        m.put("borrow_count", book.getBorrowCount());
        m.put("available_copies", availableCopies);
        m.put("created_at", book.getCreatedAt());
        m.put("updated_at", book.getUpdatedAt());
        return m;
    }

    public Map<String, Object> copyToMap(Copy copy) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", copy.getId());
        m.put("book_id", copy.getBook().getId());
        m.put("code", copy.getCode());
        m.put("status", copy.getStatus().name());
        m.put("location", copy.getLocation());
        m.put("created_at", copy.getCreatedAt());
        return m;
    }

    public Map<String, Object> userToPublicMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", user.getId());
        m.put("name", user.getName());
        m.put("email", user.getEmail());
        m.put("role", user.getRole().getName());
        return m;
    }

    public Map<String, Object> userToProfileMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", user.getId());
        m.put("name", user.getName());
        m.put("email", user.getEmail());
        m.put("phone", user.getPhone());
        m.put("address", user.getAddress());
        m.put("avatar", user.getAvatar());
        m.put("is_active", user.getIsActive());
        m.put("created_at", user.getCreatedAt());
        m.put("role", user.getRole().getName());
        return m;
    }

    public Map<String, Object> userToMeMap(User user, long unreadCount) {
        Map<String, Object> m = userToProfileMap(user);
        m.put("unread_notifications", unreadCount);
        return m;
    }

    public Map<String, Object> borrowToMap(Borrow borrow, boolean includeUser) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", borrow.getId());
        m.put("user_id", borrow.getUser().getId());
        m.put("copy_id", borrow.getCopy().getId());
        m.put("book_id", borrow.getBook().getId());
        m.put("title", borrow.getBook().getTitle());
        m.put("author", borrow.getBook().getAuthor());
        m.put("cover_image", borrow.getBook().getCoverImage());
        m.put("copy_code", borrow.getCopy().getCode());
        m.put("borrowed_at", borrow.getBorrowedAt());
        m.put("due_date", borrow.getDueDate());
        m.put("returned_at", borrow.getReturnedAt());
        m.put("status", borrow.getStatus().name());
        m.put("fine_amount", borrow.getFineAmount());
        m.put("notes", borrow.getNotes());
        if (includeUser) {
            m.put("user_name", borrow.getUser().getName());
            m.put("user_email", borrow.getUser().getEmail());
        }
        return m;
    }

    public Map<String, Object> reservationToMap(Reservation r, boolean includeUser) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("user_id", r.getUser().getId());
        m.put("book_id", r.getBook().getId());
        m.put("copy_id", r.getCopy() != null ? r.getCopy().getId() : null);
        m.put("title", r.getBook().getTitle());
        m.put("author", r.getBook().getAuthor());
        m.put("cover_image", r.getBook().getCoverImage());
        m.put("copy_code", r.getCopy() != null ? r.getCopy().getCode() : null);
        m.put("status", r.getStatus().name());
        m.put("reserved_at", r.getReservedAt());
        m.put("expires_at", r.getExpiresAt());
        m.put("notified", r.getNotified());
        if (includeUser) {
            m.put("user_name", r.getUser().getName());
            m.put("user_email", r.getUser().getEmail());
        }
        return m;
    }

    public Map<String, Object> notificationToMap(Notification n) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", n.getId());
        m.put("user_id", n.getUser().getId());
        m.put("title", n.getTitle());
        m.put("message", n.getMessage());
        m.put("type", n.getType().name());
        m.put("is_read", n.getIsRead());
        m.put("created_at", n.getCreatedAt());
        return m;
    }

    public Map<String, Object> categoryToMap(Category c, long bookCount) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("description", c.getDescription());
        m.put("created_at", c.getCreatedAt());
        m.put("book_count", bookCount);
        return m;
    }

    public Map<String, Object> overdueToMap(Borrow borrow) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", borrow.getId());
        m.put("due_date", borrow.getDueDate());
        m.put("borrowed_at", borrow.getBorrowedAt());
        m.put("user_name", borrow.getUser().getName());
        m.put("user_email", borrow.getUser().getEmail());
        m.put("title", borrow.getBook().getTitle());
        m.put("author", borrow.getBook().getAuthor());
        m.put("copy_code", borrow.getCopy().getCode());
        long daysLate = ChronoUnit.DAYS.between(borrow.getDueDate(), LocalDate.now());
        m.put("days_late", Math.max(0, daysLate));
        return m;
    }

    public Map<String, Object> adminUserToMap(User user, long activeBorrows, long overdueBorrows) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", user.getId());
        m.put("name", user.getName());
        m.put("email", user.getEmail());
        m.put("phone", user.getPhone());
        m.put("is_active", user.getIsActive());
        m.put("created_at", user.getCreatedAt());
        m.put("role", user.getRole().getName());
        m.put("active_borrows", activeBorrows);
        m.put("overdue_borrows", overdueBorrows);
        return m;
    }
}
