package com.clothing.analytics.event;

import com.clothing.analytics.service.AnalyticsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/analytics/events")
@RequiredArgsConstructor
public class AnalyticsEventController {

    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    @PostMapping("/order")
    public ResponseEntity<Void> consumeOrderEvent(@RequestBody String message) {
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
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to process order event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/product")
    public ResponseEntity<Void> consumeProductEvent(@RequestBody String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                analyticsService.recordProductAdded(shopId);
                log.info("Recorded product-added analytics for shopId={}", shopId);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to process product event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/customer")
    public ResponseEntity<Void> consumeCustomerEvent(@RequestBody String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                analyticsService.recordNewCustomer(shopId);
                log.info("Recorded new-customer analytics for shopId={}", shopId);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to process customer event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/inquiry")
    public ResponseEntity<Void> consumeInquiryEvent(@RequestBody String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID shopId = UUID.fromString(event.get("shopId").asText());

            if ("CREATED".equals(eventType)) {
                analyticsService.recordInquiry(shopId);
                log.info("Recorded inquiry analytics for shopId={}", shopId);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to process inquiry event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
