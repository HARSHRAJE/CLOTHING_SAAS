package com.clothing.shop.service;

import com.clothing.shop.dto.ShopDto;
import com.clothing.shop.model.Shop;
import com.clothing.shop.model.ShopSettings;
import com.clothing.shop.model.ShopStatus;
import com.clothing.shop.repository.ShopRepository;
import com.clothing.shop.repository.ShopSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final ShopSettingsRepository shopSettingsRepository;

    // --- Admin Operations ---

    @Transactional
    public ShopDto.ShopResponse createShop(ShopDto.CreateShopRequest request) {
        if (shopRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Shop with slug " + request.getSlug() + " already exists");
        }

        Shop shop = Shop.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .phone(request.getPhone())
                .email(request.getEmail())
                .plan(request.getPlan())
                .status(ShopStatus.ACTIVE)
                .subscriptionStartDate(request.getSubscriptionStartDate())
                .subscriptionEndDate(request.getSubscriptionEndDate())
                .build();

        Shop savedShop = shopRepository.save(shop);

        // precise default settings
        ShopSettings settings = ShopSettings.builder()
                .shopId(savedShop.getId())
                .themeColor("#000000")
                .currency("INR")
                .instagramUrl(request.getInstagramUrl())
                .build();
        shopSettingsRepository.save(settings);

        return mapToResponse(savedShop);
    }

    public Page<ShopDto.ShopResponse> getAllShops(Pageable pageable) {
        return shopRepository.findAll(pageable).map(this::mapToResponse);
    }

    public ShopDto.ShopResponse getShopById(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return mapToResponse(shop);
    }

    @Transactional
    @CacheEvict(value = { "publicShops", "internalShops" }, key = "#result.slug")
    public ShopDto.ShopResponse updateShop(UUID shopId, ShopDto.UpdateShopRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        if (request.getName() != null)
            shop.setName(request.getName());
        if (request.getPhone() != null)
            shop.setPhone(request.getPhone());
        if (request.getPlan() != null)
            shop.setPlan(request.getPlan());

        return mapToResponse(shopRepository.save(shop));
    }

    @Transactional
    public void updateShopStatus(UUID shopId, ShopStatus status) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        shop.setStatus(status);
        shopRepository.save(shop);
    }

    @Transactional
    public void updateSubscription(UUID shopId, LocalDate endDate) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        shop.setSubscriptionEndDate(endDate);
        shopRepository.save(shop);
    }

    // --- Owner Operations ---

    public ShopDto.ShopResponse getMyShop(UUID shopId) {
        return getShopById(shopId);
    }

    @Transactional
    @CacheEvict(value = { "publicShops", "internalShops" }, key = "#result.slug")
    public ShopDto.ShopResponse updateMyShopBasicInfo(UUID shopId, String name, String phone, String email) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        if (name != null)
            shop.setName(name);
        if (phone != null)
            shop.setPhone(phone);
        if (email != null)
            shop.setEmail(email);

        return mapToResponse(shopRepository.save(shop));
    }

    @Transactional
    @CacheEvict(value = { "publicShops", "internalShops" }, key = "#result.slug")
    public ShopDto.ShopResponse patchMyShop(UUID shopId, ShopDto.ConsolidatedShopUpdateRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        // Update Shop Basic Info
        if (request.getName() != null)
            shop.setName(request.getName());
        if (request.getPhone() != null)
            shop.setPhone(request.getPhone());
        if (request.getEmail() != null)
            shop.setEmail(request.getEmail());

        Shop savedShop = shopRepository.save(shop);

        // Update Shop Settings
        ShopSettings settings = shopSettingsRepository.findByShopId(shopId)
                .orElseThrow(() -> new RuntimeException("Settings not found for shop " + shopId));

        if (request.getAddress() != null)
            settings.setAddress(request.getAddress());
        if (request.getInstagramUrl() != null)
            settings.setInstagramUrl(request.getInstagramUrl());

        shopSettingsRepository.save(settings);

        return mapToResponse(savedShop);
    }

    public ShopDto.ShopSettingsResponse getShopSettings(UUID shopId) {
        ShopSettings settings = shopSettingsRepository.findByShopId(shopId)
                .orElseThrow(() -> new RuntimeException("Settings not found for shop " + shopId));
        return mapToSettingsResponse(settings);
    }

    @Transactional
    public ShopDto.ShopSettingsResponse updateShopSettings(UUID shopId, ShopDto.UpdateSettingsRequest request) {
        ShopSettings settings = shopSettingsRepository.findByShopId(shopId)
                .orElseThrow(() -> new RuntimeException("Settings not found for shop " + shopId));

        if (request.getLogoUrl() != null)
            settings.setLogoUrl(request.getLogoUrl());
        if (request.getBannerUrl() != null)
            settings.setBannerUrl(request.getBannerUrl());
        if (request.getThemeColor() != null)
            settings.setThemeColor(request.getThemeColor());
        if (request.getCurrency() != null)
            settings.setCurrency(request.getCurrency());
        if (request.getAddress() != null)
            settings.setAddress(request.getAddress());
        if (request.getWhatsappNumber() != null)
            settings.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getCustomDomain() != null)
            settings.setCustomDomain(request.getCustomDomain());
        if (request.getInstagramUrl() != null)
            settings.setInstagramUrl(request.getInstagramUrl());

        return mapToSettingsResponse(shopSettingsRepository.save(settings));
    }

    // --- Public Operations ---

    @Cacheable(value = "publicShops", key = "#slug")
    public ShopDto.PublicShopResponse getPublicShopBySlug(String slug) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        ShopSettings settings = shopSettingsRepository.findByShopId(shop.getId()).orElse(null);

        return ShopDto.PublicShopResponse.builder()
                .shopId(shop.getId())
                .name(shop.getName())
                .slug(shop.getSlug())
                .logoUrl(settings != null ? settings.getLogoUrl() : null)
                .themeColor(settings != null ? settings.getThemeColor() : null)
                .address(settings != null ? settings.getAddress() : null)
                .email(shop.getEmail())
                .phone(shop.getPhone())
                .whatsappNumber(
                        (settings != null && settings.getWhatsappNumber() != null) ? settings.getWhatsappNumber()
                                : shop.getPhone())
                .instagramUrl(settings != null ? settings.getInstagramUrl() : null)
                .build();
    }

    @Cacheable(value = "internalShops", key = "#slug")
    public ShopDto.ShopResponse getInternalShopBySlug(String slug) {
        Shop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return mapToResponse(shop);
    }

    // --- Mappers ---

    private ShopDto.ShopResponse mapToResponse(Shop shop) {
        return ShopDto.ShopResponse.builder()
                .shopId(shop.getId())
                .name(shop.getName())
                .slug(shop.getSlug())
                .phone(shop.getPhone())
                .email(shop.getEmail())
                .plan(shop.getPlan())
                .status(shop.getStatus())
                .subscriptionStart(shop.getSubscriptionStartDate())
                .subscriptionEnd(shop.getSubscriptionEndDate())
                .build();
    }

    private ShopDto.ShopSettingsResponse mapToSettingsResponse(ShopSettings settings) {
        return ShopDto.ShopSettingsResponse.builder()
                .id(settings.getId())
                .shopId(settings.getShopId())
                .logoUrl(settings.getLogoUrl())
                .bannerUrl(settings.getBannerUrl())
                .themeColor(settings.getThemeColor())
                .currency(settings.getCurrency())
                .address(settings.getAddress())
                .whatsappNumber(settings.getWhatsappNumber())
                .customDomain(settings.getCustomDomain())
                .instagramUrl(settings.getInstagramUrl())
                .build();
    }
}
