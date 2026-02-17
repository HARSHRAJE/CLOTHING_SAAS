package com.clothing.customer.repository;

import com.clothing.customer.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByShopIdAndPhone(UUID shopId, String phone);

    Page<Customer> findByShopId(UUID shopId, Pageable pageable);

    Page<Customer> findByShopIdAndNameContainingIgnoreCase(UUID shopId, String name, Pageable pageable);
}
