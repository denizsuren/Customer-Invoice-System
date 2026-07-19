package com.pia.telekom.dto;

import java.time.LocalDate;

public record SubscriptionResponse(
        Integer subscriptionId,
        Integer customerId,
        String customerFullName,
        ProductResponse product,
        LocalDate startDate,
        String status
) {
}