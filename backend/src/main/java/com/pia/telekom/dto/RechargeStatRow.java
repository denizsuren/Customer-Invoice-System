package com.pia.telekom.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RechargeStatRow(
        Integer customerId,
        LocalDate rechargeDate,
        BigDecimal rechargeAmount
) {
}