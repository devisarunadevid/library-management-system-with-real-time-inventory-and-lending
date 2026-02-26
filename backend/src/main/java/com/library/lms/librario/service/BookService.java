package com.library.lms.librario.service;

import com.library.lms.librario.dto.BookAvailability;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.entity.enums.NotificationType;
import com.library.lms.librario.repository.BookRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;
    private final NotificationService notificationService;

    public BookService(BookRepository bookRepository,
                       NotificationService notificationService) {
        this.bookRepository = bookRepository;
        this.notificationService = notificationService;
    }

    // ----------------------------
    // CRUD operations
    // ----------------------------
    public Book addBook(Book book) {
        validateCopies(book);
        return bookRepository.save(book);
    }

    public List<Book> listAll() {
        return bookRepository.findAll();
    }

    public Book getById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with id " + id));
    }

    public Book update(Long id, Book book) {
        Book existing = getById(id);

        existing.setTitle(book.getTitle());
        existing.setAuthor(book.getAuthor());
        existing.setGenre(book.getGenre());
        existing.setPublisher(book.getPublisher());
        existing.setYear(book.getYear());
        existing.setIsbn(book.getIsbn());
        existing.setShelf(book.getShelf());
        existing.setTotalCopies(book.getTotalCopies());
        existing.setAvailableCopies(book.getAvailableCopies());
        existing.setCondition(book.getCondition());
        existing.setImageUrl(book.getImageUrl());

        validateCopies(existing);
        return bookRepository.save(existing);
    }

    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    public Book save(Book book) {
        validateCopies(book);
        return bookRepository.save(book);
    }

    // ----------------------------
    // Condition reporting
    // ----------------------------
    public Book reportCondition(Long bookId, BookCondition condition) {
        Book book = getById(bookId);
        book.setCondition(condition);
        Book saved = bookRepository.save(book);

        if (condition == BookCondition.BAD || condition == BookCondition.NEEDS_REPAIR) {
            String messageHtml = "<p>Book '<b>" + book.getTitle() +
                    "</b>' reported with condition: <b>" + condition.name() + "</b>.</p>";

            // Notify admin
            notificationService.createForAdmin(messageHtml);
        }

        return saved;
    }

    public Book reportCondition(Long bookId, Long userId, BookCondition condition) {
        Book book = getById(bookId);
        book.setCondition(condition);
        Book saved = bookRepository.save(book);

        if (condition == BookCondition.BAD || condition == BookCondition.NEEDS_REPAIR) {
            String adminMessage = "<p>Book '<b>" + book.getTitle() +
                    "</b>' reported with condition: <b>" + condition.name() + "</b>.</p>";

            notificationService.createForAdmin(adminMessage);

            if (userId != null) {
                String userMessage = "<p>Thank you for reporting. Book '<b>" + book.getTitle() +
                        "</b>' condition updated to: <b>" + condition.name() + "</b>.</p>";

                notificationService.createUser(userId, userMessage, NotificationType.GENERAL);
            }
        }

        return saved;
    }

    // ----------------------------
    // Utility
    // ----------------------------
    public boolean isBookAvailable(Long bookId) {
        Book book = getById(bookId);
        return book.getAvailableCopies() > 0;
    }

    public long countBooks() {
        return bookRepository.count();
    }

    public long countAvailableBooks() {
        Long sum = bookRepository.sumAvailableCopies();
        return sum != null ? sum : 0;
    }

    public BookAvailability getBookAvailability() {
        List<Book> books = bookRepository.findAll();

        long totalBooks = books.stream()
                .mapToLong(Book::getTotalCopies)
                .sum();

        long availableBooks = books.stream()
                .mapToLong(Book::getAvailableCopies)
                .sum();

        BookAvailability availability = new BookAvailability();
        availability.setTotalBooks(totalBooks);
        availability.setAvailableBooks(availableBooks);
        return availability;
    }

    private void validateCopies(Book book) {
        if (book.getAvailableCopies() > book.getTotalCopies()) {
            throw new IllegalArgumentException("Available copies cannot exceed total copies");
        }
    }

    // ✅ Use repository advanced search instead of in-memory filtering
    public List<Book> searchBooks(String title, String author, String genre, String publisher) {
        if ((title != null && !title.isEmpty()) || (author != null && !author.isEmpty())) {
            return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                    title != null ? title : "",
                    author != null ? author : ""
            );
        } else {
            return bookRepository.searchAdvanced(title, genre, publisher);
        }
    }
}
