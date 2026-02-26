package com.library.lms.librario.repository;

import com.library.lms.librario.entity.Payment;
import com.library.lms.librario.entity.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    List<Payment> findByMembershipRequestId(Long membershipRequestId);

    // For Razorpay order id
    Optional<Payment> findByOrderId(String orderId);

    // For Razorpay payment id
    Optional<Payment> findByPaymentId(String paymentId);

    // ✅ New method to get all payments by type (ONLINE / OFFLINE)
    List<Payment> findByType(PaymentType type);
}
