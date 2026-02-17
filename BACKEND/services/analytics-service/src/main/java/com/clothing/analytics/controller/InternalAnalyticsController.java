package com.clothing.analytics.controller;

import com.clothing.analytics.dto.AnalyticsDto;
import com.clothing.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/analytics")
@RequiredArgsConstructor
public class InternalAnalyticsController {

    private final AnalyticsService analyticsService;

    @PostMapping("/orders")
    public ResponseEntity<Void> recordOrder(@RequestBody AnalyticsDto.RecordOrderRequest request) {
        analyticsService.recordOrder(request.getShopId(), request.getAmount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/product-sale")
    public ResponseEntity<Void> recordProductSale(@RequestBody AnalyticsDto.RecordProductSaleRequest request) {
        analyticsService.recordProductSale(request.getShopId(), request.getProductId(), request.getQuantity(),
                request.getAmount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customers")
    public ResponseEntity<Void> recordCustomer(@RequestBody AnalyticsDto.RecordEventRequest request) {
        analyticsService.recordNewCustomer(request.getShopId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/inquiries")
    public ResponseEntity<Void> recordInquiry(@RequestBody AnalyticsDto.RecordEventRequest request) {
        analyticsService.recordInquiry(request.getShopId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/products")
    public ResponseEntity<Void> recordProduct(@RequestBody AnalyticsDto.RecordEventRequest request) {
        analyticsService.recordProductAdded(request.getShopId());
        return ResponseEntity.ok().build();
    }
}
