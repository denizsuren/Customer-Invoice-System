package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "revenue_forecast")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RevenueForecast {

    @Id
    @Column(name = "year_offset")
    private Integer yearOffset;

    private String label;

    @Column(name = "reel_bau_revenue")
    private BigDecimal reelBauRevenue;

    @Column(name = "reel_with_recommendations_revenue")
    private BigDecimal reelWithRecommendationsRevenue;

    @Column(name = "nominal_bau_revenue")
    private BigDecimal nominalBauRevenue;

    @Column(name = "reel_fark")
    private BigDecimal reelFark;
}