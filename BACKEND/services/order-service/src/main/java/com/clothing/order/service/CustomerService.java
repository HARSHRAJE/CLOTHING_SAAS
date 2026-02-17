package com.clothing.order.service;

import com.clothing.order.model.Customer;
import com.clothing.order.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${customer-service.url}")
    private String customerServiceUrl;

    @Transactional
    public Customer findOrCreateCustomer(java.util.UUID shopId, String name, String phone, String email) {
        // 1. Check local by phone
        Customer localCustomer = customerRepository.findByPhone(phone).orElse(null);
        System.out.println("OrderService: Found local customer: " + (localCustomer != null) + " for phone: " + phone);

        // 2. Sync with Remote Service
        java.util.UUID remoteId = null;
        try {
            // GET /internal/customers?shopId={shopId}&phone={phone}
            String url = customerServiceUrl + "/internal/customers?shopId=" + shopId + "&phone=" + phone;
            System.out.println("OrderService: Syncing customer. URL: " + url);
            java.util.Map response = restTemplate.getForObject(url, java.util.Map.class);
            if (response != null && response.get("customerId") != null) {
                remoteId = java.util.UUID.fromString((String) response.get("customerId"));
            }
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            // Not found, Create Remote
            java.util.Map<String, Object> request = java.util.Map.of(
                    "shopId", shopId,
                    "name", name,
                    "phone", phone,
                    "email", email != null ? email : "");
            java.util.Map response = restTemplate.postForObject(customerServiceUrl + "/internal/customers", request,
                    java.util.Map.class);

            if (response != null && response.get("customerId") != null) {
                remoteId = java.util.UUID.fromString((String) response.get("customerId"));
                System.out.println("OrderService: Created remote customer: " + remoteId);
            }
        } catch (Exception e) {
            System.err.println("Failed to sync with customer-service: " + e.getMessage());
            e.printStackTrace();
        }

        // 3. Update Remote if exists (Sync details)
        if (remoteId != null) {
            try {
                java.util.Map<String, Object> updateRequest = java.util.Map.of(
                        "name", name,
                        "email", email != null ? email : "");
                restTemplate.put(customerServiceUrl + "/internal/customers/" + remoteId, updateRequest);
                System.out.println("OrderService: Synced customer details for: " + remoteId);
            } catch (Exception e) {
                System.err.println("Failed to sync details: " + e.getMessage());
            }
        }

        if (localCustomer == null) {
            localCustomer = Customer.builder()
                    .name(name)
                    .phone(phone)
                    .email(email)
                    .remoteCustomerId(remoteId)
                    .build();
            return customerRepository.save(localCustomer);
        } else {
            if (localCustomer.getRemoteCustomerId() == null && remoteId != null) {
                localCustomer.setRemoteCustomerId(remoteId);
                return customerRepository.save(localCustomer);
            }
            return localCustomer;
        }
    }

    public String getDefaultAddress(java.util.UUID remoteCustomerId) {
        try {
            String url = customerServiceUrl + "/customers/" + remoteCustomerId + "/addresses";
            java.util.List<java.util.Map> addresses = restTemplate.getForObject(url, java.util.List.class);

            if (addresses != null && !addresses.isEmpty()) {
                // Find default or first
                java.util.Map<String, Object> target = addresses.stream()
                        .filter(a -> Boolean.TRUE.equals(a.get("default")))
                        .findFirst()
                        .orElse((java.util.Map) addresses.get(0));

                return String.format("%s, %s, %s, %s",
                        target.get("addressLine"),
                        target.get("city"),
                        target.get("state"),
                        target.get("pincode"));
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch address for customer: " + remoteCustomerId);
            e.printStackTrace();
        }
        return null;
    }
}
