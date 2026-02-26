package com.library.lms.librario.entity;

import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;

    @Enumerated(EnumType.STRING)
    private BorrowStatus status;   // BORROWED, RETURNED, OVERDUE

    private double fineAmount;

    @Column(name = "days_overdue")
    private Integer daysOverdue = 0;

    // ✅ Add these two fields here
    @Column(name = "fine_paid")
    private Boolean finePaid = false;

    @Column(name = "payment_id")
    private String paymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "book_condition") // GOOD, BAD, DAMAGED, LOST
    private BookCondition bookCondition;

    @Column(nullable = false)
    private Integer renewCount = 0;// Use Integer instead of int, default 0

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    private PaymentType paymentType;  // OFFLINE, ONLINE, etc.

    @Column(name = "recorded_by")
    private String recordedBy;    // Name of the librarian/admin who recorded payment
}
