package com.library.lms.librario.service;

import com.library.lms.librario.entity.BorrowRequest;
import java.util.List;

public interface IBorrowRequestService {  // renamed to avoid conflict with class
    BorrowRequest requestBorrow(Long userId, Long bookId);

    BorrowRequest approveBorrow(Long requestId);

    BorrowRequest rejectRequest(Long requestId, String reason);

    BorrowRequest returnBook(Long requestId);

    BorrowRequest renewBook(Long requestId, int extraDays);

    List<BorrowRequest> getPendingRequests();

    List<BorrowRequest> getUserRequests(Long userId);
}
