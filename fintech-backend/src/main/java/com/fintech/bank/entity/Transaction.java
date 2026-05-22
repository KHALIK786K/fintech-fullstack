package com.fintech.bank.entity;

import com.fintech.bank.enums.TransactionStatus;
import com.fintech.bank.enums.TransferType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Immutable-ish record of a money movement.
 *
 * IDEMPOTENCY: idempotencyKey is unique. A client retrying a request (e.g. after
 * a network timeout) sends the same key; the DB unique constraint + a pre-check
 * guarantee we never double-charge. This is the core defense against duplicate
 * transfers in any payment system.
 *
 * txnReference is the human/bank-facing unique reference (UTR-like) we generate.
 */
@Entity
@Table(name = "transactions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_txn_reference", columnNames = "txn_reference"),
        @UniqueConstraint(name = "uk_txn_idempotency", columnNames = "idempotency_key")
}, indexes = {
        @Index(name = "idx_txn_source", columnList = "source_account_id"),
        @Index(name = "idx_txn_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "txn_reference", nullable = false, length = 32)
    private String txnReference;

    @Column(name = "idempotency_key", nullable = false, length = 80)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_account_id", nullable = false)
    private Account sourceAccount;

    // Destination is stored as raw fields (not an FK) because in real banking the
    // payee is usually at ANOTHER bank, so we only hold their account number/IFSC.
    @Column(name = "dest_account_number", nullable = false, length = 20)
    private String destAccountNumber;

    @Column(name = "dest_ifsc", nullable = false, length = 11)
    private String destIfsc;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_type", nullable = false, length = 10)
    private TransferType transferType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TransactionStatus status;

    @Column(length = 255)
    private String remarks;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;
}
