package com.fintech.bank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Append-only audit trail. Written by an HTTP filter/interceptor for every
 * mutating API call. In regulated fintech this is mandatory for forensics and
 * compliance (who did what, when, from where).
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "username"),
        @Index(name = "idx_audit_ts", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String username;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(length = 255)
    private String path;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "client_ip", length = 45)
    private String clientIp;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(nullable = false)
    private Instant timestamp;
}
