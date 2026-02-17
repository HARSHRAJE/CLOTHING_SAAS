package com.clothing.order.controller;

import com.clothing.order.dto.OrderDto;
import com.clothing.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/store/{slug}/orders")
@RequiredArgsConstructor
public class PublicOrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto.OrderResponse> createOrder(
            @PathVariable String slug,
            @RequestBody OrderDto.CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(slug, request));
    }
}
