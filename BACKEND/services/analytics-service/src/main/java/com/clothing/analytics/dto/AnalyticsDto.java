package com.clothing.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class AnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordOrderRequest {
        private UUID shopId;
        private UUID orderId;
        private BigDecimal amount;
        private LocalDate date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordProductSaleRequest {
        private UUID shopId;
        private UUID productId;
        private Integer quantity;
        private BigDecimal amount;
        private LocalDate date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordEventRequest {
        private UUID shopId;
        private LocalDate date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummaryResponse {
        private Integer todayOrders;
        private BigDecimal todayRevenue;
        private Integer todayNewCustomers;
        private Integer todayInquiries;

        private Integer totalOrders;
        private BigDecimal totalRevenue;
        private Integer totalCustomers;

        private java.util.List<DailyMetricDto> dailyMetrics;
        private java.util.List<TopProductResponse> topProducts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendResponse {
        private LocalDate date;
        private BigDecimal value; // Revenue or count
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMetricDto {
        private LocalDate date;
        private Integer ordersCount;
        private BigDecimal revenue;
        private Integer newCustomers;
        private Integer inquiriesCount;
        private Integer productsAdded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductResponse {
        private UUID productId;
        private String productName; // May need to fetch from Product Service or store
        private Integer unitsSold;
        private BigDecimal revenue;
    }
}
