package com.library.lms.librario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OfflinePaymentDTO {
    // unified id (sourceId helps identify origin)
    private Long sourceId;
    // "MEMBERSHIP" or "BORROW"
    private String source;
    private Long paymentId; // actual payments.id when applicable (nullable for borrow-only)
    private String memberName;
    private String memberEmail;
    private String bookTitle; // optional
    private BigDecimal amount;
    private String status; // INITIATED / SUCCESS / FAILED or custom mapping for borrow (PAID/PENDING)
    private String type; // OFFLINE / ONLINE / FINE (informational)
    private String receivedBy;
    private LocalDateTime receivedAt;
    private LocalDateTime createdAt;

    // Constructors, getters, setters
    public OfflinePaymentDTO() {}

    // builder-like constructor for convenience (useful in service)
    public OfflinePaymentDTO(Long sourceId, String source, Long paymentId, String memberName, String memberEmail,
                             String bookTitle, BigDecimal amount, String status, String type,
                             String receivedBy, LocalDateTime receivedAt, LocalDateTime createdAt) {
        this.sourceId = sourceId;
        this.source = source;
        this.paymentId = paymentId;
        this.memberName = memberName;
        this.memberEmail = memberEmail;
        this.bookTitle = bookTitle;
        this.amount = amount;
        this.status = status;
        this.type = type;
        this.receivedBy = receivedBy;
        this.receivedAt = receivedAt;
        this.createdAt = createdAt;
    }

    // getters and setters...
    // (You can generate using Lombok if you prefer @Data)
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getMemberEmail() { return memberEmail; }
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }
    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
