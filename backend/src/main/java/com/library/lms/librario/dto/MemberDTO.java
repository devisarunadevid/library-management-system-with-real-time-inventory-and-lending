package com.library.lms.librario.dto;

import java.time.LocalDate;
public class MemberDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long planId;
    private String planType;
    private Integer borrowingLimit;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }        // ✅ NEW
    public void setUserName(String userName) { this.userName = userName; } // ✅ NEW

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getBorrowingLimit() { return borrowingLimit; }
    public void setBorrowingLimit(int borrowingLimit) { this.borrowingLimit = borrowingLimit; }
}
