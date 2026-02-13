package com.clothing.auth.controller;

import com.clothing.auth.dto.AuthDto;
import com.clothing.auth.model.Role;
import com.clothing.auth.model.Status;
import com.clothing.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> login(@RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDto.UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @PostMapping("/admin/users")
    public ResponseEntity<AuthDto.UserResponse> createOwner(@RequestBody AuthDto.CreateUserRequest request) {
        // Enforce SUPER_ADMIN check if not handled by security config fully or for
        // extra safety
        // In our config, /auth/admin/** is restricted to SUPER_ADMIN
        return ResponseEntity.ok(authService.createUser(request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AuthDto.ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/users/{userId}/status")
    public ResponseEntity<Void> updateUserStatus(@PathVariable UUID userId,
            @RequestBody AuthDto.UpdateStatusRequest request) {
        authService.updateUserStatus(userId, request.getStatus());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/users/{userId}")
    public ResponseEntity<AuthDto.UserResponse> updateUser(@PathVariable UUID userId,
            @RequestBody AuthDto.UpdateUserRequest request) {
        return ResponseEntity.ok(authService.updateUser(userId, request));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<AuthDto.UserResponse>> getUsersByShop(@RequestParam(required = false) UUID shopId) {
        return ResponseEntity.ok(authService.getUsersByShop(shopId));
    }

    @GetMapping("/internal/validate")
    public ResponseEntity<AuthDto.LoginResponse> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return ResponseEntity.ok(authService.validateToken(token));
    }
}
