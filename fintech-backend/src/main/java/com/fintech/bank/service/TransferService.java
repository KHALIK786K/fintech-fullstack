package com.fintech.bank.service;

import com.fintech.bank.dto.request.TransferRequest;
import com.fintech.bank.dto.response.TransactionResponse;
import com.fintech.bank.enums.TransferType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransferService {
    TransactionResponse transfer(TransferRequest request, TransferType type);
    TransactionResponse getByReference(String reference);
    Page<TransactionResponse> history(String accountNumber, Pageable pageable);
    int processNeftBatch(); // invoked by scheduler; returns number settled
}
