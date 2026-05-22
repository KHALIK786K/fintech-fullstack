package com.fintech.bank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application entry point.
 * - @EnableJpaAuditing powers automatic createdAt/updatedAt on BaseEntity.
 * - @EnableScheduling powers the NEFT batch scheduler.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class BankApplication {
    public static void main(String[] args) {
        SpringApplication.run(BankApplication.class, args);
    }
}
