package com.fintech.bank.config;

import com.fintech.bank.entity.Account;
import com.fintech.bank.entity.User;
import com.fintech.bank.enums.Role;
import com.fintech.bank.repository.AccountRepository;
import com.fintech.bank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Seeds sample data on startup for easy testing. Passwords are hashed with the
 * real PasswordEncoder here (not a hardcoded hash), so the seeded logins are
 * guaranteed to work. Disabled in the 'prod' profile.
 *
 * Seeded credentials:
 *   alice / Password123   (customer) — owns account with opening balance 5,000,000
 *   bob   / Password123   (customer) — owns account with opening balance 1,000,000
 *   admin / Admin123      (admin)
 */
@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername("alice")) {
            return; // already seeded
        }

        User alice = save("alice", "Password123", "alice@example.com", "Alice Customer", Role.ROLE_CUSTOMER);
        User bob   = save("bob",   "Password123", "bob@example.com",   "Bob Customer",   Role.ROLE_CUSTOMER);
        save("admin", "Admin123", "admin@example.com", "System Admin", Role.ROLE_ADMIN);

        openAccount(alice, "100000000001", new BigDecimal("5000000.0000"));
        openAccount(bob,   "100000000002", new BigDecimal("1000000.0000"));

        log.info("Seeded sample users (alice/bob/admin) and 2 accounts.");
    }

    private User save(String username, String rawPassword, String email, String fullName, Role role) {
        return userRepository.save(User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .email(email)
                .fullName(fullName)
                .role(role)
                .enabled(true)
                .build());
    }

    private void openAccount(User owner, String number, BigDecimal balance) {
        accountRepository.save(Account.builder()
                .accountNumber(number)
                .ifscCode("FINB0001234")
                .accountHolderName(owner.getFullName())
                .balance(balance)
                .owner(owner)
                .build());
    }
}
