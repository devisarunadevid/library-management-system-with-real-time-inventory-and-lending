package com.library.lms.librario.controller;

import com.library.lms.librario.dto.OverdueDTO;
import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.service.OverdueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/overdue")
@RequiredArgsConstructor
public class OverdueController {

    private final OverdueService overdueService;

    /**
     * Admin/Librarian: get all overdue records with dynamically calculated fines
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<OverdueDTO> getAll() {
        List<BorrowRecord> list = overdueService.getAllCurrentlyOverdue();

        return list.stream().map(r -> {
            // calculate days overdue
            long days = 0;
            if (r.getDueDate() != null) {
                days = Duration.between(r.getDueDate(), LocalDateTime.now()).toDays();
                if (days < 0) days = 0;
            }

            // calculate fine dynamically
            BigDecimal fine = overdueService.calculateFine(r);

            // build DTO with dynamic fine
            return OverdueDTO.from(r, days, fine);
        }).collect(Collectors.toList());
    }

    /**
     * Get overdue records for a specific user with dynamically calculated fines
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
    public List<OverdueDTO> getByUser(@PathVariable Long userId) {
        return overdueService.getOverdueForUser(userId).stream().map(r -> {
            long days = 0;
            if (r.getDueDate() != null) {
                days = Duration.between(r.getDueDate(), LocalDateTime.now()).toDays();
                if (days < 0) days = 0;
            }

            BigDecimal fine = overdueService.calculateFine(r);
            return OverdueDTO.from(r, days, fine);
        }).collect(Collectors.toList());
    }

    /**
     * Return calculated fine for a single borrow record (does not persist)
     */
    @GetMapping("/{borrowId}/fine")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
    public Map<String, Object> getFine(@PathVariable Long borrowId) {
        BorrowRecord b = overdueService.findById(borrowId);
        BigDecimal fine = overdueService.calculateFine(b);

        return Map.of(
                "borrowId", b.getId(),
                "userId", b.getUser() != null ? b.getUser().getId() : null,
                "fine", fine
        );
    }

    /**
     * Manual trigger to process overdue fines (useful for testing)
     */
    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<String> runProcessNow() {
        overdueService.runManualProcess();
        return ResponseEntity.ok("Processed overdue scan");
    }

    /**
     * Waive fine for a borrow record (admin action)
     */
    @PutMapping("/{borrowId}/waive")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public BorrowRecord waiveFine(@PathVariable Long borrowId) {
        return overdueService.waiveFine(borrowId);
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Map<String, Long> getBorrowedBooksCount() {
        long count = overdueService.getBorrowedBooksCount();
        return Map.of("count", count);
    }
}
