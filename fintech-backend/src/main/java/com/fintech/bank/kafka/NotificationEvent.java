package com.fintech.bank.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/** Message published when a transaction completes, consumed by the notification module. */
@Data @NoArgsConstructor @AllArgsConstructor
public class NotificationEvent implements Serializable {
    private String txnReference;
    private String status;
    private String recipientEmail;
    private String message;
}
