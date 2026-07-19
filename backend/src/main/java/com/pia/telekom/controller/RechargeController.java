package com.pia.telekom.controller;

import com.pia.telekom.dto.RechargeRequest;
import com.pia.telekom.dto.RechargeResponse;
import com.pia.telekom.service.RechargeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers/{customerId}/recharges")
@RequiredArgsConstructor
public class RechargeController {

    private final RechargeService rechargeService;

    @GetMapping
    public Page<RechargeResponse> getRecharges(@PathVariable Integer customerId, @ParameterObject Pageable pageable) {
        return rechargeService.getRechargesByCustomer(customerId, pageable);
    }

    @PostMapping
    public ResponseEntity<RechargeResponse> createRecharge(@PathVariable Integer customerId,
                                                           @Valid @RequestBody RechargeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rechargeService.createRecharge(customerId, request));
    }
}
