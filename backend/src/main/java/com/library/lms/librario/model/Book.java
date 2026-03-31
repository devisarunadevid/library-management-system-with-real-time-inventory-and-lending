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
@Builder
@AllArgsConstructor
@NoArgsConstructor
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

    // --- Explicit Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getShelf() { return shelf; }
    public void setShelf(String shelf) { this.shelf = shelf; }

    public int getTotalCopies() { return totalCopies; }
    public void setTotalCopies(int totalCopies) { this.totalCopies = totalCopies; }

    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int availableCopies) { this.availableCopies = availableCopies; }

    public BookStatus getStatus() { return status; }
    public void setStatus(BookStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public BookCondition getCondition() { return condition; }
    public void setCondition(BookCondition condition) { this.condition = condition; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
