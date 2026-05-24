package com.library.repository;

import com.library.entity.Book;
import com.library.entity.Borrow;
import com.library.entity.Copy;
import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BorrowRepository extends JpaRepository<Borrow, Long> {

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book JOIN FETCH b.copy JOIN FETCH b.user ORDER BY b.borrowedAt DESC")
    List<Borrow> findAllWithDetails();

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book JOIN FETCH b.copy WHERE b.user = :user ORDER BY b.borrowedAt DESC")
    List<Borrow> findByUserWithDetails(@Param("user") User user);

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book JOIN FETCH b.copy JOIN FETCH b.user WHERE b.status = :status ORDER BY b.borrowedAt DESC")
    List<Borrow> findByStatusWithDetails(@Param("status") Borrow.BorrowStatus status);

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book JOIN FETCH b.copy JOIN FETCH b.user WHERE b.user = :user AND b.status = :status ORDER BY b.borrowedAt DESC")
    List<Borrow> findByUserAndStatus(@Param("user") User user, @Param("status") Borrow.BorrowStatus status);

    Optional<Borrow> findByIdAndStatusIn(Long id, List<Borrow.BorrowStatus> statuses);

    boolean existsByUserAndBookAndStatus(User user, Book book, Borrow.BorrowStatus status);

    boolean existsByCopyAndStatusIn(Copy copy, List<Borrow.BorrowStatus> statuses);

    @Query("SELECT COUNT(b) FROM Borrow b WHERE b.status = 'active'")
    long countActive();

    @Query("SELECT COUNT(b) FROM Borrow b WHERE b.status = 'overdue' OR (b.status = 'active' AND b.dueDate < CURRENT_DATE)")
    long countOverdue();

    @Query("SELECT COUNT(b) FROM Borrow b WHERE b.user = :user")
    long countByUser(@Param("user") User user);

    @Query("SELECT COUNT(b) FROM Borrow b WHERE b.user = :user AND b.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") Borrow.BorrowStatus status);

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book JOIN FETCH b.user ORDER BY b.borrowedAt DESC")
    List<Borrow> findRecentBorrows();

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book JOIN FETCH b.copy JOIN FETCH b.user WHERE b.status = 'overdue' OR (b.status = 'active' AND b.dueDate < CURRENT_DATE) ORDER BY b.dueDate ASC")
    List<Borrow> findOverdueList();

    @Query("SELECT b FROM Borrow b JOIN FETCH b.book WHERE b.user = :user ORDER BY b.borrowedAt DESC")
    List<Borrow> findRecentByUser(@Param("user") User user);
}