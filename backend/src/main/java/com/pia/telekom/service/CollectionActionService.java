package com.pia.telekom.service;

import com.pia.telekom.dto.CollectionActionRequest;
import com.pia.telekom.dto.CollectionActionResponse;
import com.pia.telekom.entity.CollectionAction;
import com.pia.telekom.entity.Invoice;
import com.pia.telekom.repository.CollectionActionRepository;
import com.pia.telekom.repository.InvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CollectionActionService {

    private final CollectionActionRepository collectionActionRepository;
    private final InvoiceRepository invoiceRepository;
    // RegionRepository silindi

    @Transactional(readOnly = true)
    public List<CollectionActionResponse> getActionsByInvoice(Integer invoiceId) {
        return collectionActionRepository.findByInvoice_InvoiceId(invoiceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CollectionActionResponse createAction(Integer invoiceId, CollectionActionRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Fatura bulunamadı: id=" + invoiceId));

        // Region lookup kodları silindi

        CollectionAction action = CollectionAction.builder()
                .invoice(invoice)
                .actionType(request.actionType())
                .actionDate(request.actionDate())
                // .region(region) silindi
                .build();

        CollectionAction saved = collectionActionRepository.save(action);
        return toResponse(saved);
    }

    private CollectionActionResponse toResponse(CollectionAction action) {
        // RegionResponse mapleme kodları silindi

        return new CollectionActionResponse(
                action.getActionId(),
                action.getInvoice().getInvoiceId(),
                action.getActionType(),
                action.getActionDate()
                // regionResponse parametresi silindi
        );
    }
}