package com.fintech.bank.mapper;

import com.fintech.bank.dto.response.AccountResponse;
import com.fintech.bank.entity.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {
    public AccountResponse toResponse(Account a) {
        return AccountResponse.builder()
                .id(a.getId())
                .accountNumber(a.getAccountNumber())
                .ifscCode(a.getIfscCode())
                .accountHolderName(a.getAccountHolderName())
                .balance(a.getBalance())
                .status(a.getStatus().name())
                .build();
    }
}
