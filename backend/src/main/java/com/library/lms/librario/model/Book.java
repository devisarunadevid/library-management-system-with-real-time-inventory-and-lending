package com.library.lms.librario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;   // for @NotBlank, @Min, @Max
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.library.lms.librario.entity.enums.BookStatus;
import com.library.lms.librario.entity.enums.BookCondition;


import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    private String author;

    private String genre;
    private String publisher;

    @Min(0)
    @Max(2100)
    private Integer year;

    @NotBlank
    @Column(unique = true)
    private String isbn;

    @Column(name = "shelf")
    private String shelf;

    @Min(0)
    @Column(nullable = false)
    private int totalCopies = 1;

    @Min(0)
    @Column(nullable = false)
    private int availableCopies = 1;

    @Enumerated(EnumType.STRING)
    private BookStatus status = BookStatus.AVAILABLE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "book_condition") // rename column
    private BookCondition condition = BookCondition.GOOD;

    @Version
    private int version;

    @Column(name = "image_url")
    private String imageUrl;

    /** Ensure valid state before insert/update */
    @PrePersist
    @PreUpdate
    private void validateCopies() {
        if (availableCopies > totalCopies) {
            throw new IllegalArgumentException("Available copies cannot exceed total copies");
        }
        this.status = (availableCopies > 0) ? BookStatus.AVAILABLE : BookStatus.UNAVAILABLE;
    }
}
