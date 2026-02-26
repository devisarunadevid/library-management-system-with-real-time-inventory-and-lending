package com.library.lms.librario.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class OtpVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String otp;

    private boolean consumed;

    private int attempts;

    private boolean verified;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    @ManyToOne
    private User user;
}
