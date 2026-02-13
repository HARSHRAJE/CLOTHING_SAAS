package com.clothing.auth.repository;

import com.clothing.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    List<User> findByShopId(UUID shopId);

    List<User> findByRole(com.clothing.auth.model.Role role);
}
