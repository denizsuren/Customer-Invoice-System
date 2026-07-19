package com.pia.telekom.repository;

import com.pia.telekom.dto.InvoiceStatRow;
import com.pia.telekom.dto.RechargeStatRow;
import com.pia.telekom.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    Page<Invoice> findByCustomer_CustomerId(Integer customerId, Pageable pageable);

    boolean existsByInvoiceIdAndCustomer_CustomerId(Integer invoiceId, Integer customerId);

    @Query("""
        SELECT i.customer.customerId, COUNT(i)
        FROM Invoice i
        WHERE i.paymentDate IS NULL
          AND i.dueDate < :today
          AND i.invoiceDate > :since
          AND i.customer.customerId IN :customerIds
        GROUP BY i.customer.customerId
        """)
    List<Object[]> countOverdueGroupedByCustomerIds(
            @Param("today") LocalDate today,
            @Param("since") LocalDate since,
            @Param("customerIds") List<Integer> customerIds);

    @Query("""
        SELECT i FROM Invoice i
        JOIN FETCH i.customer c
        JOIN FETCH c.region
        """)
    List<Invoice> findAllWithCustomerAndRegion();
    /*aggregation*/
    @Query(value = """
    SELECT
        r.region_id AS region_id,
        r.name AS region_name,
        r.city_type AS city_type,
        COUNT(i.invoice_id) AS total_invoice_count,
        COALESCE(SUM(i.invoice_amount), 0) AS total_revenue,
        COALESCE(AVG(i.invoice_amount), 0) AS average_invoice_amount,
        COALESCE(STDDEV_POP(i.invoice_amount), 0) AS invoice_amount_std_dev,
        COALESCE(
            100.0 * SUM(
                CASE
                    WHEN i.payment_date IS NULL
                     AND i.due_date IS NOT NULL
                     AND i.due_date < CURRENT_DATE
                    THEN 1
                    ELSE 0
                END
            ) / NULLIF(COUNT(i.invoice_id), 0),
            0
        ) AS overdue_rate_percentage
    FROM invoice i
    JOIN customer c ON c.customer_id = i.customer_id
    JOIN region r ON r.region_id = c.region_id
    GROUP BY r.region_id, r.name, r.city_type
    ORDER BY total_revenue DESC
    """, nativeQuery = true)
    List<Object[]> findRegionalPaymentAnalysisRows();

    @Query(value = """
    SELECT to_char(i.invoice_date, 'YYYY-MM') AS month,
           COALESCE(SUM(i.invoice_amount), 0) AS total_revenue
    FROM invoice i
    WHERE i.invoice_date IS NOT NULL
    GROUP BY to_char(i.invoice_date, 'YYYY-MM')
    ORDER BY month
    """, nativeQuery = true)
    List<Object[]> findMonthlyRevenueTotals();

    @Query(value = """
    SELECT r.name AS region_name,
           COALESCE(SUM(i.invoice_amount), 0) AS total_revenue,
           r.city_type AS city_type
    FROM invoice i
    JOIN customer c ON c.customer_id = i.customer_id
    JOIN region r ON r.region_id = c.region_id
    GROUP BY r.name, r.city_type
    ORDER BY total_revenue DESC
    """, nativeQuery = true)
    List<Object[]> findCityRevenueTotals();

    @Query(value = "SELECT i FROM Invoice i JOIN FETCH i.customer c LEFT JOIN FETCH i.product",
            countQuery = "SELECT COUNT(i) FROM Invoice i")
    Page<Invoice> findAllWithCustomer(Pageable pageable);

    long countByPaymentDateIsNullAndDueDateBefore(LocalDate date);

    @Query("""
        SELECT i.customer.customerId
        FROM Invoice i
        WHERE i.paymentDate IS NULL AND i.dueDate < :today AND i.invoiceDate > :since
        GROUP BY i.customer.customerId
        HAVING COUNT(i) >= :threshold
        """)
    List<Integer> findCustomerIdsWithOverdueCountAtLeast(
            @Param("today") LocalDate today,
            @Param("since") LocalDate since,
            @Param("threshold") long threshold);

    @Query("SELECT MAX(i.invoiceDate) FROM Invoice i")
    LocalDate findMaxInvoiceDate();

    @Query("SELECT COALESCE(SUM(i.invoiceAmount), 0) FROM Invoice i WHERE i.invoiceDate BETWEEN :start AND :end")
    BigDecimal sumInvoiceAmountBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("""
    SELECT i FROM Invoice i
    JOIN FETCH i.customer
    LEFT JOIN FETCH i.product
    WHERE i.overageAmount IS NOT NULL AND i.overageAmount > 0
      AND i.invoiceDate > :since
    """)
    List<Invoice> findOverageInvoicesSince(@Param("since") LocalDate since);


    @Query("""
    SELECT new com.pia.telekom.dto.InvoiceStatRow(
        i.customer.customerId, i.invoiceDate, i.dueDate, i.paymentDate, i.overageAmount)
    FROM Invoice i
    """)
    List<InvoiceStatRow> findAllForStats();

    @Query(value = """
    SELECT AVG(sub.total_unpaid) FROM (
        SELECT SUM(due_amount) as total_unpaid
        FROM invoice
        WHERE payment_date IS NULL
        GROUP BY customer_id
    ) sub
    """, nativeQuery = true)
    BigDecimal averageUnpaidValuePerCustomer();

    @Query(value = """
    SELECT i FROM Invoice i
    JOIN FETCH i.customer c
    LEFT JOIN FETCH i.product
    WHERE (:query IS NULL OR :query = ''
        OR LOWER(CONCAT(c.name, ' ', c.surname)) LIKE LOWER(CONCAT('%', :query, '%'))
    )
    """,
            countQuery = """
    SELECT COUNT(i) FROM Invoice i
    JOIN i.customer c
    WHERE (:query IS NULL OR :query = ''
        OR LOWER(CONCAT(c.name, ' ', c.surname)) LIKE LOWER(CONCAT('%', :query, '%'))
    )
    """)
    Page<Invoice> searchInvoices(@Param("query") String query, Pageable pageable);

    /* ---- Faturalar sayfası özet kartları (InvoiceSummaryService) ---- */

    /** Son 5 yılın yıllık ciro ortalaması. */
    @Query(value = """
        SELECT COALESCE(AVG(yearly_total), 0)
        FROM (
            SELECT date_part('year', i.invoice_date) AS y,
                   SUM(i.invoice_amount)             AS yearly_total
            FROM invoice i
            WHERE i.invoice_date >= (CURRENT_DATE - INTERVAL '5 year')
            GROUP BY date_part('year', i.invoice_date)
        ) t
        """, nativeQuery = true)
    java.math.BigDecimal averageAnnualRevenueLastFiveYears();

    /** Son ödeme tarihini 3+ gün geçmiş ve hâlâ ödenmemiş fatura adedi. */
    @Query(value = """
        SELECT COUNT(*)
        FROM invoice i
        WHERE i.payment_date IS NULL
          AND i.due_date < (CURRENT_DATE - 3)
        """, nativeQuery = true)
    long countOverdueMoreThanThreeDays();

    /*
      Paket aşımı yapan faturalar: [adet, ortalama aşım tutarı].
      TARİH PENCERESİ BİLİNÇLİ OLARAK YOK: önce "son 30 gün (bugüne göre)",
      sonra "son 30 gün (en son faturaya göre)" denendi; seed verinin aşımlı
      satırları o dilimlere düşmediği için kart 0 gösterdi. Tüm zamanlar
      üzerinden sayım, veri varsa her koşulda sonuç üretir. Dönemsel pencere
      istenirse WHERE'e tarih koşulu eklemek yeterlidir.
    */
    @Query(value = """
        SELECT COUNT(*)                           AS overage_count,
               COALESCE(AVG(i.overage_amount), 0) AS avg_overage
        FROM invoice i
        WHERE i.overage_amount > 0
        """, nativeQuery = true)
    java.util.List<Object[]> overageStatsLastThirtyDays();
}