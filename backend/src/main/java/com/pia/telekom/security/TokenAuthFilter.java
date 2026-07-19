package com.pia.telekom.security;

import com.pia.telekom.repository.AdminSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TokenAuthFilter extends OncePerRequestFilter {

    private final AdminSessionRepository adminSessionRepository;

    private static final String[] PUBLIC_PATHS = {
            "/api/auth/login",
            "/v3/api-docs",
            "/swagger-ui"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        boolean isPublic = "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !path.startsWith("/api/")
                || java.util.Arrays.stream(PUBLIC_PATHS).anyMatch(path::startsWith);

        if (isPublic) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            respondUnauthorized(response, "Yetkilendirme başlığı eksik");
            return;
        }

        String token = authHeader.substring(7);
        boolean valid = adminSessionRepository.findByTokenAndExpiresAtAfter(token, LocalDateTime.now()).isPresent();

        if (!valid) {
            respondUnauthorized(response, "Oturum geçersiz veya süresi dolmuş");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void respondUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}");
    }
}