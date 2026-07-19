package com.pia.telekom.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceRequest(
        Integer productId,

        String paymentChannel,

        @NotNull(message = "Fatura tutarı zorunludur")
        BigDecimal invoiceAmount,

        @NotNull(message = "Ödenecek tutar zorunludur")
        BigDecimal dueAmount,

        BigDecimal overageAmount,

        @NotNull(message = "Fatura tarihi zorunludur")
        LocalDate invoiceDate,

        @NotNull(message = "Son ödeme tarihi zorunludur")
        LocalDate dueDate,

        LocalDate paymentDate
) {
}