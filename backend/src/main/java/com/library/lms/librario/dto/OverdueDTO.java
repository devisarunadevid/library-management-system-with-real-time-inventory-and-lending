package com.library.lms.librario.dto;

import com.library.lms.librario.entity.BorrowRecord;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OverdueDTO {

    public Long id;
    public Long userId;
    public String userName;
    public Long bookId;
    public String bookTitle;
    public LocalDateTime borrowDate;
    public LocalDateTime dueDate;
    public Double fineAmount;
    public long daysOverdue;

    public OverdueDTO() {}

    /**
     * Old method: uses stored fineAmount from BorrowRecord safely
     */
    public static OverdueDTO from(BorrowRecord r, long daysOverdue) {
        // assign to a Double variable first
        Double fineDouble = r.getFineAmount(); // do NOT compare primitive
        BigDecimal fine = (fineDouble != null)
                ? BigDecimal.valueOf(fineDouble)
                : BigDecimal.ZERO;

        return from(r, daysOverdue, fine);
    }

    /**
     * New method: supports dynamic fine calculation
     */
    public static OverdueDTO from(BorrowRecord r, long daysOverdue, BigDecimal fine) {
        OverdueDTO dto = new OverdueDTO();

        dto.id = r.getId();
        dto.userId = r.getUser() != null ? r.getUser().getId() : null;
        dto.userName = r.getUser() != null ? r.getUser().getName() : "Unknown User";
        dto.bookId = r.getBook() != null ? r.getBook().getId() : null;
        dto.bookTitle = r.getBook() != null ? r.getBook().getTitle() : "Unknown Book";
        dto.borrowDate = r.getBorrowDate();
        dto.dueDate = r.getDueDate();
        dto.daysOverdue = Math.max(daysOverdue, 0); // never negative

        // safe conversion
        dto.fineAmount = fine != null ? fine.doubleValue() : 0.0;

        return dto;
    }
}
