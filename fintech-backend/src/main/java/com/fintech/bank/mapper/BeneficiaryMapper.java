package com.fintech.bank.mapper;

import com.fintech.bank.dto.response.BeneficiaryResponse;
import com.fintech.bank.entity.Beneficiary;
import org.springframework.stereotype.Component;

@Component
public class BeneficiaryMapper {
    public BeneficiaryResponse toResponse(Beneficiary b) {
        return BeneficiaryResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .accountNumber(b.getAccountNumber())
                .ifscCode(b.getIfscCode())
                .bankName(b.getBankName())
                .verified(b.isVerified())
                .build();
    }
}
