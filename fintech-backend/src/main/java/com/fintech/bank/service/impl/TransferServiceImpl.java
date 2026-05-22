package com.fintech.bank.service.impl;

import com.fintech.bank.dto.request.TransferRequest;
import com.fintech.bank.dto.response.TransactionResponse;
import com.fintech.bank.entity.Account;
import com.fintech.bank.entity.Transaction;
import com.fintech.bank.entity.User;
import com.fintech.bank.enums.TransactionStatus;
import com.fintech.bank.enums.TransferType;
import com.fintech.bank.exception.BadRequestException;
import com.fintech.bank.exception.InsufficientFundsException;
import com.fintech.bank.exception.ResourceNotFoundException;
import com.fintech.bank.kafka.NotificationEvent;
import com.fintech.bank.mapper.TransactionMapper;
import com.fintech.bank.repository.AccountRepository;
import com.fintech.bank.repository.TransactionRepository;
import com.fintech.bank.security.SecurityUtil;
import com.fintech.bank.service.FraudDetectionService;
import com.fintech.bank.service.NotificationService;
import com.fintech.bank.service.TransferService;
import com.fintech.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Heart of the payment system.
 *
 * RTGS vs NEFT in this simulation:
 *  - RTGS: settled immediately and individually inside the request transaction.
 *          Real RTGS is for high-value transfers and gives real-time finality.
 *  - NEFT: the debit is reserved immediately but the transaction is left in
 *          PROCESSING and settled later by a scheduled batch (processNeftBatch),
 *          mirroring NEFT's deferred net/batch settlement.
 *
 * Key correctness properties:
 *  - IDEMPOTENCY: if the same idempotencyKey arrives again we return the original
 *    transaction instead of moving money twice.
 *  - ATOMICITY: the whole transfer runs in one @Transactional unit. A failure
 *    anywhere rolls back the debit, so we never lose or create money (ACID).
 *  - ISOLATION: the source account row is locked with PESSIMISTIC_WRITE so two
 *    concurrent debits can't both read a stale balance and overdraw it.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransferServiceImpl implements TransferService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;
    private final NotificationService notificationService;
    private final TransactionMapper transactionMapper;
    private final SecurityUtil securityUtil;
    private final ReferenceGenerator referenceGenerator;

    @Value("${app.rtgs.min-amount:200000}")
    private BigDecimal rtgsMinAmount;

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request, TransferType type) {
        // 1. Idempotency short-circuit (pre-check; DB unique constraint is the hard guarantee).
        var existing = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (existing.isPresent()) {
            log.info("Idempotent replay for key {} -> returning existing txn {}",
                    request.getIdempotencyKey(), existing.get().getTxnReference());
            return transactionMapper.toResponse(existing.get());
        }

        // 2. RTGS minimum-amount rule.
        if (type == TransferType.RTGS && request.getAmount().compareTo(rtgsMinAmount) < 0) {
            throw new BadRequestException("RTGS minimum transfer amount is " + rtgsMinAmount);
        }

        // 3. Load + lock the source account, verifying ownership.
        User current = securityUtil.getCurrentUser();
        Account source = accountRepository.findByAccountNumber(request.getSourceAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Source account not found: " + request.getSourceAccountNumber()));
        if (!source.getOwner().getId().equals(current.getId())) {
            throw new BadRequestException("You do not own the source account");
        }
        if (request.getSourceAccountNumber().equals(request.getDestAccountNumber())) {
            throw new BadRequestException("Source and destination cannot be the same account");
        }

        // Re-read under a write lock for the balance mutation.
        Account locked = accountRepository.findByIdForUpdate(source.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account vanished"));

        // 4. Fraud checks (daily limit, duplicates).
        fraudDetectionService.validate(locked, request.getDestAccountNumber(), request.getAmount());

        // 5. Funds check.
        if (locked.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient balance");
        }

        // 6. Create the transaction record (INITIATED).
        String prefix = (type == TransferType.RTGS) ? "RTGS" : "NEFT";
        Transaction txn = Transaction.builder()
                .txnReference(referenceGenerator.generateTxnReference(prefix))
                .idempotencyKey(request.getIdempotencyKey())
                .sourceAccount(locked)
                .destAccountNumber(request.getDestAccountNumber())
                .destIfsc(request.getDestIfsc())
                .amount(request.getAmount())
                .transferType(type)
                .status(TransactionStatus.INITIATED)
                .remarks(request.getRemarks())
                .build();

        // 7. Reserve funds: debit happens now for BOTH rails (money leaves the payer).
        locked.setBalance(locked.getBalance().subtract(request.getAmount()));
        accountRepository.save(locked);

        if (type == TransferType.RTGS) {
            // Immediate settlement. If the destination is an internal account, credit it.
            creditDestinationIfInternal(request.getDestAccountNumber(), request.getAmount());
            txn.setStatus(TransactionStatus.SUCCESS);
        } else {
            // NEFT: leave in PROCESSING; the batch scheduler will settle it.
            txn.setStatus(TransactionStatus.PROCESSING);
        }

        Transaction saved = transactionRepository.save(txn);

        // 8. Fire notification (async if Kafka enabled).
        notificationService.notifyTransaction(new NotificationEvent(
                saved.getTxnReference(), saved.getStatus().name(),
                current.getEmail(),
                type + " transfer of " + saved.getAmount() + " is " + saved.getStatus()));

        return transactionMapper.toResponse(saved);
    }

    /** Credits an internal destination account if one exists (cross-bank payees are external/simulated). */
    private void creditDestinationIfInternal(String destAccountNumber, BigDecimal amount) {
        accountRepository.findByAccountNumber(destAccountNumber).ifPresent(dest -> {
            dest.setBalance(dest.getBalance().add(amount));
            accountRepository.save(dest);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getByReference(String reference) {
        Transaction txn = transactionRepository.findByTxnReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + reference));
        return transactionMapper.toResponse(txn);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> history(String accountNumber, Pageable pageable) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        return transactionRepository
                .findBySourceAccountIdOrderByCreatedAtDesc(account.getId(), pageable)
                .map(transactionMapper::toResponse);
    }

    /**
     * NEFT batch settlement. Picks up all PROCESSING NEFT transactions and finalizes
     * them. In a real bank this runs at fixed half-hourly windows; here it's driven
     * by the scheduler. Each settlement credits the internal destination if present.
     */
    @Override
    @Transactional
    public int processNeftBatch() {
        List<Transaction> pending = transactionRepository
                .findByTransferTypeAndStatus(TransferType.NEFT, TransactionStatus.PROCESSING);
        for (Transaction txn : pending) {
            creditDestinationIfInternal(txn.getDestAccountNumber(), txn.getAmount());
            txn.setStatus(TransactionStatus.SUCCESS);
            transactionRepository.save(txn);
            notificationService.notifyTransaction(new NotificationEvent(
                    txn.getTxnReference(), txn.getStatus().name(),
                    txn.getSourceAccount().getOwner().getEmail(),
                    "NEFT batch settled: " + txn.getAmount()));
        }
        if (!pending.isEmpty()) {
            log.info("NEFT batch settled {} transaction(s)", pending.size());
        }
        return pending.size();
    }
}
