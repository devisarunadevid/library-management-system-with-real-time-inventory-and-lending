package com.library.lms.librario.controller;

import com.library.lms.librario.dto.ReservationRequestDTO;
import com.library.lms.librario.entity.Reservation;
import com.library.lms.librario.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // ✅ Reserve a book (POST JSON)
    @PostMapping
    public Reservation reserveBook(@RequestBody ReservationRequestDTO request) {
        return reservationService.reserveBookByEmail(request.getUserEmail(), request.getBookId());
    }

    // ✅ Cancel a reservation
    @DeleteMapping("/{reservationId}")
    public void cancelReservation(@PathVariable Long reservationId) {
        reservationService.cancelReservation(reservationId);
    }

    // ✅ Get reservations for a specific user
    @GetMapping("/user/{userId}")
    public List<Reservation> getUserReservations(@PathVariable Long userId) {
        return reservationService.getUserReservations(userId);
    }

    // ✅ Get all reservations (for librarians/admins)
    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    // ✅ New: Get reservation count for a specific book
    @GetMapping("/count")
    public Map<String, Integer> getReservationCount(@RequestParam Long bookId) {
        int count = reservationService.getReservationCountForBook(bookId);
        return Map.of("count", count);
    }
}
