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

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }

    public long getAvailableBooks() { return availableBooks; }
    public void setAvailableBooks(long availableBooks) { this.availableBooks = availableBooks; }
}
