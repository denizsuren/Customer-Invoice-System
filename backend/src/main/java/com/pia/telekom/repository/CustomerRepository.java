package com.pia.telekom.repository;

import com.pia.telekom.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer>,
        JpaSpecificationExecutor<Customer> {

    @Override
    @EntityGraph(attributePaths = "region")
    Page<Customer> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "region")
    Page<Customer> findAll(Specification<Customer> spec, Pageable pageable);

    Page<Customer> findByRegion_RegionId(Integer regionId, Pageable pageable);

    @Query("SELECT c.customerId, c.hasAutopay FROM Customer c")
    List<Object[]> findAllCustomerIdAndAutopay();

    /*
      Faturalar sayfası özet kartı: ödeme kanalı tercihi mobil olan müşteri
      yüzdesi. DB'deki değerler serbest metin olabildiği için (Mobil Uygulama,
      mobile app vb.) LIKE ile toleranslı eşleşir.
    */
    @Query(value = """
        SELECT COALESCE(
                 100.0 * COUNT(*) FILTER (WHERE LOWER(c.payment_channel_preference) LIKE '%mobil%'
                                             OR LOWER(c.payment_channel_preference) LIKE '%app%')
                 / NULLIF(COUNT(*), 0), 0)
        FROM customer c
        """, nativeQuery = true)
    Double mobileChannelPercentage();

    /** Mobil kanalı tercih eden müşterinin en yoğun olduğu bölge adı (tek satır). */
    @Query(value = """
        SELECT r.name
        FROM customer c
        JOIN region r ON r.region_id = c.region_id
        WHERE LOWER(c.payment_channel_preference) LIKE '%mobil%'
           OR LOWER(c.payment_channel_preference) LIKE '%app%'
        GROUP BY r.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
        """, nativeQuery = true)
    java.util.List<String> topMobileRegions();
}