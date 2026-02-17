package com.clothing.product.controller;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.InventoryTransactionType;
import com.clothing.product.model.Product;
import com.clothing.product.model.ProductVariant;
import com.clothing.product.repository.ProductVariantRepository;
import com.clothing.product.service.InventoryService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/internal/products")
@RequiredArgsConstructor
public class InternalProductController {

    private final ProductVariantRepository variantRepository;
    private final InventoryService inventoryService;

    @GetMapping("/{variantId}")
    public ResponseEntity<VariantInternalResponse> validateVariant(@PathVariable UUID variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        Product product = variant.getProduct();

        return ResponseEntity.ok(VariantInternalResponse.builder()
                .variantId(variant.getId())
                .productId(product.getId())
                .price(variant.getPrice() != null ? variant.getPrice() : product.getPrice())
                .availableStock(variant.getStock())
                .status(product.getStatus().name())
                .build());
    }

    @PostMapping("/variants/{variantId}/reserve")
    public ResponseEntity<Void> reserveStock(
            @PathVariable UUID variantId,
            @RequestBody Map<String, Object> request) {
        Integer quantity = (Integer) request.get("quantity");
        String referenceId = (String) request.get("referenceId");

        // Reserve means reducing stock ('SALE' type for now, or 'RESERVE' if we had it)
        inventoryService.updateStockInternal(variantId, -quantity, InventoryTransactionType.SALE, referenceId);

        return ResponseEntity.ok().build();
    }

    @Data
    @Builder
    static class VariantInternalResponse {
        private UUID variantId;
        private UUID productId;
        private BigDecimal price;
        private Integer availableStock;
        private String status;
    }
}
