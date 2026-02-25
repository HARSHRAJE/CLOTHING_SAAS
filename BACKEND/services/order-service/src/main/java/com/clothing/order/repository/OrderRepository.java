package com.clothing.order.repository;

import com.clothing.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByShopId(UUID shopId, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByCustomerRemoteCustomerId(UUID remoteCustomerId, Pageable pageable);
}
