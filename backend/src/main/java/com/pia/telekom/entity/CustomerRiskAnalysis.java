package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_risk_analysis")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerRiskAnalysis implements Persistable<Integer> {

    @Id
    @Column(name = "customer_id")
    private Integer customerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "risk_score", precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(name = "behavior_category", length = 20)
    private String behaviorCategory;

    @Column(name = "recommend_action", length = 40)
    private String recommendAction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_upgrade_product_id")
    private Product suggestedUpgradeProduct;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public Integer getId() {
        return customerId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}