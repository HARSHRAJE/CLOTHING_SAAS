package com.clothing.analytics.repository;

import com.clothing.analytics.model.ProductMetric;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductMetricRepository extends JpaRepository<ProductMetric, UUID> {
    Optional<ProductMetric> findByShopIdAndProductIdAndDate(UUID shopId, UUID productId, LocalDate date);

    @Query("SELECT new com.clothing.analytics.model.ProductMetric(" +
            "null, p.shopId, p.productId, MAX(p.date), " +
            "CAST(SUM(p.unitsSold) AS integer), SUM(p.revenue), MAX(p.createdAt)) " +
            "FROM ProductMetric p " +
            "WHERE p.shopId = :shopId AND p.date BETWEEN :startDate AND :endDate " +
            "GROUP BY p.shopId, p.productId " +
            "ORDER BY SUM(p.revenue) DESC")
    List<ProductMetric> findTopProductsByRevenue(@Param("shopId") UUID shopId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
