package com.clothing.shop.controller;

import com.clothing.shop.dto.ShopDto;
import com.clothing.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/store")
@RequiredArgsConstructor
public class PublicShopController {

    private final ShopService shopService;

    @GetMapping("/{slug}")
    public ResponseEntity<ShopDto.PublicShopResponse> getShopBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(shopService.getPublicShopBySlug(slug));
    }
}
