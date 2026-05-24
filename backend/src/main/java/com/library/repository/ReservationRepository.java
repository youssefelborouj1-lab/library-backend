package com.library.repository;

import com.library.entity.Book;
import com.library.entity.Reservation;
import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

        @Query("SELECT r FROM Reservation r JOIN FETCH r.book JOIN FETCH r.user LEFT JOIN FETCH r.copy ORDER BY r.reservedAt DESC")
        List<Reservation> findAllWithDetails();

        @Query("SELECT r FROM Reservation r JOIN FETCH r.book LEFT JOIN FETCH r.copy WHERE r.user = :user ORDER BY r.reservedAt DESC")
        List<Reservation> findByUserWithDetails(@Param("user") User user);

        Optional<Reservation> findByUserAndBookAndStatusIn(User user, Book book,
                        List<Reservation.ReservationStatus> statuses);

        @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user = :user AND r.status IN ('pending', 'confirmed')")
        long countActiveByUser(@Param("user") User user);

        @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status IN ('pending', 'confirmed')")
        long countAllActive();

        @Query("SELECT r FROM Reservation r JOIN FETCH r.user LEFT JOIN FETCH r.copy WHERE r.book = :book AND r.status = 'confirmed' ORDER BY r.reservedAt ASC LIMIT 1")
        Optional<Reservation> findFirstPendingByBook(@Param("book") Book book);

        @Modifying
        @Query("""
                            UPDATE Reservation r
                            SET r.status = 'done'
                            WHERE r.user = :user
                              AND r.book = :book
                              AND r.status = 'confirmed'
                        """)
        int markAsDoneByUserAndBook(@Param("user") User user,
                        @Param("book") Book book);
}