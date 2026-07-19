package com.pia.telekom.repository;

import com.pia.telekom.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query(value = """
    SELECT AVG(p2.monthly_fee - p1.monthly_fee)
    FROM product p1 JOIN product p2 ON p2.tier_level > p1.tier_level
        AND p1.category = p2.category
    """, nativeQuery = true)
    BigDecimal averageUpgradeFeeGap();

    @Query("SELECT AVG(p.monthlyFee) FROM Product p WHERE p.subscriptionType = 'faturali'")
    BigDecimal averageEntryPostpaidFee();
}
