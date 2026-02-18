package com.clothing.notification.controller;

import com.clothing.notification.dto.NotificationDto;
import com.clothing.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {

    private final NotificationService notificationService;

    @PostMapping("/whatsapp")
    public ResponseEntity<NotificationDto.LinkResponse> sendWhatsApp(
            @RequestBody NotificationDto.WhatsAppRequest request) {
        return ResponseEntity.ok(notificationService.sendWhatsAppNotification(request));
    }

    @PostMapping("/whatsapp/template")
    public ResponseEntity<NotificationDto.LinkResponse> sendWhatsAppTemplate(
            @RequestBody NotificationDto.TemplateRequest request) {
        return ResponseEntity.ok(notificationService.sendTemplateNotification(request));
    }
}
