package com.clothing.notification.repository;

import com.clothing.notification.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByShopId(UUID shopId, Pageable pageable);

    Page<Notification> findByShopIdAndCreatedAtBetween(UUID shopId, LocalDateTime startDate, LocalDateTime endDate,
            Pageable pageable);
}
