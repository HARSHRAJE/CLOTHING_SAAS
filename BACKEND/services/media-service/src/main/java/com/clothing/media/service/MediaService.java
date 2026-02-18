package com.clothing.media.service;

import com.clothing.media.model.Media;
import com.clothing.media.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final GcsService gcsService;
    private final MediaRepository mediaRepository;

    @Transactional
    public Media uploadMedia(UUID shopId, String entityTypeStr, UUID entityId, MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        String path = "shop-" + shopId + "/" + entityTypeStr.toLowerCase() + "/" + entityId + "/" + fileName;

        String url = gcsService.uploadFile(path, file);

        Media.EntityType entityType = Media.EntityType.valueOf(entityTypeStr.toUpperCase());

        Media media = Media.builder()
                .shopId(shopId)
                .fileName(fileName)
                .url(url)
                .fileType(file.getContentType())
                .size(file.getSize())
                .entityType(entityType)
                .entityId(entityId)
                .build();

        Media savedMedia = mediaRepository.save(media);

        // We store the proxy URL instead of GCS URL so frontend can access it via our
        // service
        String proxyUrl = "/media/" + savedMedia.getId() + "/view";
        savedMedia.setUrl(proxyUrl);

        return mediaRepository.save(savedMedia);
    }

    @Transactional(readOnly = true)
    public List<Media> getMediaByEntity(String entityTypeStr, UUID entityId) {
        Media.EntityType entityType = Media.EntityType.valueOf(entityTypeStr.toUpperCase());
        return mediaRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Transactional(readOnly = true)
    public Media getMediaById(UUID id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));
    }

    @Transactional
    public void deleteMedia(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        // Extract path from URL is tricky if bucket name changes, but we know the
        // structure:
        // https://storage.googleapis.com/BUCKET/PATH
        // Standardize path storage later? For now, reconstruct or parse.
        // Or store path in DB. We have fileName, shopId, entityType, entityId.
        // Let's reconstruct path from DB data to be safe.

        String path = "shop-" + media.getShopId() + "/"
                + media.getEntityType().name().toLowerCase() + "/"
                + media.getEntityId() + "/"
                + media.getFileName();

        gcsService.deleteFile(path);
        mediaRepository.delete(media);
    }

    @Transactional(readOnly = true)
    public Page<Media> getAllMedia(UUID shopId, Pageable pageable) {
        return mediaRepository.findByShopId(shopId, pageable);
    }

    @Transactional(readOnly = true)
    public byte[] getMediaContent(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        String path = "shop-" + media.getShopId() + "/"
                + media.getEntityType().name().toLowerCase() + "/"
                + media.getEntityId() + "/"
                + media.getFileName();

        return gcsService.downloadFile(path);
    }
}
