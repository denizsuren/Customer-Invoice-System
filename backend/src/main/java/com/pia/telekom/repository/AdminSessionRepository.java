package com.pia.telekom.repository;

import com.pia.telekom.entity.AdminSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AdminSessionRepository extends JpaRepository<AdminSession, String> {

    Optional<AdminSession> findByTokenAndExpiresAtAfter(String token, LocalDateTime now);

    void deleteByToken(String token);
}