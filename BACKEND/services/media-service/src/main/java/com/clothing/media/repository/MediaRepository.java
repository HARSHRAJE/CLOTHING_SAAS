package com.clothing.media.repository;

import com.clothing.media.model.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    List<Media> findByEntityTypeAndEntityId(Media.EntityType entityType, UUID entityId);

    Page<Media> findByShopId(UUID shopId, Pageable pageable);
}
