package com.pia.telekom.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceResponse(
        Integer invoiceId,
        Integer customerId,
        String customerName,
        ProductResponse product,
        String paymentChannel,
        BigDecimal invoiceAmount,
        BigDecimal dueAmount,
        BigDecimal overageAmount,
        LocalDate invoiceDate,
        LocalDate dueDate,
        LocalDate paymentDate,
        String paymentStatus
) {
}