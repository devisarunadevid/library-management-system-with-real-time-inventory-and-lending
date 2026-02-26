package com.library.lms.librario.service;

import com.library.lms.librario.model.Book;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAlertService {

    private final NotificationService notificationService;

    /**
     * Call this when a book is reported damaged or lost
     */
    public void reportDamagedOrLost(Book book, String type) {
        String message = "Alert: Book '" + book.getTitle() + "' has been reported as " + type;
        notificationService.createForAdmin(message);
    }
}
