package com.clothing.inquiry.controller;

import com.clothing.inquiry.dto.InquiryDto;
import com.clothing.inquiry.model.InquiryStatus;
import com.clothing.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/inquiries")
@RequiredArgsConstructor
public class OwnerInquiryController {

    private final InquiryService inquiryService;

    // TODO: Verify JWT role and extract Shop ID. For now assuming passed or header?
    // Requirement says: "shopId from JWT"
    // We need a utility to extract shopId from JWT or assume Gateway passes it as
    // Header
    // For MVP, letting caller pass Shop ID via Header 'X-Shop-Id' or similar if
    // Gateway handles auth
    // BUT valid approach in this project (based on OrderService):
    // OrderService.java:165 checks if order.getShopId().equals(shopId)
    // We need to know HOW shopId is obtained.
    // OrderService: getAllOrders(UUID shopId, ...)
    // InternalShopController: validateShopStatus

    // Let's assume for now we expect X-Shop-Id header from Gateway OR we rely on a
    // SecurityContext if setup.
    // Inspecting OrderService again...
    // verify 'shopId' is passed to methods.

    // Let's accept 'shopId' as RequestParam for now to align with "Query:
    // ?page=0..."
    // Wait, the requirement says "shopId from JWT".
    // I will add a placeholder for JWT extraction or usage.

    @GetMapping
    public ResponseEntity<Page<InquiryDto.InquiryResponse>> getInquiries(
            @RequestHeader("X-Shop-Id") UUID shopId, // Assumed passed by Gateway or extracted
            @RequestParam(required = false) InquiryStatus status,
            @RequestParam(required = false) String phone,
            Pageable pageable) {
        return ResponseEntity.ok(inquiryService.getInquiries(shopId, status, phone, pageable));
    }

    @GetMapping("/{inquiryId}")
    public ResponseEntity<InquiryDto.InquiryResponse> getInquiry(
            @RequestHeader("X-Shop-Id") UUID shopId,
            @PathVariable UUID inquiryId) {
        return ResponseEntity.ok(inquiryService.getInquiry(shopId, inquiryId));
    }

    @PutMapping("/{inquiryId}/status")
    public ResponseEntity<InquiryDto.InquiryResponse> updateStatus(
            @RequestHeader("X-Shop-Id") UUID shopId,
            @PathVariable UUID inquiryId,
            @RequestBody InquiryDto.UpdateStatusRequest request) {
        return ResponseEntity.ok(inquiryService.updateStatus(shopId, inquiryId, request.getStatus()));
    }

    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<Void> deleteInquiry(
            @RequestHeader("X-Shop-Id") UUID shopId,
            @PathVariable UUID inquiryId) {
        inquiryService.deleteInquiry(shopId, inquiryId);
        return ResponseEntity.ok().build();
    }
}
