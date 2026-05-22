package com.fintech.bank.service;

import com.fintech.bank.kafka.NotificationEvent;

public interface NotificationService {
    void notifyTransaction(NotificationEvent event);
}
