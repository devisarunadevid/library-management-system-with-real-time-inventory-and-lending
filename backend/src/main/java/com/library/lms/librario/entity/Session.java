package com.library.lms.librario.entity;

import com.library.lms.librario.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions", indexes = {
        @Index(name = "uk_sessions_token", columnList = "token", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "login_time")
    private LocalDateTime loginTime;

    @Column(name = "logout_time")
    private LocalDateTime logoutTime;

    @Column(nullable = false, length = 200)
    private String token;
}
