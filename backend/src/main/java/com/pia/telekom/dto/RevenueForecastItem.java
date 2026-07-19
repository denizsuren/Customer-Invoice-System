package com.pia.telekom.dto;

import java.math.BigDecimal;

public record RevenueForecastItem(String label, BigDecimal baseline, BigDecimal withRecommendations, BigDecimal difference) {
}