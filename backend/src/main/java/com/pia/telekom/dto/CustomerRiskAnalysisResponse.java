package com.pia.telekom.dto;

import java.math.BigDecimal;

public record CustomerRiskAnalysisResponse(
        Integer customerId,
        String customerName,
        BigDecimal riskScore,
        String behaviorCategory,
        String recommendAction
) {
}