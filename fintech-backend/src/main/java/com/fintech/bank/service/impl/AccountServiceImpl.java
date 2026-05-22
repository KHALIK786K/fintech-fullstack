package com.fintech.bank.service.impl;

import com.fintech.bank.service.AccountService;
import com.fintech.bank.dto.request.CreateAccountRequest;
import com.fintech.bank.dto.response.AccountResponse;
import com.fintech.bank.entity.Account;
import com.fintech.bank.entity.User;
import com.fintech.bank.exception.ResourceNotFoundException;
import com.fintech.bank.mapper.AccountMapper;
import com.fintech.bank.repository.AccountRepository;
import com.fintech.bank.security.SecurityUtil;
import com.fintech.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private static final String BANK_IFSC = "FINB0001234"; // single-branch simulation

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final SecurityUtil securityUtil;
    private final ReferenceGenerator referenceGenerator;

    @Override
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        User owner = securityUtil.getCurrentUser();

        String accountNumber;
        do {
            accountNumber = referenceGenerator.generateAccountNumber();
        } while (accountRepository.findByAccountNumber(accountNumber).isPresent());

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .ifscCode(BANK_IFSC)
                .accountHolderName(request.getAccountHolderName())
                .balance(request.getOpeningBalance())
                .owner(owner)
                .build();

        return accountMapper.toResponse(accountRepository.save(account));
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        // Ownership check: a customer may only view their own account.
        User current = securityUtil.getCurrentUser();
        if (!account.getOwner().getId().equals(current.getId())) {
            throw new ResourceNotFoundException("Account not found: " + accountNumber);
        }
        return accountMapper.toResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getMyAccounts() {
        User current = securityUtil.getCurrentUser();
        return accountRepository.findByOwnerId(current.getId())
                .stream().map(accountMapper::toResponse).toList();
    }
}
