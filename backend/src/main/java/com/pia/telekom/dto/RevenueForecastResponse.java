package com.pia.telekom.dto;

import java.math.BigDecimal;
import java.util.List;

public record RevenueForecastResponse(
        List<MonthlyRevenue> historicalData,
        double slope,
        double intercept,
        BigDecimal nextMonthForecast,
        BigDecimal nextYearForecast,
        double rSquared
) {
    public record MonthlyRevenue(String yearMonth, BigDecimal revenue) {
    }
}