package com.fintech.bank.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferRequest {
    @NotBlank
    private String sourceAccountNumber;

    @NotBlank
    @Pattern(regexp = "\\d{9,18}", message = "Destination account must be 9-18 digits")
    private String destAccountNumber;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format")
    private String destIfsc;

    @NotNull
    @DecimalMin(value = "1.00", message = "Amount must be at least 1.00")
    private BigDecimal amount;

    private String remarks;

    /**
     * Client-supplied idempotency key. Retried requests reuse the same key so the
     * server returns the original result instead of executing the transfer twice.
     */
    @NotBlank
    private String idempotencyKey;
}
