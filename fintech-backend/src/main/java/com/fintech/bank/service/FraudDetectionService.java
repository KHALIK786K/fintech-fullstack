package com.fintech.bank.service;

import com.fintech.bank.entity.Account;

import java.math.BigDecimal;

public interface FraudDetectionService {
    /** Throws FraudCheckException if the proposed transfer violates a control. */
    void validate(Account source, String destAccountNumber, BigDecimal amount);
}
