package com.library.lms.librario.controller;

import com.library.lms.librario.model.Book;
import com.library.lms.librario.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Map;

@RestController
@RequestMapping("/api/librarian")
public class LibrarianController {
    // Example endpoint: add a book
    private final BookService bookService;
    public LibrarianController(BookService bookService){ this.bookService = bookService; }

    // Librarian or Admin can add a book (SecurityConfig already enforces role)
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    @PostMapping("/add-book")
    public ResponseEntity<?> addBook(@RequestBody Book book, Authentication authentication) {
        Book saved = bookService.save(book);
        return ResponseEntity.ok(Map.of(
                "message", "Book added successfully",
                "addedBy", authentication.getName(),
                "bookId", saved.getId()
        ));
    }

    // Return all books (for librarian dashboard)
    @GetMapping("/books")
    public ResponseEntity<?> listBooks() {
        return ResponseEntity.ok(bookService.listAll());
    }

    // Borrowed-books endpoint (dummy for now — replace with real logic later)
    @GetMapping("/borrowed-books")
    public ResponseEntity<?> borrowedBooks() {
        return ResponseEntity.ok(Map.of("message", "Borrowed books list (implement DB later)"));
    }
}
