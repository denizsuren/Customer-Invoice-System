package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", nullable = false, length = 30)
    private String category;


    @Column(name = "monthly_fee", nullable = false, precision = 8, scale = 2)
    private BigDecimal monthlyFee;

    @Column(name = "data_limit_gb")
    private Integer dataLimitGb;

    @Column(name = "voice_limit_min")
    private Integer voiceLimitMin;

    @Column(name = "tier_level", length = 20)
    private String tierLevel;

    @Column(name = "subscription_type", nullable = false, length = 20)
    private String subscriptionType;

}