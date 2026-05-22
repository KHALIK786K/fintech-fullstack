package com.fintech.bank.exception;

/** Thrown when the fraud module blocks a transfer (limit breach, duplicate, etc.). */
public class FraudCheckException extends RuntimeException {
    public FraudCheckException(String message) { super(message); }
}
