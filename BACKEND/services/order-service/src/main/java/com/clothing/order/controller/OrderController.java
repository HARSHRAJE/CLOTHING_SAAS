package com.clothing.order.controller;

import com.clothing.order.dto.OrderDto;
import com.clothing.order.model.OrderStatus;
import com.clothing.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderDto.OrderResponse>> getOrders(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            Pageable pageable) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(orderService.getAllOrders(shopId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @PathVariable UUID id) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(orderService.getOrderById(shopId, id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<org.springframework.data.domain.Page<OrderDto.OrderResponse>> getOrdersByCustomer(
            @PathVariable UUID customerId,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(customerId, pageable));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @PathVariable UUID id,
            @RequestBody Map<String, String> statusMap) {
        UUID shopId = UUID.fromString(shopIdHeader);
        OrderStatus status = OrderStatus.valueOf(statusMap.get("status"));
        return ResponseEntity.ok(orderService.updateOrderStatus(shopId, id, status));
    }

    @GetMapping("/debug/{orderId}")
    public ResponseEntity<Map<String, Object>> debugOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderDebugInfo(orderId));
    }
}
