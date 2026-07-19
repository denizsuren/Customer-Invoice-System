package com.pia.telekom.service;

import com.pia.telekom.dto.*;
import com.pia.telekom.entity.Invoice;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.InvoiceRepository;
import com.pia.telekom.repository.RevenueForecastRepository;
import com.pia.telekom.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pia.telekom.entity.RevenueForecast;
import com.pia.telekom.repository.RevenueForecastRepository;
import java.util.Comparator;
import com.pia.telekom.entity.Invoice;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final long RISK_THRESHOLD = 3;
    private static final int LOOKBACK_MONTHS = 12;

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final RevenueForecastService revenueForecastService;
    private final RegionalPaymentAnalysisService regionalPaymentAnalysisService;
    private final UpgradeRecommendationService upgradeRecommendationService;
    private final RevenueForecastRepository revenueForecastRepository;

    @Cacheable(value = "dashboardCache", key = "'main'", sync = true)
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        DashboardStats stats = buildStats();
        List<RevenuePoint> revenuePoints = buildRevenuePoints();
        List<PackageDistributionItem> packageDistribution = buildPackageDistribution();
        long activeLineCount = subscriptionRepository.countByStatusIgnoreCase("active");
        List<CityRevenueItem> cityRevenue = buildCityRevenue();
        List<String> recommendations = buildRecommendations(stats);
        List<RevenueForecastItem> revenueForecast = buildRevenueForecast();

        return new DashboardResponse(
                buildPeriodLabel(), stats, revenuePoints, packageDistribution,
                activeLineCount, cityRevenue, recommendations, revenueForecast
        );
    }

    private DashboardStats buildStats() {
        long totalCustomers = customerRepository.count();

        LocalDate maxInvoiceDate = invoiceRepository.findMaxInvoiceDate();
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        if (maxInvoiceDate != null) {
            YearMonth latestMonth = YearMonth.from(maxInvoiceDate);
            monthlyRevenue = invoiceRepository.sumInvoiceAmountBetween(
                    latestMonth.atDay(1), latestMonth.atEndOfMonth());
        }

        long overdueInvoiceCount = invoiceRepository.countByPaymentDateIsNullAndDueDateBefore(LocalDate.now());

        long riskyCustomerCount = invoiceRepository.findCustomerIdsWithOverdueCountAtLeast(
                LocalDate.now(), LocalDate.now().minusMonths(LOOKBACK_MONTHS), RISK_THRESHOLD).size();

        return new DashboardStats(totalCustomers, monthlyRevenue, overdueInvoiceCount, riskyCustomerCount);
    }

    private List<RevenuePoint> buildRevenuePoints() {
        return invoiceRepository.findMonthlyRevenueTotals().stream()
                .map(row -> new RevenuePoint(
                        String.valueOf(row[0]),
                        toBigDecimal(row[1])
                ))
                .toList();
    }

    private List<RevenueForecastItem> buildRevenueForecast() {
        return revenueForecastRepository.findAll().stream()
                .sorted(Comparator.comparing(RevenueForecast::getYearOffset))
                .map(r -> new RevenueForecastItem(
                        r.getLabel(), r.getReelBauRevenue(), r.getReelWithRecommendationsRevenue(), r.getReelFark()))
                .toList();
    }

    private List<PackageDistributionItem> buildPackageDistribution() {
        List<Object[]> rows = subscriptionRepository.countGroupedByCategory();

        long total = rows.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();

        return rows.stream()
                .map(r -> {
                    String category = String.valueOf(r[0]);
                    long count = ((Number) r[1]).longValue();
                    double percentage = total == 0 ? 0.0 : Math.round((count * 1000.0) / total) / 10.0;
                    return new PackageDistributionItem(category, count, percentage);
                })
                .toList();
    }

    private List<CityRevenueItem> buildCityRevenue() {
        return invoiceRepository.findCityRevenueTotals().stream()
                .map(row -> new CityRevenueItem(
                        String.valueOf(row[0]),
                        toBigDecimal(row[1]),
                        mapCityTypeToGroup(String.valueOf(row[2]))
                ))
                .toList();
    }

    private String mapCityTypeToGroup(String cityType) {
        if (cityType == null) return "Diğer";
        return switch (cityType.toLowerCase()) {
            case "metro" -> "Büyükşehir";
            case "mid" -> "Bölge merkezi";
            default -> "Diğer";
        };
    }

    private List<String> buildRecommendations(DashboardStats stats) {
        int upgradeCandidateCount = upgradeRecommendationService.getRecommendations().size();

        return List.of(
                "%d müşteri paket limitini sık aşıyor, üst pakete geçiş önerisi sunulabilir".formatted(upgradeCandidateCount),
                "%d müşteri son 12 ayda 3 veya daha fazla kez ödemesini geciktirdi".formatted(stats.riskyCustomerCount()),
                "%d fatura şu anda vadesi geçmiş ve ödenmemiş durumda".formatted(stats.overdueInvoiceCount())
        );
    }

    private String buildPeriodLabel() {
        LocalDate now = LocalDate.now();
        String month = now.getMonth().getDisplayName(TextStyle.FULL, new Locale("tr", "TR"));
        return month + " " + now.getYear();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal decimal) return decimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        return new BigDecimal(String.valueOf(value));
    }

}