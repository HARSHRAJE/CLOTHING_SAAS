package com.clothing.product.controller;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ProductDto.CategoryResponse> createCategory(
            @RequestBody ProductDto.CreateCategoryRequest request,
            Authentication authentication) {
        UUID shopId = UUID.fromString((String) authentication.getDetails());
        return ResponseEntity.ok(categoryService.createCategory(shopId, request));
    }

    @GetMapping
    public ResponseEntity<List<ProductDto.CategoryResponse>> getCategories(Authentication authentication) {
        UUID shopId = UUID.fromString((String) authentication.getDetails());
        return ResponseEntity.ok(categoryService.getCategories(shopId));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ProductDto.CategoryResponse> updateCategory(
            @PathVariable UUID categoryId,
            @RequestBody ProductDto.CreateCategoryRequest request,
            Authentication authentication) {
        UUID shopId = UUID.fromString((String) authentication.getDetails());
        return ResponseEntity.ok(categoryService.updateCategory(shopId, categoryId, request));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable UUID categoryId,
            Authentication authentication) {
        UUID shopId = UUID.fromString((String) authentication.getDetails());
        categoryService.deleteCategory(shopId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
