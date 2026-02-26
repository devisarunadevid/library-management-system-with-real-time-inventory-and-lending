package com.library.lms.librario.repository;

import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.PaymentType;
import com.library.lms.librario.entity.enums.BorrowStatus;
import com.library.lms.librario.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    long countByUserAndStatus(User user, BorrowStatus status);
    List<BorrowRecord> findByUserOrderByBorrowDateDesc(User user);
    List<BorrowRecord> findByStatus(BorrowStatus status);
    List<BorrowRecord> findByUser_Id(Long userId);
    List<BorrowRecord> findByFinePaidTrue();
    List<BorrowRecord> findByPaymentType(PaymentType paymentType);
    List<BorrowRecord> findByFineAmountGreaterThanAndFinePaidFalse(Double fineAmount);
}
