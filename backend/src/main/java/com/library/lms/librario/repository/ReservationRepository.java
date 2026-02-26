package com.library.lms.librario.repository;

import com.library.lms.librario.entity.Reservation;
import com.library.lms.librario.entity.ReservationStatus;
import com.library.lms.librario.model.Book;
import com.library.lms.librario.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);

    List<Reservation> findByBook(Book book);

    Optional<Reservation> findByBookAndStatus(Book book, ReservationStatus status);

    List<Reservation> findByBook_IdAndNotifiedFalse(Long bookId);

    // ✅ New method for reservation count
    int countByBookAndStatus(Book book, ReservationStatus status);
}

