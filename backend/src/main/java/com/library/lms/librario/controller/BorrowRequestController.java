package com.library.lms.librario.controller;

import com.library.lms.librario.entity.BorrowRecord;
import com.library.lms.librario.entity.BorrowRequest;
import com.library.lms.librario.entity.enums.BookCondition;
import com.library.lms.librario.service.BorrowRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/borrow-requests")
@RequiredArgsConstructor
public class BorrowRequestController {

    private final BorrowRequestService service;

    // Member requests a book
    @PostMapping("/request")
    public BorrowRequest requestBook(@RequestParam Long userId, @RequestParam Long bookId) {
        return service.requestBorrow(userId, bookId); // ✅ match service
    }

    // Admin approves a borrow request
    @PostMapping("/approve/{id}")
    public BorrowRecord approveRequest(@PathVariable Long id) {
        return service.approveBorrow(id);
    }

    // Admin rejects a borrow request
    @PostMapping("/reject/{id}")
    public BorrowRequest rejectRequest(@PathVariable Long id, @RequestParam String reason) {
        return service.rejectRequest(id, reason);
    }

    // Member returns a book
    @PostMapping("/return/{id}")
    public BorrowRecord returnBook(@PathVariable Long id,
                                   @RequestParam(required = false) BookCondition condition) {
        return service.returnBook(id, condition);
    }

    // Member renews a book
    @PostMapping("/renew/{id}")
    public BorrowRecord renewBook(@PathVariable Long id) {
        return service.renewBook(id); // matches service method
    }

    // Admin: view pending requests
    @GetMapping("/pending")
    public List<BorrowRequest> getPendingRequests() {
        return service.getPendingRequests();
    }

    // Member: view own requests
    @GetMapping("/user/{userId}")
    public List<BorrowRequest> getUserRequests(@PathVariable Long userId) {
        return service.getUserRequests(userId);
    }
}
