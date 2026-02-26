package com.library.lms.librario.controller;

import com.library.lms.librario.dto.BookAvailability;
import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService service;

    // --- List all books ---
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
    public List<Book> getAll() {
        return service.listAll();
    }

    // --- Add a book ---
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Book add(@RequestBody @Valid Book b) {
        return service.addBook(b);
    }

    // --- Update a book ---
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Book update(@PathVariable Long id, @RequestBody @Valid Book b) {
        return service.update(id, b);
    }

    // --- Delete a book ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // --- Search books by title or author ---
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
    public List<Book> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String publisher) {
        return service.searchBooks(title, author, genre, publisher);
    }

    // --- Get total count of books ---
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public long getBookCount() {
        return service.countBooks();
    }

    // --- Check low-stock books (admin) ---
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<Book> lowStockBooks(@RequestParam(defaultValue = "3") int threshold) {
        return service.listAll().stream()
                .filter(b -> b.getAvailableCopies() <= threshold)
                .toList();
    }

    @PutMapping("/{id}/condition")
    public Book updateBookCondition(
            @PathVariable Long id,
            @RequestParam BookCondition condition) {
        return service.reportCondition(id, condition);
    }

    // --- Get total and available books ---
    @GetMapping("/availability")
    public BookAvailability getAvailability() {
        return service.getBookAvailability();
    }

}
