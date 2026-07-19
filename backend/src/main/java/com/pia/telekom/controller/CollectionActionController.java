package com.pia.telekom.controller;

import com.pia.telekom.dto.CollectionActionRequest;
import com.pia.telekom.dto.CollectionActionResponse;
import com.pia.telekom.service.CollectionActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices/{invoiceId}/collection-actions")
@RequiredArgsConstructor
public class CollectionActionController {

    private final CollectionActionService collectionActionService;

    @GetMapping
    public List<CollectionActionResponse> getActions(@PathVariable Integer invoiceId) {
        return collectionActionService.getActionsByInvoice(invoiceId);
    }

    @PostMapping
    public ResponseEntity<CollectionActionResponse> createAction(
            @PathVariable Integer invoiceId,
            @Valid @RequestBody CollectionActionRequest request) {
        CollectionActionResponse created = collectionActionService.createAction(invoiceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}