package com.clothing.customer.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerEventProducer {

    private static final String TOPIC = "customer-events";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publish(CustomerEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, event.getShopId().toString(), json);
            log.info("Published CustomerEvent: type={}, customerId={}", event.getEventType(), event.getCustomerId());
        } catch (Exception e) {
            log.error("Failed to publish CustomerEvent: {}", e.getMessage());
        }
    }
}
