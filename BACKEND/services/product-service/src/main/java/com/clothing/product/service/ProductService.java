package com.clothing.product.service;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.*;
import com.clothing.product.repository.CategoryRepository;
import com.clothing.product.repository.ProductRepository;
import com.clothing.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryService inventoryService;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${analytics-service.url:http://analytics-service:8087}")
    private String analyticsServiceUrl;

    @Transactional
    public ProductDto.ProductResponse createProduct(UUID shopId, ProductDto.CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Category does not belong to this shop");
        }

        Product product = Product.builder()
                .shopId(shopId)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .costPrice(request.getCostPrice())
                .sku(request.getSku())
                .status(ProductStatus.ACTIVE)
                .build();

        Product saved = productRepository.save(product);

        // Record Analytics
        try {
            java.util.Map<String, Object> analyticsRequest = java.util.Map.of(
                    "shopId", saved.getShopId(),
                    "date", java.time.LocalDate.now().toString());
            restTemplate.postForLocation(analyticsServiceUrl + "/internal/analytics/products", analyticsRequest);
        } catch (Exception e) {
            System.err.println("Failed to record analytics: " + e.getMessage());
        }

        return mapToProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto.ProductResponse> getProducts(UUID shopId, ProductStatus status, Pageable pageable) {
        Page<Product> products;
        if (status != null) {
            products = productRepository.findByShopIdAndStatus(shopId, status, pageable);
        } else {
            products = productRepository.findByShopId(shopId, pageable);
        }
        return products.map(this::mapToProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductDto.ProductResponse getProduct(UUID shopId, UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        return mapToProductResponse(product);
    }

    // Public method for non-authenticated internal/public access if needed by other
    // services
    @Transactional(readOnly = true)
    public ProductDto.ProductResponse getProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToProductResponse(product);
    }

    @Transactional
    public ProductDto.ProductResponse updateProduct(UUID shopId, UUID productId,
            ProductDto.UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            if (!category.getShopId().equals(shopId)) {
                throw new RuntimeException("Unauthorized: Category does not belong to this shop");
            }

            product.setCategory(category);
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice());
        product.setSku(request.getSku());

        return mapToProductResponse(productRepository.save(product));
    }

    @Transactional
    public void updateProductStatus(UUID shopId, UUID productId, ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        product.setStatus(status);
        productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(UUID shopId, UUID productId) {
        // Soft delete implementation: Set status to INACTIVE or use a deleted_at flag
        // Reuse status update with check
        updateProductStatus(shopId, productId, ProductStatus.INACTIVE);
    }

    // --- Variant Methods ---

    @Transactional
    public ProductDto.VariantResponse addVariant(UUID shopId, UUID productId, ProductDto.AddVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        ProductVariant variant = ProductVariant.builder()
                .shopId(product.getShopId())
                .product(product)
                .size(request.getSize())
                .color(request.getColor())
                .price(request.getPrice())
                .stock(0) // Initial stock is 0, updated via InventoryService
                .build();

        ProductVariant saved = variantRepository.save(variant);

        // Set initial stock if provided
        if (request.getStock() != null && request.getStock() > 0) {
            inventoryService.updateStock(product.getShopId(), saved.getId(), request.getStock(),
                    InventoryTransactionType.MANUAL,
                    "Initial Stock");
            saved.setStock(request.getStock()); // Update local object for response
        }

        return mapToVariantResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductDto.VariantResponse> getVariants(UUID shopId, UUID productId) {
        // Verify product ownership first
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        return variantRepository.findByProductId(productId).stream()
                .map(this::mapToVariantResponse)
                .collect(Collectors.toList());
    }

    private ProductDto.ProductResponse mapToProductResponse(Product product) {
        return ProductDto.ProductResponse.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .category(mapToCategoryResponse(product.getCategory()))
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .sku(product.getSku())
                .status(product.getStatus())
                .variants(product.getVariants() != null
                        ? product.getVariants().stream().map(this::mapToVariantResponse).collect(Collectors.toList())
                        : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private ProductDto.CategoryResponse mapToCategoryResponse(Category category) {
        if (category == null)
            return null;
        return ProductDto.CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    private ProductDto.VariantResponse mapToVariantResponse(ProductVariant variant) {
        return ProductDto.VariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .size(variant.getSize())
                .color(variant.getColor())
                .price(variant.getPrice())
                .stock(variant.getStock())
                .build();
    }
}
