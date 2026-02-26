package com.library.lms.librario.service;

import com.library.lms.librario.dto.OfflineFinePaymentRequest;
import com.library.lms.librario.dto.OfflineMembershipPaymentRequest;
import com.library.lms.librario.dto.OfflinePaymentDTO;
import com.library.lms.librario.entity.*;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.BorrowRecordRepository;
import com.library.lms.librario.repository.MembershipRequestRepository;
import com.library.lms.librario.repository.PaymentRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.mail.MailService;
import com.library.lms.librario.entity.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final MailService mailService;
    private final BorrowRecordRepository borrowRepo;
    private final MembershipRequestRepository membershipRequestRepo;

    // =====================================================
    // 1️⃣ GENERIC MEMBERSHIP PAYMENT HELPERS (dummy / non-Razorpay)
    // =====================================================

    // Create a new payment (dummy mode, not Razorpay order)
    public Payment createPayment(Long userId, Long membershipRequestId, Double amount) {
        User user = userRepo.findById(userId).orElse(null);

        Payment payment = Payment.builder()
                .userId(userId)
                .membershipRequestId(membershipRequestId)
                .amount(BigDecimal.valueOf(amount))
                .currency("INR")
                .status(PaymentStatus.INITIATED)
                .transactionId("TXN-" + UUID.randomUUID())
                .paymentDate(LocalDateTime.now())
                .type(PaymentType.ONLINE)                      // ✅ mark as ONLINE
                .memberName(user != null ? user.getName() : null)   // ✅ store member name
                .memberEmail(user != null ? user.getEmail() : null) // ✅ store member email
                .build();

        Payment saved = paymentRepo.save(payment);

        // 🔔 Notify user (acknowledgement)
        if (user != null) {
            notificationService.create(
                    user,
                    "MEMBER",
                    "Your payment of ₹" + amount + " has been initiated. Transaction ID: " + saved.getTransactionId(),
                    NotificationType.GENERAL
            );

            mailService.send(
                    user.getEmail(),
                    "Payment Initiated",
                    "Hello " + user.getName() + ",\n\nWe have received your payment request of ₹" + amount +
                            ".\nTransaction ID: " + saved.getTransactionId() +
                            "\nStatus: INITIATED\n\nLibrary Team"
            );
        }

        return saved;
    }

    // Mark payment as SUCCESS
    public Payment markPaymentSuccess(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("❌ Payment not found with id: " + paymentId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return payment; // already success
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setType(PaymentType.ONLINE);                 // ✅ ensure ONLINE

        User user = userRepo.findById(payment.getUserId()).orElse(null);
        if (user != null) {
            // ✅ Ensure memberName / memberEmail filled
            if (payment.getMemberName() == null) {
                payment.setMemberName(user.getName());
            }
            if (payment.getMemberEmail() == null) {
                payment.setMemberEmail(user.getEmail());
            }
        }

        Payment saved = paymentRepo.save(payment);

        // 🔔 Notify user & admin
        if (user != null) {
            notificationService.create(
                    user,
                    "MEMBER",
                    "Your payment of ₹" + payment.getAmount() + " was successful. Transaction ID: " + payment.getTransactionId(),
                    NotificationType.GENERAL
            );

            mailService.send(
                    user.getEmail(),
                    "Payment Successful",
                    "Hello " + user.getName() + ",\n\nYour payment of ₹" + payment.getAmount() +
                            " has been received successfully.\nTransaction ID: " + payment.getTransactionId() +
                            "\n\nLibrary Team"
            );

            notificationService.create(
                    user,
                    "ADMIN",
                    "Payment received from " + user.getName() + " (₹" + payment.getAmount() + ")",
                    NotificationType.GENERAL
            );

            mailService.send(
                    "admin@library.com",
                    "Payment Successful - " + user.getName(),
                    "User " + user.getName() + " has successfully paid ₹" + payment.getAmount() +
                            ".\nTransaction ID: " + payment.getTransactionId()
            );
        }

        return saved;
    }

    // Mark payment as FAILED
    public Payment markPaymentFailed(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("❌ Payment not found with id: " + paymentId));

        if (payment.getStatus() == PaymentStatus.FAILED) {
            return payment; // already failed
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setType(PaymentType.ONLINE);                 // ✅ still an ONLINE attempt

        User user = userRepo.findById(payment.getUserId()).orElse(null);
        if (user != null) {
            if (payment.getMemberName() == null) payment.setMemberName(user.getName());
            if (payment.getMemberEmail() == null) payment.setMemberEmail(user.getEmail());
        }

        Payment saved = paymentRepo.save(payment);

        // 🔔 Notify user
        if (user != null) {
            notificationService.create(
                    user,
                    "MEMBER",
                    "Your payment of ₹" + payment.getAmount() + " has failed. Please try again.",
                    NotificationType.GENERAL
            );

            mailService.send(
                    user.getEmail(),
                    "Payment Failed",
                    "Hello " + user.getName() + ",\n\nYour payment of ₹" + payment.getAmount() +
                            " has failed.\nTransaction ID: " + payment.getTransactionId() +
                            "\nPlease try again.\n\nLibrary Team"
            );
        }

        return saved;
    }

    // =====================================================
    // 2️⃣ ONLINE FINE PAYMENT (Razorpay success → already used in controller)
    // =====================================================

    @Transactional
    public Payment markFinePaymentSuccess(Long borrowRecordId, String razorpayPaymentId) {
        BorrowRecord record = borrowRepo.findById(borrowRecordId)
                .orElseThrow(() -> new IllegalArgumentException("Borrow record not found: " + borrowRecordId));

        if (record.getFineAmount() <= 0) {
            throw new IllegalStateException("No fine to pay for this record");
        }

        double fineAmount = record.getFineAmount();

        Payment payment = Payment.builder()
                .userId(record.getUser().getId())
                .borrowRecordId(borrowRecordId)                     // ✅ link to borrow record
                .amount(BigDecimal.valueOf(fineAmount))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .transactionId("TXN-" + UUID.randomUUID())
                .paymentId(razorpayPaymentId)
                .paymentDate(LocalDateTime.now())
                .type(PaymentType.ONLINE)                           // ✅ ONLINE fine
                .memberName(record.getUser().getName())
                .memberEmail(record.getUser().getEmail())
                .bookTitle(record.getBook().getTitle())
                .build();

        Payment savedPayment = paymentRepo.save(payment);

        record.setFinePaid(true);
        record.setPaymentId(razorpayPaymentId);
        record.setFineAmount(0.0);
        borrowRepo.save(record);

        User user = record.getUser();
        notificationService.create(
                user,
                "MEMBER",
                "Your overdue/damage/loss fine of ₹" + fineAmount +
                        " for '" + record.getBook().getTitle() + "' has been paid successfully.",
                NotificationType.GENERAL
        );

        mailService.send(
                user.getEmail(),
                "Fine Payment Successful",
                "Hello " + user.getName() + ",\n\nYour fine of ₹" + fineAmount +
                        " has been paid successfully.\nTransaction ID: " + savedPayment.getTransactionId() +
                        "\n\nLibrary Team"
        );

        return savedPayment;
    }

    // =====================================================
    // 3️⃣ OFFLINE MEMBERSHIP PAYMENT (via /api/payments/offline)
    // =====================================================

    public Payment recordOfflineMembershipPayment(OfflineMembershipPaymentRequest request) {
        User librarian = userRepo.findById(request.getLibrarianId())
                .orElseThrow(() -> new RuntimeException("Librarian not found"));
        if (librarian.getRole().getId() != 2) {
            throw new RuntimeException("User is not a librarian");
        }

        MembershipRequest membershipRequest = membershipRequestRepo
                .findById(request.getMembershipRequestId())
                .orElseThrow(() -> new RuntimeException("Membership request not found"));

        User memberUser = membershipRequest.getUser();

        Payment payment = new Payment();
        payment.setMembershipRequestId(request.getMembershipRequestId());
        payment.setUserId(memberUser.getId());
        payment.setAmount(BigDecimal.valueOf(request.getAmount()));
        payment.setCurrency("INR");
        payment.setType(PaymentType.OFFLINE);                     // ✅ OFFLINE
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRecordedBy(librarian.getId());
        payment.setReceivedBy(librarian.getName());
        payment.setReceivedAt(LocalDateTime.now());
        payment.setCreatedAt(LocalDateTime.now());
        // ✅ Fill membership history columns
        payment.setMemberName(memberUser.getName());
        payment.setMemberEmail(memberUser.getEmail());

        Payment savedPayment = paymentRepo.save(payment);

        membershipRequest.setPaid(true);
        membershipRequest.setStatus(RequestStatus.COMPLETED);
        membershipRequest.setCompletedDate(LocalDateTime.now());
        membershipRequestRepo.save(membershipRequest);

        notificationService.create(
                memberUser,
                "MEMBER",
                "Your offline membership payment of ₹" + request.getAmount() + " was recorded by " + librarian.getName(),
                NotificationType.GENERAL
        );

        mailService.send(
                memberUser.getEmail(),
                "Offline Payment Recorded",
                "Hello " + memberUser.getName() + ",\n\nYour offline membership payment of ₹" + request.getAmount() +
                        " has been recorded successfully by " + librarian.getName() + ".\n\nLibrary Team"
        );

        return savedPayment;
    }

    // =====================================================
    // 4️⃣ OFFLINE FINE PAYMENT (via /api/payments/offline-fine)
    // =====================================================

    public BorrowRecord recordOfflineFinePayment(OfflineFinePaymentRequest request) {
        User librarian = userRepo.findById(request.getLibrarianId())
                .orElseThrow(() -> new RuntimeException("Librarian not found"));

        if (librarian.getRole().getId() != 2) {
            throw new RuntimeException("User is not a librarian");
        }

        BorrowRecord record = borrowRepo.findById(request.getBorrowId())
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        double amount = request.getAmount() != null
                ? request.getAmount()
                : record.getFineAmount();

        Payment payment = Payment.builder()
                .userId(record.getUser().getId())
                .borrowRecordId(record.getId())                      // ✅ link to borrow
                .amount(BigDecimal.valueOf(amount))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .type(PaymentType.OFFLINE)                           // ✅ OFFLINE fine
                .paymentDate(LocalDateTime.now())
                .memberName(record.getUser().getName())
                .memberEmail(record.getUser().getEmail())
                .bookTitle(record.getBook().getTitle())
                .recordedBy(librarian.getId())
                .receivedBy(librarian.getName())
                .receivedAt(LocalDateTime.now())
                .build();
        paymentRepo.save(payment);

        record.setFinePaid(true);
        record.setFineAmount(0.0);
        record.setPaymentType(PaymentType.OFFLINE);
        record.setRecordedBy(librarian.getName());

        borrowRepo.save(record);

        return record;
    }

    // =====================================================
    // 5️⃣ ADMIN VIEWS / HISTORY
    // =====================================================

    // Get all payments (for admin dashboard)
    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    // Get all offline payments (raw)
    public List<Payment> getOfflinePayments() {
        return paymentRepo.findByType(PaymentType.OFFLINE);
    }

    // Mark an offline payment as received manually
    public Payment markAsReceived(Long id, String receivedBy) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setReceivedBy(receivedBy);
        payment.setReceivedAt(LocalDateTime.now());
        return paymentRepo.save(payment);
    }

    /**
     * ✅ Combined offline payments for frontend table:
     *  - MEMBERSHIP: from payments table (type=OFFLINE & membershipRequestId != null)
     *  - BORROW/FINE: from BorrowRecord (finePaid=true) mainly for legacy / extra info
     */
    public List<OfflinePaymentDTO> getOfflinePaymentsCombined() {

        // 1) Membership-related OFFLINE payments (from payments table)
        List<Payment> offlinePayments = paymentRepo.findByType(PaymentType.OFFLINE);

        List<Payment> membershipOffline = offlinePayments.stream()
                .filter(p -> p.getMembershipRequestId() != null)     // ✅ only membership
                .collect(Collectors.toList());

        List<OfflinePaymentDTO> membershipDtos = membershipOffline.stream()
                .map(p -> new OfflinePaymentDTO(
                        p.getId(),                                // sourceId
                        "MEMBERSHIP",                             // source
                        p.getId(),                                // paymentId
                        p.getMemberName(),
                        p.getMemberEmail(),
                        p.getBookTitle(),                         // usually null for membership
                        p.getAmount(),
                        p.getStatus() != null ? p.getStatus().name() : null,
                        p.getType() != null ? p.getType().name() : null,
                        p.getReceivedBy(),
                        p.getReceivedAt(),
                        p.getCreatedAt()
                ))
                .collect(Collectors.toList());

        // 2) Borrow records where finePaid = true (for FINE history)
        List<BorrowRecord> paidBorrows = borrowRepo.findByFinePaidTrue();

        List<OfflinePaymentDTO> borrowDtos = paidBorrows.stream().map(br -> {
            String memberName = br.getUser() != null ? br.getUser().getName() : null;
            String memberEmail = br.getUser() != null ? br.getUser().getEmail() : null;
            String bookTitle = br.getBook() != null ? br.getBook().getTitle() : null;
            BigDecimal amount = BigDecimal.valueOf(br.getFineAmount());
            String status = (br.getFinePaid() != null && br.getFinePaid()) ? "SUCCESS" : "INITIATED";
            LocalDateTime createdAt = br.getReturnDate() != null ? br.getReturnDate() : br.getBorrowDate();
            String receivedBy = br.getRecordedBy();                // ✅ use recordedBy, not paymentId

            return new OfflinePaymentDTO(
                    br.getId(),               // sourceId
                    "BORROW",                // source
                    null,                    // paymentId (not from payments table)
                    memberName,
                    memberEmail,
                    bookTitle,
                    amount,
                    status,
                    "FINE",                  // type label for UI
                    receivedBy,
                    null,                    // receivedAt unknown from BorrowRecord
                    createdAt
            );
        }).collect(Collectors.toList());

        // 3) Merge & sort by createdAt desc
        List<OfflinePaymentDTO> combined = new ArrayList<>();
        combined.addAll(membershipDtos);
        combined.addAll(borrowDtos);

        combined.sort((a, b) -> {
            LocalDateTime at = a.getCreatedAt();
            LocalDateTime bt = b.getCreatedAt();
            if (at == null && bt == null) return 0;
            if (at == null) return 1;
            if (bt == null) return -1;
            return bt.compareTo(at); // descending
        });

        return combined;
    }

}
