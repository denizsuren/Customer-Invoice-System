package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_session")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminSession {

    @Id
    @Column(name = "token", length = 36)
    private String token;

    @Column(name = "admin_id", nullable = false)
    private Integer adminId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}