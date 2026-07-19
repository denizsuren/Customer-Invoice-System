package com.pia.telekom.repository;

import com.pia.telekom.entity.CustomerRiskAnalysis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRiskAnalysisRepository extends JpaRepository<CustomerRiskAnalysis, Integer> {
    @Query("SELECT c.customerId FROM CustomerRiskAnalysis c")
    List<Integer> findAllIds();

    @Query("SELECT c.recommendAction, COUNT(c) FROM CustomerRiskAnalysis c WHERE c.recommendAction IS NOT NULL GROUP BY c.recommendAction")
    List<Object[]> countGroupedByRecommendAction();

    @Query("""
    SELECT cra FROM CustomerRiskAnalysis cra
    JOIN FETCH cra.customer c
    WHERE cra.recommendAction = :action
    ORDER BY cra.riskScore DESC NULLS LAST
    """)
    Page<CustomerRiskAnalysis> findByRecommendAction(@Param("action") String action, Pageable pageable);

    @Query("SELECT c.customerId, c.behaviorCategory FROM CustomerRiskAnalysis c WHERE c.customerId IN :customerIds")
    List<Object[]> findBehaviorCategoriesByCustomerIds(@Param("customerIds") List<Integer> customerIds);



    @Query("""
    SELECT
        CASE
            WHEN c.behaviorCategory = 'guvenli' THEN 'guvenilir'
            WHEN c.behaviorCategory = 'orta_risk' THEN 'normal'
            WHEN c.behaviorCategory = 'riskli' THEN 'riskli'
            ELSE 'normal'
        END,
        COUNT(c)
    FROM CustomerRiskAnalysis c
    WHERE c.behaviorCategory IS NOT NULL
    GROUP BY
        CASE
            WHEN c.behaviorCategory = 'guvenli' THEN 'guvenilir'
            WHEN c.behaviorCategory = 'orta_risk' THEN 'normal'
            WHEN c.behaviorCategory = 'riskli' THEN 'riskli'
            ELSE 'normal'
        END
    """)
    List<Object[]> countGroupedByRiskCategory();

}