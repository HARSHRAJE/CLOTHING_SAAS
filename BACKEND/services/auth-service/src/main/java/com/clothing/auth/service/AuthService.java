package com.clothing.auth.service;

import com.clothing.auth.dto.AuthDto;
import com.clothing.auth.model.Role;
import com.clothing.auth.model.Status;
import com.clothing.auth.model.User;
import com.clothing.auth.repository.UserRepository;
import com.clothing.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import com.clothing.auth.model.PasswordResetToken;
import com.clothing.auth.repository.PasswordResetTokenRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final PasswordResetTokenRepository tokenRepository;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getStatus() == Status.DISABLED) {
            throw new RuntimeException("User account is disabled");
        }

        // Logic for checking shop status could be added here later (via Feign Client to
        // Shop Service)

        String token = jwtUtil.generateToken(user);

        return AuthDto.LoginResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .role(user.getRole())
                .shopId(user.getShopId())
                .build();
    }

    public AuthDto.UserResponse getCurrentUser(String email) {
        User user = getUserByEmail(email);
        return mapToUserResponse(user);
    }

    public AuthDto.UserResponse createUser(AuthDto.CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .shopId(request.getShopId())
                .status(Status.ACTIVE)
                .build();

        if (request.getRole() == Role.SUPER_ADMIN) {
            user.setShopId(null);
        }

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    public void changePassword(String email, AuthDto.ChangePasswordRequest request) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void updateUserStatus(UUID userId, Status status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    public AuthDto.UserResponse updateUser(UUID userId, AuthDto.UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getShopId() != null) {
            user.setShopId(request.getShopId());
        }

        return mapToUserResponse(userRepository.save(user));
    }

    public List<AuthDto.UserResponse> getUsersByShop(UUID shopId) {
        List<User> users;
        if (shopId != null) {
            users = userRepository.findByShopId(shopId);
        } else {
            // If no shopId provided, return all OWNERS (for Admin Dashboard)
            users = userRepository.findByRole(Role.OWNER);
        }
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    // Internal validation method
    public AuthDto.LoginResponse validateToken(String token) {
        String email = jwtUtil.extractUsername(token);
        User user = getUserByEmail(email);
        // additional checks if needed
        return AuthDto.LoginResponse.builder()
                .userId(user.getId())
                .role(user.getRole())
                .shopId(user.getShopId())
                .build();

    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getStatus() == Status.DISABLED) {
            // Silently return to prevent user enumeration
            return;
        }

        String tokenString = UUID.randomUUID().toString();
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenString)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepository.save(token);

        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, tokenString);
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    public void resetPassword(String tokenString, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }

        PasswordResetToken token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Invalid or empty password reset token"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token);
            throw new RuntimeException("Password reset token has expired");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate token after successful reset
        tokenRepository.delete(token);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private AuthDto.UserResponse mapToUserResponse(User user) {
        return AuthDto.UserResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .shopId(user.getShopId())
                .status(user.getStatus())
                .build();
    }
}
