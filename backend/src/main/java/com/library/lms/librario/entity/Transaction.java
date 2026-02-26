package com.library.lms.librario.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "transactions")
@Getter
@Setter
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    private double fine = 0;
    private String status = "BORROWED";

    @Column(name = "renewals_done")
    private int renewalsDone = 0;
}
