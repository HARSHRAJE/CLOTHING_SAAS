package com.clothing.inquiry.dto;

import com.clothing.inquiry.model.InquiryStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class InquiryDto {

    @Data
    @Builder
    public static class CreateInquiryRequest {
        private String customerName;
        private String phone;
        private String email;
        private UUID productId;
        private String message;
    }

    @Data
    @Builder
    public static class InternalCreateInquiryRequest {
        private UUID shopId;
        private String customerName;
        private String phone;
        private String email;
        private UUID productId;
        private String message;
    }

    @Data
    @Builder
    public static class UpdateStatusRequest {
        private InquiryStatus status;
    }

    @Data
    @Builder
    public static class InquiryResponse {
        private UUID inquiryId;
        private UUID shopId;
        private String customerName;
        private String phone;
        private String email;
        private UUID productId;
        private String message;
        private InquiryStatus status;
        private LocalDateTime createdAt;
    }
}
