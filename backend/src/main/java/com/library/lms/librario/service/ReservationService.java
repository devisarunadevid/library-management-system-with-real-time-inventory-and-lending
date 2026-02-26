package com.library.lms.librario.service;

import com.library.lms.librario.entity.Reservation;
import com.library.lms.librario.entity.ReservationStatus;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.ReservationRepository;
import com.library.lms.librario.repository.BookRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final UserRepository userRepo;
    private final BookRepository bookRepo;
    private final MailService mailService;

    @Transactional
    public Reservation reserveBook(Long userId, Long bookId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Check if available copies > 0
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book not available for reservation");
        }

        // Optional: check if already reserved
        reservationRepo.findByBookAndStatus(book, ReservationStatus.ACTIVE)
                .ifPresent(r -> {
                    throw new RuntimeException("Book is already reserved");
                });

        Reservation res = Reservation.builder()
                .user(user)
                .book(book)
                .reservedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(2)) // Example: expires in 2 days
                .status(ReservationStatus.ACTIVE)
                .build();

        Reservation saved = reservationRepo.save(res);

        // ✅ Reduce available copies temporarily
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepo.save(book);

        // ✅ Notify user by email
        String subject = "Book Reservation Confirmed";
        String body = "<div style='font-family:Arial,sans-serif;color:#333;'>" +
                "<h2>📚 Reservation Confirmed</h2>" +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>You have successfully reserved the book <b>" + book.getTitle() + "</b>.</p>" +
                "<p>Please collect it within 2 days.</p>" +
                "<br><p>Regards,<br/>Library Team</p></div>";

        mailService.send(user.getEmail(), subject, body);

        return saved;
    }

    @Transactional
    public void cancelReservation(Long reservationId) {
        Reservation res = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (res.getStatus() != ReservationStatus.ACTIVE) {
            throw new RuntimeException("Reservation already cancelled/expired");
        }

        res.setStatus(ReservationStatus.CANCELLED);
        reservationRepo.save(res);

        // ✅ Restore book copy
        Book book = res.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepo.save(book);

        // ✅ Notify user
        mailService.send(res.getUser().getEmail(),
                "Reservation Cancelled",
                "Your reservation for book " + book.getTitle() + " has been cancelled.");
    }

    public List<Reservation> getUserReservations(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return reservationRepo.findByUser(user);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepo.findAll();
    }

    // ✅ New method: Get reservation count for a book
    public int getReservationCountForBook(Long bookId) {
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return reservationRepo.countByBookAndStatus(book, ReservationStatus.ACTIVE);
    }

    // ✅ New method: Reserve a book using user email (used by JSON POST endpoint)
    @Transactional
    public Reservation reserveBookByEmail(String userEmail, Long bookId) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reserveBook(user.getId(), bookId); // reuse existing reserveBook method
    }
}