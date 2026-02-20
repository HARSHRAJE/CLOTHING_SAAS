package com.clothing.customer.controller;

import com.clothing.customer.dto.CustomerDto;
import com.clothing.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<Page<CustomerDto.CustomerResponse>> getCustomers(
            @RequestHeader("X-Shop-Id") String shopIdHeader,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        UUID shopId = UUID.fromString(shopIdHeader);
        return ResponseEntity.ok(customerService.getCustomers(shopId, search, pageable));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerDto.CustomerResponse> getCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(customerService.getCustomer(customerId));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<CustomerDto.CustomerResponse> updateCustomer(
            @PathVariable UUID customerId,
            @RequestBody CustomerDto.UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(customerId, request));
    }

    @PostMapping("/{customerId}/addresses")
    public ResponseEntity<CustomerDto.AddressResponse> addAddress(
            @PathVariable UUID customerId,
            @RequestBody CustomerDto.AddressRequest request) {
        return ResponseEntity.ok(customerService.addAddress(customerId, request));
    }

    @GetMapping("/{customerId}/addresses")
    public ResponseEntity<Object> getAddresses(@PathVariable UUID customerId) {
        return ResponseEntity.ok(customerService.getAddresses(customerId));
    }
}
