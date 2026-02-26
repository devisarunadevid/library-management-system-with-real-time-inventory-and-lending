package com.library.lms.librario.dto;

import jakarta.validation.constraints.NotNull;
public class BorrowRequestDto {
    @NotNull(message = "Book ID is required")
    private Long bookId;

    // getters and setters
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
}
