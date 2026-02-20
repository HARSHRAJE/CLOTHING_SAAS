package com.clothing.product.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventProducer {

    private static final String TOPIC = "product-events";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publish(ProductEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, event.getShopId().toString(), json);
            log.info("Published ProductEvent: type={}, productId={}", event.getEventType(), event.getProductId());
        } catch (Exception e) {
            log.error("Failed to publish ProductEvent: {}", e.getMessage());
        }
    }
}
