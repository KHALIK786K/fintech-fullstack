package com.fintech.bank.service.impl;

import com.fintech.bank.config.KafkaConfig;
import com.fintech.bank.kafka.NotificationEvent;
import com.fintech.bank.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Simulated notification dispatch.
 * - If Kafka is enabled, publishes a NotificationEvent (async, decoupled).
 * - Otherwise logs a simulated email/SMS, so the feature works with zero infra.
 *
 * KafkaTemplate is optional (required = false) so the bean isn't mandatory when
 * Kafka is disabled.
 */
@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    @Value("${app.kafka.enabled:false}")
    private boolean kafkaEnabled;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void notifyTransaction(NotificationEvent event) {
        if (kafkaEnabled && kafkaTemplate != null) {
            kafkaTemplate.send(KafkaConfig.NOTIFICATION_TOPIC, event.getTxnReference(), event);
            log.info("Published notification event to Kafka for txn {}", event.getTxnReference());
        } else {
            // Simulated channel
            log.info("[SIMULATED NOTIFICATION] to={} | txn={} | status={} | {}",
                    event.getRecipientEmail(), event.getTxnReference(),
                    event.getStatus(), event.getMessage());
        }
    }
}
