package com.clothing.inquiry.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryEvent {

    private String eventType; // CREATED
    private UUID shopId;
    private UUID inquiryId;
    private String customerName;
    private String phone;
}
