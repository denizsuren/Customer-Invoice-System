package com.pia.telekom.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RechargeResponse(
        Integer rechargeId, Integer customerId, String rechargeChannel,
        BigDecimal rechargeAmount, LocalDate rechargeDate
) {
}
