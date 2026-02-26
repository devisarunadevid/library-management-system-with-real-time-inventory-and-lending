package com.library.lms.librario.service;

import com.library.lms.librario.entity.Transaction;
import com.library.lms.librario.model.User;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.repository.TransactionRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.repository.BookRepository;
import com.library.lms.librario.service.mail.MailService;
import com.library.lms.librario.entity.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;
    private final MailService mailService;

    public Transaction renewBook(Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        int MAX_RENEWALS = 2;

        if (tx.getReturnDate() != null) {
            throw new RuntimeException("Book already returned, cannot renew");
        }

        if (tx.getRenewalsDone() >= MAX_RENEWALS) {
            throw new RuntimeException("Max renewals reached");
        }

        // Extend due date by 7 days
        LocalDate newDue = tx.getDueDate().plusDays(7);
        tx.setDueDate(newDue);
        tx.setRenewalsDone(tx.getRenewalsDone() + 1);

        Transaction savedTx = transactionRepository.save(tx);

        // Fetch User and Book for notifications
        User user = userRepository.findById(tx.getMemberId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(tx.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        String message = "Your book '" + book.getTitle() +
                "' has been renewed successfully. New due date: " + newDue;

        // ✅ In-app notification (corrected call)
        notificationService.create(
                user,
                "MEMBER",
                message,
                NotificationType.GENERAL
        );

        // Email
        mailService.send(user.getEmail(), "Book Renewal Confirmation", message);

        return savedTx;
    }
}
