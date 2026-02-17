package com.clothing.order.dto;

import com.clothing.order.model.OrderSource;
import com.clothing.order.model.OrderStatus;
import com.clothing.order.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {

    @Data
    public static class CreateOrderRequest {
        private String customerName;
        private String phone;
        private String email;
        private List<OrderItemRequest> items;
        private OrderSource orderSource;
    }

    @Data
    public static class OrderItemRequest {
        private UUID variantId;
        private Integer quantity;
    }

    @Data
    @Builder
    public static class OrderResponse {
        private UUID orderId;
        private UUID shopId;
        private String orderNumber;
        private OrderStatus status;
        private PaymentStatus paymentStatus;
        private OrderSource orderSource;
        private BigDecimal totalAmount;
        private BigDecimal taxAmount;
        private BigDecimal discountAmount;

        private CustomerResponse customer;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;
        private String address;
    }

    @Data
    @Builder
    public static class CustomerResponse {
        private UUID id;
        private UUID remoteCustomerId;
        private String name;
        private String phone;
        private String email;
    }

    @Data
    @Builder
    public static class OrderItemResponse {
        private UUID id;
        private UUID productId;
        private UUID variantId;
        private String productName; // Might need to fetch from Product Service or store snapshot
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal totalPrice;
    }
}
