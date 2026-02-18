package com.clothing.notification.repository;

import com.clothing.notification.model.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {
    List<NotificationTemplate> findByShopId(UUID shopId);

    Optional<NotificationTemplate> findByShopIdAndName(UUID shopId, String name);
}
