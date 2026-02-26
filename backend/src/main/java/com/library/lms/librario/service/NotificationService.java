package com.library.lms.librario.service;

import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.Notification;
import com.library.lms.librario.model.User;
import com.library.lms.librario.entity.enums.NotificationType;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.repository.BookRepository;
import com.library.lms.librario.repository.BorrowRecordRepository;
import com.library.lms.librario.repository.NotificationRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.mail.MailService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final BorrowRecordRepository borrowRepo;
    private final MailService mailService;
    private final BookRepository bookRepo;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepo;

    @Value("${library.admin.email:admin@library.com}")
    private String adminEmail;

    public NotificationService(BorrowRecordRepository borrowRepo,
                               MailService mailService,
                               BookRepository bookRepo,
                               NotificationRepository notificationRepository,
                               UserRepository userRepo) {
        this.borrowRepo = borrowRepo;
        this.mailService = mailService;
        this.bookRepo = bookRepo;
        this.notificationRepository = notificationRepository;
        this.userRepo = userRepo;
    }

    // ----------------------------
    // Core helper: Save + Email
    // ----------------------------
    private Notification buildAndNotify(Long userId, String role, String email,
                                        NotificationType type, String messageHtml) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTargetRole(role); // important for admin/librarian/member filtering
        notification.setType(type);
        notification.setTitle(type.getDefaultTitle());
        notification.setMessage(messageHtml);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        // Send email if email exists
        if (email != null) {
            String subject = type.getDefaultTitle();
            mailService.send(email, subject, messageHtml);
        }

        return saved;
    }

    // ----------------------------
    // Role-specific methods
    // ----------------------------
    public Notification createForMember(Long userId, String messageHtml) {
        User user = userRepo.findById(userId).orElse(null);
        return buildAndNotify(userId, "MEMBER",
                user != null ? user.getEmail() : null,
                NotificationType.GENERAL, messageHtml);
    }

    public Notification createForAdmin(String messageHtml) {
        return buildAndNotify(null, "ADMIN", adminEmail,
                NotificationType.GENERAL, messageHtml);
    }

    public Notification createForAdmin(String messageHtml, NotificationType type) {
        return buildAndNotify(null, "ADMIN", adminEmail, type, messageHtml);
    }

    public Notification createForLibrarian(String messageHtml) {
        return buildAndNotify(null, "LIBRARIAN", adminEmail,
                NotificationType.GENERAL, messageHtml);
    }

    public Notification create(User user, String role, String messageHtml, NotificationType type) {
        if (user == null) throw new IllegalArgumentException("User cannot be null");
        return buildAndNotify(user.getId(), role, user.getEmail(), type, messageHtml);
    }

    public Notification createUser(Long userId, String messageHtml, NotificationType type) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return buildAndNotify(userId, "MEMBER", user.getEmail(), type, messageHtml);
    }

    // ----------------------------
    // Due-date reminders for members
    // ----------------------------
    public void notifyDueDateApproaching() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);

        List<BorrowRecord> records = borrowRepo.findAll();
        for (BorrowRecord record : records) {
            if (record.getDueDate() != null &&
                    record.getDueDate().isAfter(now) &&
                    record.getDueDate().isBefore(threeDaysLater)) {

                String messageHtml = "<p>Reminder: Book '<b>" + record.getBook().getTitle() +
                        "</b>' is due on <b>" + record.getDueDate() + "</b>.</p>";

                buildAndNotify(record.getUser().getId(), "MEMBER",
                        record.getUser().getEmail(),
                        NotificationType.DUE_DATE, messageHtml);
            }
        }
    }

    // ----------------------------
    // Low stock alerts for admin
    // ----------------------------
    public void notifyLowStockBooks() {
        List<Book> lowStock = bookRepo.findAll().stream()
                .filter(book -> book.getAvailableCopies() < 5)
                .toList();

        for (Book book : lowStock) {
            String messageHtml = "<p>Low stock alert for book: '<b>" + book.getTitle() + "</b>'.</p>";
            buildAndNotify(null, "ADMIN", adminEmail,
                    NotificationType.LOW_STOCK, messageHtml);
        }
    }

    // ----------------------------
    // Admin-specific fetch methods
    // ----------------------------
    public List<Notification> getUnreadForAdmins() {
        return notificationRepository.findUnreadForAdmins();
    }

    public long getUnreadCountForAdmins() {
        return notificationRepository.countUnreadForAdmins();
    }
}
