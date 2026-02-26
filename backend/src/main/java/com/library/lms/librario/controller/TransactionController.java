package com.library.lms.librario.controller;


import com.library.lms.librario.entity.Transaction;
import com.library.lms.librario.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PutMapping("/renew/{id}")
    public ResponseEntity<Transaction> renewBook(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.renewBook(id));
    }
}
