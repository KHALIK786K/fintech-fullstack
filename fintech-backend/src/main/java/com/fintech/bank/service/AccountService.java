package com.fintech.bank.service;

import com.fintech.bank.dto.request.CreateAccountRequest;
import com.fintech.bank.dto.response.AccountResponse;

import java.util.List;

public interface AccountService {
    AccountResponse createAccount(CreateAccountRequest request);
    AccountResponse getByAccountNumber(String accountNumber);
    List<AccountResponse> getMyAccounts();
}
