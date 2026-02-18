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
@Table(name = "notification_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID shopId;

    private String name;

    @Enumerated(EnumType.STRING)
    private Notification.NotificationType type;

    @Column(columnDefinition = "TEXT")
    private String templateBody;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
