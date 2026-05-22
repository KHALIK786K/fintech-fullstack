package com.fintech.bank.kafka;

import com.fintech.bank.config.KafkaConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes notification events and "delivers" them (simulated). In production this
 * would call an email/SMS provider. Decoupling via Kafka means a slow provider
 * never blocks the transfer transaction.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.kafka.enabled", havingValue = "true")
public class NotificationConsumer {

    @KafkaListener(topics = KafkaConfig.NOTIFICATION_TOPIC, groupId = "notification-group")
    public void consume(NotificationEvent event) {
        log.info("[KAFKA CONSUMER] Delivering notification for txn {} -> {} ({})",
                event.getTxnReference(), event.getRecipientEmail(), event.getStatus());
    }
}
