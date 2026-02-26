package com.library.lms.librario.service;

import com.library.lms.librario.entity.BorrowRequest;
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

@Service
@RequiredArgsConstructor
public class BorrowRequestServiceImpl implements IBorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepo;
    private final BookRepository bookRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    /** Member creates a borrow request */
    @Override
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

        return borrowRequestRepo.save(request);
    }

    /** Admin rejects a borrow request */
    @Override
    public BorrowRequest rejectRequest(Long requestId, String reason) {
        BorrowRequest req = borrowRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));
        req.setStatus(RequestStatus.REJECTED);
        return borrowRequestRepo.save(req);
    }

    /** Get all pending requests */
    @Override
    public List<BorrowRequest> getPendingRequests() {
        return borrowRequestRepo.findByStatus(RequestStatus.PENDING);
    }

    /** Get all requests by a specific user */
    @Override
    public List<BorrowRequest> getUserRequests(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return borrowRequestRepo.findByUser(user);
    }

    /** Approve, return, renew methods will delegate to BorrowService */
    @Override
    public BorrowRequest approveBorrow(Long requestId) {
        // call BorrowService.approveBorrow(requestId)
        throw new UnsupportedOperationException("Implement BorrowService delegation");
    }

    @Override
    public BorrowRequest returnBook(Long requestId) {
        throw new UnsupportedOperationException("Implement BorrowService delegation");
    }

    @Override
    public BorrowRequest renewBook(Long requestId, int extraDays) {
        throw new UnsupportedOperationException("Implement BorrowService delegation");
    }
}
