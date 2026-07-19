package com.pia.telekom.service;

import com.pia.telekom.dto.UpgradeRecommendationResponse;
import com.pia.telekom.entity.Customer;
import com.pia.telekom.entity.Invoice;
import com.pia.telekom.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UpgradeRecommendationService {

    private static final int OVERAGE_THRESHOLD = 2;
    private static final int LOOKBACK_MONTHS = 12;

    private final InvoiceRepository invoiceRepository;

    @Cacheable("upgradeRecommendationsCache")
    @Transactional(readOnly = true)
    public List<UpgradeRecommendationResponse> getRecommendations() {
        LocalDate since = LocalDate.now().minusMonths(LOOKBACK_MONTHS);

        List<Invoice> overageInvoices = invoiceRepository.findOverageInvoicesSince(since);

        Map<Customer, List<Invoice>> groupedByCustomer = overageInvoices.stream()
                .collect(Collectors.groupingBy(Invoice::getCustomer));

        return groupedByCustomer.entrySet().stream()
                .filter(entry -> entry.getValue().size() >= OVERAGE_THRESHOLD)
                .map(entry -> buildRecommendation(entry.getKey(), entry.getValue()))
                .toList();
    }

    private UpgradeRecommendationResponse buildRecommendation(Customer customer, List<Invoice> invoices) {
        BigDecimal totalOverage = invoices.stream()
                .map(Invoice::getOverageAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Invoice latestInvoice = invoices.get(invoices.size() - 1);
        var product = latestInvoice.getProduct();

        String recommendation = "Paket limitini sık aşıyor, bir üst pakete (%s → üst tier) geçiş önerilir"
                .formatted(product.getTierLevel());

        return new UpgradeRecommendationResponse(
                customer.getCustomerId(),
                customer.getName() + " " + customer.getSurname(),
                product.getProductId(),
                product.getName(),
                invoices.size(),
                totalOverage,
                recommendation
        );
    }
}