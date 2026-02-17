package com.clothing.customer.dto;

import com.clothing.customer.model.CustomerActivity;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CustomerDto {

    @Data
    @Builder
    public static class CreateCustomerRequest {
        private UUID shopId;
        private String name;
        private String phone;
        private String email;
    }

    @Data
    @Builder
    public static class UpdateCustomerRequest {
        private String name;
        private String email;
    }

    @Data
    @Builder
    public static class UpdateMetricsRequest {
        private BigDecimal orderAmount;
    }

    @Data
    @Builder
    public static class AddActivityRequest {
        private UUID shopId;
        private CustomerActivity.ActivityType activityType;
        private String referenceId;
    }

    @Data
    @Builder
    public static class CustomerResponse {
        private UUID customerId;
        private String name;
        private String phone;
        private String email;
        private Integer totalOrders;
        private BigDecimal totalSpent;
        private Integer loyaltyPoints;
        private LocalDateTime createdAt;
        private String defaultAddress;
    }

    @Data
    @Builder
    public static class AddressRequest {
        private String addressLine;
        private String city;
        private String state;
        private String pincode;
        private boolean isDefault;
    }

    @Data
    @Builder
    public static class AddressResponse {
        private UUID id;
        private String addressLine;
        private String city;
        private String state;
        private String pincode;
        private boolean isDefault;
    }
}
