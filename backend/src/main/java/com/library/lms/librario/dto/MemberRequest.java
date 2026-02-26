package com.library.lms.librario.dto;

public class MemberRequest {
    private Long userId;
    private Long planId;
    private String startDate;

    // Getters and setters (or use Lombok @Data)
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public String getStartDate() {
        return startDate;
    }
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
}