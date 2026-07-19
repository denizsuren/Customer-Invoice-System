package com.pia.telekom.controller;

import com.pia.telekom.dto.CustomerRequest;
import com.pia.telekom.dto.CustomerResponse;
import com.pia.telekom.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;
import org.springdoc.core.annotations.ParameterObject;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public Page<CustomerResponse> getAllCustomers(@ParameterObject Pageable pageable) {
        return customerService.getAllCustomers(pageable);
    }

    @GetMapping("/{customerId}")
    public CustomerResponse getCustomerById(@PathVariable Integer customerId) {
        return customerService.getCustomerById(customerId);
    }

    @GetMapping("/search")
    public Page<CustomerResponse> searchCustomers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String surname,
            @RequestParam(required = false) Integer regionId,
            @RequestParam(required = false) String cityType,
            @RequestParam(required = false) String subscriptionType,
            @RequestParam(required = false) Integer minOverdueCount,
            @RequestParam(required = false) String riskCategory,
            @ParameterObject Pageable pageable) {
        return customerService.searchCustomers(name, surname, regionId, cityType, subscriptionType, minOverdueCount, riskCategory, pageable);
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{customerId}")
    public CustomerResponse updateCustomer(@PathVariable Integer customerId,
                                           @Valid @RequestBody CustomerRequest request) {
        return customerService.updateCustomer(customerId, request);
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer customerId) {
        customerService.deleteCustomer(customerId);
        return ResponseEntity.noContent().build();
    }
}