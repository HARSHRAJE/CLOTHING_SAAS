package com.clothing.shop.controller;

import com.clothing.shop.dto.ShopDto;
import com.clothing.shop.model.ShopStatus;
import com.clothing.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/shops")
@RequiredArgsConstructor
public class AdminShopController {

    private final ShopService shopService;

    @PostMapping
    public ResponseEntity<ShopDto.ShopResponse> createShop(@RequestBody ShopDto.CreateShopRequest request) {
        return ResponseEntity.ok(shopService.createShop(request));
    }

    @GetMapping
    public ResponseEntity<Page<ShopDto.ShopResponse>> getAllShops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(shopService.getAllShops(pageable));
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<ShopDto.ShopResponse> getShopById(@PathVariable UUID shopId) {
        return ResponseEntity.ok(shopService.getShopById(shopId));
    }

    @PutMapping("/{shopId}")
    public ResponseEntity<ShopDto.ShopResponse> updateShop(@PathVariable UUID shopId,
            @RequestBody ShopDto.UpdateShopRequest request) {
        return ResponseEntity.ok(shopService.updateShop(shopId, request));
    }

    @PutMapping("/{shopId}/status")
    public ResponseEntity<Void> updateShopStatus(@PathVariable UUID shopId,
            @RequestBody ShopDto.UpdateStatusRequest request) {
        shopService.updateShopStatus(shopId, request.getStatus());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{shopId}/subscription")
    public ResponseEntity<Void> updateSubscription(@PathVariable UUID shopId,
            @RequestBody ShopDto.UpdateSubscriptionRequest request) {
        shopService.updateSubscription(shopId, request.getSubscriptionEndDate());
        return ResponseEntity.ok().build();
    }
}
