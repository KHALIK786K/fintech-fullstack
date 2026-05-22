package com.fintech.bank.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class BeneficiaryResponse {
    private Long id;
    private String name;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private boolean verified;
}
