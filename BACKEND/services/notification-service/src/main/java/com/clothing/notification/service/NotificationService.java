package com.clothing.notification.service;

import com.clothing.notification.dto.NotificationDto;
import com.clothing.notification.model.Notification;
import com.clothing.notification.model.NotificationTemplate;
import com.clothing.notification.repository.NotificationRepository;
import com.clothing.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;

    @Transactional
    public NotificationDto.LinkResponse sendWhatsAppNotification(NotificationDto.WhatsAppRequest request) {
        String validatedPhone = validatePhone(request.getRecipient());

        Notification notification = Notification.builder()
                .shopId(request.getShopId())
                .type(Notification.NotificationType.WHATSAPP_LINK)
                .recipient(validatedPhone)
                .message(request.getMessage())
                .status(Notification.NotificationStatus.SENT) // We assume sent as we generate link
                .sentAt(LocalDateTime.now())
                .retryCount(0)
                .build();

        Notification saved = notificationRepository.save(notification);
        String link = generateWhatsAppLink(validatedPhone, request.getMessage());

        return NotificationDto.LinkResponse.builder()
                .notificationId(saved.getId())
                .link(link)
                .build();
    }

    @Transactional
    public NotificationDto.LinkResponse sendTemplateNotification(NotificationDto.TemplateRequest request) {
        NotificationTemplate template = templateRepository
                .findByShopIdAndName(request.getShopId(), request.getTemplateName())
                .orElseThrow(() -> new RuntimeException("Template not found: " + request.getTemplateName()));

        String message = processTemplate(template.getTemplateBody(), request.getVariables());

        return sendWhatsAppNotification(NotificationDto.WhatsAppRequest.builder()
                .shopId(request.getShopId())
                .recipient(request.getRecipient())
                .message(message)
                .build());
    }

    // --- Template Management ---

    public NotificationDto.TemplateResponse createTemplate(UUID shopId, NotificationDto.CreateTemplateRequest request) {
        NotificationTemplate template = NotificationTemplate.builder()
                .shopId(shopId)
                .name(request.getName())
                .type(Notification.NotificationType.valueOf(request.getType()))
                .templateBody(request.getTemplateBody())
                .build();

        return mapToTemplateResponse(templateRepository.save(template));
    }

    public List<NotificationDto.TemplateResponse> getTemplates(UUID shopId) {
        return templateRepository.findByShopId(shopId).stream()
                .map(this::mapToTemplateResponse)
                .collect(Collectors.toList());
    }

    public NotificationDto.TemplateResponse updateTemplate(UUID shopId, UUID templateId,
            NotificationDto.CreateTemplateRequest request) {
        NotificationTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to template");
        }

        template.setName(request.getName());
        template.setTemplateBody(request.getTemplateBody());
        template.setType(Notification.NotificationType.valueOf(request.getType()));

        return mapToTemplateResponse(templateRepository.save(template));
    }

    public void deleteTemplate(UUID shopId, UUID templateId) {
        NotificationTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to template");
        }
        templateRepository.delete(template);
    }

    // --- History ---

    public Page<NotificationDto.NotificationResponse> getNotificationHistory(UUID shopId, Pageable pageable) {
        return notificationRepository.findByShopId(shopId, pageable)
                .map(this::mapToNotificationResponse);
    }

    public NotificationDto.NotificationResponse getNotificationDetails(UUID shopId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }
        return mapToNotificationResponse(notification);
    }

    // --- Helpers ---

    private String generateWhatsAppLink(String phone, String message) {
        if (message == null)
            message = "";
        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        return "https://wa.me/" + phone + "?text=" + encodedMessage;
    }

    private String processTemplate(String templateBody, Map<String, String> variables) {
        if (templateBody == null)
            return "";
        String processed = templateBody;
        if (variables != null) {
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                String placeholder = "{{" + entry.getKey() + "}}";
                processed = processed.replace(placeholder, entry.getValue() != null ? entry.getValue() : "");
            }
        }
        return processed;
    }

    private String validatePhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            throw new RuntimeException("Recipient phone is required");
        }
        // Basic cleanup
        String clean = phone.replaceAll("[^0-9]", "");
        return clean;
    }

    private NotificationDto.TemplateResponse mapToTemplateResponse(NotificationTemplate t) {
        return NotificationDto.TemplateResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .type(t.getType().name())
                .templateBody(t.getTemplateBody())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private NotificationDto.NotificationResponse mapToNotificationResponse(Notification n) {
        return NotificationDto.NotificationResponse.builder()
                .id(n.getId())
                .recipient(n.getRecipient())
                .message(n.getMessage())
                .status(n.getStatus())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
