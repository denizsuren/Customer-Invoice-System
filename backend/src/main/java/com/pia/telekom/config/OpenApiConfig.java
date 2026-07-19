package com.pia.telekom.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI telekomOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Telekomünikasyon Analiz ve Yönetim Sistemi API")
                        .description("Müşteri, fatura ve analiz servislerini içeren API dokümantasyonu")
                        .version("v1.0"));
    }
}