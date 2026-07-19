package com.pia.telekom.controller;

import com.pia.telekom.dto.*;
import com.pia.telekom.entity.RevenueForecast;
import com.pia.telekom.repository.RevenueForecastRepository;
import com.pia.telekom.service.*;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final RegionalPaymentAnalysisService regionalPaymentAnalysisService;
    private final UpgradeRecommendationService upgradeRecommendationService;
    private final RevenueForecastService revenueForecastService;
    private final CustomerStatsAggregationService customerStatsAggregationService;
    private final CustomerRiskAnalysisService customerRiskAnalysisService;
    private final RevenueForecastRepository revenueForecastRepository;


    @GetMapping("/regional-payments")
    public List<RegionalPaymentAnalysisResponse> getRegionalPaymentAnalysis() {
        return regionalPaymentAnalysisService.analyzeByRegion();
    }

    @GetMapping("/upgrade-recommendations")
    public List<UpgradeRecommendationResponse> getUpgradeRecommendations() {
        return upgradeRecommendationService.getRecommendations();
    }

    @GetMapping("/revenue-forecast")
    public List<RevenueForecast> getRevenueForecast() {
        return revenueForecastRepository.findAll();
    }

    @PostMapping("/recalculate-forecast")
    public List<RevenueForecast> recalculateForecast() {
        return revenueForecastService.recalculateForecast();
    }

    @PostMapping("/recalculate-stats")
    public String recalculateStats() {
        int count = customerStatsAggregationService.recalculateAll();
        return count + " müşteri için customer_stats güncellendi";
    }

    @PostMapping("/recalculate-risk")
    public String recalculateRisk() {
        int count = customerRiskAnalysisService.recalculateAll();
        return count + " müşteri için risk analizi güncellendi";

    }

    @GetMapping("/recommendations/summary")
    public List<RecommendationSummaryItem> getRecommendationSummary() {
        return customerRiskAnalysisService.getRecommendationSummary();
    }

    @GetMapping("/risk-categories/summary")
    public List<RiskCategorySummaryItem> getRiskCategorySummary() {
        return customerRiskAnalysisService.getRiskCategorySummary();
    }

    @GetMapping("/recommendations")
    public Page<CustomerRiskAnalysisResponse> getRecommendationsByAction(
            @RequestParam String action,
            @ParameterObject Pageable pageable) {
        return customerRiskAnalysisService.getRecommendationsByAction(action, pageable);
    }
}