package com.clothing.product.repository;

import com.clothing.product.model.Product;
import com.clothing.product.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Page<Product> findByShopId(UUID shopId, Pageable pageable);

    Page<Product> findByShopIdAndStatus(UUID shopId, ProductStatus status, Pageable pageable);
}
