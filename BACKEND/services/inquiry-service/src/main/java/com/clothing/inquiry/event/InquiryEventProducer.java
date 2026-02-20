package com.clothing.inquiry.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InquiryEventProducer {

    private static final String TOPIC = "inquiry-events";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publish(InquiryEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, event.getShopId().toString(), json);
            log.info("Published InquiryEvent: type={}, inquiryId={}", event.getEventType(), event.getInquiryId());
        } catch (Exception e) {
            log.error("Failed to publish InquiryEvent: {}", e.getMessage());
        }
    }
}
