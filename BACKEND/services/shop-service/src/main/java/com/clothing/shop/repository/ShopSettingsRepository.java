package com.clothing.shop.repository;

import com.clothing.shop.model.ShopSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopSettingsRepository extends JpaRepository<ShopSettings, UUID> {
    Optional<ShopSettings> findByShopId(UUID shopId);
}
