package com.library.lms.librario.repository;


import com.library.lms.librario.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    Optional<Book> findByIsbn(String isbn);
    // Simple search (title or author only)
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);

    // ✅ Advanced search: (title OR author) AND genre AND publisher
    @Query("SELECT b FROM Book b " +
            "WHERE (:title IS NULL OR :title = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "   OR LOWER(b.author) LIKE LOWER(CONCAT('%', :title, '%'))) " +
            "AND (:genre IS NULL OR :genre = '' OR LOWER(b.genre) LIKE LOWER(CONCAT('%', :genre, '%'))) " +
            "AND (:publisher IS NULL OR :publisher = '' OR LOWER(b.publisher) LIKE LOWER(CONCAT('%', :publisher, '%')))")
    List<Book> searchAdvanced(
            @Param("title") String title,
            @Param("genre") String genre,
            @Param("publisher") String publisher);

    @Query("SELECT COALESCE(SUM(b.availableCopies), 0) FROM Book b")
    Long sumAvailableCopies();
}

