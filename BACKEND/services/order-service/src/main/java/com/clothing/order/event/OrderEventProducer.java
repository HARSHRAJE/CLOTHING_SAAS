package com.clothing.order.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ANALYTICS_SERVICE_URL:http://localhost:8087}")
    private String analyticsServiceUrl;

    @Value("${internal.api.key}")
    private String internalApiKey;

    public void publish(OrderEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            String url = analyticsServiceUrl + "/analytics/events/order";
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(json,
                    headers);
            restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, String.class);
            log.debug("Sent order event to analytics service: {}", json);
        } catch (Exception e) {
            log.error("Failed to send order event to analytics service: {}", e.getMessage(), e);
        }
    }
}
