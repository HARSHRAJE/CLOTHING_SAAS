package com.clothing.notification.controller;

import com.clothing.notification.dto.NotificationDto;
import com.clothing.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            Authentication authentication,
            Pageable pageable) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(notificationService.getNotificationHistory(shopId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDto.NotificationResponse> getDetails(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(notificationService.getNotificationDetails(shopId, id));
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<NotificationDto.LinkResponse> sendWhatsApp(
            Authentication authentication,
            @RequestBody NotificationDto.WhatsAppRequest request) {
        UUID shopId = getShopId(authentication);
        request.setShopId(shopId); // Force security
        return ResponseEntity.ok(notificationService.sendWhatsAppNotification(request));
    }

    @PostMapping("/templates")
    public ResponseEntity<NotificationDto.TemplateResponse> createTemplate(
            Authentication authentication,
            @RequestBody NotificationDto.CreateTemplateRequest request) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(notificationService.createTemplate(shopId, request));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<NotificationDto.TemplateResponse>> getTemplates(
            Authentication authentication) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(notificationService.getTemplates(shopId));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<NotificationDto.TemplateResponse> updateTemplate(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody NotificationDto.CreateTemplateRequest request) {
        UUID shopId = getShopId(authentication);
        return ResponseEntity.ok(notificationService.updateTemplate(shopId, id, request));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID shopId = getShopId(authentication);
        notificationService.deleteTemplate(shopId, id);
        return ResponseEntity.ok().build();
    }

    private UUID getShopId(Authentication authentication) {
        // In Filter, we set details to shopId string
        String shopIdStr = (String) authentication.getDetails();
        return UUID.fromString(shopIdStr);
    }
}
