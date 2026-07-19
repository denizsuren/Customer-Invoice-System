package com.pia.telekom.repository;

import com.pia.telekom.dto.RechargeStatRow;
import com.pia.telekom.entity.Recharge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RechargeRepository extends JpaRepository<Recharge, Integer> {

    Page<Recharge> findByCustomer_CustomerId(Integer customerId, Pageable pageable);

    @Query("""
        SELECT new com.pia.telekom.dto.RechargeStatRow(r.customer.customerId, r.rechargeDate, r.rechargeAmount)
        FROM Recharge r
        WHERE r.gozlemDisiKayit = false
        """)
    List<RechargeStatRow> findAllForStats();

    @Query("SELECT COALESCE(SUM(r.rechargeAmount), 0) FROM Recharge r WHERE r.gozlemDisiKayit = false")
    BigDecimal sumValidRechargeAmount();
}