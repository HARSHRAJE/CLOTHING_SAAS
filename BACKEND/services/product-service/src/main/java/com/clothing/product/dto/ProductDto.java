package com.clothing.product.dto;

import com.clothing.product.model.InventoryTransactionType;
import com.clothing.product.model.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ProductDto {

    @Data
    @Builder
    public static class CreateCategoryRequest {
        private String name;
        private String description;
    }

    @Data
    @Builder
    public static class CategoryResponse {
        private UUID id;
        private UUID shopId;
        private String name;
        private String description;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class CreateProductRequest {
        private UUID categoryId;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal costPrice;

        // imageUrl removed — images are now managed per variant
    }

    @Data
    @Builder
    public static class UpdateProductRequest {
        private UUID categoryId; // Optional
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal costPrice;

        // imageUrl removed — images are now managed per variant
    }

    @Data
    @Builder
    public static class ProductResponse {
        private UUID id;
        private UUID shopId;
        private CategoryResponse category;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal costPrice;

        // imageUrl removed — images are now managed per variant
        private ProductStatus status;
        private List<VariantResponse> variants;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class AddVariantRequest {
        private String size;
        private String color;
        private BigDecimal price;
        private Integer stock;
        /**
         * Ordered list of image URLs for this variant.
         * Index 0 is treated as the primary/hero image.
         */
        private List<String> imageUrls;
    }

    @Data
    @Builder
    public static class UpdateVariantRequest {
        private String size;
        private String color;
        private BigDecimal price;
        /**
         * Full replacement of the variant's image gallery.
         * Pass null or an empty list to clear all images.
         */
        private List<String> imageUrls;
    }

    @Data
    @Builder
    public static class VariantResponse {
        private UUID id;
        private UUID productId;
        private String size;
        private String color;
        private BigDecimal price;
        private Integer stock;
        /** Ordered gallery URLs (index 0 = hero image). */
        private List<String> imageUrls;
    }

    @Data
    @Builder
    public static class StockUpdateRequest {
        private Integer quantityChange;
        private InventoryTransactionType type;
        private String referenceId;
    }

    @Data
    @Builder
    public static class InventoryHistoryResponse {
        private UUID id;
        private Integer quantityChange;
        private InventoryTransactionType type;
        private String referenceId;
        private LocalDateTime createdAt;
    }
}
