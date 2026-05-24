package com.library.repository;

import com.library.entity.Book;
import com.library.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category ORDER BY b.borrowCount DESC")
    List<Book> findAllOrderByBorrowCountDesc();

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category WHERE b.category = :category ORDER BY b.borrowCount DESC")
    List<Book> findByCategoryOrderByBorrowCountDesc(@Param("category") Category category);

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category WHERE b.category = :category AND b.id <> :excludeId ORDER BY b.borrowCount DESC LIMIT 4")
    List<Book> findSimilar(@Param("category") Category category, @Param("excludeId") Long excludeId);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.category.id = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category WHERE b.id NOT IN :ids ORDER BY b.borrowCount DESC LIMIT 50")
    List<Book> findCandidatesExcluding(@Param("ids") List<Long> ids);

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.category ORDER BY b.borrowCount DESC LIMIT 50")
    List<Book> findTopByBorrowCount();
}
