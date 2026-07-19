package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recharge")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recharge_id")
    private Integer rechargeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "recharge_channel", length = 30)
    private String rechargeChannel;

    @Column(name = "recharge_amount", precision = 10, scale = 2)
    private BigDecimal rechargeAmount;

    @Column(name = "recharge_date")
    private LocalDate rechargeDate;

    @Column(name = "gozlem_disi_kayit", nullable = false)
    @Builder.Default
    private Boolean gozlemDisiKayit = false;
}
