package com.library.lms.librario.dto;

import java.time.LocalDateTime;
public record BorrowRecordDTO(
        Long id,
        Long bookId,
        String bookTitle,
        LocalDateTime borrowDate,
        LocalDateTime dueDate,
        LocalDateTime returnDate,
        Double fineAmount,
        Boolean finePaid,
        String status,
        Integer renewCount,
        Long userId,
        String userName,    // added
        String userEmail,
        String bookCondition
) { }
