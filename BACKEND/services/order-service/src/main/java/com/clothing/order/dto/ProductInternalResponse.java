package com.clothing.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInternalResponse {
    private UUID variantId;
    private UUID productId;
    private String productName;
    private String category;
    private String size;
    private String color;
    private BigDecimal price;
    private Integer availableStock;
    private String status;
}
