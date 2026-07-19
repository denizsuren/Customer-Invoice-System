package com.pia.telekom.service;

import com.pia.telekom.dto.InvoiceSummaryResponse;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/*
  Faturalar sayfasının üst kartları için özet metrikler.
  4 kartın tamamı tek endpoint'ten döner; tüm hesaplar DB tarafında aggregate
  sorgularla yapılır (satır taşınmaz) ve sonuç 5 dk önbelleklenir (CacheConfig).
*/
@Service
@RequiredArgsConstructor
public class InvoiceSummaryService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Cacheable("invoiceSummaryCache")
    @Transactional(readOnly = true)
    public InvoiceSummaryResponse getSummary() {
        BigDecimal annual = invoiceRepository.averageAnnualRevenueLastFiveYears()
                .setScale(0, RoundingMode.HALF_UP);

        double mobileRate = round1(customerRepository.mobileChannelPercentage());

        List<String> topRegions = customerRepository.topMobileRegions();
        String topRegion = topRegions.isEmpty() ? "—" : topRegions.get(0);

        long overdueCount = invoiceRepository.countOverdueMoreThanThreeDays();

        List<Object[]> overageRows = invoiceRepository.overageStatsLastThirtyDays();
        long overageCount = 0;
        BigDecimal avgOverage = BigDecimal.ZERO;
        if (!overageRows.isEmpty()) {
            Object[] row = overageRows.get(0);
            overageCount = ((Number) row[0]).longValue();
            avgOverage = BigDecimal.valueOf(((Number) row[1]).doubleValue())
                    .setScale(0, RoundingMode.HALF_UP);
        }

        return new InvoiceSummaryResponse(annual, mobileRate, topRegion, overdueCount, overageCount, avgOverage);
    }

    private double round1(Double value) {
        if (value == null || value.isNaN()) return 0.0;
        return Math.round(value * 10.0) / 10.0;
    }
}
