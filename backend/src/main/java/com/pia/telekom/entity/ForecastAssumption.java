package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "forecast_assumption")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForecastAssumption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String kategori;

    @Column(name = "metric_key")
    private String metricKey;

    private String deger;
    private String kaynak;

    @Column(name = "not_aciklama")
    private String notAciklama;
}