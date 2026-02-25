package com.clothing.customer.service;

import com.clothing.customer.dto.CustomerDto;
import com.clothing.customer.model.Customer;
import com.clothing.customer.model.CustomerActivity;
import com.clothing.customer.model.CustomerAddress;
import com.clothing.customer.repository.CustomerActivityRepository;
import com.clothing.customer.repository.CustomerAddressRepository;
import com.clothing.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final CustomerActivityRepository activityRepository;
    private final com.clothing.customer.event.CustomerEventProducer customerEventProducer;

    // Internal: Find by Phone
    public CustomerDto.CustomerResponse findByPhone(UUID shopId, String phone) {
        return customerRepository.findByShopIdAndPhone(shopId, phone)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    // Internal: Create Customer
    @Transactional
    public CustomerDto.CustomerResponse createCustomer(CustomerDto.CreateCustomerRequest request) {
        // Check if exists
        customerRepository.findByShopIdAndPhone(request.getShopId(), request.getPhone())
                .ifPresent(c -> {
                    throw new RuntimeException("Customer already exists");
                });

        Customer customer = Customer.builder()
                .shopId(request.getShopId())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .build();

        Customer saved = customerRepository.save(customer);

        // Publish Kafka event for analytics (replaces REST call)
        customerEventProducer.publish(com.clothing.customer.event.CustomerEvent.builder()
                .eventType("CREATED")
                .shopId(saved.getShopId())
                .customerId(saved.getId())
                .customerName(saved.getName())
                .build());

        return mapToResponse(saved);
    }

    // Internal: Update Metrics
    @Transactional
    public void updateMetrics(UUID customerId, CustomerDto.UpdateMetricsRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (customer.getTotalOrders() == null)
            customer.setTotalOrders(0);
        if (customer.getTotalSpent() == null)
            customer.setTotalSpent(BigDecimal.ZERO);
        if (customer.getLoyaltyPoints() == null)
            customer.setLoyaltyPoints(0);

        customer.setTotalOrders(customer.getTotalOrders() + 1);

        BigDecimal orderAmount = request.getOrderAmount() != null ? request.getOrderAmount() : BigDecimal.ZERO;
        customer.setTotalSpent(customer.getTotalSpent().add(orderAmount));

        // Simple loyalty logic: 1 point per 100 spent
        int points = orderAmount.divideToIntegralValue(BigDecimal.valueOf(100)).intValue();
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);

        customerRepository.save(customer);
    }

    // Internal: Add Activity
    @Transactional
    public void addActivity(UUID customerId, CustomerDto.AddActivityRequest request) {
        CustomerActivity activity = CustomerActivity.builder()
                .customerId(customerId)
                .shopId(request.getShopId())
                .activityType(request.getActivityType())
                .referenceId(request.getReferenceId())
                .build();
        activityRepository.save(activity);
    }

    // Owner: Get All
    public Page<CustomerDto.CustomerResponse> getCustomers(UUID shopId, String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return customerRepository.findByShopIdAndNameContainingIgnoreCase(shopId, search, pageable)
                    .map(this::mapToResponse);
        }
        return customerRepository.findByShopId(shopId, pageable).map(this::mapToResponse);
    }

    // Owner: Get Details
    public CustomerDto.CustomerResponse getCustomer(UUID customerId) {
        return customerRepository.findById(customerId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    // Owner: Update
    @Transactional
    public CustomerDto.CustomerResponse updateCustomer(UUID customerId, CustomerDto.UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (request.getName() != null)
            customer.setName(request.getName());
        if (request.getEmail() != null)
            customer.setEmail(request.getEmail());

        return mapToResponse(customerRepository.save(customer));
    }

    // Address Management
    @Transactional
    public CustomerDto.AddressResponse addAddress(UUID customerId, CustomerDto.AddressRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (request.isDefault()) {
            // Unset other defaults
            addressRepository.findByCustomerId(customerId).forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }

        CustomerAddress address = CustomerAddress.builder()
                .customerId(customerId)
                .shopId(customer.getShopId())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .isDefault(request.isDefault())
                .build();

        return mapToAddressResponse(addressRepository.save(address));
    }

    public List<CustomerDto.AddressResponse> getAddresses(UUID customerId) {
        return addressRepository.findByCustomerId(customerId).stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    private CustomerDto.CustomerResponse mapToResponse(Customer customer) {
        return CustomerDto.CustomerResponse.builder()
                .customerId(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .totalOrders(customer.getTotalOrders())
                .totalSpent(customer.getTotalSpent())
                .loyaltyPoints(customer.getLoyaltyPoints())
                .createdAt(customer.getCreatedAt())
                .loyaltyPoints(customer.getLoyaltyPoints())
                .createdAt(customer.getCreatedAt())
                .defaultAddress(addressRepository.findByCustomerId(customer.getId()).stream()
                        .filter(a -> a.isDefault())
                        .findFirst()
                        .map(a -> String.format("%s, %s", a.getCity(), a.getState())) // Simplified for list view
                        .orElse(null))
                .build();
    }

    private CustomerDto.AddressResponse mapToAddressResponse(CustomerAddress address) {
        return CustomerDto.AddressResponse.builder()
                .id(address.getId())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .isDefault(address.isDefault())
                .build();
    }
}
