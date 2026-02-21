package com.clothing.customer.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerEventProducer {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${analytics-service.url:http://analytics-service:8087}")
    private String analyticsServiceUrl;

    public void publish(CustomerEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            String url = analyticsServiceUrl + "/analytics/events/customer";
            restTemplate.postForObject(url, json, String.class);
            log.debug("Sent customer event to analytics service: {}", json);
        } catch (Exception e) {
            log.error("Failed to send customer event to analytics service: {}", e.getMessage(), e);
        }
    }
}
