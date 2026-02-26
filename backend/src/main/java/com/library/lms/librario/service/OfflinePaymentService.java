package com.library.lms.librario.service;

import com.library.lms.librario.dto.OfflineFinePaymentRequest;
import com.library.lms.librario.dto.OfflineMembershipPaymentRequest;
import com.library.lms.librario.entity.*;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.entity.Member;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OfflinePaymentService {

    private final PaymentRepository paymentRepo;
    private final MembershipRequestRepository membershipRequestRepo;
    private final BorrowRecordRepository borrowRecordRepo;
    private final MemberRepository memberRepo;  // ✅ Add this
    private final UserRepository userRepo;      // ✅ Add this

    /**
     * ✅ Records Offline Membership Payment
     * Steps:
     * 1. Find membership request.
     * 2. Save payment as OFFLINE.
     * 3. Mark request as COMPLETED.
     * 4. Update actual member’s plan and validity.
     * 5. Reflect plan in user table too.
     */
    public void recordMembershipPayment(OfflineMembershipPaymentRequest dto) {
        var req = membershipRequestRepo.findById(dto.getMembershipRequestId())
                .orElseThrow(() -> new RuntimeException("Membership Request not found"));

        var user = req.getUser();
        var plan = req.getPlan();

        // ✅ Save payment entry
        Payment payment = Payment.builder()
                .userId(user.getId())
                .membershipRequestId(req.getId())
                .amount(BigDecimal.valueOf(dto.getAmount()))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .paymentDate(LocalDateTime.now())
                .type(PaymentType.OFFLINE)
                .receivedBy(String.valueOf(dto.getLibrarianId()))
                .receivedAt(LocalDateTime.now())
                .memberName(user.getName())
                .memberEmail(user.getEmail())
                .build();
        paymentRepo.save(payment);

        // ✅ Mark membership request as completed and paid
        req.setPaid(true);
        req.setStatus(RequestStatus.COMPLETED);
        req.setCompletedDate(LocalDateTime.now());
        membershipRequestRepo.save(req);

        // ✅ Update Member’s plan (if member exists)
        var memberOpt = memberRepo.findByUser_Id(user.getId());
        if (memberOpt.isPresent()) {
            var member = memberOpt.get();
            member.setMembershipPlan(plan);
            member.setStartDate(LocalDate.now());
            member.setEndDate(LocalDate.now().plusDays(plan.getDurationDays()));
            memberRepo.save(member);
        }

        // ✅ Also reflect plan in User entity
        user.setMembershipPlan(plan);
        userRepo.save(user);
    }

    /**
     * ✅ Records Offline Fine Payment for Borrow Records
     * Steps:
     * 1. Find borrow record.
     * 2. Mark fine as paid.
     * 3. Create payment entry (for record).
     */
    public void recordFinePayment(OfflineFinePaymentRequest dto) {
        var record = borrowRecordRepo.findById(dto.getBorrowId())
                .orElseThrow(() -> new RuntimeException("Borrow Record not found"));

        record.setFinePaid(true);
        record.setFineAmount(0.0);
        record.setPaymentType(PaymentType.OFFLINE);
        record.setRecordedBy(String.valueOf(dto.getLibrarianId()));
        borrowRecordRepo.save(record);

        Payment payment = Payment.builder()
                .userId(record.getUser().getId())
                .amount(BigDecimal.valueOf(dto.getAmount()))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .paymentDate(LocalDateTime.now())
                .type(PaymentType.OFFLINE)
                .receivedBy(String.valueOf(dto.getLibrarianId()))
                .receivedAt(LocalDateTime.now())
                .memberName(record.getUser().getName())
                .memberEmail(record.getUser().getEmail())
                .bookTitle(record.getBook().getTitle())
                .build();

        paymentRepo.save(payment);
    }
}
