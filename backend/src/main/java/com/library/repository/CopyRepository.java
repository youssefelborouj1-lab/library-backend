package com.library.repository;

import com.library.entity.Book;
import com.library.entity.Copy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CopyRepository extends JpaRepository<Copy, Long> {
    List<Copy> findByBookOrderByStatusAscCodeAsc(Book book);
    List<Copy> findByBookOrderByCodeAsc(Book book);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
    Optional<Copy> findByCode(String code);

    @Query("SELECT COUNT(c) FROM Copy c WHERE c.book = :book AND c.status = 'available'")
    long countAvailableByBook(@Param("book") Book book);

    @Query("SELECT COUNT(c) FROM Copy c WHERE c.book = :book")
    long countByBook(@Param("book") Book book);

    @Query("SELECT COUNT(c) FROM Copy c WHERE c.status = 'available'")
    long countAllAvailable();

    @Query("SELECT c FROM Copy c WHERE c.book = :book AND c.status = 'available' ORDER BY c.code LIMIT 1")
    Optional<Copy> findFirstAvailableByBook(@Param("book") Book book);

    @Query("SELECT c FROM Copy c WHERE c.book.id = :bookId AND c.status = 'available' ORDER BY c.code LIMIT 1")
    Optional<Copy> findFirstAvailableByBookId(@Param("bookId") Long bookId);
}
