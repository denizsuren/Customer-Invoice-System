package com.pia.telekom.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "payment_channel", length = 20)
    private String paymentChannel;

    @Column(name = "invoice_amount", precision = 10, scale = 2)
    private BigDecimal invoiceAmount;

    @Column(name = "due_amount", precision = 10, scale = 2)
    private BigDecimal dueAmount;

    @Column(name = "overage_amount", precision = 10, scale = 2)
    private BigDecimal overageAmount;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    /** DB'de saklanmaz — paymentDate/dueDate'ten anlık hesaplanır. */
    @Transient
    public String getPaymentStatus() {
        if (paymentDate != null) return "PAID";
        if (dueDate != null && dueDate.isBefore(LocalDate.now())) return "OVERDUE";
        return "UNPAID";
    }
}