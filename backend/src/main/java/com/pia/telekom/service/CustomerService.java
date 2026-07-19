package com.pia.telekom.service;

import com.pia.telekom.dto.CustomerRequest;
import com.pia.telekom.dto.CustomerResponse;
import com.pia.telekom.dto.RegionResponse;
import com.pia.telekom.entity.Customer;
import com.pia.telekom.entity.Region;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.CustomerRiskAnalysisRepository;
import com.pia.telekom.repository.InvoiceRepository;
import com.pia.telekom.repository.RegionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Period;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private static final int RISK_THRESHOLD = 3;
    private static final int LOOKBACK_MONTHS = 12;

    private final CustomerRepository customerRepository;
    private final RegionRepository regionRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRiskAnalysisRepository customerRiskAnalysisRepository;

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        Page<Customer> customerPage = customerRepository.findAll(pageable);
        Map<Integer, Long> riskMap = buildOverdueCountMap(customerPage.getContent());
        Map<Integer, String> behaviorMap = buildBehaviorCategoryMap(customerPage.getContent());
        return customerPage.map(customer -> toResponse(customer, riskMap, behaviorMap));
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Müşteri bulunamadı: id=" + customerId));
        Map<Integer, Long> riskMap = buildOverdueCountMap(List.of(customer));
        Map<Integer, String> behaviorMap = buildBehaviorCategoryMap(List.of(customer));
        return toResponse(customer, riskMap, behaviorMap);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String name, String surname,
                                                  Integer regionId, String cityType,
                                                  String subscriptionType, Integer minOverdueCount,
                                                  String riskCategory,
                                                  Pageable pageable) {
        Specification<Customer> spec = com.pia.telekom.specification.CustomerSpecification.filterBy(
                name, surname, regionId, cityType, subscriptionType, minOverdueCount, riskCategory);
        Page<Customer> customerPage = customerRepository.findAll(spec, pageable);
        Map<Integer, Long> riskMap = buildOverdueCountMap(customerPage.getContent());
        Map<Integer, String> behaviorMap = buildBehaviorCategoryMap(customerPage.getContent());
        return customerPage.map(customer -> toResponse(customer, riskMap, behaviorMap));
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Region region = regionRepository.findById(request.regionId())
                .orElseThrow(() -> new EntityNotFoundException("Bölge bulunamadı: id=" + request.regionId()));

        Customer customer = Customer.builder()
                .name(request.name())
                .surname(request.surname())
                .birthdate(request.birthDate())
                .address(request.address())
                .email(request.email())
                .phone(request.phone())
                .region(region)
                .ageGroup(deriveAgeGroup(request.birthDate()))
                .paymentChannelPreference(request.paymentChannelPreference())
                .hasAutopay(request.hasAutopay() != null ? request.hasAutopay() : false)
                .build();

        Customer saved = customerRepository.save(customer);
        return toResponse(saved, Map.of(), Map.of());
    }

    @Transactional
    public CustomerResponse updateCustomer(Integer customerId, CustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Müşteri bulunamadı: id=" + customerId));
        Region region = regionRepository.findById(request.regionId())
                .orElseThrow(() -> new EntityNotFoundException("Bölge bulunamadı: id=" + request.regionId()));

        customer.setName(request.name());
        customer.setSurname(request.surname());
        customer.setBirthdate(request.birthDate());
        customer.setAddress(request.address());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setRegion(region);
        customer.setAgeGroup(deriveAgeGroup(request.birthDate()));
        customer.setPaymentChannelPreference(request.paymentChannelPreference());
        customer.setHasAutopay(request.hasAutopay() != null ? request.hasAutopay() : customer.getHasAutopay());

        Customer updated = customerRepository.save(customer);
        Map<Integer, Long> riskMap = buildOverdueCountMap(List.of(updated));
        Map<Integer, String> behaviorMap = buildBehaviorCategoryMap(List.of(updated));
        return toResponse(updated, riskMap, behaviorMap);
    }

    @Transactional
    public void deleteCustomer(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new EntityNotFoundException("Müşteri bulunamadı: id=" + customerId);
        }
        customerRepository.deleteById(customerId);
    }

    private Map<Integer, Long> buildOverdueCountMap(List<Customer> customers) {
        if (customers.isEmpty()) {
            return Map.of();
        }

        List<Integer> customerIds = customers.stream().map(Customer::getCustomerId).toList();
        LocalDate since = LocalDate.now().minusMonths(LOOKBACK_MONTHS);

        List<Object[]> rows = invoiceRepository.countOverdueGroupedByCustomerIds(
                LocalDate.now(), LocalDate.now().minusMonths(LOOKBACK_MONTHS), customerIds);
        return rows.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));
    }

    private CustomerResponse toResponse(Customer customer, Map<Integer, Long> riskMap, Map<Integer, String> behaviorMap) {
        RegionResponse regionResponse = new RegionResponse(
                customer.getRegion().getRegionId(),
                customer.getRegion().getName(),
                customer.getRegion().getCityType(),
                customer.getRegion().getPopulationWeight()
        );

        long overdueCount = riskMap.getOrDefault(customer.getCustomerId(), 0L);
        String behaviorCategory = behaviorMap.get(customer.getCustomerId());
        String riskTag = mapBehaviorCategoryToTag(behaviorCategory);
        if (riskTag == null) {
            riskTag = calculateRiskTag(overdueCount);
        }

        return new CustomerResponse(
                customer.getCustomerId(),
                customer.getName(),
                customer.getSurname(),
                customer.getBirthdate(),
                customer.getAddress(),
                customer.getEmail(),
                customer.getPhone(),
                regionResponse,
                customer.getAgeGroup(),
                customer.getPaymentChannelPreference(),
                customer.getHasAutopay(),
                riskTag
        );
    }

    private String calculateRiskTag(long overdueCount) {
        if (overdueCount >= RISK_THRESHOLD) {
            return "RISKLI";
        } else if (overdueCount == 0) {
            return "GÜVENİLİR";
        } else {
            return "NORMAL";
        }
    }

    private String deriveAgeGroup(LocalDate birthDate) {
        if (birthDate == null) return null;
        int age = Period.between(birthDate, LocalDate.now()).getYears();
        if (age < 18) return "0-17";
        if (age <= 25) return "18-25";
        if (age <= 35) return "26-35";
        if (age <= 50) return "36-50";
        if (age <= 65) return "51-65";
        return "65+";
    }

    private Map<Integer, String> buildBehaviorCategoryMap(List<Customer> customers) {
        if (customers.isEmpty()) {
            return Map.of();
        }
        List<Integer> customerIds = customers.stream().map(Customer::getCustomerId).toList();
        List<Object[]> rows = customerRiskAnalysisRepository.findBehaviorCategoriesByCustomerIds(customerIds);
        return rows.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (String) row[1]
                ));
    }

    private String mapBehaviorCategoryToTag(String category) {
        if (category == null) return null;
        return switch (category) {
            case "guvenli" -> "GÜVENİLİR";
            case "orta_risk" -> "NORMAL";
            case "riskli" -> "RİSKLİ";
            case "aktif" -> "AKTİF";
            case "pasif" -> "PASİF";
            default -> null;
        };
    }
}