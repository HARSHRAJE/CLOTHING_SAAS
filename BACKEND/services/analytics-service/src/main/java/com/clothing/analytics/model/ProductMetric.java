package com.clothing.analytics.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_metrics", indexes = {
        @Index(name = "idx_pm_shop", columnList = "shop_id"),
        @Index(name = "idx_pm_product", columnList = "product_id"),
        @Index(name = "idx_pm_date", columnList = "date")
})
public class ProductMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_id", nullable = false)
    private UUID shopId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(nullable = false)
    private LocalDate date;

    @Builder.Default
    @Column(name = "units_sold")
    private Integer unitsSold = 0;

    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
