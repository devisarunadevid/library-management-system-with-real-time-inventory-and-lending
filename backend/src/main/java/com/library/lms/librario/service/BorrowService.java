package com.library.lms.librario.service;

import com.library.lms.librario.dto.BorrowRecordDTO;
import com.library.lms.librario.dto.OfflineFinePaymentRequest;
import com.library.lms.librario.entity.*;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.entity.enums.NotificationType;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.*;
import com.library.lms.librario.service.mail.MailService;
import com.library.lms.librario.repository.PaymentRepository;
import com.library.lms.librario.entity.Payment;
import com.library.lms.librario.entity.PaymentStatus;
import com.library.lms.librario.entity.PaymentType;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository recordRepo;
    private final BorrowRequestRepository requestRepo;
    private final BookRepository bookRepo;
    private final UserRepository userRepo;
    private final MemberService memberService;
    private final ReservationRepository reservationRepo;
    private final MailService mailService;
    private final NotificationService notificationService;
    // 🔹 NEW: to store offline fine payments in payments table
    private final PaymentRepository paymentRepo;

    /** ADMIN: Approve borrow request */
    public BorrowRecord approveBorrow(Long requestId) {
        BorrowRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        Book book = req.getBook();
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book not available for borrowing");
        }

        Member member = memberService.getMemberByUser(req.getUser());
        if (member == null || member.getMembershipPlan() == null) {
            throw new RuntimeException("User has no active membership plan");
        }

        int borrowDays = member.getMembershipPlan().getBorrowDurationDays();

        BorrowRecord record = BorrowRecord.builder()
                .user(req.getUser())
                .book(book)
                .borrowDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(borrowDays))
                .status(BorrowStatus.BORROWED)
                .fineAmount(0.0)
                .build();

        // update entities
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        req.setStatus(RequestStatus.APPROVED);
        req.setIssueDate(LocalDateTime.now());

        // persist changes
        bookRepo.save(book);
        requestRepo.save(req);
        BorrowRecord saved = recordRepo.save(record);

        // notifications
        String message = "Your borrow request for '" + book.getTitle() + "' has been approved.";
        notificationService.create(req.getUser(), "MEMBER", message, NotificationType.GENERAL);
        mailService.send(req.getUser().getEmail(), "Borrow Request Approved", message);

        // 🔔 Notify Admin
        notificationService.createForAdmin(
                "Borrow request approved for user " + req.getUser().getName() + " for book '" + book.getTitle() + "'",
                NotificationType.GENERAL
        );

        return saved;
    }

    /** MEMBER: Return book */
    public BorrowRecord returnBook(Long recordId, BookCondition condition) {
        BorrowRecord record = recordRepo.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() != BorrowStatus.BORROWED &&
                record.getStatus() != BorrowStatus.OVERDUE) {
            throw new RuntimeException("Book already returned or not active");
        }

        record.setReturnDate(LocalDateTime.now());
        Member member = memberService.getMemberByUser(record.getUser());

        BigDecimal fine = calculateOverdueFine(record, member);

        if (condition != null) {
            record.setBookCondition(condition);
            switch (condition) {
                case DAMAGED -> fine = fine.add(calculateDamageFine(record, member));
                case LOST -> fine = fine.add(calculateLostFine(record, member));
            }
        }

        if (condition == BookCondition.DAMAGED || condition == BookCondition.LOST) {
            notificationService.createForAdmin(
                    "Book '" + record.getBook().getTitle() + "' returned in condition " + condition.name() +
                            " by " + record.getUser().getName(),
                    NotificationType.GENERAL
            );
        }

        record.setFineAmount(fine.doubleValue());

        Book book = record.getBook();
        if (condition != BookCondition.LOST) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepo.save(book);

            // auto-assign if reserved
            List<Reservation> reservations = reservationRepo.findByBook_IdAndNotifiedFalse(book.getId());
            if (!reservations.isEmpty()) {
                reservations.sort((r1, r2) -> r1.getReservedAt().compareTo(r2.getReservedAt()));
                Reservation firstReservation = reservations.get(0);

                try {
                    long activeBorrows = recordRepo.countByUserAndStatus(
                            firstReservation.getUser(), BorrowStatus.BORROWED);

                    if (activeBorrows == 0 && book.getAvailableCopies() > 0) {
                        Member reservedMember = memberService.getMemberByUser(firstReservation.getUser());

                        BorrowRecord autoRecord = BorrowRecord.builder()
                                .user(firstReservation.getUser())
                                .book(book)
                                .borrowDate(LocalDateTime.now())
                                .dueDate(LocalDateTime.now().plusDays(
                                        reservedMember.getMembershipPlan().getBorrowDurationDays()))
                                .status(BorrowStatus.BORROWED)
                                .fineAmount(0.0)
                                .build();

                        recordRepo.save(autoRecord);

                        book.setAvailableCopies(book.getAvailableCopies() - 1);
                        bookRepo.save(book);

                        firstReservation.setNotified(true);
                        reservationRepo.save(firstReservation);

                        String autoMsg = "The book '" + book.getTitle() + "' you reserved is now available and has been assigned to you.";
                        notificationService.create(firstReservation.getUser(), "MEMBER", autoMsg, NotificationType.GENERAL);
                        mailService.send(firstReservation.getUser().getEmail(), "Book Auto-Assigned", autoMsg);
                    }
                } catch (Exception e) {
                    System.err.println("Auto-assignment failed: " + e.getMessage());
                }
            }
        }

        // final status:
        // - LOST -> LOST
        // - DAMAGED -> DAMAGED
        // - otherwise: it is returned (even if late); leave fineAmount to show outstanding fines
        if (condition == BookCondition.LOST) {
            record.setStatus(BorrowStatus.LOST);
        } else if (condition == BookCondition.DAMAGED) {
            record.setStatus(BorrowStatus.DAMAGED);
        } else {
            // Always mark as RETURNED for returned books (even if returned after due date)
            record.setStatus(BorrowStatus.RETURNED);
        }

        BorrowRecord saved = recordRepo.save(record);

        // notifications
        String msg = "You have returned '" + record.getBook().getTitle() +
                "'. Fine: " + record.getFineAmount();
        notificationService.create(record.getUser(), "MEMBER", msg, NotificationType.GENERAL);
        mailService.send(record.getUser().getEmail(), "Book Returned", msg);

        return saved;
    }

    /** MEMBER: Renew book */
    public BorrowRecord renewBook(Long recordId) {
        BorrowRecord record = recordRepo.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        Member member = memberService.getMemberByUser(record.getUser());
        if (member == null || member.getMembershipPlan() == null) {
            throw new RuntimeException("User has no active membership plan");
        }

        int renewCount = record.getRenewCount() == null ? 0 : record.getRenewCount();
        if (renewCount >= 2) throw new RuntimeException("Maximum renewals reached");

        int extraDays = member.getMembershipPlan().getRenewalDays();
        record.setDueDate(record.getDueDate().plusDays(extraDays));
        record.setRenewCount(renewCount + 1);

        BorrowRecord saved = recordRepo.save(record);

        String msg = "Your borrow for '" + record.getBook().getTitle() +
                "' has been renewed. New due date: " + record.getDueDate();
        notificationService.create(record.getUser(), "MEMBER", msg, NotificationType.GENERAL);
        mailService.send(record.getUser().getEmail(), "Book Renewed", msg);

        return saved;
    }

    private BigDecimal calculateOverdueFine(BorrowRecord record, Member member) {
        if (record.getReturnDate() == null || record.getDueDate() == null) return BigDecimal.ZERO;

        if (member == null || member.getMembershipPlan() == null) {
            return BigDecimal.valueOf(10);
        }
        BigDecimal finePerDay = member.getMembershipPlan().getFinePerDay();
        if (finePerDay == null) finePerDay = BigDecimal.valueOf(10);

        long overdueDays = Duration.between(record.getDueDate(), record.getReturnDate()).toDays();
        return overdueDays > 0 ? finePerDay.multiply(BigDecimal.valueOf(overdueDays)) : BigDecimal.ZERO;
    }

    private BigDecimal calculateDamageFine(BorrowRecord record, Member member) {
        return BigDecimal.valueOf(200);
    }

    private BigDecimal calculateLostFine(BorrowRecord record, Member member) {
        return BigDecimal.valueOf(500);
    }

    /** MEMBER: Borrow history */
    public List<BorrowRecordDTO> historyForUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<BorrowRecord> records = recordRepo.findByUserOrderByBorrowDateDesc(user);

        return records.stream()
                .map(r -> new BorrowRecordDTO(
                        r.getId(),
                        r.getBook().getId(),
                        r.getBook().getTitle(),
                        r.getBorrowDate(),
                        r.getDueDate(),
                        r.getReturnDate(),
                        r.getFineAmount(),
                        r.getFinePaid(),
                        r.getStatus().name(),
                        r.getRenewCount(),
                        r.getUser() != null ? r.getUser().getId() : null,
                        r.getUser().getName(),
                        r.getUser().getEmail(),
                        r.getBookCondition() != null ? r.getBookCondition().name() : null
                ))
                .toList();
    }

    /** MEMBER: Request borrow */
    public BorrowRequest requestBorrow(String email, Long bookId) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book not available");
        }

        BorrowRequest request = BorrowRequest.builder()
                .user(user)
                .book(book)
                .status(RequestStatus.PENDING)
                .requestDate(LocalDateTime.now())
                .build();

        BorrowRequest saved = requestRepo.save(request);

        String msg = "Your borrow request for '" + book.getTitle() + "' has been submitted.";
        notificationService.create(user, "MEMBER", msg, NotificationType.GENERAL);
        mailService.send(user.getEmail(), "Borrow Request Submitted", msg);

        return saved;
    }

    /** ADMIN: Reject borrow */
    public void rejectBorrow(Long requestId) {
        BorrowRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        request.setStatus(RequestStatus.REJECTED);
        requestRepo.save(request);

        String msg = "Your borrow request for '" + request.getBook().getTitle() + "' has been rejected.";
        notificationService.create(request.getUser(), "MEMBER", msg, NotificationType.GENERAL);
        mailService.send(request.getUser().getEmail(), "Borrow Request Rejected", msg);
    }

    /** MEMBER: Report damage/loss */
    public BorrowRecord reportDamageOrLoss(Long borrowId, String condition) {
        BorrowRecord record = recordRepo.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() != BorrowStatus.BORROWED &&
                record.getStatus() != BorrowStatus.OVERDUE) {
            throw new RuntimeException("Book already returned or not active");
        }

        String normalized = condition.toLowerCase();
        BorrowStatus newStatus;
        BookCondition bookCondition;
        double fine;

        switch (normalized) {
            case "damaged" -> {
                newStatus = BorrowStatus.DAMAGED;
                bookCondition = BookCondition.DAMAGED;
                fine = 200;
            }
            case "lost" -> {
                newStatus = BorrowStatus.LOST;
                bookCondition = BookCondition.LOST;
                fine = 500;
            }
            default -> throw new RuntimeException("Invalid condition: " + condition);
        }

        record.setStatus(newStatus);
        record.setBookCondition(bookCondition);
        record.setReturnDate(LocalDateTime.now());
        record.setFineAmount(record.getFineAmount() + fine);

        BorrowRecord saved = recordRepo.save(record);

        String msg = "You reported '" + record.getBook().getTitle() + "' as " +
                newStatus.name() + ". Fine: " + fine;
        notificationService.create(record.getUser(), "MEMBER", msg, NotificationType.GENERAL);
        mailService.send(record.getUser().getEmail(), "Book Reported " + newStatus.name(), msg);

        return saved;
    }

    /** ADMIN: Get all pending requests */
    public List<BorrowRequest> getPendingRequests() {
        return requestRepo.findByStatus(RequestStatus.PENDING);
    }

    /** ADMIN: Get all requests */
    public List<BorrowRequest> getAllRequests() {
        return requestRepo.findAll();
    }

    /** ADMIN/LIBRARIAN: Get all borrow records as DTOs */
    public List<BorrowRecordDTO> getAllRecordsDTO() {
        List<BorrowRecord> records = recordRepo.findAll();

        return records.stream()
                .map(r -> new BorrowRecordDTO(
                        r.getId(),
                        r.getBook().getId(),
                        r.getBook().getTitle(),
                        r.getBorrowDate(),
                        r.getDueDate(),
                        r.getReturnDate(),
                        r.getFineAmount(),
                        r.getFinePaid(),
                        r.getStatus().name(),
                        r.getRenewCount(),
                        r.getUser() != null ? r.getUser().getId() : null,
                        r.getUser().getName(),
                        r.getUser().getEmail(),
                        r.getBookCondition() != null ? r.getBookCondition().name() : null
                ))
                .toList();
    }

    // ==============================
    // OFFLINE FINE PAYMENT (LIBRARIAN/ADMIN)
    // ==============================

    /** LIBRARIAN/ADMIN: Record offline fine payment */
    public BorrowRecord recordOfflineFinePayment(OfflineFinePaymentRequest request) {
        User librarian = userRepo.findById(request.getLibrarianId())
                .orElseThrow(() -> new RuntimeException("Librarian not found"));
        if (librarian.getRole().getId() != 2) {
            throw new RuntimeException("User is not a librarian");
        }

        BorrowRecord record = recordRepo.findById(request.getBorrowId())
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        // ✅ Amount actually paid (fallback to existing fineAmount if not provided)
        double amount = request.getAmount() != null
                ? request.getAmount()
                : (record.getFineAmount() != 0.0 ? record.getFineAmount() : 0.0);

        // ✅ Create a Payment row for this offline fine
        Payment payment = Payment.builder()
                .userId(record.getUser().getId())
                .amount(BigDecimal.valueOf(amount))
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .type(PaymentType.OFFLINE)
                .paymentDate(LocalDateTime.now())
                .memberName(record.getUser().getName())
                .memberEmail(record.getUser().getEmail())
                .bookTitle(record.getBook().getTitle())
                .recordedBy(librarian.getId())     // store librarian id
                .receivedBy(librarian.getName())   // who collected
                .receivedAt(LocalDateTime.now())
                .build();
        paymentRepo.save(payment);

        // ✅ Update borrow record as before
        record.setFinePaid(true);
        record.setFineAmount(0.0);
        record.setPaymentType(PaymentType.OFFLINE);
        record.setRecordedBy(librarian.getName());

        return recordRepo.save(record);
    }

    /** LIBRARIAN/ADMIN: Get all offline fine payments */
    public List<BorrowRecord> getAllOfflineFines() {
        return recordRepo.findByPaymentType(PaymentType.OFFLINE);
    }

    /** LIBRARIAN/ADMIN: Get all unpaid fines */
    public List<BorrowRecordDTO> getUnpaidFines() {
        List<BorrowRecord> records = recordRepo.findByFineAmountGreaterThanAndFinePaidFalse(0.0);

        return records.stream()
                .map(r -> new BorrowRecordDTO(
                        r.getId(),
                        r.getBook().getId(),
                        r.getBook().getTitle(),
                        r.getBorrowDate(),
                        r.getDueDate(),
                        r.getReturnDate(),
                        r.getFineAmount(),
                        r.getFinePaid(),
                        r.getStatus().name(),
                        r.getRenewCount(),
                        r.getUser() != null ? r.getUser().getId() : null,
                        r.getUser().getName(),
                        r.getUser().getEmail(),
                        r.getBookCondition() != null ? r.getBookCondition().name() : null
                ))
                .toList();
    }

}
