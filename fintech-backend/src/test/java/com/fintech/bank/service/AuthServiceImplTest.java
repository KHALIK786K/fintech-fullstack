package com.fintech.bank.service;

import com.fintech.bank.dto.request.SignupRequest;
import com.fintech.bank.exception.DuplicateResourceException;
import com.fintech.bank.repository.UserRepository;
import com.fintech.bank.security.JwtService;
import com.fintech.bank.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsService userDetailsService;

    @InjectMocks AuthServiceImpl authService;

    @Test
    void signup_withTakenUsername_throwsDuplicate() {
        SignupRequest req = new SignupRequest();
        req.setUsername("alice");
        req.setPassword("Password123");
        req.setEmail("alice@example.com");
        req.setFullName("Alice");

        when(userRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(req))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username");
    }
}
