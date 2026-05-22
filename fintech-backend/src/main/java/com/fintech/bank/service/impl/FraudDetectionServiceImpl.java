package com.fintech.bank.service.impl;

import com.fintech.bank.entity.Account;
import com.fintech.bank.exception.FraudCheckException;
import com.fintech.bank.repository.TransactionRepository;
import com.fintech.bank.service.FraudDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Lightweight rules engine. Real systems use ML scoring + velocity rules, but the
 * structure is the same: evaluate the candidate transfer against limits and
 * recent history before allowing it.
 *
 * Rules implemented:
 *  1. Per-day cumulative debit limit per account.
 *  2. Duplicate detection: identical source/dest/amount within a short window.
 */
@Service
@RequiredArgsConstructor
public class FraudDetectionServiceImpl implements FraudDetectionService {

    private final TransactionRepository transactionRepository;

    @Value("${app.fraud.daily-limit:1000000}")
    private BigDecimal dailyLimit;

    @Value("${app.fraud.duplicate-window-seconds:60}")
    private long duplicateWindowSeconds;

    @Override
    public void validate(Account source, String destAccountNumber, BigDecimal amount) {
        Instant startOfWindow = Instant.now().minus(24, ChronoUnit.HOURS);
        BigDecimal todaysDebits = transactionRepository.sumDebitsSince(source.getId(), startOfWindow);
        if (todaysDebits.add(amount).compareTo(dailyLimit) > 0) {
            throw new FraudCheckException(
                    "Daily transfer limit exceeded. Limit=" + dailyLimit + ", attempted total=" + todaysDebits.add(amount));
        }

        Instant dupWindow = Instant.now().minusSeconds(duplicateWindowSeconds);
        long dups = transactionRepository.countRecentDuplicates(source.getId(), destAccountNumber, amount, dupWindow);
        if (dups > 0) {
            throw new FraudCheckException(
                    "Duplicate transaction detected (same destination & amount within "
                            + duplicateWindowSeconds + "s). Use a new idempotency key if intentional.");
        }
    }
}
