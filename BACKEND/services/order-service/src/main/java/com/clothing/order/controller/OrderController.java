package com.clothing.order.controller;

import com.clothing.order.dto.OrderDto;
import com.clothing.order.model.OrderStatus;
import com.clothing.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            Authentication authentication,
            Pageable pageable) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(orderService.getAllOrders(shopId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(orderService.getOrderById(shopId, id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, String> statusMap) {
        UUID shopId = getShopId(authentication);
        OrderStatus status = OrderStatus.valueOf(statusMap.get("status"));
        return ResponseEntity.ok(orderService.updateOrderStatus(shopId, id, status));
    }

    private UUID getShopId(Authentication authentication) {
        // In Filter, we set details to shopId
        String shopIdStr = (String) authentication.getDetails();
        return UUID.fromString(shopIdStr);
    }

    @GetMapping("/debug/{orderId}")
    public ResponseEntity<Map<String, Object>> debugOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderDebugInfo(orderId));
    }
}
