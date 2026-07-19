package com.pia.telekom.service;
/*
import com.pia.telekom.dto.RevenueForecastResponse;
import com.pia.telekom.entity.Invoice;
import com.pia.telekom.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueForecastService {

    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public RevenueForecastResponse forecastRevenue() {
        List<Invoice> allInvoices = invoiceRepository.findAll();

        Map<YearMonth, BigDecimal> monthlyRevenue = allInvoices.stream()
                .collect(Collectors.groupingBy(
                        inv -> YearMonth.from(inv.getInvoiceDate()),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Invoice::getInvoiceAmount, BigDecimal::add)
                ));

        SimpleRegression regression = new SimpleRegression();
        List<RevenueForecastResponse.MonthlyRevenue> historicalData = new java.util.ArrayList<>();

        int index = 0;
        for (Map.Entry<YearMonth, BigDecimal> entry : monthlyRevenue.entrySet()) {
            regression.addData(index, entry.getValue().doubleValue());
            historicalData.add(new RevenueForecastResponse.MonthlyRevenue(
                    entry.getKey().toString(), entry.getValue()));
            index++;
        }

        double slope = 0.0;
        double intercept = 0.0;
        double rSquared = 0.0;
        BigDecimal nextMonthForecast = BigDecimal.ZERO;
        BigDecimal nextYearForecast = BigDecimal.ZERO;

        if (monthlyRevenue.size() >= 2) {
            slope = regression.getSlope();
            intercept = regression.getIntercept();
            rSquared = regression.getRSquare();

            double nextMonthValue = regression.predict(index);
            double nextYearValue = regression.predict(index + 11);

            nextMonthForecast = toMoney(nextMonthValue);
            nextYearForecast = toMoney(nextYearValue * 12);
        }

        return new RevenueForecastResponse(
                historicalData, round(slope), round(intercept),
                nextMonthForecast, nextYearForecast, round(rSquared)
        );
    }

    private BigDecimal toMoney(double value) {
        if (Double.isNaN(value) || value < 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private double round(double value) {
        if (Double.isNaN(value)) {
            return 0.0;
        }
        return Math.round(value * 10000.0) / 10000.0;
    }
}

*/


import com.pia.telekom.entity.RevenueForecast;
import com.pia.telekom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueForecastService {

    // Benimseme oranları — forecast_assumptions.csv'den (kendi varsayımlarımız, dokümante edilmiş)
    private static final Map<String, double[]> ADOPTION_RATES = Map.of(
            "oto_odeme_teklifi", new double[]{0.20, 0.35},
            "oto_odeme_hatirlatma", new double[]{0.10, 0.20},
            "yuksek_tarife_teklifi", new double[]{0.15, 0.30},
            "faturali_tarifeye_gecis_teklifi", new double[]{0.15, 0.28},
            "ek_paket_teklifi", new double[]{0.15, 0.30}
    );

    private static final BigDecimal EK_PAKET_MONTHLY_FEE = BigDecimal.valueOf(40);
    private static final LocalDate OBS_START = LocalDate.of(2026, 1, 1);
    private static final LocalDate OBS_END = LocalDate.of(2026, 6, 30);

    private final CustomerRiskAnalysisRepository riskAnalysisRepository;
    private final InvoiceRepository invoiceRepository;
    private final RechargeRepository rechargeRepository;
    private final ProductRepository productRepository;
    private final RevenueForecastRepository revenueForecastRepository;

    @Transactional
    public List<RevenueForecast> recalculateForecast() {
        Map<String, Long> actionCounts = riskAnalysisRepository.countGroupedByRecommendAction().stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        BigDecimal reelFarkY1 = calculateReelFark(actionCounts, 0);
        BigDecimal reelFarkY2 = calculateReelFark(actionCounts, 1);

        BigDecimal baseRevenue = calculateBaseRevenue();

        RevenueForecast year0 = RevenueForecast.builder()
                .yearOffset(0).label("Baz (gözlem yılı)")
                .reelBauRevenue(baseRevenue)
                .reelWithRecommendationsRevenue(baseRevenue)
                .reelFark(BigDecimal.ZERO)
                .build();

        RevenueForecast year1 = RevenueForecast.builder()
                .yearOffset(1).label("Yıl +1")
                .reelBauRevenue(baseRevenue)
                .reelWithRecommendationsRevenue(baseRevenue.add(reelFarkY1))
                .reelFark(reelFarkY1)
                .build();

        RevenueForecast year2 = RevenueForecast.builder()
                .yearOffset(2).label("Yıl +2")
                .reelBauRevenue(baseRevenue)
                .reelWithRecommendationsRevenue(baseRevenue.add(reelFarkY2))
                .reelFark(reelFarkY2)
                .build();

        List<RevenueForecast> results = List.of(year0, year1, year2);
        revenueForecastRepository.saveAll(results);
        return results;
    }

    private BigDecimal calculateReelFark(Map<String, Long> actionCounts, int yearIndex) {
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<String, double[]> entry : ADOPTION_RATES.entrySet()) {
            String action = entry.getKey();
            double rate = entry.getValue()[yearIndex];
            long n = actionCounts.getOrDefault(action, 0L);
            long adopters = Math.round(n * rate);

            BigDecimal contribution = switch (action) {
                case "oto_odeme_teklifi", "oto_odeme_hatirlatma" -> autopayContribution(adopters);
                case "yuksek_tarife_teklifi" -> upgradeFeeContribution(adopters);
                case "faturali_tarifeye_gecis_teklifi" -> prepaidToPostpaidContribution(adopters);
                case "ek_paket_teklifi" -> adopters == 0 ? BigDecimal.ZERO
                        : EK_PAKET_MONTHLY_FEE.multiply(BigDecimal.valueOf(adopters * 12L));
                default -> BigDecimal.ZERO;
            };
            total = total.add(contribution);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal autopayContribution(long adopters) {
        if (adopters == 0) return BigDecimal.ZERO;
        BigDecimal avgUnpaidValue = invoiceRepository.averageUnpaidValuePerCustomer();
        if (avgUnpaidValue == null) return BigDecimal.ZERO;
        return avgUnpaidValue.multiply(BigDecimal.valueOf(adopters)).multiply(BigDecimal.valueOf(2));
    }

    private BigDecimal upgradeFeeContribution(long adopters) {
        if (adopters == 0) return BigDecimal.ZERO;
        BigDecimal avgFeeGap = productRepository.averageUpgradeFeeGap();
        if (avgFeeGap == null) return BigDecimal.ZERO;
        return avgFeeGap.multiply(BigDecimal.valueOf(adopters)).multiply(BigDecimal.valueOf(12));
    }

    private BigDecimal prepaidToPostpaidContribution(long adopters) {
        if (adopters == 0) return BigDecimal.ZERO;
        BigDecimal avgSuggestedFee = productRepository.averageEntryPostpaidFee();
        if (avgSuggestedFee == null) return BigDecimal.ZERO;
        return avgSuggestedFee.multiply(BigDecimal.valueOf(adopters)).multiply(BigDecimal.valueOf(12));
    }

    private BigDecimal calculateBaseRevenue() {
        BigDecimal invoiceSum = invoiceRepository.sumInvoiceAmountBetween(OBS_START, OBS_END);
        BigDecimal rechargeSum = rechargeRepository.sumValidRechargeAmount();

        BigDecimal total = (invoiceSum != null ? invoiceSum : BigDecimal.ZERO)
                .add(rechargeSum != null ? rechargeSum : BigDecimal.ZERO);

        return total.multiply(BigDecimal.valueOf(2)).setScale(2, RoundingMode.HALF_UP); // 6 ay -> 12 ay
    }
}