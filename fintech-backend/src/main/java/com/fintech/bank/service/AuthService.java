package com.fintech.bank.service;

import com.fintech.bank.dto.request.LoginRequest;
import com.fintech.bank.dto.request.SignupRequest;
import com.fintech.bank.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
}
