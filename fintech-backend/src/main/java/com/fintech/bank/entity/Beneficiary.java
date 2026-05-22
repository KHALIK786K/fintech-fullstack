package com.fintech.bank.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * A saved payee that a user can transfer to. Validating beneficiaries up front
 * (account number + IFSC) reduces failed transfers and is a real anti-fraud control.
 */
@Entity
@Table(name = "beneficiaries", uniqueConstraints =
        @UniqueConstraint(name = "uk_beneficiary_owner_acct",
                columnNames = {"owner_id", "account_number"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "account_number", nullable = false, length = 20)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "bank_name", length = 120)
    private String bankName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;
}
