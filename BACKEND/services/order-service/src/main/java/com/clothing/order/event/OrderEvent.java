package com.clothing.order.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {

    private String eventType; // CREATED, STATUS_CHANGED
    private UUID shopId;
    private UUID orderId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String status;
    private List<OrderItemEvent> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEvent {
        private UUID productId;
        private UUID variantId;
        private int quantity;
        private BigDecimal price;
        private BigDecimal totalPrice;
    }
}
