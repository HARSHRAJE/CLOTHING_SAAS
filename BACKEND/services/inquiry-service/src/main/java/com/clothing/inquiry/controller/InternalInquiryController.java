package com.clothing.inquiry.controller;

import com.clothing.inquiry.dto.InquiryDto;
import com.clothing.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/inquiries")
@RequiredArgsConstructor
public class InternalInquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<InquiryDto.InquiryResponse> createInquiryInternal(
            @RequestBody InquiryDto.InternalCreateInquiryRequest request) {
        return ResponseEntity.ok(inquiryService.createInquiryInternal(request));
    }
}
