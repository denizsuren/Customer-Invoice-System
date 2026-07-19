package com.pia.telekom.service;


import com.pia.telekom.dto.RechargeRequest;
import com.pia.telekom.dto.RechargeResponse;
import com.pia.telekom.entity.Customer;
import com.pia.telekom.entity.Recharge;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.RechargeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RechargeService {

    private final RechargeRepository rechargeRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public Page<RechargeResponse> getRechargesByCustomer(Integer customerId, Pageable pageable) {
        return rechargeRepository.findByCustomer_CustomerId(customerId, pageable).map(this::toResponse);
    }

    @Transactional
    public RechargeResponse createRecharge(Integer customerId, RechargeRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Müşteri bulunamadı: id=" + customerId));

        Recharge recharge = Recharge.builder()
                .customer(customer)
                .rechargeChannel(request.rechargeChannel())
                .rechargeAmount(request.rechargeAmount())
                .rechargeDate(request.rechargeDate())
                .build();

        return toResponse(rechargeRepository.save(recharge));
    }

    private RechargeResponse toResponse(Recharge r) {
        return new RechargeResponse(r.getRechargeId(), r.getCustomer().getCustomerId(),
                r.getRechargeChannel(), r.getRechargeAmount(), r.getRechargeDate());
    }
}