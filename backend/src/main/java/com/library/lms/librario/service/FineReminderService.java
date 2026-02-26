package com.library.lms.librario.service;

import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.service.mail.MailService;
import com.library.lms.librario.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FineReminderService {

    private final BorrowRecordRepository borrowRepo;
    private final NotificationService notificationService;
    private final MailService mailService;

    // Run every day at 9 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendFineReminders() {
        List<BorrowRecord> overdue = borrowRepo.findByStatus(BorrowStatus.OVERDUE);

        for (BorrowRecord r : overdue) {
            if (r.getFineAmount() > 0) {
                String message = "Reminder: Your fine for book '" + r.getBook().getTitle()
                        + "' is ₹" + r.getFineAmount() + ". Please pay it soon.";

                // ✅ In-app notification (fixed)
                notificationService.createForMember(r.getUser().getId(), message);

                // ✅ Email reminder
                String subject = "Library Fine Reminder: " + r.getBook().getTitle();
                String body = "<div style='font-family:Arial,sans-serif;color:#333;'>" +
                        "<h2>📚 Fine Reminder</h2>" +
                        "<p>Hi " + r.getUser().getName() + ",</p>" +
                        "<p>Your fine for the book <b>" + r.getBook().getTitle() + "</b> " +
                        "is <b>₹" + r.getFineAmount() + "</b>. Please pay it at your earliest convenience.</p>" +
                        "<p>Thank you,<br/>Library Team</p></div>";

                mailService.send(r.getUser().getEmail(), subject, body);
            }
        }
    }
}
