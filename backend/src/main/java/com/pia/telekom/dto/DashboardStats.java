package com.pia.telekom.dto;

import java.math.BigDecimal;

public record DashboardStats(
        long totalCustomers,
        BigDecimal monthlyRevenue,
        long overdueInvoiceCount,
        long riskyCustomerCount
) {
}