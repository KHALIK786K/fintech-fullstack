package com.fintech.bank.service;

import com.fintech.bank.dto.request.BeneficiaryRequest;
import com.fintech.bank.dto.response.BeneficiaryResponse;

import java.util.List;

public interface BeneficiaryService {
    BeneficiaryResponse add(BeneficiaryRequest request);
    List<BeneficiaryResponse> list();
    void remove(Long id);
}
