package com.clothing.shop.controller;

import com.clothing.shop.dto.ShopDto;
import com.clothing.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/internal/shops")
@RequiredArgsConstructor
public class InternalShopController {

    private final ShopService shopService;

    @GetMapping("/{shopId}")
    public ResponseEntity<ShopDto.ShopResponse> validateShopStatus(@PathVariable UUID shopId) {
        return ResponseEntity.ok(shopService.getShopById(shopId));
    }
}
