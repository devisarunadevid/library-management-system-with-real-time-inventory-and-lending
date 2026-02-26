package com.library.lms.librario.service;

import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.BorrowRequest;
import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.entity.enums.NotificationType;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.BookRepository;
import com.library.lms.librario.repository.BorrowRequestRepository;
import com.library.lms.librario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepo;
    private final BookRepository bookRepo;
    private final UserRepository userRepo;
    private final BorrowService borrowService;
    private final NotificationService notificationService;

    /** Member creates a borrow request */
    public BorrowRequest requestBorrow(Long userId, Long bookId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available");
        }

        BorrowRequest request = BorrowRequest.builder()
                .user(user)
                .book(book)
                .requestDate(LocalDateTime.now())
                .status(RequestStatus.PENDING)
                .build();

        BorrowRequest saved = borrowRequestRepo.save(request);

        // 🔔 Notify admin of new borrow request
        String body = "<p>New borrow request: <b>" + user.getName() + "</b> requested '<b>" + book.getTitle() + "</b>'.</p>";
        notificationService.createForAdmin(body, NotificationType.BORROW_REQUEST);

        return saved;
    }

    /** Admin rejects a borrow request */
    public BorrowRequest rejectRequest(Long requestId, String reason) {
        BorrowRequest req = borrowRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));
        req.setStatus(RequestStatus.REJECTED);
        BorrowRequest saved = borrowRequestRepo.save(req);

        // 🔔 Notify member
        String bodyUser = "<p>Your borrow request for '<b>" + req.getBook().getTitle() + "</b>' was rejected.</p>"
                + "<p>Reason: " + reason + "</p>";
        notificationService.createForMember(req.getUser().getId(), bodyUser);

        // 🔔 Notify admin about rejection (for record)
        String bodyAdmin = "<p>Borrow request by <b>" + req.getUser().getName() + "</b> for '<b>"
                + req.getBook().getTitle() + "</b>' was rejected.</p>";
        notificationService.createForAdmin(bodyAdmin, NotificationType.GENERAL);

        return saved;
    }

    /** Admin approves a borrow request */
    public BorrowRecord approveBorrow(Long requestId) {
        BorrowRecord record = borrowService.approveBorrow(requestId);

        // 🔔 Notify member
        String bodyUser = "<p>Your borrow request for '<b>" + record.getBook().getTitle() + "</b>' has been approved.</p>";
        notificationService.createForMember(record.getUser().getId(), bodyUser);

        // 🔔 Notify admin about approval
        String bodyAdmin = "<p>Borrow request approved for user <b>" + record.getUser().getName() + "</b> for book '<b>"
                + record.getBook().getTitle() + "</b>'.</p>";
        notificationService.createForAdmin(bodyAdmin, NotificationType.GENERAL);

        return record;
    }

    /** Member returns a borrowed book */
    public BorrowRecord returnBook(Long requestId, BookCondition condition) {
        BorrowRecord record = borrowService.returnBook(requestId, condition);

        // 🔔 Notify member
        String bodyUser = "<p>Book '<b>" + record.getBook().getTitle() + "</b>' returned successfully.</p>";
        notificationService.createForMember(record.getUser().getId(), bodyUser);

        // 🔔 Notify admin if damaged or needs repair
        if (condition == BookCondition.BAD || condition == BookCondition.NEEDS_REPAIR || condition == BookCondition.DAMAGED || condition == BookCondition.LOST) {
            String bodyAdmin = "<p>Book '<b>" + record.getBook().getTitle() + "</b>' returned in condition <b>" + condition.name() +
                    "</b> by <b>" + record.getUser().getName() + "</b>.</p>";
            notificationService.createForAdmin(bodyAdmin, NotificationType.GENERAL);
        }

        return record;
    }

    /** Member renews a borrowed book */
    public BorrowRecord renewBook(Long requestId) {
        BorrowRecord record = borrowService.renewBook(requestId);

        // 🔔 Notify member
        String bodyUser = "<p>Book '<b>" + record.getBook().getTitle() + "</b>' has been renewed.</p>"
                + "<p>New due date: " + record.getDueDate() + "</p>";
        notificationService.createForMember(record.getUser().getId(), bodyUser);

        // 🔔 Notify admin about renewal
        String bodyAdmin = "<p>User <b>" + record.getUser().getName() + "</b> renewed book '<b>"
                + record.getBook().getTitle() + "</b>'.</p>";
        notificationService.createForAdmin(bodyAdmin, NotificationType.GENERAL);

        return record;
    }

    /** Admin: get all pending borrow requests */
    public List<BorrowRequest> getPendingRequests() {
        return borrowRequestRepo.findAll()
                .stream()
                .filter(req -> req.getStatus() == RequestStatus.PENDING)
                .collect(Collectors.toList());
    }

    /** Member: get all requests by user */
    public List<BorrowRequest> getUserRequests(Long userId) {
        userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return borrowRequestRepo.findAll()
                .stream()
                .filter(req -> req.getUser().getId().equals(userId))
                .collect(Collectors.toList());
    }
}
