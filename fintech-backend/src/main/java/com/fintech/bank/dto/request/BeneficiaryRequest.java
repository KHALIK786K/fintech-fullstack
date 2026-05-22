package com.fintech.bank.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BeneficiaryRequest {
    @NotBlank private String name;

    @NotBlank
    @Pattern(regexp = "\\d{9,18}", message = "Account number must be 9-18 digits")
    private String accountNumber;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format")
    private String ifscCode;

    private String bankName;
}
