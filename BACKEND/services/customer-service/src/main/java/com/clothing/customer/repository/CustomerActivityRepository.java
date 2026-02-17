package com.clothing.customer.repository;

import com.clothing.customer.model.CustomerActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomerActivityRepository extends JpaRepository<CustomerActivity, UUID> {
    Page<CustomerActivity> findByCustomerId(UUID customerId, Pageable pageable);
}
