package com.clothing.customer.controller;

import com.clothing.customer.dto.CustomerDto;
import com.clothing.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/internal/customers")
@RequiredArgsConstructor
public class InternalCustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<CustomerDto.CustomerResponse> findCustomer(
            @RequestParam UUID shopId,
            @RequestParam String phone) {
        try {
            return ResponseEntity.ok(customerService.findByPhone(shopId, phone));
        } catch (RuntimeException e) {
            if ("Customer not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<CustomerDto.CustomerResponse> createCustomer(
            @RequestBody CustomerDto.CreateCustomerRequest request) {
        return ResponseEntity.ok(customerService.createCustomer(request));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<CustomerDto.CustomerResponse> updateCustomer(
            @PathVariable UUID customerId,
            @RequestBody CustomerDto.UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(customerId, request));
    }

    @PutMapping("/{customerId}/metrics")
    public ResponseEntity<Void> updateMetrics(
            @PathVariable UUID customerId,
            @RequestBody CustomerDto.UpdateMetricsRequest request) {
        customerService.updateMetrics(customerId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{customerId}/activity")
    public ResponseEntity<Void> addActivity(
            @PathVariable UUID customerId,
            @RequestBody CustomerDto.AddActivityRequest request) {
        customerService.addActivity(customerId, request);
        return ResponseEntity.ok().build();
    }
}
