package com.clothing.customer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_activities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID shopId;

    @Column(nullable = false)
    private UUID customerId;

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private String referenceId; // e.g., Order ID

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ActivityType {
        ORDER,
        REVIEW,
        SUPPORT
    }
}
