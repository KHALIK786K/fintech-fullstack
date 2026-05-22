package com.fintech.bank.mapper;

import com.fintech.bank.dto.response.TransactionResponse;
import com.fintech.bank.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
    public TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .txnReference(t.getTxnReference())
                .sourceAccountNumber(t.getSourceAccount().getAccountNumber())
                .destAccountNumber(t.getDestAccountNumber())
                .destIfsc(t.getDestIfsc())
                .amount(t.getAmount())
                .transferType(t.getTransferType().name())
                .status(t.getStatus().name())
                .remarks(t.getRemarks())
                .failureReason(t.getFailureReason())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
