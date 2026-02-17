package com.clothing.order.service;

import com.clothing.order.dto.OrderDto;
import com.clothing.order.model.*;
import com.clothing.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerService customerService;
    private final RestTemplate restTemplate;

    @Value("${shop-service.url}")
    private String shopServiceUrl;

    @Value("${product-service.url}")
    private String productServiceUrl;

    @Value("${customer-service.url}")
    private String customerServiceUrl;

    @Value("${analytics-service.url:http://analytics-service:8087}")
    private String analyticsServiceUrl;

    @Transactional
    public OrderDto.OrderResponse createOrder(String shopSlug, OrderDto.CreateOrderRequest request) {
        // 1. Resolve Shop
        UUID shopId = resolveShopId(shopSlug);

        // 2. Handle Customer
        Customer customer = customerService.findOrCreateCustomer(shopId, request.getCustomerName(), request.getPhone(),
                request.getEmail());

        // 3. Validate & Reserve Stock
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .shopId(shopId)
                .customer(customer)
                .orderNumber("ORD-" + System.currentTimeMillis()) // Simple generation
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .orderSource(request.getOrderSource())
                .build(); // Don't save yet, need items

        for (OrderDto.OrderItemRequest itemRequest : request.getItems()) {
            // Call Product Service to validate and get price
            // GET /internal/products/{variantId}
            Map variantDetails = restTemplate
                    .getForObject(productServiceUrl + "/internal/products/" + itemRequest.getVariantId(), Map.class);
            if (variantDetails == null) {
                throw new RuntimeException("Variant not found: " + itemRequest.getVariantId());
            }

            Integer availableStock = (Integer) variantDetails.get("availableStock");
            if (availableStock < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for variant: " + itemRequest.getVariantId());
            }

            // Check product status? implied by variant details usually, but let's assume
            // active if returned

            // Reserve Stock
            // POST /internal/products/variants/{variantId}/reserve
            Map<String, Object> reserveRequest = Map.of(
                    "quantity", itemRequest.getQuantity(),
                    "referenceId", order.getOrderNumber());
            restTemplate.postForEntity(
                    productServiceUrl + "/internal/products/variants/" + itemRequest.getVariantId() + "/reserve",
                    reserveRequest, Void.class);

            BigDecimal price = new BigDecimal(variantDetails.get("price").toString());
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .shopId(shopId)
                    .order(order)
                    .productId(UUID.fromString((String) variantDetails.get("productId")))
                    .variantId(itemRequest.getVariantId())
                    .quantity(itemRequest.getQuantity())
                    .price(price)
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setTaxAmount(BigDecimal.ZERO); // Calculate logic later
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setItems(orderItems);

        // Fetch shipping address if customer is remote
        if (customer.getRemoteCustomerId() != null) {
            String address = customerService.getDefaultAddress(customer.getRemoteCustomerId());
            if (address != null) {
                order.setAddress(address);
            }
        }

        Order savedOrder = orderRepository.save(order);

        // 4. Update Customer Metrics & Activity (Async ideally, but sync for now)
        if (customer.getRemoteCustomerId() != null) {
            try {
                updateCustomerMetrics(customer.getRemoteCustomerId(), savedOrder);
            } catch (Exception e) {
                System.err.println("Failed to update customer metrics: " + e.getMessage());
            }
        }

        // 5. Record Analytics (Async ideally)
        recordAnalytics(savedOrder);

        return mapToResponse(savedOrder);
    }

    private void updateCustomerMetrics(UUID remoteCustomerId, Order order) {
        // Update Metrics
        // PUT /internal/customers/{customerId}/metrics
        Map<String, Object> metricsRequest = Map.of("orderAmount", order.getTotalAmount());
        restTemplate.put(customerServiceUrl + "/internal/customers/" + remoteCustomerId + "/metrics", metricsRequest);

        // Add Activity
        // POST /internal/customers/{customerId}/activity
        Map<String, Object> activityRequest = Map.of(
                "shopId", order.getShopId(),
                "activityType", "ORDER",
                "referenceId", order.getOrderNumber());
        restTemplate.postForLocation(customerServiceUrl + "/internal/customers/" + remoteCustomerId + "/activity",
                activityRequest);
    }

    private void recordAnalytics(Order order) {
        try {
            // Record Order
            Map<String, Object> orderRequest = Map.of(
                    "shopId", order.getShopId(),
                    "orderId", order.getId(),
                    "amount", order.getTotalAmount(),
                    "date", java.time.LocalDate.now().toString());
            restTemplate.postForLocation(analyticsServiceUrl + "/internal/analytics/orders", orderRequest);

            // Record Product Sales
            for (OrderItem item : order.getItems()) {
                Map<String, Object> saleRequest = Map.of(
                        "shopId", order.getShopId(),
                        "productId", item.getProductId(),
                        "quantity", item.getQuantity(),
                        "amount", item.getTotalPrice(),
                        "date", java.time.LocalDate.now().toString());
                restTemplate.postForLocation(analyticsServiceUrl + "/internal/analytics/product-sale", saleRequest);
            }
        } catch (Exception e) {
            System.err.println("Failed to record analytics: " + e.getMessage());
        }
    }

    private UUID resolveShopId(String slug) {
        // GET /internal/shops/slug/{slug}
        try {
            Map shop = restTemplate.getForObject(shopServiceUrl + "/internal/shops/slug/" + slug, Map.class);
            if (shop == null) {
                throw new RuntimeException("Shop not found for slug: " + slug);
            }
            return UUID.fromString((String) shop.get("shopId"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to resolve shop: " + e.getMessage());
        }
    }

    // --- Owner Operations ---

    public org.springframework.data.domain.Page<OrderDto.OrderResponse> getAllOrders(UUID shopId,
            org.springframework.data.domain.Pageable pageable) {
        return orderRepository.findByShopId(shopId, pageable).map(this::mapToResponse);
    }

    public OrderDto.OrderResponse getOrderById(UUID shopId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        return mapToResponse(order);
    }

    public Map<String, Object> getOrderDebugInfo(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        return Map.of(
                "OrderId", order.getId(),
                "ShopId", order.getShopId(),
                "LocalCustomerId", order.getCustomer().getId(),
                "RemoteCustomerId",
                order.getCustomer().getRemoteCustomerId() != null ? order.getCustomer().getRemoteCustomerId() : "NULL",
                "Address", order.getAddress() != null ? order.getAddress() : "NULL");
    }

    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(UUID shopId, UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized access to order");
        }

        order.setStatus(newStatus);

        // Log history (optional but good)
        // OrderStatusHistory history = ...

        return mapToResponse(orderRepository.save(order));
    }

    private OrderDto.OrderResponse mapToResponse(Order order) {
        return OrderDto.OrderResponse.builder()
                .orderId(order.getId())
                .shopId(order.getShopId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .orderSource(order.getOrderSource())
                .paymentStatus(order.getPaymentStatus())
                .orderSource(order.getOrderSource())
                .totalAmount(order.getTotalAmount())
                .address(order.getAddress())
                .customer(OrderDto.CustomerResponse.builder()
                        .id(order.getCustomer().getId())
                        .remoteCustomerId(order.getCustomer().getRemoteCustomerId())
                        .name(order.getCustomer().getName())
                        .phone(order.getCustomer().getPhone())
                        .email(order.getCustomer().getEmail())
                        .build())
                .items(order.getItems().stream().map(this::mapItem).collect(Collectors.toList()))
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderDto.OrderItemResponse mapItem(OrderItem item) {
        return OrderDto.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .variantId(item.getVariantId())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
