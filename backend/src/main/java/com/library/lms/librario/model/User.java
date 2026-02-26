package com.library.lms.librario.model;

import com.library.lms.librario.entity.MembershipPlan;
import com.library.lms.librario.entity.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "uk_users_email", columnList = "email", unique = true)
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👇 Example user details
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    // 👇 Add status field
    @Column(nullable = false)
    private boolean status;

    // 🔹 Add relation with MembershipPlan
    @ManyToOne
    @JoinColumn(name = "membership_plan_id")  // foreign key in users table
    private MembershipPlan membershipPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
