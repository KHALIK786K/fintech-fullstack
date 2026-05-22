package com.fintech.bank.service;

import com.fintech.bank.dto.request.TransferRequest;
import com.fintech.bank.dto.response.TransactionResponse;
import com.fintech.bank.entity.Account;
import com.fintech.bank.entity.Transaction;
import com.fintech.bank.entity.User;
import com.fintech.bank.enums.AccountStatus;
import com.fintech.bank.enums.TransactionStatus;
import com.fintech.bank.enums.TransferType;
import com.fintech.bank.exception.BadRequestException;
import com.fintech.bank.exception.InsufficientFundsException;
import com.fintech.bank.mapper.TransactionMapper;
import com.fintech.bank.repository.AccountRepository;
import com.fintech.bank.repository.TransactionRepository;
import com.fintech.bank.security.SecurityUtil;
import com.fintech.bank.service.impl.TransferServiceImpl;
import com.fintech.bank.util.ReferenceGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceImplTest {

    @Mock AccountRepository accountRepository;
    @Mock TransactionRepository transactionRepository;
    @Mock FraudDetectionService fraudDetectionService;
    @Mock NotificationService notificationService;
    @Mock SecurityUtil securityUtil;
    @Mock ReferenceGenerator referenceGenerator;
    // Real mapper so the response is built from the saved entity.
    TransactionMapper transactionMapper = new TransactionMapper();

    TransferServiceImpl service;

    User user;
    Account source;

    @BeforeEach
    void setup() {
        service = new TransferServiceImpl(accountRepository, transactionRepository,
                fraudDetectionService, notificationService, transactionMapper,
                securityUtil, referenceGenerator);
        ReflectionTestUtils.setField(service, "rtgsMinAmount", new BigDecimal("200000"));

        user = User.builder().id(1L).username("alice").email("a@x.com").build();
        source = Account.builder()
                .id(10L).accountNumber("100000000001").ifscCode("FINB0001234")
                .accountHolderName("Alice").balance(new BigDecimal("5000000.0000"))
                .status(AccountStatus.ACTIVE).owner(user).build();
    }

    private TransferRequest req(BigDecimal amount, String key) {
        TransferRequest r = new TransferRequest();
        r.setSourceAccountNumber("100000000001");
        r.setDestAccountNumber("100000000002");
        r.setDestIfsc("FINB0001234");
        r.setAmount(amount);
        r.setIdempotencyKey(key);
        r.setRemarks("test");
        return r;
    }

    @Test
    void idempotentReplay_returnsExistingTransaction_withoutMovingMoney() {
        Transaction existing = Transaction.builder()
                .txnReference("RTGS202601010000000001").idempotencyKey("k1")
                .sourceAccount(source).destAccountNumber("100000000002").destIfsc("FINB0001234")
                .amount(new BigDecimal("300000")).transferType(TransferType.RTGS)
                .status(TransactionStatus.SUCCESS).build();
        when(transactionRepository.findByIdempotencyKey("k1")).thenReturn(Optional.of(existing));

        TransactionResponse resp = service.transfer(req(new BigDecimal("300000"), "k1"), TransferType.RTGS);

        assertThat(resp.getTxnReference()).isEqualTo("RTGS202601010000000001");
        verify(accountRepository, never()).save(any()); // no balance change on replay
        verify(fraudDetectionService, never()).validate(any(), any(), any());
    }

    @Test
    void rtgsBelowMinimum_isRejected() {
        when(transactionRepository.findByIdempotencyKey("k2")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.transfer(req(new BigDecimal("1000"), "k2"), TransferType.RTGS))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("RTGS minimum");
    }

    @Test
    void insufficientFunds_isRejected() {
        when(transactionRepository.findByIdempotencyKey("k3")).thenReturn(Optional.empty());
        when(securityUtil.getCurrentUser()).thenReturn(user);
        when(accountRepository.findByAccountNumber("100000000001")).thenReturn(Optional.of(source));
        Account locked = Account.builder().id(10L).accountNumber("100000000001")
                .balance(new BigDecimal("100")).owner(user).status(AccountStatus.ACTIVE).build();
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(locked));

        assertThatThrownBy(() ->
                service.transfer(req(new BigDecimal("250000"), "k3"), TransferType.RTGS))
                .isInstanceOf(InsufficientFundsException.class);
    }

    @Test
    void successfulRtgs_debitsSource_andMarksSuccess() {
        when(transactionRepository.findByIdempotencyKey("k4")).thenReturn(Optional.empty());
        when(securityUtil.getCurrentUser()).thenReturn(user);
        when(accountRepository.findByAccountNumber("100000000001")).thenReturn(Optional.of(source));
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(source));
        when(accountRepository.findByAccountNumber("100000000002")).thenReturn(Optional.empty()); // external payee
        when(referenceGenerator.generateTxnReference("RTGS")).thenReturn("RTGS202601010000000099");
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

        TransactionResponse resp = service.transfer(req(new BigDecimal("300000"), "k4"), TransferType.RTGS);

        assertThat(resp.getStatus()).isEqualTo("SUCCESS");
        assertThat(source.getBalance()).isEqualByComparingTo("4700000.0000"); // 5,000,000 - 300,000
        verify(notificationService).notifyTransaction(any());
    }
}
