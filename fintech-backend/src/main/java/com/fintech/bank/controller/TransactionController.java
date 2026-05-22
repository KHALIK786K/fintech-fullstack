package com.fintech.bank.controller;

import com.fintech.bank.dto.response.TransactionResponse;
import com.fintech.bank.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Status lookup & history")
public class TransactionController {

    private final TransferService transferService;

    @Operation(summary = "Get a transaction by its reference (status tracking)")
    @GetMapping("/{reference}")
    public ResponseEntity<TransactionResponse> byReference(@PathVariable String reference) {
        return ResponseEntity.ok(transferService.getByReference(reference));
    }

    @Operation(summary = "Paginated transaction history for an account")
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<Page<TransactionResponse>> history(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(transferService.history(accountNumber, PageRequest.of(page, size)));
    }
}
