package com.pia.telekom.service;

import com.pia.telekom.dto.CustomerRiskAnalysisResponse;
import com.pia.telekom.dto.RecommendationSummaryItem;
import com.pia.telekom.dto.SubscriptionTypeRow;
import com.pia.telekom.entity.CustomerRiskAnalysis;
import com.pia.telekom.entity.CustomerStats;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.CustomerRiskAnalysisRepository;
import com.pia.telekom.repository.CustomerStatsRepository;
import com.pia.telekom.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pia.telekom.dto.CustomerRiskAnalysisResponse;
import com.pia.telekom.dto.RecommendationSummaryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.pia.telekom.dto.RiskCategorySummaryItem;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerRiskAnalysisService {

    private static final BigDecimal GUVENLI_MAX = BigDecimal.valueOf(16.9);
    private static final BigDecimal ORTA_RISK_MAX = BigDecimal.valueOf(32.9);
    private static final int PASIF_RECENCY_THRESHOLD_DAYS = 25;

    private final CustomerStatsRepository customerStatsRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CustomerRiskAnalysisRepository customerRiskAnalysisRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public int recalculateAll() {
        List<CustomerStats> allStats = customerStatsRepository.findAll();

        List<SubscriptionTypeRow> subscriptionRows = subscriptionRepository.findAllSubscriptionTypes();

        Map<Integer, String> subscriptionTypeByCustomer = subscriptionRows.stream()
                .collect(Collectors.toMap(SubscriptionTypeRow::customerId, SubscriptionTypeRow::subscriptionType, (a, b) -> a));

        Map<Integer, String> tierLevelByCustomer = subscriptionRows.stream()
                .collect(Collectors.toMap(SubscriptionTypeRow::customerId, SubscriptionTypeRow::tierLevel, (a, b) -> a));

        Map<Integer, Boolean> hasAutopayByCustomer = customerRepository.findAllCustomerIdAndAutopay().stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Boolean) row[1],
                        (a, b) -> a
                ));

        List<CustomerRiskAnalysis> existingAnalyses = customerRiskAnalysisRepository.findAll();
        Map<Integer, CustomerRiskAnalysis> existingByCustomerId = existingAnalyses.stream()
                .collect(Collectors.toMap(CustomerRiskAnalysis::getCustomerId, a -> a));

        List<CustomerRiskAnalysis> toInsert = new ArrayList<>();
        int updatedCount = 0;

        for (CustomerStats stats : allStats) {
            String subscriptionType = subscriptionTypeByCustomer.get(stats.getCustomerId());
            if (subscriptionType == null) {
                continue;
            }

            boolean hasAutopay = Boolean.TRUE.equals(hasAutopayByCustomer.get(stats.getCustomerId()));
            String tierLevel = tierLevelByCustomer.get(stats.getCustomerId());
            CustomerRiskAnalysis existing = existingByCustomerId.get(stats.getCustomerId());

            if (existing != null) {
                applyValues(existing, stats, subscriptionType, hasAutopay, tierLevel);
                updatedCount++;
            } else {
                CustomerRiskAnalysis fresh = "faturasiz".equalsIgnoreCase(subscriptionType)
                        ? buildPrepaidAnalysis(stats, false)
                        : buildPostpaidAnalysis(stats, false, hasAutopay, tierLevel);
                toInsert.add(fresh);
            }
        }

        if (!toInsert.isEmpty()) {
            customerRiskAnalysisRepository.saveAll(toInsert);
        }

        return updatedCount + toInsert.size();
    }

    private void applyValues(CustomerRiskAnalysis target, CustomerStats stats, String subscriptionType,
                             boolean hasAutopay, String tierLevel) {
        if ("faturasiz".equalsIgnoreCase(subscriptionType)) {
            CustomerRiskAnalysis computed = buildPrepaidAnalysis(stats, true);
            target.setRiskScore(computed.getRiskScore());
            target.setBehaviorCategory(computed.getBehaviorCategory());
            target.setRecommendAction(computed.getRecommendAction());
            target.setCalculatedAt(computed.getCalculatedAt());
        } else {
            CustomerRiskAnalysis computed = buildPostpaidAnalysis(stats, true, hasAutopay, tierLevel);
            target.setRiskScore(computed.getRiskScore());
            target.setBehaviorCategory(computed.getBehaviorCategory());
            target.setRecommendAction(computed.getRecommendAction());
            target.setCalculatedAt(computed.getCalculatedAt());
        }
    }

    private CustomerRiskAnalysis buildPostpaidAnalysis(CustomerStats stats, boolean isExisting,
                                                       boolean hasAutopay, String tierLevel) {
        int totalInvoices = stats.getTotalInvoices() != null ? stats.getTotalInvoices() : 0;
        int late = stats.getLatePaymentCount() != null ? stats.getLatePaymentCount() : 0;
        int unpaid = stats.getUnpaidCount() != null ? stats.getUnpaidCount() : 0;
        double delay = stats.getAvgDelayDays() != null ? stats.getAvgDelayDays().doubleValue() : 0.0;
        int overuseCount = stats.getOveruseCount() != null ? stats.getOveruseCount() : 0;

        BigDecimal riskScore;
        if (totalInvoices == 0) {
            riskScore = BigDecimal.ZERO;
        } else {
            double interactionDenominator = Math.max(totalInvoices - 1, 1);
            double raw = (40.0 * late + 40.0 * unpaid
                    + (2.0 / 3.0) * late * delay
                    + (2.0 / 3.0) * late * unpaid * delay / interactionDenominator) / totalInvoices;
            riskScore = BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP);
        }

        String category = categorize(riskScore);
        String recommendAction = recommendActionForPostpaid(category, hasAutopay, overuseCount, tierLevel);

        return CustomerRiskAnalysis.builder()
                .customerId(stats.getCustomerId())
                .customer(stats.getCustomer())
                .riskScore(riskScore)
                .behaviorCategory(category)
                .recommendAction(recommendAction)
                .calculatedAt(LocalDateTime.now())
                .isNew(!isExisting)
                .build();
    }

    private CustomerRiskAnalysis buildPrepaidAnalysis(CustomerStats stats, boolean isExisting) {
        int totalRecharges = stats.getTotalRecharges() != null ? stats.getTotalRecharges() : 0;
        BigDecimal avgDaysBetween = stats.getAvgDaysBetweenRecharges();

        String category;
        if (totalRecharges <= 1) {
            category = "pasif";
        } else if (avgDaysBetween != null && avgDaysBetween.doubleValue() <= 25.0) {
            category = "aktif";
        } else {
            category = "pasif";
        }

        String recommendAction = "aktif".equals(category)
                ? "faturali_tarifeye_gecis_teklifi"
                : "kampanya_yok";

        return CustomerRiskAnalysis.builder()
                .customerId(stats.getCustomerId())
                .customer(stats.getCustomer())
                .riskScore(null)
                .behaviorCategory(category)
                .recommendAction(recommendAction)
                .calculatedAt(LocalDateTime.now())
                .isNew(!isExisting)
                .build();
    }

    private String categorize(BigDecimal riskScore) {
        if (riskScore.compareTo(GUVENLI_MAX) <= 0) {
            return "guvenli";
        } else if (riskScore.compareTo(ORTA_RISK_MAX) <= 0) {
            return "orta_risk";
        } else {
            return "riskli";
        }
    }

    private String recommendActionForPostpaid(String category, boolean hasAutopay, int overuseCount, String tierLevel) {
        return switch (category) {
            case "guvenli" -> "kampanya_teklifi";
            case "riskli" -> hasAutopay ? "oto_odeme_hatirlatma" : "oto_odeme_teklifi";
            case "orta_risk" -> {
                if (overuseCount == 0) {
                    yield "takip_arama";
                }
                yield "premium".equalsIgnoreCase(tierLevel) ? "ek_paket_teklifi" : "yuksek_tarife_teklifi";
            }
            default -> "takip_arama";
        };
    }

    @Transactional(readOnly = true)
    public List<RecommendationSummaryItem> getRecommendationSummary() {
        return customerRiskAnalysisRepository.countGroupedByRecommendAction().stream()
                .map(row -> new RecommendationSummaryItem((String) row[0], (Long) row[1]))
                .toList();
    }

    @Cacheable(value = "riskCategorySummaryCache", key = "'main'", sync = true)
    @Transactional(readOnly = true)
    public List<RiskCategorySummaryItem> getRiskCategorySummary() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("guvenilir", 0L);
        counts.put("normal", 0L);
        counts.put("riskli", 0L);

        for (Object[] row : customerRiskAnalysisRepository.countGroupedByRiskCategory()) {
            String category = String.valueOf(row[0]);
            Long count = row[1] instanceof Number number ? number.longValue() : 0L;
            counts.put(category, count);
        }

        return counts.entrySet().stream()
                .map(entry -> new RiskCategorySummaryItem(entry.getKey(), entry.getValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<CustomerRiskAnalysisResponse> getRecommendationsByAction(String action, Pageable pageable) {
        return customerRiskAnalysisRepository.findByRecommendAction(action, pageable)
                .map(cra -> new CustomerRiskAnalysisResponse(
                        cra.getCustomerId(),
                        cra.getCustomer().getName() + " " + cra.getCustomer().getSurname(),
                        cra.getRiskScore(),
                        cra.getBehaviorCategory(),
                        cra.getRecommendAction()
                ));
    }
}