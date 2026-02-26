package com.library.lms.librario.entity;

import com.library.lms.librario.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_user_read", columnList = "user_id, `read`"),
                @Index(name = "idx_targetRole_createdAt", columnList = "target_role, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = true)
    private Long userId; // optional: can be null for role-targeted notifications

    @Column(length = 150, nullable = false)
    private String title;

    @Column(length = 1000, nullable = false)
    private String message;

    @Column(name = "target_role", length = 50, nullable = false)
    private String targetRole;  // e.g., "ADMIN", "MEMBER"

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, nullable = false)
    private NotificationType type; // e.g., INFO, ALERT, REMINDER

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "`read`", nullable = false)
    private boolean read = false;

    // Automatically set createdAt before persisting
    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
