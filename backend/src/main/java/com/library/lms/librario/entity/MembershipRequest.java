package com.library.lms.librario.entity;

import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // requesting member

    @ManyToOne
    private MembershipPlan plan;  // requested plan

    private boolean paid; // payment completed

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, APPROVED, REJECTED

    private LocalDateTime requestDate;
    private LocalDateTime approvedDate;

    private LocalDateTime completedDate; // when request is completed/paid

}
