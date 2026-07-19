package com.pia.telekom.controller;

import com.pia.telekom.dto.InvoiceResponse;
import com.pia.telekom.dto.InvoiceSummaryResponse;
import com.pia.telekom.service.InvoiceService;
import com.pia.telekom.service.InvoiceSummaryService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceListController {

    private final InvoiceService invoiceService;
    private final InvoiceSummaryService invoiceSummaryService;

    /*
      Üst özet kartları. Sabit "/summary" yolu, olası "/{id}" eşlemesinden
      önceliklidir; çakışma olmaz.
    */
    @GetMapping("/summary")
    public InvoiceSummaryResponse getSummary() {
        return invoiceSummaryService.getSummary();
    }

    @GetMapping
    public Page<InvoiceResponse> getAllInvoices(
            @RequestParam(required = false) String query,
            @ParameterObject Pageable pageable) {
        return invoiceService.searchInvoices(query, pageable);
    }
}