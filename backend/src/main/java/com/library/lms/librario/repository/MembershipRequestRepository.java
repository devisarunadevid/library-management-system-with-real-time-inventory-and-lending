package com.library.lms.librario.repository;

import com.library.lms.librario.entity.MembershipRequest;
import com.library.lms.librario.model.User;
import com.library.lms.librario.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MembershipRequestRepository extends JpaRepository<MembershipRequest, Long> {

    // Find all requests by status (PENDING, APPROVED, REJECTED)
    List<MembershipRequest> findByStatus(RequestStatus status);

    // Find all requests for a specific user
    List<MembershipRequest> findByUser(User user);

    List<MembershipRequest> findByUserId(Long userId);
}
