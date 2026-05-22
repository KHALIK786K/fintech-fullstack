package com.fintech.bank.service.impl;

import com.fintech.bank.service.BeneficiaryService;
import com.fintech.bank.dto.request.BeneficiaryRequest;
import com.fintech.bank.dto.response.BeneficiaryResponse;
import com.fintech.bank.entity.Beneficiary;
import com.fintech.bank.entity.User;
import com.fintech.bank.exception.DuplicateResourceException;
import com.fintech.bank.exception.ResourceNotFoundException;
import com.fintech.bank.mapper.BeneficiaryMapper;
import com.fintech.bank.repository.BeneficiaryRepository;
import com.fintech.bank.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final BeneficiaryMapper beneficiaryMapper;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional
    public BeneficiaryResponse add(BeneficiaryRequest request) {
        User owner = securityUtil.getCurrentUser();
        if (beneficiaryRepository.existsByOwnerIdAndAccountNumber(owner.getId(), request.getAccountNumber())) {
            throw new DuplicateResourceException("Beneficiary with this account already exists");
        }
        Beneficiary b = Beneficiary.builder()
                .name(request.getName())
                .accountNumber(request.getAccountNumber())
                .ifscCode(request.getIfscCode())
                .bankName(request.getBankName())
                .owner(owner)
                .verified(true)
                .build();
        return beneficiaryMapper.toResponse(beneficiaryRepository.save(b));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> list() {
        User owner = securityUtil.getCurrentUser();
        return beneficiaryRepository.findByOwnerId(owner.getId())
                .stream().map(beneficiaryMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public void remove(Long id) {
        User owner = securityUtil.getCurrentUser();
        Beneficiary b = beneficiaryRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found: " + id));
        beneficiaryRepository.delete(b);
    }
}