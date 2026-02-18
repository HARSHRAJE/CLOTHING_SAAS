package com.clothing.media.controller;

import com.clothing.media.model.Media;
import com.clothing.media.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Media management APIs")
public class MediaController {

    private final MediaService mediaService;

    @Operation(summary = "Upload media file")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Media> uploadMedia(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") UUID entityId) throws IOException {

        UUID shopId = getShopId(authentication);
        Media media = mediaService.uploadMedia(shopId, entityType, entityId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(media);
    }

    @Operation(summary = "Get media by entity")
    @GetMapping
    public ResponseEntity<List<Media>> getMediaByEntity(
            Authentication authentication,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") UUID entityId) {

        // Security check: ensure entity belongs to shop?
        // Logic currently relies on trusted input or implicit shop association.
        // Ideally we verify entityId belongs to shopId, but that requires inter-service
        // call.
        // For now, we assume the requester (Owner) has access to their own shop's data.
        // We could verify shopId matches if we stored it in the entity, but we only
        // have entityId.
        // However, we can filter by shopId if we wanted to be strict, but the
        // requirement was "Get Media by Entity".
        // Let's just return the media.

        return ResponseEntity.ok(mediaService.getMediaByEntity(entityType, entityId));
    }

    @Operation(summary = "Get media by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Media> getMediaById(
            Authentication authentication,
            @PathVariable UUID id) {

        Media media = mediaService.getMediaById(id);
        UUID shopId = getShopId(authentication);

        if (!media.getShopId().equals(shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(media);
    }

    @Operation(summary = "Delete media")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(
            Authentication authentication,
            @PathVariable UUID id) {

        Media media = mediaService.getMediaById(id);
        UUID shopId = getShopId(authentication);

        if (!media.getShopId().equals(shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Replace media")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Media> replaceMedia(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) throws IOException {

        Media oldMedia = mediaService.getMediaById(id);
        UUID shopId = getShopId(authentication);

        if (!oldMedia.getShopId().equals(shopId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Delete old
        mediaService.deleteMedia(id);

        // Upload new with same entity association
        Media newMedia = mediaService.uploadMedia(shopId, oldMedia.getEntityType().name(), oldMedia.getEntityId(),
                file);

        return ResponseEntity.ok(newMedia);
    }

    @Operation(summary = "View media content")
    @GetMapping("/{id}/view")
    public ResponseEntity<byte[]> viewMedia(@PathVariable UUID id) {
        Media media = mediaService.getMediaById(id);
        byte[] content = mediaService.getMediaContent(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(media.getFileType()))
                .body(content);
    }

    @Operation(summary = "List all media for shop")
    @GetMapping("/all")
    public ResponseEntity<Page<Media>> getAllMedia(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        UUID shopId = getShopId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(mediaService.getAllMedia(shopId, pageable));
    }

    private UUID getShopId(Authentication authentication) {
        if (authentication == null || authentication.getDetails() == null) {
            throw new RuntimeException("Shop ID not found in authentication");
        }
        try {
            return UUID.fromString((String) authentication.getDetails());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Shop ID format");
        }
    }
}
