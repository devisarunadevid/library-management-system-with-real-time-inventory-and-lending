package com.library.lms.librario.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "membership_plans")
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // Plan type (e.g., Basic, Premium)

    private BigDecimal fees;
    private int durationMonths;
    private int durationDays;
    private int borrowingLimit;

    // 🔹 Borrow/renewal configuration
    private int borrowDurationDays;  // how many days a book can be borrowed
    private int renewalDays;         // extra days allowed for renewal

    // ⚠️ You already have finePerDay as BigDecimal → decide one type
    // If you prefer double (as used in BorrowService), keep this one:
    private BigDecimal finePerDay;

    // Constructors
    public MembershipPlan() {}

    public MembershipPlan(String type, BigDecimal fees, int durationMonths, int durationDays,
                          int borrowingLimit, int borrowDurationDays, int renewalDays, BigDecimal  finePerDay) {
        this.type = type;
        this.fees = fees;
        this.durationMonths = durationMonths;
        this.durationDays = durationDays;
        this.borrowingLimit = borrowingLimit;
        this.borrowDurationDays = borrowDurationDays;
        this.renewalDays = renewalDays;
        this.finePerDay = finePerDay;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getFees() { return fees; }
    public void setFees(BigDecimal fees) { this.fees = fees; }

    public int getDurationMonths() { return durationMonths; }
    public void setDurationMonths(int durationMonths) { this.durationMonths = durationMonths; }

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }

    public int getBorrowingLimit() { return borrowingLimit; }
    public void setBorrowingLimit(int borrowingLimit) { this.borrowingLimit = borrowingLimit; }

    public int getBorrowDurationDays() { return borrowDurationDays; }
    public void setBorrowDurationDays(int borrowDurationDays) { this.borrowDurationDays = borrowDurationDays; }

    public int getRenewalDays() { return renewalDays; }
    public void setRenewalDays(int renewalDays) { this.renewalDays = renewalDays; }

    public BigDecimal  getFinePerDay() { return finePerDay; }
    public void setFinePerDay(BigDecimal finePerDay) { this.finePerDay = finePerDay; }
}
