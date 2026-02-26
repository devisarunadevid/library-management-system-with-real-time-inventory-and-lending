package com.library.lms.librario.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who is paying
    private Long userId;

    // Linked membership request
    private Long membershipRequestId;

    // 🔹 Linked borrow record (for fine payments)
    private Long borrowRecordId;

    // Amount to pay (use BigDecimal for accuracy)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Default currency
    @Column(nullable = false)
    private String currency = "INR";

    private String transactionId;

    // Payment status: INITIATED, SUCCESS, FAILED
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.INITIATED;

    // Razorpay IDs
    private String orderId;     // Razorpay order_id (rzp_order_xxxx)
    private String paymentId;   // Razorpay payment_id (pay_xxxx)

    // Payment timestamp
    private LocalDateTime paymentDate = LocalDateTime.now();

    // 🔹 New Fields for Offline & History Support
    @Enumerated(EnumType.STRING)
    private PaymentType type = PaymentType.ONLINE; // ONLINE or OFFLINE

    private String memberName;
    private String memberEmail;
    private String bookTitle;
    private Long recordedBy;
    private String receivedBy;
    private LocalDateTime receivedAt;
    private LocalDateTime createdAt = LocalDateTime.now();
    /*
    // Optional: JPA relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_request_id", insertable = false, updatable = false)
    private MembershipRequest membershipRequest;
    */
}
