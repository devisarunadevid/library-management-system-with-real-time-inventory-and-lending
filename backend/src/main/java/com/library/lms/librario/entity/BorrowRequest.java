package com.library.lms.librario.entity;

import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user; // member requesting book

    @ManyToOne
    private Book book; // requested book

    @ManyToOne
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    private RequestStatus status  = RequestStatus.PENDING; // PENDING, APPROVED, REJECTED

    @Enumerated(EnumType.STRING)
    private BorrowStatus borrowStatus; // BORROWED, RETURNED, OVERDUE

    private LocalDateTime requestDate;
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private LocalDateTime approvedAt;

    private Double fineAmount; // fine in case of overdue
}
