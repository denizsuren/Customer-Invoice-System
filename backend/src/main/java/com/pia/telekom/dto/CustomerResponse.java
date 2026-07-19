package com.pia.telekom.dto;

import java.time.LocalDate;

public record CustomerResponse(
        Integer customerId,
        String name,
        String surname,
        LocalDate birthdate,
        String address,
        String email,
        String phone,
        RegionResponse region,
        String ageGroup,
        String paymentChannelPreference,
        Boolean hasAutopay,
        String riskTag
) {
}