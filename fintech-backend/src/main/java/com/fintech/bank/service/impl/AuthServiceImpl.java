package com.fintech.bank.service.impl;

import com.fintech.bank.dto.request.LoginRequest;
import com.fintech.bank.dto.request.SignupRequest;
import com.fintech.bank.dto.response.AuthResponse;
import com.fintech.bank.entity.User;
import com.fintech.bank.enums.Role;
import com.fintech.bank.exception.DuplicateResourceException;
import com.fintech.bank.repository.UserRepository;
import com.fintech.bank.security.JwtService;
import com.fintech.bank.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // never store plaintext
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);
        return AuthResponse.builder()
                .token(token).tokenType("Bearer")
                .username(user.getUsername()).role(user.getRole().name())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException (-> 401) if auth fails.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        return AuthResponse.builder()
                .token(token).tokenType("Bearer")
                .username(user.getUsername()).role(user.getRole().name())
                .build();
    }
}
