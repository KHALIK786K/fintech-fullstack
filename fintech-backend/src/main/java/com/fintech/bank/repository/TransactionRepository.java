package com.fintech.bank.repository;

import com.fintech.bank.entity.Transaction;
import com.fintech.bank.enums.TransactionStatus;
import com.fintech.bank.enums.TransferType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    Optional<Transaction> findByTxnReference(String txnReference);

    Page<Transaction> findBySourceAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    List<Transaction> findByTransferTypeAndStatus(TransferType type, TransactionStatus status);

    /** Sum of today's successful + in-flight debits for an account, used by the daily-limit fraud check. */
    @Query("""
           SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
           WHERE t.sourceAccount.id = :accountId
             AND t.status IN (com.fintech.bank.enums.TransactionStatus.SUCCESS,
                              com.fintech.bank.enums.TransactionStatus.PROCESSING,
                              com.fintech.bank.enums.TransactionStatus.INITIATED)
             AND t.createdAt >= :since
           """)
    BigDecimal sumDebitsSince(@Param("accountId") Long accountId, @Param("since") Instant since);

    /** Duplicate-detection: same source, dest and amount within a short window. */
    @Query("""
           SELECT COUNT(t) FROM Transaction t
           WHERE t.sourceAccount.id = :accountId
             AND t.destAccountNumber = :dest
             AND t.amount = :amount
             AND t.createdAt >= :since
           """)
    long countRecentDuplicates(@Param("accountId") Long accountId,
                               @Param("dest") String dest,
                               @Param("amount") BigDecimal amount,
                               @Param("since") Instant since);
}
