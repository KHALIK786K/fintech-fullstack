package com.fintech.bank.controller;

import com.fintech.bank.dto.request.BeneficiaryRequest;
import com.fintech.bank.dto.response.ApiMessage;
import com.fintech.bank.dto.response.BeneficiaryResponse;
import com.fintech.bank.service.BeneficiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
@Tag(name = "Beneficiaries", description = "Manage saved payees")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @Operation(summary = "Add a beneficiary")
    @PostMapping
    public ResponseEntity<BeneficiaryResponse> add(@Valid @RequestBody BeneficiaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(beneficiaryService.add(request));
    }

    @Operation(summary = "List my beneficiaries")
    @GetMapping
    public ResponseEntity<List<BeneficiaryResponse>> list() {
        return ResponseEntity.ok(beneficiaryService.list());
    }

    @Operation(summary = "Remove a beneficiary")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiMessage> remove(@PathVariable Long id) {
        beneficiaryService.remove(id);
        return ResponseEntity.ok(new ApiMessage("Beneficiary removed"));
    }
}
