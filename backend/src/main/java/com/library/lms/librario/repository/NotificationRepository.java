package com.library.lms.librario.repository;

import com.library.lms.librario.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Existing queries
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String role);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);
    List<Notification> findByTargetRoleAndReadFalse(String targetRole);

    // 👇 Add these two for Admin unread
    @Query("SELECT n FROM Notification n WHERE n.targetRole = 'ADMIN' AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadForAdmins();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.targetRole = 'ADMIN' AND n.read = false")
    long countUnreadForAdmins();
}
