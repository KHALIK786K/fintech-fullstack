package com.fintech.bank.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Topic definitions. Gated on app.kafka.enabled so local runs without a broker
 * still start cleanly. When enabled, Spring auto-creates the topic on startup.
 */
@Configuration
@ConditionalOnProperty(name = "app.kafka.enabled", havingValue = "true")
public class KafkaConfig {

    public static final String NOTIFICATION_TOPIC = "txn-notifications";

    @Bean
    public NewTopic notificationTopic() {
        return TopicBuilder.name(NOTIFICATION_TOPIC).partitions(1).replicas(1).build();
    }
}
