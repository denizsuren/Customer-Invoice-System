package com.pia.telekom.config;

import com.pia.telekom.entity.Administrator;
import com.pia.telekom.repository.AdministratorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/*
  Uygulama her açıldığında çalışır. administrator tablosu boşsa,
  application.yml'deki bilgilerle otomatik ilk admin kullanıcısını oluşturur.
  Tabloda zaten kayıt varsa hiçbir şey yapmaz (idempotent).
*/
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final AdministratorRepository administratorRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    @Override
    @Transactional
    public void run(String... args) {
        if (administratorRepository.count() > 0) {
            log.info("Admin kullanıcı zaten mevcut, ilk admin oluşturma atlandı.");
            return;
        }

        Administrator admin = Administrator.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .fullName(adminFullName)
                .build();

        administratorRepository.save(admin);
        log.info("İlk admin kullanıcısı oluşturuldu: {}", adminEmail);
    }
}