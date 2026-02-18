package com.clothing.media.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class GcsService {

    private final Storage storage;

    @Value("${gcp.bucket-name}")
    private String bucketName;

    public String uploadFile(String path, MultipartFile file) throws IOException {
        BlobId blobId = BlobId.of(bucketName, path);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return "https://storage.googleapis.com/" + bucketName + "/" + path;
    }

    public void deleteFile(String path) {
        BlobId blobId = BlobId.of(bucketName, path);
        storage.delete(blobId);
    }

    public byte[] downloadFile(String path) {
        BlobId blobId = BlobId.of(bucketName, path);
        return storage.readAllBytes(blobId);
    }
}
