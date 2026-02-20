package com.clothing.notification.controller;

import com.clothing.notification.dto.NotificationDto;
import com.clothing.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class OwnerNotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDto.NotificationResponse>> getHistory(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            Pageable pageable) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(notificationService.getNotificationHistory(shopId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDto.NotificationResponse> getDetails(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @PathVariable UUID id) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(notificationService.getNotificationDetails(shopId, id));
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<NotificationDto.LinkResponse> sendWhatsApp(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @RequestBody NotificationDto.WhatsAppRequest request) {
        UUID shopId = UUID.fromString(shopIdHeader);
        request.setShopId(shopId);
        return ResponseEntity.ok(notificationService.sendWhatsAppNotification(request));
    }

    @PostMapping("/templates")
    public ResponseEntity<NotificationDto.TemplateResponse> createTemplate(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @RequestBody NotificationDto.CreateTemplateRequest request) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(notificationService.createTemplate(shopId, request));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<NotificationDto.TemplateResponse>> getTemplates(
            @RequestHeader("X-Shop-Id") String shopIdHeader) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(notificationService.getTemplates(shopId));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<NotificationDto.TemplateResponse> updateTemplate(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @PathVariable UUID id,
            @RequestBody NotificationDto.CreateTemplateRequest request) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(notificationService.updateTemplate(shopId, id, request));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @PathVariable UUID id) {
        UUID shopId = UUID.fromString(shopIdHeader);
        notificationService.deleteTemplate(shopId, id);
        return ResponseEntity.ok().build();
    }
}
