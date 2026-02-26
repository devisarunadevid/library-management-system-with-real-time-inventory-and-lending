package com.library.lms.librario.repository;

import com.library.lms.librario.model.OtpVerification;
import com.library.lms.librario.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByUserAndConsumedFalseOrderByCreatedAtDesc(User user);
    Optional<OtpVerification> findTopByUserOrderByCreatedAtDesc(User user);
    Optional<OtpVerification> findTopByEmailOrderByCreatedAtDesc(String email);// used after verify
}
