package com.clothing.product.repository;

import com.clothing.product.model.VariantImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VariantImageRepository extends JpaRepository<VariantImage, UUID> {
    // Images are managed via cascade from ProductVariant.
    // This repository is kept for any future direct queries if needed.
}
