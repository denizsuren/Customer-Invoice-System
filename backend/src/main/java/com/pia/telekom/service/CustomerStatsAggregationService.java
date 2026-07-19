package com.pia.telekom.service;

import com.pia.telekom.dto.InvoiceStatRow;
import com.pia.telekom.dto.RechargeStatRow;
import com.pia.telekom.entity.Customer;
import com.pia.telekom.entity.CustomerStats;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.CustomerStatsRepository;
import com.pia.telekom.repository.InvoiceRepository;
import com.pia.telekom.repository.RechargeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerStatsAggregationService {

    /**
     * Veri seti Ocak-Haziran 2026 gözlem dönemini kapsıyor. Gerçek now() kullanırsak
     * (sistem tarihi Temmuz 2026), her müşteride yapay gecikme/durgunluk hesaplanır —
     * bu yüzden referans tarihi veri setinin kendi sonuna sabitliyoruz.
     */
    private static final LocalDate REFERENCE_DATE = LocalDate.of(2026, 6, 30);

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final RechargeRepository rechargeRepository;
    private final CustomerStatsRepository customerStatsRepository;

    @Transactional
    public int recalculateAll() {
        List<Integer> customerIds = customerRepository.findAll().stream()
                .map(Customer::getCustomerId)
                .toList();

        Map<Integer, List<InvoiceStatRow>> invoicesByCustomer = invoiceRepository.findAllForStats().stream()
                .collect(Collectors.groupingBy(InvoiceStatRow::customerId));

        Map<Integer, List<RechargeStatRow>> rechargesByCustomer = rechargeRepository.findAllForStats().stream()
                .collect(Collectors.groupingBy(RechargeStatRow::customerId));

        // Var olan kayıtları TEK sorguda çekip persistence context'e alıyoruz.
        List<CustomerStats> existingStats = customerStatsRepository.findAll();
        Map<Integer, CustomerStats> existingByCustomerId = existingStats.stream()
                .collect(Collectors.toMap(CustomerStats::getCustomerId, s -> s));

        List<CustomerStats> toInsert = new ArrayList<>();
        int updatedCount = 0;

        for (Integer customerId : customerIds) {
            List<InvoiceStatRow> invoices = invoicesByCustomer.getOrDefault(customerId, List.of());
            List<RechargeStatRow> recharges = rechargesByCustomer.getOrDefault(customerId, List.of());

            CustomerStats existing = existingByCustomerId.get(customerId);

            if (existing != null) {
                applyStats(existing, invoices, recharges);
                updatedCount++;
            } else {
                toInsert.add(buildStats(customerId, invoices, recharges));
            }
        }

        if (!toInsert.isEmpty()) {
            customerStatsRepository.saveAll(toInsert);
        }

        return updatedCount + toInsert.size();
    }

    private void applyStats(CustomerStats target, List<InvoiceStatRow> invoices, List<RechargeStatRow> recharges) {
        CustomerStats computed = buildStats(target.getCustomerId(), invoices, recharges);
        target.setTotalInvoices(computed.getTotalInvoices());
        target.setLatePaymentCount(computed.getLatePaymentCount());
        target.setUnpaidCount(computed.getUnpaidCount());
        target.setAvgDelayDays(computed.getAvgDelayDays());
        target.setOveruseCount(computed.getOveruseCount());
        target.setTotalRecharges(computed.getTotalRecharges());
        target.setAvgRechargeAmount(computed.getAvgRechargeAmount());
        target.setAvgDaysBetweenRecharges(computed.getAvgDaysBetweenRecharges());
        target.setDaysSinceLastRecharge(computed.getDaysSinceLastRecharge());
    }

    private CustomerStats buildStats(Integer customerId, List<InvoiceStatRow> invoices, List<RechargeStatRow> recharges) {
        int totalInvoices = invoices.size();
        int latePaymentCount = 0;
        int unpaidCount = 0;
        int overuseCount = 0;
        List<Long> delayDays = new ArrayList<>();

        for (InvoiceStatRow inv : invoices) {
            boolean isLate = inv.paymentDate() != null && inv.dueDate() != null
                    && inv.paymentDate().isAfter(inv.dueDate());
            boolean isUnpaid = inv.paymentDate() == null && inv.dueDate() != null
                    && inv.dueDate().isBefore(REFERENCE_DATE);

            if (isLate) {
                latePaymentCount++;
                delayDays.add(ChronoUnit.DAYS.between(inv.dueDate(), inv.paymentDate()));
            }
            if (isUnpaid) {
                unpaidCount++;
            }
            if (inv.overageAmount() != null && inv.overageAmount().compareTo(BigDecimal.ZERO) > 0) {
                overuseCount++;
            }
        }

        BigDecimal avgDelayDays = delayDays.isEmpty()
                ? null
                : BigDecimal.valueOf(delayDays.stream().mapToLong(Long::longValue).average().orElse(0))
                .setScale(2, RoundingMode.HALF_UP);

        int totalRecharges = recharges.size();
        BigDecimal avgRechargeAmount = null;
        BigDecimal avgDaysBetweenRecharges = null;
        Integer daysSinceLastRecharge = null;

        if (totalRecharges > 0) {
            BigDecimal sum = recharges.stream()
                    .map(RechargeStatRow::rechargeAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            avgRechargeAmount = sum.divide(BigDecimal.valueOf(totalRecharges), 2, RoundingMode.HALF_UP);

            List<LocalDate> sortedDates = recharges.stream()
                    .map(RechargeStatRow::rechargeDate)
                    .filter(Objects::nonNull)
                    .sorted()
                    .toList();

            if (sortedDates.size() >= 2) {
                List<Long> gaps = new ArrayList<>();
                for (int i = 1; i < sortedDates.size(); i++) {
                    gaps.add(ChronoUnit.DAYS.between(sortedDates.get(i - 1), sortedDates.get(i)));
                }
                avgDaysBetweenRecharges = BigDecimal.valueOf(gaps.stream().mapToLong(Long::longValue).average().orElse(0))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            LocalDate lastRecharge = sortedDates.get(sortedDates.size() - 1);
            daysSinceLastRecharge = (int) ChronoUnit.DAYS.between(lastRecharge, REFERENCE_DATE);
        }

        Customer customerRef = customerRepository.getReferenceById(customerId);

        return CustomerStats.builder()
                .customerId(customerId)
                .customer(customerRef)
                .totalInvoices(totalInvoices)
                .latePaymentCount(latePaymentCount)
                .unpaidCount(unpaidCount)
                .avgDelayDays(avgDelayDays)
                .overuseCount(overuseCount)
                .totalRecharges(totalRecharges)
                .avgRechargeAmount(avgRechargeAmount)
                .avgDaysBetweenRecharges(avgDaysBetweenRecharges)
                .daysSinceLastRecharge(daysSinceLastRecharge)
                .build();
    }
}