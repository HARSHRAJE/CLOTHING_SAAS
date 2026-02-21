package com.clothing.analytics.controller;

import com.clothing.analytics.dto.AnalyticsDto;
import com.clothing.analytics.model.DailyMetric;
import com.clothing.analytics.model.ProductMetric;
import com.clothing.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class OwnerAnalyticsController {

        private final AnalyticsService analyticsService;

        @GetMapping("/summary")
        public ResponseEntity<AnalyticsDto.DashboardSummaryResponse> getSummary(
                        @RequestHeader("X-Shop-Id") UUID shopId) {
                DailyMetric today = analyticsService.getTodaySummary(shopId);
                DailyMetric total = analyticsService.getTotalSummary(shopId);

                // Fetch Trends (Last 7 Days)
                LocalDate endDate = LocalDate.now();
                LocalDate startDate = endDate.minusDays(7);
                List<DailyMetric> trends = analyticsService.getRevenueTrend(shopId, startDate, endDate);

                List<AnalyticsDto.DailyMetricDto> dailyMetricDtos = trends.stream()
                                .map(m -> AnalyticsDto.DailyMetricDto.builder()
                                                .date(m.getDate())
                                                .ordersCount(m.getOrdersCount())
                                                .revenue(m.getRevenue())
                                                .newCustomers(m.getNewCustomers())
                                                .inquiriesCount(m.getInquiriesCount())
                                                .productsAdded(m.getProductsAdded())
                                                .build())
                                .collect(Collectors.toList());

                // Fetch Top Products.
                List<ProductMetric> topProductMetrics = analyticsService.getTopProducts(shopId, startDate, endDate, 5);
                List<AnalyticsDto.TopProductResponse> topProducts = topProductMetrics.stream()
                                .map(m -> AnalyticsDto.TopProductResponse.builder()
                                                .productId(m.getProductId())
                                                .productName("Product " + m.getProductId().toString().substring(0, 8)) // Placeholder
                                                                                                                       // name
                                                .unitsSold(m.getUnitsSold())
                                                .revenue(m.getRevenue())
                                                .build())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(AnalyticsDto.DashboardSummaryResponse.builder()
                                .todayOrders(today.getOrdersCount())
                                .todayRevenue(today.getRevenue())
                                .todayNewCustomers(today.getNewCustomers())
                                .todayInquiries(today.getInquiriesCount())
                                .totalOrders(total.getOrdersCount())
                                .totalRevenue(total.getRevenue())
                                .totalCustomers(total.getNewCustomers())
                                .dailyMetrics(dailyMetricDtos)
                                .topProducts(topProducts)
                                .build());
        }

        @GetMapping("/revenue")
        public ResponseEntity<List<AnalyticsDto.TrendResponse>> getRevenueTrend(
                        @RequestHeader("X-Shop-Id") UUID shopId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

                List<DailyMetric> metrics = analyticsService.getRevenueTrend(shopId, startDate, endDate);
                return ResponseEntity.ok(metrics.stream()
                                .map(m -> new AnalyticsDto.TrendResponse(m.getDate(), m.getRevenue()))
                                .collect(Collectors.toList()));
        }

        @GetMapping("/orders")
        public ResponseEntity<List<AnalyticsDto.TrendResponse>> getOrdersTrend(
                        @RequestHeader("X-Shop-Id") UUID shopId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

                List<DailyMetric> metrics = analyticsService.getOrdersTrend(shopId, startDate, endDate);
                return ResponseEntity.ok(metrics.stream()
                                .map(m -> new AnalyticsDto.TrendResponse(m.getDate(),
                                                java.math.BigDecimal.valueOf(m.getOrdersCount())))
                                .collect(Collectors.toList()));
        }

        @GetMapping("/top-products")
        public ResponseEntity<List<AnalyticsDto.TopProductResponse>> getTopProducts(
                        @RequestHeader("X-Shop-Id") UUID shopId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(defaultValue = "5") int limit) {

                if (startDate == null)
                        startDate = LocalDate.now().minusDays(30);
                if (endDate == null)
                        endDate = LocalDate.now();

                List<ProductMetric> metrics = analyticsService.getTopProducts(shopId, startDate, endDate, limit);

                // Note: ProductName is not stored here. Frontend can fetch it or we can store
                // it.
                // For MVP, returning ID.
                return ResponseEntity.ok(metrics.stream()
                                .map(m -> AnalyticsDto.TopProductResponse.builder()
                                                .productId(m.getProductId())
                                                .unitsSold(m.getUnitsSold())
                                                .revenue(m.getRevenue())
                                                .build())
                                .collect(Collectors.toList()));
        }
}
