package com.clothing.auth.config;

import com.clothing.auth.model.Role;
import com.clothing.auth.model.Status;
import com.clothing.auth.model.User;
import com.clothing.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .email("admin@saas.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .role(Role.SUPER_ADMIN)
                        .status(Status.ACTIVE)
                        .build();
                userRepository.save(admin);
                System.out.println("Default Admin User Created: admin@saas.com / password123");
            }
        };
    }
}
