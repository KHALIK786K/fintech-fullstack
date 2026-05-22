package com.fintech.bank.enums;

/**
 * Lifecycle of a transaction.
 * INITIATED -> validations passed, funds not yet moved.
 * PROCESSING -> queued (NEFT batch) or mid-settlement.
 * SUCCESS    -> funds debited from source and credited to destination.
 * FAILED     -> rolled back; no net balance change.
 * FLAGGED    -> held by fraud module for manual review.
 */
public enum TransactionStatus {
    INITIATED,
    PROCESSING,
    SUCCESS,
    FAILED,
    FLAGGED
}
