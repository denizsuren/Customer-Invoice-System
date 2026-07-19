package com.pia.telekom.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceStatRow(
        Integer customerId,
        LocalDate invoiceDate,
        LocalDate dueDate,
        LocalDate paymentDate,
        BigDecimal overageAmount
) {
}
