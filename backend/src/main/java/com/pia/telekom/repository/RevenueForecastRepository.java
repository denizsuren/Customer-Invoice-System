package com.pia.telekom.repository;

import com.pia.telekom.entity.RevenueForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevenueForecastRepository extends JpaRepository<RevenueForecast, Integer> {
}
