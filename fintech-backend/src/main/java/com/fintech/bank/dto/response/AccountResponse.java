package com.fintech.bank.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data @Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private BigDecimal balance;
    private String status;
}
