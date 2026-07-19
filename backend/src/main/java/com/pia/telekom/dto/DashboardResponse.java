package com.pia.telekom.dto;


import java.util.List;

public record DashboardResponse(
        String periodLabel,
        DashboardStats stats,
        List<RevenuePoint> revenuePoints,
        List<PackageDistributionItem> packageDistribution,
        long activeLineCount,
        List<CityRevenueItem> cityRevenue,
        List<String> recommendations,
        List<RevenueForecastItem> revenueForecast
) {
}