package com.fintech.bank.repository;

import com.fintech.bank.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findByOwnerId(Long ownerId);

    /**
     * PESSIMISTIC_WRITE takes a row-level DB lock (SELECT ... FOR UPDATE).
     * We use it on the source account during a transfer so two concurrent
     * debits on the same account are serialized at the database, preventing
     * a race that could overdraw the balance. The lock is held until the
     * surrounding @Transactional method commits.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdForUpdate(@Param("id") Long id);
}
