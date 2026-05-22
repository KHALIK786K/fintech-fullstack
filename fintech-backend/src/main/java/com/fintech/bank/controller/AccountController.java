package com.fintech.bank.controller;

import com.fintech.bank.dto.request.CreateAccountRequest;
import com.fintech.bank.dto.response.AccountResponse;
import com.fintech.bank.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account creation & lookup")
public class AccountController {

    private final AccountService accountService;

    @Operation(summary = "Open a new bank account for the authenticated user")
    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request));
    }

    @Operation(summary = "List my accounts")
    @GetMapping
    public ResponseEntity<List<AccountResponse>> myAccounts() {
        return ResponseEntity.ok(accountService.getMyAccounts());
    }

    @Operation(summary = "Get one of my accounts by number (includes balance)")
    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponse> byNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getByAccountNumber(accountNumber));
    }
}
