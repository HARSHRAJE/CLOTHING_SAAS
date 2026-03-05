package com.clothing.product.service;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.Category;
import com.clothing.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public ProductDto.CategoryResponse createCategory(UUID shopId, ProductDto.CreateCategoryRequest request) {
        Category category = Category.builder()
                .shopId(shopId)
                .name(request.getName())
                .description(request.getDescription())
                .targetGender(request.getTargetGender() == null ? com.clothing.product.model.TargetGender.UNISEX
                        : request.getTargetGender())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductDto.CategoryResponse> getCategories(UUID shopId) {
        return categoryRepository.findByShopId(shopId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto.CategoryResponse updateCategory(UUID shopId, UUID categoryId,
            ProductDto.CreateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Category does not belong to this shop");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getTargetGender() != null) {
            category.setTargetGender(request.getTargetGender());
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCategory(UUID shopId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Category does not belong to this shop");
        }

        categoryRepository.deleteById(categoryId);
    }

    private ProductDto.CategoryResponse mapToResponse(Category category) {
        return ProductDto.CategoryResponse.builder()
                .id(category.getId())
                .shopId(category.getShopId())
                .name(category.getName())
                .description(category.getDescription())
                .targetGender(category.getTargetGender())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
