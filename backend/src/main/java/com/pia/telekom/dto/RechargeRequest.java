package com.pia.telekom.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RechargeRequest(
        String rechargeChannel,
        @NotNull(message = "Yükleme tutarı zorunludur") BigDecimal rechargeAmount,
        @NotNull(message = "Yükleme tarihi zorunludur") LocalDate rechargeDate
) {
}