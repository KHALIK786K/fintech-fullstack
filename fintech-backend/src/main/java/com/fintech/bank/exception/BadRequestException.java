package com.fintech.bank.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
