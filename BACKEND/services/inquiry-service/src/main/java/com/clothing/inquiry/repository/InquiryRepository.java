package com.clothing.inquiry.repository;

import com.clothing.inquiry.model.Inquiry;
import com.clothing.inquiry.model.InquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {

    Page<Inquiry> findByShopId(UUID shopId, Pageable pageable);

    Page<Inquiry> findByShopIdAndStatus(UUID shopId, InquiryStatus status, Pageable pageable);

    // Dynamic filtering might be better with Specification, but for simple
    // requirements:
    Page<Inquiry> findByShopIdAndPhoneContaining(UUID shopId, String phone, Pageable pageable);
}
