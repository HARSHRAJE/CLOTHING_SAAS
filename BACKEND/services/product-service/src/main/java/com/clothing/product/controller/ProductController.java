package com.clothing.product.controller;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.ProductStatus;
import com.clothing.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductDto.ProductResponse> createProduct(
            @RequestBody ProductDto.CreateProductRequest request,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(productService.createProduct(shopId, request));
    }

    @GetMapping
    public ResponseEntity<Page<ProductDto.ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ProductStatus status,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.getProducts(shopId, status, pageable));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDto.ProductResponse> getProduct(
            @PathVariable UUID productId,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(productService.getProduct(shopId, productId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductDto.ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @RequestBody ProductDto.UpdateProductRequest request,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(productService.updateProduct(shopId, productId, request));
    }

    @PutMapping("/{productId}/status")
    public ResponseEntity<Void> updateProductStatus(
            @PathVariable UUID productId,
            @RequestBody Map<String, String> statusMap,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        ProductStatus status = ProductStatus.valueOf(statusMap.get("status"));
        productService.updateProductStatus(shopId, productId, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable UUID productId,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        productService.deleteProduct(shopId, productId);
        return ResponseEntity.noContent().build();
    }

    // --- Variant Endpoints ---

    @PostMapping("/{productId}/variants")
    public ResponseEntity<ProductDto.VariantResponse> addVariant(
            @PathVariable UUID productId,
            @RequestBody ProductDto.AddVariantRequest request,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(productService.addVariant(shopId, productId, request));
    }

    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<ProductDto.VariantResponse>> getVariants(
            @PathVariable UUID productId,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(productService.getVariants(shopId, productId));
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductDto.VariantResponse> updateVariant(
            @PathVariable UUID variantId,
            @RequestBody ProductDto.UpdateVariantRequest request,
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(productService.updateVariant(shopId, variantId, request));
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable UUID variantId) {
        return ResponseEntity.noContent().build();
    }
}
