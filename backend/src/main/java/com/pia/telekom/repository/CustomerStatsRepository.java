package com.pia.telekom.repository;

import com.pia.telekom.entity.CustomerStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerStatsRepository extends JpaRepository<CustomerStats, Integer> {
}

// @MapsId kullandım çünkü customer_stats.customer_id hem primary key hem foreign key (Customer'a 1-1) — bu
// JPA'da bu tür "paylaşılan PK" ilişkilerin standart yöntemi.