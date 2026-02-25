package com.clothing.product.controller;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.ProductStatus;
import com.clothing.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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
    private final com.clothing.product.service.CategoryService categoryService;
    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${SHOP_SERVICE_URL:http://localhost:8082}")
    private String shopServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${internal.api.key}")
    private String internalApiKey;

    @GetMapping("/{slug}")
    @Cacheable(value = "productsByShopSlug", key = "#slug")
    public ResponseEntity<List<ProductDto.ProductResponse>> getProductsBySlug(@PathVariable String slug) {
        String url = shopServiceUrl + "/store/" + slug;

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity,
                    Map.class);
            Map shop = response.getBody();
            if (shop == null)
                return ResponseEntity.notFound().build();

            String shopIdStr = (String) shop.get("shopId");
            UUID shopId = UUID.fromString(shopIdStr);

            // Fetch active products for this shop
            return ResponseEntity
                    .ok(productService.getProducts(shopId, ProductStatus.ACTIVE, Pageable.unpaged()).getContent());

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Shop internal call failed: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{slug}/categories")
    @Cacheable(value = "categoriesByShopSlug", key = "#slug")
    public ResponseEntity<List<ProductDto.CategoryResponse>> getCategoriesBySlug(@PathVariable String slug) {
        String url = shopServiceUrl + "/store/" + slug;

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity,
                    Map.class);
            Map shop = response.getBody();
            if (shop == null)
                return ResponseEntity.notFound().build();

            String shopIdStr = (String) shop.get("shopId");
            UUID shopId = UUID.fromString(shopIdStr);

            return ResponseEntity.ok(categoryService.getCategories(shopId));

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Shop internal call failed: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{slug}/{productId}")
    @Cacheable(value = "productDetail", key = "#productId")
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
