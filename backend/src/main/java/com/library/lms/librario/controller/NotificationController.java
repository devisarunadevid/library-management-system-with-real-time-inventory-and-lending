package com.library.lms.librario.controller;

import com.library.lms.librario.entity.Notification;
import com.library.lms.librario.repository.NotificationRepository;
import com.library.lms.librario.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    // 🔹 Admin notifications
    @GetMapping("/admin")
    public List<Notification> getAdminNotifications() {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
    }

    // 🔹 All notifications for a specific user
    @GetMapping("/user/{userId}")
    public List<Notification> getByUser(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 🔹 Only unread notifications for a user
    @GetMapping("/unread/{userId}")
    public List<Notification> getUnread(@PathVariable Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    // 🔹 Mark as read
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setRead(true);
        notificationRepository.save(notif);
    }

    // 🔹 Delete a notification
    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
    }

    // 🔹 Admin unread notifications
    @GetMapping("/admin/unread")
    public List<Notification> getAdminUnreadNotifications() {
        return notificationService.getUnreadForAdmins();
    }

    // 🔹 Admin unread count
    @GetMapping("/admin/unread/count")
    public long getAdminUnreadCount() {
        return notificationService.getUnreadCountForAdmins();
    }
}
