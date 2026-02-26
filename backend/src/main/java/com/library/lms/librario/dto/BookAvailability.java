package com.library.lms.librario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor   // ✅ Add this to allow new BookAvailability()
public class BookAvailability {
    private long totalBooks;
    private long availableBooks;
}
