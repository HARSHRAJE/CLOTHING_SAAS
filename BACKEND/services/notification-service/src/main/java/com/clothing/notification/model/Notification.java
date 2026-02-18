package com.clothing.notification.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID shopId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String recipient;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;

    private Integer retryCount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

    public enum NotificationType {
        WHATSAPP_LINK
    }

    public enum NotificationStatus {
        PENDING, SENT, FAILED
    }
}
