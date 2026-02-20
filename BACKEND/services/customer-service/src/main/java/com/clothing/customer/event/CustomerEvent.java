package com.clothing.customer.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerEvent {

    private String eventType; // CREATED
    private UUID shopId;
    private UUID customerId;
    private String customerName;
}
