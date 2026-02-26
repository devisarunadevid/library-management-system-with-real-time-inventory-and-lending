package com.library.lms.librario.controller;

import com.library.lms.librario.dto.BorrowRecordDTO;
import com.library.lms.librario.dto.OfflineFinePaymentRequest;
import com.library.lms.librario.dto.OfflineMembershipPaymentRequest;
import com.library.lms.librario.service.BorrowService;
import com.library.lms.librario.service.OfflinePaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/offline-payments")
@RequiredArgsConstructor
public class OfflinePaymentController {

    private final OfflinePaymentService offlinePaymentService;
    private final BorrowService borrowService;

    /**
     * ✅ Record Offline Membership Payment
     * Called from: OfflinePaymentForm.jsx when librarian records offline membership fee
     * Example POST body:
     * {
     *   "membershipRequestId": 9,
     *   "amount": 149.99,
     *   "librarianId": 12
     * }
     */
    @PostMapping("/membership")
    public ResponseEntity<String> recordMembershipPayment(@RequestBody OfflineMembershipPaymentRequest request) {
        offlinePaymentService.recordMembershipPayment(request);
        return ResponseEntity.ok("Membership Payment Recorded Successfully");
    }

    /**
     * ✅ Record Offline Fine Payment
     * Called from: OfflinePaymentForm.jsx when librarian records fine payment
     * Example POST body:
     * {
     *   "borrowId": 45,
     *   "amount": 50.00,
     *   "librarianId": 12
     * }
     */
    @PostMapping("/fine")
    public ResponseEntity<String> recordFinePayment(@RequestBody OfflineFinePaymentRequest request) {
        offlinePaymentService.recordFinePayment(request);
        return ResponseEntity.ok("Fine Payment Recorded Successfully");
    }

    /**
     * ✅ Get Unpaid Fines List
     * Called from: FineList.jsx or OfflineFinePayment.jsx (for listing pending fines)
     */
    @GetMapping("/unpaid-fines")
    public ResponseEntity<List<BorrowRecordDTO>> getUnpaidFines() {
        List<BorrowRecordDTO> unpaidFines = borrowService.getUnpaidFines();
        return ResponseEntity.ok(unpaidFines);
    }
}
