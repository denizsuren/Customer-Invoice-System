package com.pia.telekom.service;

import com.pia.telekom.dto.InvoiceRequest;
import com.pia.telekom.dto.InvoiceResponse;
import com.pia.telekom.dto.ProductResponse;
import com.pia.telekom.entity.Customer;
import com.pia.telekom.entity.Invoice;
import com.pia.telekom.entity.Product;
import com.pia.telekom.repository.CustomerRepository;
import com.pia.telekom.repository.InvoiceRepository;
import com.pia.telekom.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByCustomer(Integer customerId, Pageable pageable) {
        ensureCustomerExists(customerId);
        return invoiceRepository.findByCustomer_CustomerId(customerId, pageable)
                .map(this::toResponse);
    }


    @CacheEvict(value = {"dashboardCache", "regionalPaymentsCache", "upgradeRecommendationsCache"}, allEntries = true)
    @Transactional
    public InvoiceResponse createInvoice(Integer customerId, InvoiceRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Müşteri bulunamadı: id=" + customerId));

        Product product = resolveProduct(request.productId());

        Invoice invoice = Invoice.builder()
                .customer(customer)
                .product(product)
                .paymentChannel(request.paymentChannel())
                .invoiceAmount(request.invoiceAmount())
                .dueAmount(request.dueAmount())
                .overageAmount(request.overageAmount())
                .invoiceDate(request.invoiceDate())
                .dueDate(request.dueDate())
                .paymentDate(request.paymentDate())
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    @CacheEvict(value = {"dashboardCache", "regionalPaymentsCache", "upgradeRecommendationsCache"}, allEntries = true)
    @Transactional
    public InvoiceResponse updateInvoice(Integer customerId, Integer invoiceId, InvoiceRequest request) {
        Invoice invoice = getInvoiceForCustomerOrThrow(customerId, invoiceId);
        Product product = resolveProduct(request.productId());

        invoice.setProduct(product);
        invoice.setPaymentChannel(request.paymentChannel());
        invoice.setInvoiceAmount(request.invoiceAmount());
        invoice.setDueAmount(request.dueAmount());
        invoice.setOverageAmount(request.overageAmount());
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setDueDate(request.dueDate());
        invoice.setPaymentDate(request.paymentDate());

        Invoice updated = invoiceRepository.save(invoice);
        return toResponse(updated);
    }

    @CacheEvict(value = {"dashboardCache", "regionalPaymentsCache", "upgradeRecommendationsCache"}, allEntries = true)
    @Transactional
    public void deleteInvoice(Integer customerId, Integer invoiceId) {
        Invoice invoice = getInvoiceForCustomerOrThrow(customerId, invoiceId);
        invoiceRepository.delete(invoice);
    }

    private Invoice getInvoiceForCustomerOrThrow(Integer customerId, Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Fatura bulunamadı: id=" + invoiceId));

        if (!invoice.getCustomer().getCustomerId().equals(customerId)) {
            throw new EntityNotFoundException(
                    "Fatura (id=" + invoiceId + ") bu müşteriye (id=" + customerId + ") ait değil");
        }
        return invoice;
    }

    private void ensureCustomerExists(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new EntityNotFoundException("Müşteri bulunamadı: id=" + customerId);
        }
    }

    private Product resolveProduct(Integer  productId) {
        if (productId == null) {
            return null;
        }
        return productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Ürün bulunamadı: id=" + productId));
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        ProductResponse productResponse = null;
        if (invoice.getProduct() != null) {
            Product p = invoice.getProduct();
            productResponse = new ProductResponse(
                    p.getProductId(), p.getName(), p.getCategory(), p.getMonthlyFee(),
                    p.getDataLimitGb(), p.getVoiceLimitMin(), p.getTierLevel(), p.getSubscriptionType()
            );
        }

        Customer customer = invoice.getCustomer();

        return new InvoiceResponse(
                invoice.getInvoiceId(),
                customer.getCustomerId(),
                customer.getName() + " " + customer.getSurname(),
                productResponse,
                invoice.getPaymentChannel(),
                invoice.getInvoiceAmount(),
                invoice.getDueAmount(),
                invoice.getOverageAmount(),
                invoice.getInvoiceDate(),
                invoice.getDueDate(),
                invoice.getPaymentDate(),
                invoice.getPaymentStatus()
        );
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAllWithCustomer(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> searchInvoices(String query, Pageable pageable) {
        return invoiceRepository.searchInvoices(query, pageable).map(this::toResponse);
    }
}