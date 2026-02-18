package com.clothing.media.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class GcsConfig {

    @Value("${gcp.project-id}")
    private String projectId;

    @Bean
    public Storage storage() throws IOException {
        String credentialsPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credentialsPath == null) {
            credentialsPath = "/root/.config/gcloud/application_default_credentials.json";
        }

        System.out.println("DEBUG: Loading GCS Credentials from: " + credentialsPath);
        System.out.println("DEBUG: Using Project ID: " + projectId);

        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath));

        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build()
                .getService();
    }
}
