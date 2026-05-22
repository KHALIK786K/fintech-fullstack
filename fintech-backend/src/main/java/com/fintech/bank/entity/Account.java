package com.fintech.bank.entity;

import com.fintech.bank.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * A bank account holding a balance.
 *
 * IMPORTANT MONEY-HANDLING NOTE:
 * Balance is BigDecimal, never double/float. Floating point cannot represent
 * decimal currency exactly (0.1 + 0.2 != 0.3), which is unacceptable for money.
 *
 * @Version enables JPA OPTIMISTIC LOCKING: if two transactions read the same
 * balance and both try to write, the second commit fails with an
 * OptimisticLockException instead of silently losing an update. The transfer
 * service ALSO uses a pessimistic DB lock for the debit path (see repository).
 */
@Entity
@Table(name = "accounts", uniqueConstraints =
        @UniqueConstraint(name = "uk_accounts_number", columnNames = "account_number"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_number", nullable = false, length = 20)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "account_holder_name", nullable = false, length = 120)
    private String accountHolderName;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Version
    private Long version;
}
