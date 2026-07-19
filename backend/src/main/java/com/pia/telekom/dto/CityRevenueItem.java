package com.pia.telekom.dto;

import java.math.BigDecimal;

public record CityRevenueItem(String city, BigDecimal totalRevenue, String group) {
}