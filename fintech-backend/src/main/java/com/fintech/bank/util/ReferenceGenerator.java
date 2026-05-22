package com.fintech.bank.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generates unique-ish identifiers.
 *
 * Transaction reference mimics a UTR (Unique Transaction Reference): a prefix for
 * the rail, the date, and a random suffix. The DB unique constraint on
 * txn_reference is the real guarantee of uniqueness; this just makes collisions
 * astronomically unlikely so we (almost) never have to retry.
 */
@Component
public class ReferenceGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String DIGITS = "0123456789";

    public String generateTxnReference(String railPrefix) {
        StringBuilder suffix = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            suffix.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        }
        return railPrefix + LocalDate.now().format(DATE_FMT) + suffix;
    }

    /** 12-digit account number. */
    public String generateAccountNumber() {
        StringBuilder sb = new StringBuilder();
        // First digit non-zero so length is stable.
        sb.append(1 + RANDOM.nextInt(9));
        for (int i = 0; i < 11; i++) {
            sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }
}
