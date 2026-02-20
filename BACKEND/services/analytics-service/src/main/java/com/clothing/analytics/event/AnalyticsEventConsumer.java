package com.clothing.analytics.event;

import com.clothing.analytics.service.AnalyticsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsEventConsumer {

    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "analytics-group")
    public void consumeOrderEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                BigDecimal amount = new BigDecimal(event.get("totalAmount").asText());
                analyticsService.recordOrder(shopId, amount);

                // Record individual product sales
                JsonNode items = event.get("items");
                if (items != null && items.isArray()) {
                    for (JsonNode item : items) {
                        UUID productId = UUID.fromString(item.get("productId").asText());
                        int quantity = item.get("quantity").asInt();
                        BigDecimal itemAmount = new BigDecimal(item.get("totalPrice").asText());
                        analyticsService.recordProductSale(shopId, productId, quantity, itemAmount);
                    }
                }

                log.info("Recorded order analytics for shopId={}", shopId);
            }
        } catch (Exception e) {
            log.error("Failed to consume order event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "product-events", groupId = "analytics-group")
    public void consumeProductEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                analyticsService.recordProductAdded(shopId);
                log.info("Recorded product-added analytics for shopId={}", shopId);
            }
        } catch (Exception e) {
            log.error("Failed to consume product event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "customer-events", groupId = "analytics-group")
    public void consumeCustomerEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                analyticsService.recordNewCustomer(shopId);
                log.info("Recorded new-customer analytics for shopId={}", shopId);
            }
        } catch (Exception e) {
            log.error("Failed to consume customer event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "inquiry-events", groupId = "analytics-group")
    public void consumeInquiryEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                analyticsService.recordInquiry(shopId);
                log.info("Recorded inquiry analytics for shopId={}", shopId);
            }
        } catch (Exception e) {
            log.error("Failed to consume inquiry event: {}", e.getMessage(), e);
        }
    }
}
