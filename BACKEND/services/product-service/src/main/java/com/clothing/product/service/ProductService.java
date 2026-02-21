package com.clothing.product.service;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.*;
import com.clothing.product.repository.CategoryRepository;
import com.clothing.product.repository.ProductRepository;
import com.clothing.product.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryService inventoryService;
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final com.clothing.product.event.ProductEventProducer productEventProducer;

    // -----------------------------------------------------------------------
    // Product CRUD
    // -----------------------------------------------------------------------

    @Transactional
    @CacheEvict(value = "productsByShopSlug", key = "#shopId.toString()") // we need the slug ideally but the controller
                                                                          // fetches by slug and calls service by
                                                                          // shopId. Wait, let's evict by shop Slug? The
                                                                          // controller caches by slug, so we need slug.
                                                                          // Wait, product-service only knows shopId.
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

                .status(ProductStatus.ACTIVE)
                .build();

        Product saved = productRepository.save(product);

        // Publish Kafka event for analytics (replaces REST call)
        productEventProducer.publish(com.clothing.product.event.ProductEvent.builder()
                .eventType("CREATED")
                .shopId(saved.getShopId())
                .productId(saved.getId())
                .productName(saved.getName())
                .build());

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
    @CacheEvict(value = { "productsByShopSlug", "productDetail" }, key = "#shopId.toString()")
    // Ideally productDetail evicts by productId, but we can't easily do both
    // flexibly here without multiple annotations.
    // Actually we can: @CacheEvict(value = "productDetail", key = "#productId")
    // Let's do multiple annotations via @Caching
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = "productsByShopSlug", key = "#shopId.toString()"),
            @CacheEvict(value = "productDetail", key = "#productId")
    })
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

        return mapToProductResponse(productRepository.save(product));
    }

    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = "productsByShopSlug", key = "#shopId.toString()"),
            @CacheEvict(value = "productDetail", key = "#productId")
    })
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
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = "productsByShopSlug", key = "#shopId.toString()"),
            @CacheEvict(value = "productDetail", key = "#productId")
    })
    public void deleteProduct(UUID shopId, UUID productId) {
        updateProductStatus(shopId, productId, ProductStatus.INACTIVE);
    }

    // -----------------------------------------------------------------------
    // Variant Methods
    // -----------------------------------------------------------------------

    @Transactional
    @org.springframework.cache.annotation.Caching(evict = {
            @CacheEvict(value = "productsByShopSlug", key = "#shopId.toString()"),
            @CacheEvict(value = "productDetail", key = "#productId")
    })
    public ProductDto.VariantResponse addVariant(UUID shopId, UUID productId, ProductDto.AddVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        // Build images from request URLs
        List<VariantImage> images = buildVariantImages(request.getImageUrls());

        ProductVariant variant = ProductVariant.builder()
                .shopId(product.getShopId())
                .product(product)
                .size(request.getSize())
                .color(request.getColor())
                .price(request.getPrice())
                .stock(0) // Initial stock is 0, updated via InventoryService
                .images(images)
                .build();

        ProductVariant saved = variantRepository.save(variant);

        // Set initial stock if provided
        if (request.getStock() != null && request.getStock() > 0) {
            inventoryService.updateStock(product.getShopId(), saved.getId(), request.getStock(),
                    InventoryTransactionType.MANUAL,
                    "Initial Stock");
            saved.setStock(request.getStock());
        }

        return mapToVariantResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductDto.VariantResponse> getVariants(UUID shopId, UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Product does not belong to this shop");
        }

        return variantRepository.findByProductId(productId).stream()
                .map(this::mapToVariantResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates mutable fields of a variant and does a full replacement of its
     * image gallery. Passing null or an empty list for {@code imageUrls} clears
     * all existing images.
     */
    @Transactional
    // We need productId to evict productDetail, which we can get from
    // variant.getProduct().getId()
    // but SPEL can't easily fetch that before execution. We can just evict
    // productsByShopSlug.
    @CacheEvict(value = "productsByShopSlug", key = "#shopId.toString()")
    public ProductDto.VariantResponse updateVariant(UUID shopId, UUID variantId,
            ProductDto.UpdateVariantRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        if (!variant.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Variant does not belong to this shop");
        }

        if (request.getSize() != null) {
            variant.setSize(request.getSize());
        }
        if (request.getColor() != null) {
            variant.setColor(request.getColor());
        }
        if (request.getPrice() != null) {
            variant.setPrice(request.getPrice());
        }

        // Full replacement of the image gallery via orphanRemoval
        variant.getImages().clear();
        variant.getImages().addAll(buildVariantImages(request.getImageUrls()));

        ProductVariant saved = variantRepository.save(variant);
        return mapToVariantResponse(saved);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Builds a list of {@link VariantImage} entities from a list of URL strings.
     * The list index becomes the {@code displayOrder} (0 = hero/primary image).
     */
    private List<VariantImage> buildVariantImages(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            return new ArrayList<>();
        }
        return IntStream.range(0, urls.size())
                .mapToObj(i -> VariantImage.builder()
                        .imageUrl(urls.get(i))
                        .displayOrder(i)
                        .build())
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
        // Collect image URLs ordered by displayOrder
        List<String> imageUrls = variant.getImages() != null
                ? variant.getImages().stream()
                        .map(VariantImage::getImageUrl)
                        .collect(Collectors.toList())
                : new ArrayList<>();

        return ProductDto.VariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .size(variant.getSize())
                .color(variant.getColor())
                .price(variant.getPrice())
                .stock(variant.getStock())
                .imageUrls(imageUrls)
                .build();
    }
}
