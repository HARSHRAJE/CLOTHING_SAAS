package com.clothing.analytics.service;

import com.clothing.analytics.model.DailyMetric;
import com.clothing.analytics.model.ProductMetric;
import com.clothing.analytics.repository.DailyMetricRepository;
import com.clothing.analytics.repository.ProductMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DailyMetricRepository dailyMetricRepository;
    private final ProductMetricRepository productMetricRepository;
    private final com.clothing.analytics.repository.EventLogRepository eventLogRepository;

    @Transactional
    public void recordOrder(UUID shopId, BigDecimal amount) {
        DailyMetric metric = getOrCreateDailyMetric(shopId);
        metric.setOrdersCount(metric.getOrdersCount() + 1);
        metric.setRevenue(metric.getRevenue().add(amount));
        dailyMetricRepository.save(metric);

        // Log Event
        saveEventLog(shopId, "ORDER_CREATED", null, java.util.Map.of("amount", amount));
    }

    @Transactional
    public void recordProductSale(UUID shopId, UUID productId, int quantity, BigDecimal amount) {
        ProductMetric metric = getOrCreateProductMetric(shopId, productId);
        metric.setUnitsSold(metric.getUnitsSold() + quantity);
        metric.setRevenue(metric.getRevenue().add(amount));
        productMetricRepository.save(metric);

        // Log Event
        saveEventLog(shopId, "PRODUCT_SOLD", productId, java.util.Map.of("quantity", quantity, "amount", amount));
    }

    @Transactional
    public void recordNewCustomer(UUID shopId) {
        DailyMetric metric = getOrCreateDailyMetric(shopId);
        metric.setNewCustomers(metric.getNewCustomers() + 1);
        dailyMetricRepository.save(metric);

        // Log Event
        saveEventLog(shopId, "CUSTOMER_CREATED", null, java.util.Map.of());
    }

    @Transactional
    public void recordInquiry(UUID shopId) {
        DailyMetric metric = getOrCreateDailyMetric(shopId);
        metric.setInquiriesCount(metric.getInquiriesCount() + 1);
        dailyMetricRepository.save(metric);

        // Log Event
        saveEventLog(shopId, "INQUIRY_CREATED", null, java.util.Map.of());
    }

    @Transactional
    public void recordProductAdded(UUID shopId) {
        DailyMetric metric = getOrCreateDailyMetric(shopId);
        metric.setProductsAdded(metric.getProductsAdded() + 1);
        dailyMetricRepository.save(metric);

        // Log Event
        saveEventLog(shopId, "PRODUCT_CREATED", null, java.util.Map.of());
    }

    private void saveEventLog(UUID shopId, String eventType, UUID entityId, java.util.Map<String, Object> data) {
        try {
            com.clothing.analytics.model.EventLog log = com.clothing.analytics.model.EventLog.builder()
                    .shopId(shopId)
                    .eventType(eventType)
                    .entityId(entityId)
                    .data(data)
                    .build();
            eventLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to save event log: " + e.getMessage());
        }
    }

    // --- Read Methods ---

    public DailyMetric getTodaySummary(UUID shopId) {
        return getOrCreateDailyMetric(shopId);
    }

    public List<DailyMetric> getRevenueTrend(UUID shopId, LocalDate startDate, LocalDate endDate) {
        return dailyMetricRepository.findByShopIdAndDateBetween(shopId, startDate, endDate);
    }

    public List<DailyMetric> getOrdersTrend(UUID shopId, LocalDate startDate, LocalDate endDate) {
        return dailyMetricRepository.findByShopIdAndDateBetween(shopId, startDate, endDate);
    }

    public List<ProductMetric> getTopProducts(UUID shopId, LocalDate startDate, LocalDate endDate, int limit) {
        return productMetricRepository.findTopProductsByRevenue(shopId, startDate, endDate, PageRequest.of(0, limit));
    }

    public DailyMetric getTotalSummary(UUID shopId) {
        List<DailyMetric> allMetrics = dailyMetricRepository.findByShopId(shopId);
        DailyMetric total = DailyMetric.builder()
                .shopId(shopId)
                .date(LocalDate.now())
                .ordersCount(0)
                .revenue(BigDecimal.ZERO)
                .newCustomers(0)
                .inquiriesCount(0)
                .productsAdded(0)
                .build();

        for (DailyMetric m : allMetrics) {
            total.setOrdersCount(total.getOrdersCount() + m.getOrdersCount());
            total.setRevenue(total.getRevenue().add(m.getRevenue()));
            total.setNewCustomers(total.getNewCustomers() + m.getNewCustomers());
            total.setInquiriesCount(total.getInquiriesCount() + m.getInquiriesCount());
            total.setProductsAdded(total.getProductsAdded() + m.getProductsAdded());
        }
        return total;
    }

    // --- Helpers ---

    private DailyMetric getOrCreateDailyMetric(UUID shopId) {
        LocalDate today = LocalDate.now();
        return dailyMetricRepository.findByShopIdAndDate(shopId, today)
                .orElseGet(() -> dailyMetricRepository.save(DailyMetric.builder()
                        .shopId(shopId)
                        .date(today)
                        .build()));
    }

    private ProductMetric getOrCreateProductMetric(UUID shopId, UUID productId) {
        LocalDate today = LocalDate.now();
        return productMetricRepository.findByShopIdAndProductIdAndDate(shopId, productId, today)
                .orElseGet(() -> productMetricRepository.save(ProductMetric.builder()
                        .shopId(shopId)
                        .productId(productId)
                        .date(today)
                        .build()));
    }
}
