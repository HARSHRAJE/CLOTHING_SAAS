package com.clothing.inquiry.controller;

import com.clothing.inquiry.dto.InquiryDto;
import com.clothing.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/store")
@RequiredArgsConstructor
public class PublicInquiryController {

    private final InquiryService inquiryService;

    @PostMapping("/{slug}/inquiries")
    public ResponseEntity<InquiryDto.InquiryResponse> createInquiry(
            @PathVariable String slug,
            @RequestBody InquiryDto.CreateInquiryRequest request) {
        return ResponseEntity.ok(inquiryService.createInquiry(slug, request));
    }
}
