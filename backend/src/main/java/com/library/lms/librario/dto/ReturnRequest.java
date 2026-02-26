package com.library.lms.librario.dto;

import jakarta.validation.constraints.NotNull;
public class ReturnRequest {
    @NotNull(message = "Borrow record ID is required")
    private Long borrowRecordId;

    public Long getBorrowRecordId() { return borrowRecordId; }
    public void setBorrowRecordId(Long borrowRecordId) { this.borrowRecordId = borrowRecordId; }
}
