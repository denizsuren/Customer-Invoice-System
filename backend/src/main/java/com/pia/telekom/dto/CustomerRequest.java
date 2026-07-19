package com.pia.telekom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record CustomerRequest(
        @NotBlank(message = "İsim boş olamaz")
        String name,

        @NotBlank(message = "Soyisim boş olamaz")
        String surname,

        LocalDate birthDate,

        String address,
        String email,
        String phone,

        @NotNull(message = "Bölge seçimi zorunludur")
        Integer regionId,

        String ageGroup,
        String paymentChannelPreference,
        Boolean hasAutopay
) {

}