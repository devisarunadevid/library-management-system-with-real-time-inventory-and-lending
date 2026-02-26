package com.library.lms.librario.dto;

public record BorrowReportDTO(
        Long id,
        String bookTitle,
        String status,
        String condition,
        double fineAmount
) { }
