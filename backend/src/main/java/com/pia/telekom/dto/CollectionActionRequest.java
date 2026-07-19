package com.pia.telekom.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CollectionActionRequest(
        @NotNull(message = "Aksiyon tipi zorunludur")
        String actionType,

        @NotNull(message = "Aksiyon tarihi zorunludur")
        LocalDate actionDate
) {
}