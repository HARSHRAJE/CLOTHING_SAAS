package com.clothing.product.controller;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products/variants")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PutMapping("/{variantId}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable UUID variantId,
            @RequestBody ProductDto.StockUpdateRequest request,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        inventoryService.updateStock(shopId, variantId, request.getQuantityChange(), request.getType(),
                request.getReferenceId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{variantId}/inventory")
    public ResponseEntity<List<ProductDto.InventoryHistoryResponse>> getInventoryHistory(
            @PathVariable UUID variantId,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(inventoryService.getHistory(shopId, variantId));
    }
}
