package com.clothing.shop.dto;

import com.clothing.shop.model.ShopPlan;
import com.clothing.shop.model.ShopStatus;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

public class ShopDto {

    @Data
    public static class CreateShopRequest {
        private String name;
        private String slug;
        private String phone;
        private String email;
        private ShopPlan plan;
        private LocalDate subscriptionStartDate;
        private LocalDate subscriptionEndDate;
    }

    @Data
    @Builder
    public static class ShopResponse implements Serializable {
        private UUID shopId;
        private String name;
        private String slug;
        private String phone;
        private String email;
        private ShopPlan plan;
        private ShopStatus status;
        private LocalDate subscriptionStart;
        private LocalDate subscriptionEnd;
    }

    @Data
    public static class UpdateShopRequest {
        private String name;
        private String phone;
        private ShopPlan plan;
    }

    @Data
    public static class UpdateStatusRequest {
        private ShopStatus status;
    }

    @Data
    public static class UpdateSubscriptionRequest {
        private LocalDate subscriptionEndDate;
    }

    @Data
    @Builder
    public static class ShopSettingsResponse {
        private UUID id;
        private UUID shopId;
        private String logoUrl;
        private String bannerUrl;
        private String themeColor;
        private String currency;
        private String address;
        private String whatsappNumber;
        private String customDomain;
    }

    @Data
    public static class UpdateSettingsRequest {
        private String logoUrl;
        private String bannerUrl;
        private String themeColor;
        private String currency; // "INR", "USD"
        private String address;
        private String whatsappNumber;
        private String customDomain;
    }

    @Data
    @Builder
    public static class PublicShopResponse implements Serializable {
        private UUID shopId;
        private String name;
        private String slug;
        private String logoUrl;
        private String themeColor;
        private String whatsappNumber;
    }
}
