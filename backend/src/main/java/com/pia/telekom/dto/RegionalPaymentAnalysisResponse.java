package com.pia.telekom.dto;

import java.math.BigDecimal;

public record RegionalPaymentAnalysisResponse(
        Integer regionId,
        String regionName,
        String city,
        long totalInvoiceCount,
        BigDecimal totalRevenue,
        double averageInvoiceAmount,
        double invoiceAmountStdDev,
        double overdueRatePercentage
) {
}