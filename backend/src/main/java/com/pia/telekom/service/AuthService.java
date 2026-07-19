package com.pia.telekom.service;

import com.pia.telekom.dto.LoginRequest;
import com.pia.telekom.dto.LoginResponse;
import com.pia.telekom.entity.AdminSession;
import com.pia.telekom.entity.Administrator;
import com.pia.telekom.exception.InvalidCredentialsException;
import com.pia.telekom.repository.AdminSessionRepository;
import com.pia.telekom.repository.AdministratorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long SESSION_DURATION_HOURS = 24;

    private final AdministratorRepository administratorRepository;
    private final AdminSessionRepository adminSessionRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Administrator admin = administratorRepository
                .findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = UUID.randomUUID().toString();

        AdminSession session = AdminSession.builder()
                .token(token)
                .adminId(admin.getAdminId())
                .expiresAt(LocalDateTime.now().plusHours(SESSION_DURATION_HOURS))
                .build();
        adminSessionRepository.save(session);

        return new LoginResponse(token, admin.getEmail(), admin.getFullName(), "ADMIN");
    }

    @Transactional
    public void logout(String token) {
        adminSessionRepository.deleteByToken(token);
    }
}