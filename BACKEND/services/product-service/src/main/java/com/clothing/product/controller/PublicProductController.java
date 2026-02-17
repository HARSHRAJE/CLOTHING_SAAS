package com.clothing.product.controller;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.ProductStatus;
import com.clothing.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/store/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;
    private final RestTemplate restTemplate = new RestTemplate(); // Should be a Bean

    @GetMapping("/{slug}")
    public ResponseEntity<List<ProductDto.ProductResponse>> getProductsBySlug(@PathVariable String slug) {
        // Resolve slug -> shopId
        // Assuming shop-service is at http://localhost:8082
        // In Docker/K8s this would be http://shop-service:8082
        String shopServiceUrl = "http://localhost:8082/store/" + slug;

        try {
            // Need a DTO or just parse Map to get ID
            Map shop = restTemplate.getForObject(shopServiceUrl, Map.class);
            if (shop == null)
                return ResponseEntity.notFound().build();

            String shopIdStr = (String) shop.get("shopId");
            UUID shopId = UUID.fromString(shopIdStr);

            // Fetch active products for this shop
            // For public view, maybe we don't paginate or we default it?
            // Service returns Page, we can extract content
            return ResponseEntity
                    .ok(productService.getProducts(shopId, ProductStatus.ACTIVE, Pageable.unpaged()).getContent());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{slug}/{productId}")
    public ResponseEntity<ProductDto.ProductResponse> getProductDetail(
            @PathVariable String slug,
            @PathVariable UUID productId) {
        // We could verify slug matches shopId of product, but for simple access:
        // Just get product, check if ACTIVE
        ProductDto.ProductResponse product = productService.getProduct(productId);
        if (product.getStatus() != ProductStatus.ACTIVE) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }
}
