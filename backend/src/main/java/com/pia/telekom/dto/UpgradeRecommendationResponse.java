package com.pia.telekom.dto;

import java.math.BigDecimal;

public record UpgradeRecommendationResponse(
        Integer customerId,
        String customerFullName,
        Integer currentProductId,
        String currentProductName,
        int overageInvoiceCount,
        BigDecimal totalOverageAmount,
        String recommendation
) {
}