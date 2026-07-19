package com.pia.telekom.repository;

import com.pia.telekom.entity.CollectionAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionActionRepository extends JpaRepository<CollectionAction, Integer> {

    List<CollectionAction> findByInvoice_InvoiceId(Integer invoiceId);
}