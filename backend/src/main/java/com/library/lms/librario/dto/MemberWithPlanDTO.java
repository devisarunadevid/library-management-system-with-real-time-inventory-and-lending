package com.library.lms.librario.dto;

public class MemberWithPlanDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String planType;
    private Double fees;
    private Integer borrowingLimit;

    // ✅ Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public Double getFees() { return fees; }
    public void setFees(Double fees) { this.fees = fees; }

    public Integer getBorrowingLimit() { return borrowingLimit; }
    public void setBorrowingLimit(Integer borrowingLimit) { this.borrowingLimit = borrowingLimit; }
}