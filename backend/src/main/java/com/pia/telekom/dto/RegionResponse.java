package com.pia.telekom.dto;

import java.math.BigDecimal;

public record RegionResponse(
        Integer regionId,
        String name,
        String cityType,
        BigDecimal populationWeight
) {
}
