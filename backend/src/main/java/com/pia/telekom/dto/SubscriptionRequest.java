package com.pia.telekom.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SubscriptionRequest(
        @NotNull(message = "Müşteri seçimi zorunludur")
        Integer customerId,

        @NotNull(message = "Ürün seçimi zorunludur")
        Integer productId,

        LocalDate startDate,
        String status
) {
}