package com.clothing.product.service;

import com.clothing.product.dto.ProductDto;
import com.clothing.product.model.InventoryTransaction;
import com.clothing.product.model.InventoryTransactionType;
import com.clothing.product.model.ProductVariant;
import com.clothing.product.repository.InventoryTransactionRepository;
import com.clothing.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductVariantRepository variantRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Transactional
    public void updateStock(UUID shopId, UUID variantId, Integer quantityChange, InventoryTransactionType type,
            String referenceId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        if (!variant.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Variant does not belong to this shop");
        }

        updateStockInternal(variant, quantityChange, type, referenceId);
    }

    @Transactional
    public void updateStockInternal(UUID variantId, Integer quantityChange, InventoryTransactionType type,
            String referenceId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        updateStockInternal(variant, quantityChange, type, referenceId);
    }

    private void updateStockInternal(ProductVariant variant, Integer quantityChange, InventoryTransactionType type,
            String referenceId) {

        int newStock = variant.getStock() + quantityChange;
        if (newStock < 0) {
            throw new RuntimeException("Insufficient stock");
        }

        variant.setStock(newStock);
        variantRepository.save(variant);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .shopId(variant.getShopId())
                .variant(variant)
                .quantityChange(quantityChange)
                .type(type)
                .referenceId(referenceId)
                .build();

        transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<ProductDto.InventoryHistoryResponse> getHistory(UUID shopId, UUID variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        if (!variant.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Variant does not belong to this shop");
        }

        return transactionRepository.findByVariantIdOrderByCreatedAtDesc(variantId).stream()
                .map(t -> ProductDto.InventoryHistoryResponse.builder()
                        .id(t.getId())
                        .quantityChange(t.getQuantityChange())
                        .type(t.getType())
                        .referenceId(t.getReferenceId())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
