package com.clothing.shop.controller;

import com.clothing.shop.dto.ShopDto;
import com.clothing.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/shops/me")
@RequiredArgsConstructor
public class OwnerShopController {

    private final ShopService shopService;

    @GetMapping
    public ResponseEntity<ShopDto.ShopResponse> getMyShop(@RequestHeader("X-Shop-Id") String shopIdStr) {
        return ResponseEntity.ok(shopService.getMyShop(UUID.fromString(shopIdStr)));
    }

    @PutMapping
    public ResponseEntity<ShopDto.ShopResponse> updateMyShop(
            @RequestHeader("X-Shop-Id") String shopIdStr,
            @RequestBody ShopDto.UpdateShopRequest request) {
        return ResponseEntity
                .ok(shopService.updateMyShopBasicInfo(UUID.fromString(shopIdStr), request.getPhone(), null));
    }

    @GetMapping("/settings")
    public ResponseEntity<ShopDto.ShopSettingsResponse> getShopSettings(
            @RequestHeader("X-Shop-Id") String shopIdStr) {
        return ResponseEntity.ok(shopService.getShopSettings(UUID.fromString(shopIdStr)));
    }

    @PutMapping("/settings")
    public ResponseEntity<ShopDto.ShopSettingsResponse> updateShopSettings(
            @RequestHeader("X-Shop-Id") String shopIdStr,
            @RequestBody ShopDto.UpdateSettingsRequest request) {
        return ResponseEntity.ok(shopService.updateShopSettings(UUID.fromString(shopIdStr), request));
    }
}
