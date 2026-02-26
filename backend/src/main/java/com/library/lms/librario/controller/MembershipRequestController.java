package com.library.lms.librario.controller;

import com.library.lms.librario.entity.MembershipRequest;
import com.library.lms.librario.service.MembershipRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership-requests")
@RequiredArgsConstructor
public class MembershipRequestController {

    private final MembershipRequestService membershipRequestService;

    // 1️⃣ User requests a membership plan
    @PostMapping("/{planId}")
    public ResponseEntity<MembershipRequest> requestMembership(
            @RequestParam Long userId,
            @PathVariable Long planId) {
        MembershipRequest request = membershipRequestService.requestPlan(userId, planId);
        return ResponseEntity.ok(request);
    }

    // 2️⃣ Admin approves a request
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<MembershipRequest> approveRequest(@PathVariable Long requestId) {
        MembershipRequest request = membershipRequestService.approveRequest(requestId);
        return ResponseEntity.ok(request);
    }

    // 🔹 2A️⃣ New: Get all approved but unpaid membership requests (for librarian offline payment form)
    @GetMapping("/approved-unpaid")
    public ResponseEntity<List<MembershipRequest>> getApprovedUnpaidRequests() {
        return ResponseEntity.ok(membershipRequestService.getApprovedUnpaidRequests());
    }

    // 3️⃣ Admin rejects a request with reason
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<MembershipRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam String reason) {
        MembershipRequest request = membershipRequestService.rejectRequest(requestId, reason);
        return ResponseEntity.ok(request);
    }

    // 4️⃣ Admin views all pending requests
    @GetMapping("/pending")
    public ResponseEntity<List<MembershipRequest>> getPendingRequests() {
        List<MembershipRequest> pending = membershipRequestService.getPendingRequests();
        return ResponseEntity.ok(pending);
    }

    // 5️⃣ User views their own requests ✅
    @GetMapping("/my")
    public ResponseEntity<List<MembershipRequest>> getUserRequests(@RequestParam Long userId) {
        List<MembershipRequest> userRequests = membershipRequestService.getUserRequests(userId);
        return ResponseEntity.ok(userRequests);
    }

    // 6️⃣ Admin views ALL requests
    @GetMapping
    public ResponseEntity<List<MembershipRequest>> getAllRequests() {
        return ResponseEntity.ok(membershipRequestService.getAllRequests());
    }

    //7️⃣ Mark request as paid (called by frontend after simulated payment)
    @PutMapping("/{requestId}/pay")
    public ResponseEntity<MembershipRequest> markAsPaid(@PathVariable Long requestId) {
        MembershipRequest request = membershipRequestService.markAsPaid(requestId);
        return ResponseEntity.ok(request);
    }
}
