package com.clothing.analytics.repository;

import com.clothing.analytics.model.DailyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyMetricRepository extends JpaRepository<DailyMetric, UUID> {
    Optional<DailyMetric> findByShopIdAndDate(UUID shopId, LocalDate date);

    @Query("SELECT d FROM DailyMetric d WHERE d.shopId = :shopId AND d.date BETWEEN :startDate AND :endDate ORDER BY d.date ASC")
    List<DailyMetric> findByShopIdAndDateBetween(@Param("shopId") UUID shopId, @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<DailyMetric> findByShopId(UUID shopId);
}
