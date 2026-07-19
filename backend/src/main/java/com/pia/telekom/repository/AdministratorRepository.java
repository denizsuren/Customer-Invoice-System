package com.pia.telekom.repository;

import com.pia.telekom.entity.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdministratorRepository extends JpaRepository<Administrator, Integer> {

    Optional<Administrator> findByEmailIgnoreCase(String email);
}
