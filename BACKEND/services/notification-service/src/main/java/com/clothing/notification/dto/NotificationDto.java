package com.clothing.notification.dto;

import com.clothing.notification.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WhatsAppRequest {
        private UUID shopId;
        private String recipient;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateRequest {
        private UUID shopId;
        private String templateName;
        private String recipient;
        private java.util.Map<String, String> variables;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkResponse {
        private UUID notificationId;
        private String link;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private UUID id;
        private String recipient;
        private String message;
        private Notification.NotificationStatus status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTemplateRequest {
        private String name;
        private String type;
        private String templateBody;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateResponse {
        private UUID id;
        private String name;
        private String type;
        private String templateBody;
        private LocalDateTime createdAt;
    }
}
