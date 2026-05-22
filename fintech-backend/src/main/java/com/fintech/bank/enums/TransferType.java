package com.fintech.bank.enums;

/**
 * Payment rails supported by the system.
 * RTGS = Real Time Gross Settlement (high-value, settled individually & immediately).
 * NEFT = National Electronic Funds Transfer (any value, settled in deferred batches).
 */
public enum TransferType {
    RTGS,
    NEFT
}
