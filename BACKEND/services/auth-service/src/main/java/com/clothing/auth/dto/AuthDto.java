package com.clothing.auth.dto;

import com.clothing.auth.model.Role;
import com.clothing.auth.model.Status;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

public class AuthDto {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @Builder
    public static class LoginResponse {
        private String accessToken;
        private UUID userId;
        private Role role;
        private UUID shopId;
    }

    @Data
    @Builder
    public static class UserResponse {
        private UUID userId;
        private String email;
        private Role role;
        private UUID shopId;
        private Status status;
    }

    @Data
    public static class CreateUserRequest {
        private UUID shopId;
        private String email;
        private String password;
        private Role role;
    }

    @Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    public static class UpdateStatusRequest {
        private Status status;
    }

    @Data
    public static class UpdateUserRequest {
        private String email;
        private UUID shopId; // Optional: to reassign shop
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }
}
