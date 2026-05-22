package com.fintech.bank.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data @Builder
public class TransactionResponse {
    private String txnReference;
    private String sourceAccountNumber;
    private String destAccountNumber;
    private String destIfsc;
    private BigDecimal amount;
    private String transferType;
    private String status;
    private String remarks;
    private String failureReason;
    private Instant createdAt;
}
