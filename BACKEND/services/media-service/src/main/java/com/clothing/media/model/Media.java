package com.clothing.media.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "media_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID shopId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String url;

    private String fileType;
    private Long size;

    @Enumerated(EnumType.STRING)
    private EntityType entityType;

    private UUID entityId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum EntityType {
        PRODUCT,
        SHOP,
        VARIANT
    }
}
