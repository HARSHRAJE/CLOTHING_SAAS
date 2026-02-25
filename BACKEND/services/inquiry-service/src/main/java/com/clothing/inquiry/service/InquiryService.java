package com.clothing.inquiry.service;

import com.clothing.inquiry.dto.InquiryDto;
import com.clothing.inquiry.model.Inquiry;
import com.clothing.inquiry.model.InquiryStatus;
import com.clothing.inquiry.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final RestTemplate restTemplate;
    private final com.clothing.inquiry.event.InquiryEventProducer inquiryEventProducer;

    @Value("${SHOP_SERVICE_URL:http://localhost:8082}")
    private String shopServiceUrl;

    @Value("${internal.api.key}")
    private String internalApiKey;

    // Public: Create Inquiry via Slug
    @Transactional
    public InquiryDto.InquiryResponse createInquiry(String shopSlug, InquiryDto.CreateInquiryRequest request) {
        UUID shopId = resolveShopId(shopSlug);

        Inquiry inquiry = Inquiry.builder()
                .shopId(shopId)
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .productId(request.getProductId())
                .message(request.getMessage())
                .status(InquiryStatus.NEW)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);
        publishInquiryEvent(saved);
        return mapToResponse(saved);
    }

    // Internal: Create Inquiry
    @Transactional
    public InquiryDto.InquiryResponse createInquiryInternal(InquiryDto.InternalCreateInquiryRequest request) {
        Inquiry inquiry = Inquiry.builder()
                .shopId(request.getShopId())
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .productId(request.getProductId())
                .message(request.getMessage())
                .status(InquiryStatus.NEW)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);
        publishInquiryEvent(saved);
        return mapToResponse(saved);
    }

    private void publishInquiryEvent(Inquiry inquiry) {
        inquiryEventProducer.publish(com.clothing.inquiry.event.InquiryEvent.builder()
                .eventType("CREATED")
                .shopId(inquiry.getShopId())
                .inquiryId(inquiry.getId())
                .customerName(inquiry.getCustomerName())
                .phone(inquiry.getPhone())
                .build());
    }

    // Owner: Get All
    public Page<InquiryDto.InquiryResponse> getInquiries(UUID shopId, InquiryStatus status, String phone,
            Pageable pageable) {
        if (status != null) {
            return inquiryRepository.findByShopIdAndStatus(shopId, status, pageable).map(this::mapToResponse);
        }
        if (phone != null && !phone.isEmpty()) {
            return inquiryRepository.findByShopIdAndPhoneContaining(shopId, phone, pageable).map(this::mapToResponse);
        }
        return inquiryRepository.findByShopId(shopId, pageable).map(this::mapToResponse);
    }

    // Owner: Get Single
    public InquiryDto.InquiryResponse getInquiry(UUID shopId, UUID inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        if (!inquiry.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to inquiry");
        }
        return mapToResponse(inquiry);
    }

    // Owner: Update Status
    @Transactional
    public InquiryDto.InquiryResponse updateStatus(UUID shopId, UUID inquiryId, InquiryStatus status) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        if (!inquiry.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to inquiry");
        }

        inquiry.setStatus(status);
        return mapToResponse(inquiryRepository.save(inquiry));
    }

    // Owner: Delete
    @Transactional
    public void deleteInquiry(UUID shopId, UUID inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        if (!inquiry.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to inquiry");
        }
        inquiryRepository.delete(inquiry);
    }

    private UUID resolveShopId(String slug) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                    shopServiceUrl + "/internal/shops/slug/" + slug,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Map.class);
            Map shop = response.getBody();
            if (shop == null || shop.get("shopId") == null) {
                throw new RuntimeException("Shop not found");
            }
            return UUID.fromString((String) shop.get("shopId"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to resolve shop: " + e.getMessage());
        }
    }

    private InquiryDto.InquiryResponse mapToResponse(Inquiry inquiry) {
        return InquiryDto.InquiryResponse.builder()
                .inquiryId(inquiry.getId())
                .shopId(inquiry.getShopId())
                .customerName(inquiry.getCustomerName())
                .phone(inquiry.getPhone())
                .email(inquiry.getEmail())
                .productId(inquiry.getProductId())
                .message(inquiry.getMessage())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
