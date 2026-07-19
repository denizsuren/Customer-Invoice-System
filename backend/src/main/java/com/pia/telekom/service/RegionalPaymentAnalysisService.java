package com.pia.telekom.service;

import com.pia.telekom.dto.RegionalPaymentAnalysisResponse;
import com.pia.telekom.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegionalPaymentAnalysisService {

    private final InvoiceRepository invoiceRepository;

    @Cacheable(value = "regionalPaymentsCache", key = "'all'", sync = true)
    @Transactional(readOnly = true)
    public List<RegionalPaymentAnalysisResponse> analyzeByRegion() {
        return invoiceRepository.findRegionalPaymentAnalysisRows().stream()
                .map(row -> new RegionalPaymentAnalysisResponse(
                        toInteger(row[0]),
                        String.valueOf(row[1]),
                        String.valueOf(row[2]),
                        toLong(row[3]),
                        toBigDecimal(row[4]),
                        round(toDouble(row[5])),
                        round(toDouble(row[6])),
                        round(toDouble(row[7]))
                ))
                .toList();
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.intValue();
        return Integer.valueOf(String.valueOf(value));
    }

    private long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number number) return number.longValue();
        return Long.parseLong(String.valueOf(value));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal decimal) return decimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        return new BigDecimal(String.valueOf(value));
    }

    private double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number number) return number.doubleValue();
        return Double.parseDouble(String.valueOf(value));
    }

    private double round(double value) {
        if (Double.isNaN(value)) {
            return 0.0;
        }
        return Math.round(value * 100.0) / 100.0;
    }
}