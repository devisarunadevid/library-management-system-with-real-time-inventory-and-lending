package com.library.lms.librario.repository;

import com.library.lms.librario.entity.BorrowRequest;
import com.library.lms.librario.entity.enums.RequestStatus;
import com.library.lms.librario.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    // Find requests by status (PENDING, APPROVED, REJECTED)
    List<BorrowRequest> findByStatus(String status);

    // Find all requests of a specific user
    List<BorrowRequest> findByUser(User user);

    // BorrowRequestRepository.java
    List<BorrowRequest> findByStatus(RequestStatus status);
}
