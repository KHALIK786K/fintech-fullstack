package com.fintech.bank.controller;

import com.fintech.bank.dto.request.TransferRequest;
import com.fintech.bank.dto.response.TransactionResponse;
import com.fintech.bank.enums.TransferType;
import com.fintech.bank.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Two endpoints, one service: the rail is chosen by the path so the workflows
 * stay explicit while sharing all the transactional/idempotency/fraud logic.
 */
@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
@Tag(name = "Transfers", description = "RTGS (instant) and NEFT (batch) money transfers")
public class TransferController {

    private final TransferService transferService;

    @Operation(summary = "RTGS transfer — instant settlement, high-value (min amount enforced)")
    @PostMapping("/rtgs")
    public ResponseEntity<TransactionResponse> rtgs(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transferService.transfer(request, TransferType.RTGS));
    }

    @Operation(summary = "NEFT transfer — queued for the next batch settlement window")
    @PostMapping("/neft")
    public ResponseEntity<TransactionResponse> neft(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(transferService.transfer(request, TransferType.NEFT));
    }
}
