package com.clothing.analytics.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "daily_metrics", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "shop_id", "date" })
})
public class DailyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_id", nullable = false)
    private UUID shopId;

    @Column(nullable = false)
    private LocalDate date;

    @Builder.Default
    @Column(name = "orders_count")
    private Integer ordersCount = 0;

    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "new_customers")
    private Integer newCustomers = 0;

    @Builder.Default
    @Column(name = "inquiries_count")
    private Integer inquiriesCount = 0;

    @Builder.Default
    @Column(name = "products_added")
    private Integer productsAdded = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
