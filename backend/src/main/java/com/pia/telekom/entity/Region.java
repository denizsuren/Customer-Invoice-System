package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "region")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "region_id")
    private Integer regionId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "city_type", nullable = false, length = 20)
    private String cityType;

    @Column(name = "population_weight", precision = 4, scale = 2)
    private BigDecimal populationWeight;

    @OneToMany(mappedBy = "region", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Customer> customers = new java.util.ArrayList<>();
}
