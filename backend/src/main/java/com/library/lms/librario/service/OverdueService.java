package com.library.lms.librario.service;

import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.Member;
import com.library.lms.librario.model.User;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.entity.enums.NotificationType;
import com.library.lms.librario.repository.BorrowRecordRepository;
import com.library.lms.librario.repository.MemberRepository;
import com.library.lms.librario.service.mail.MailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OverdueService {

    private final BorrowRecordRepository borrowRepo;
    private final MemberRepository memberRepo;
    private final ConfigService configService;

    // ✅ Services for notifications + email
    private final NotificationService notificationService;
    private final MailService mailService;

    public List<BorrowRecord> getOverdueBooks() {
        LocalDateTime now = LocalDateTime.now();

        return borrowRepo.findByStatus(BorrowStatus.BORROWED)
                .stream()
                .filter(r -> r.getDueDate() != null
                        && r.getReturnDate() == null
                        && r.getDueDate().isBefore(now))
                .collect(Collectors.toList());
    }

    public List<BorrowRecord> getAllCurrentlyOverdue() {
        LocalDateTime now = LocalDateTime.now();

        // Borrowed but past due and not returned
        List<BorrowRecord> borrowedPastDue = borrowRepo.findByStatus(BorrowStatus.BORROWED)
                .stream()
                .filter(r -> r.getDueDate() != null
                        && r.getReturnDate() == null
                        && r.getDueDate().isBefore(now))
                .peek(this::calculateFine) // recalc fines
                .collect(Collectors.toList());

        // Already marked OVERDUE — but ensure not returned (returnDate == null)
        List<BorrowRecord> alreadyOverdue = borrowRepo.findByStatus(BorrowStatus.OVERDUE)
                .stream()
                .filter(r -> r.getReturnDate() == null) // <-- exclude any records that have been returned
                .peek(this::calculateFine)
                .collect(Collectors.toList());

        var combined = borrowedPastDue.stream()
                .collect(Collectors.toMap(BorrowRecord::getId, r -> r));
        for (BorrowRecord br : alreadyOverdue) {
            combined.putIfAbsent(br.getId(), br);
        }
        return combined.values().stream().collect(Collectors.toList());
    }

    public BigDecimal calculateFine(BorrowRecord record) {
        if (record == null || record.getDueDate() == null) return BigDecimal.ZERO;

        // ✅ Use LocalDate instead of LocalDateTime to avoid time truncation errors
        LocalDate dueDate = record.getDueDate().toLocalDate();
        LocalDate now = LocalDate.now();

        // If returned, calculate until return date; else until today
        LocalDate until = (record.getReturnDate() != null)
                ? record.getReturnDate().toLocalDate()
                : now;

        long daysLate = ChronoUnit.DAYS.between(dueDate, until);

        if (daysLate <= 0) return BigDecimal.ZERO;

        Member member = memberRepo.findByUser_Id(record.getUser().getId()).orElse(null);

        BigDecimal finePerDay = (member != null && member.getMembershipPlan() != null
                && member.getMembershipPlan().getFinePerDay() != null)
                ? member.getMembershipPlan().getFinePerDay()
                : configService.getFinePerDay();

        BigDecimal fine = finePerDay.multiply(BigDecimal.valueOf(daysLate));

        // ✅ Update record so frontend gets correct data even if not saved yet
        record.setFineAmount(fine.doubleValue());
        record.setDaysOverdue((int) daysLate);

        return fine;
    }

    public List<BorrowRecord> getOverdueForUser(Long userId) {
        return getAllCurrentlyOverdue().stream()
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(userId))
                .peek(this::calculateFine) // ✅ ensures fine is refreshed
                .collect(Collectors.toList());
    }

    public long getBorrowedBooksCount() {
        return borrowRepo.findByStatus(com.library.lms.librario.entity.enums.BorrowStatus.BORROWED)
                .stream()
                .filter(r -> r.getReturnDate() == null)
                .count();
    }

    public BorrowRecord findById(Long id) {
        return borrowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found: " + id));
    }

    @Transactional
    public BorrowRecord waiveFine(Long borrowId) {
        BorrowRecord r = findById(borrowId);
        r.setFineAmount(0.0);
        // Mark the fine as paid/cleared so UI/backends can exclude it
        r.setFinePaid(Boolean.TRUE);
        // optionally set a paymentId/note to indicate waived
        r.setPaymentId("WAIVED-" + System.currentTimeMillis());

        BorrowRecord saved = borrowRepo.save(r);

        // Send notification + email on fine waiver
        User user = r.getUser();
        if (user != null) {
            notificationService.create(
                    user,
                    "MEMBER",
                    "Your fine for '" + r.getBook().getTitle() + "' has been waived.",
                    NotificationType.GENERAL
            );

            mailService.send(
                    user.getEmail(),
                    "Fine Waived",
                    "Hello " + user.getName() + ",\n\nYour fine for '" +
                            r.getBook().getTitle() + "' has been waived successfully.\n\nLibrary Team"
            );
        }

        return saved;
    }

    /**
     * Scheduled job to mark overdue and compute fines.
     * Runs daily at 02:00 by default.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void processOverdues() {
        var overdue = getAllCurrentlyOverdue();

        for (BorrowRecord r : overdue) {
            var fine = calculateFine(r);
            r.setFineAmount(fine.doubleValue());
            r.setStatus(BorrowStatus.OVERDUE);
            borrowRepo.save(r);

            // ✅ Send notification + email for overdue
            User user = r.getUser();
            if (user != null) {
                notificationService.create(
                        user,
                        "MEMBER",
                        "The book '" + r.getBook().getTitle() + "' is overdue. Fine so far: " + fine + ".",
                        NotificationType.GENERAL
                );

                mailService.send(
                        user.getEmail(),
                        "Book Overdue - Action Required",
                        "Hello " + user.getName() + ",\n\nThe book '" + r.getBook().getTitle() +
                                "' is overdue.\nFine so far: " + fine +
                                ". Please return it as soon as possible.\n\nLibrary Team"
                );
            }
        }
    }

    @Transactional
    public void runManualProcess() {
        processOverdues();
    }
}
