package com.library.lms.librario.controller;

import com.library.lms.librario.dto.BorrowRecordDTO;
import com.library.lms.librario.dto.BorrowReportDTO;
import com.library.lms.librario.dto.OfflineFinePaymentRequest;
import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.BorrowRequest;
import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.repository.BorrowRecordRepository;
import com.library.lms.librario.service.BorrowService;
import com.library.lms.librario.service.OverdueService;
import com.library.lms.librario.service.NotificationService;
import com.library.lms.librario.service.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    @Autowired
    private BorrowRecordRepository borrowRecordRepo;
    @Autowired
    private MailService mailService;
    private final BorrowService borrowService;
    private final OverdueService overdueService;
    private final NotificationService notificationService;

    // --- MEMBER: Request to borrow a book ---
    @PostMapping("/request")
    public BorrowRequest requestBorrow(@RequestParam String email,
                                       @RequestParam Long bookId) {
        return borrowService.requestBorrow(email, bookId);
    }

    // --- ADMIN: Approve borrow request ---
    @PostMapping("/approve/{requestId}")
    public BorrowRecord approveBorrow(@PathVariable Long requestId) {
        return borrowService.approveBorrow(requestId);
    }

    // --- ADMIN: Reject borrow request ---
    @PostMapping("/reject/{requestId}")
    public void rejectBorrow(@PathVariable Long requestId) {
        borrowService.rejectBorrow(requestId);
    }

    // --- LIBRARIAN/ADMIN: Return book (DTO version) ---
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    @PostMapping("/return/{id}")
    public BorrowRecordDTO returnBook(@PathVariable Long id,
                                      @RequestParam(required = false) String condition) {

        BookCondition bookCondition = null;
        if (condition != null) {
            bookCondition = BookCondition.valueOf(condition.toUpperCase());
        }

        BorrowRecord record = borrowService.returnBook(id, bookCondition);
        var fine = overdueService.calculateFine(record);
        record.setFineAmount(fine.doubleValue());

        notificationService.create(
                record.getUser(),
                "Book Returned",
                "Book '" + record.getBook().getTitle() + "' returned successfully. Fine: ₹" + fine,
                com.library.lms.librario.entity.enums.NotificationType.GENERAL
        );

        // Map entity -> DTO
        BorrowRecordDTO dto = new BorrowRecordDTO(
                record.getId(),
                record.getBook().getId(),
                record.getBook().getTitle(),
                record.getBorrowDate(),
                record.getDueDate(),
                record.getReturnDate(),
                record.getFineAmount(),
                record.getFinePaid(),                 // ✅ correct
                record.getStatus().name(),            // ✅ status
                record.getRenewCount(),
                record.getUser().getId(),
                record.getUser().getName(),
                record.getUser().getEmail(),
                record.getBookCondition() != null ? record.getBookCondition().name() : null
        );


        return dto;
    }

    // --- MEMBER: Borrow history ---
    @GetMapping("/history/{userId}")
    public List<BorrowRecordDTO> history(@PathVariable Long userId) {
        return borrowService.historyForUser(userId);
    }

    // --- ADMIN: View all pending requests ---
    @GetMapping("/requests/pending")
    public List<BorrowRequest> getPendingRequests() {
        return borrowService.getPendingRequests();
    }

    // --- ADMIN: View all requests (any status) ---
    @GetMapping("/requests")
    public List<BorrowRequest> getAllRequests() {
        return borrowService.getAllRequests();
    }

    @PostMapping("/report/{borrowId}")
    public ResponseEntity<BorrowReportDTO> reportDamageOrLoss(
            @PathVariable Long borrowId,
            @RequestParam String condition) {

        BorrowRecord record = borrowService.reportDamageOrLoss(borrowId, condition);

        BorrowReportDTO dto = new BorrowReportDTO(
                record.getId(),
                record.getBook().getTitle(),
                record.getStatus().name(),
                record.getBookCondition() != null ? record.getBookCondition().name() : null,
                record.getFineAmount()
        );

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/renew/{borrowId}")
    public ResponseEntity<?> renewBook(@PathVariable Long borrowId) {
        BorrowRecord record = borrowService.renewBook(borrowId);

        // Optional: send email
        if (mailService != null) {
            mailService.send(record.getUser().getEmail(), "Book Renewed",
                    "Your book '" + record.getBook().getTitle() + "' has been renewed until " + record.getDueDate());
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "newDueDate", record.getDueDate(),
                "renewCount", record.getRenewCount()
        ));
    }

    @GetMapping("/records/all")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecordDTO>> getAllBorrowRecords() {
        return ResponseEntity.ok(borrowService.getAllRecordsDTO());
    }

    // --- LIBRARIAN/ADMIN: Record offline fine payment ---
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    @PostMapping("/offline-fine")
    public BorrowRecord recordOfflineFinePayment(@RequestBody OfflineFinePaymentRequest request) {
        return borrowService.recordOfflineFinePayment(request);
    }

    // --- LIBRARIAN/ADMIN: Get all offline fine payments ---
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    @GetMapping("/offline-fines")
    public List<BorrowRecord> getAllOfflineFines() {
        return borrowService.getAllOfflineFines();
    }

}
