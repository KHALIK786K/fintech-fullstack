package com.fintech.bank.repository;

import com.fintech.bank.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByOwnerId(Long ownerId);
    Optional<Beneficiary> findByIdAndOwnerId(Long id, Long ownerId);
    boolean existsByOwnerIdAndAccountNumber(Long ownerId, String accountNumber);
}
