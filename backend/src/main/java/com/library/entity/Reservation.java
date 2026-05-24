package com.library.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "copy_id")
    private Copy copy;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReservationStatus status = ReservationStatus.pending;

    @Column(name = "reserved_at")
    private LocalDateTime reservedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column
    private Boolean notified = false;

    @PrePersist
    protected void onCreate() {
        reservedAt = LocalDateTime.now();
    }

    public enum ReservationStatus {
        pending, confirmed, cancelled, expired, done
    }
}
