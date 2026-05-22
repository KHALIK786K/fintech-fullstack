package com.fintech.bank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/** Generic success message wrapper for endpoints that don't return an entity. */
@Data @AllArgsConstructor
public class ApiMessage {
    private String message;
}
