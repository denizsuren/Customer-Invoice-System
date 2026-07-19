package com.pia.telekom.dto;

import java.time.LocalDate;

public record CollectionActionResponse(
        Integer actionId,
        Integer invoiceId,
        String actionType,
        LocalDate actionDate
) {
}