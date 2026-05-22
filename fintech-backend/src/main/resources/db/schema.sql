-- ============================================================================
-- Reference DDL (MySQL dialect). For the default H2 run, Hibernate generates
-- the schema automatically; this file documents the production schema and can
-- be applied manually to MySQL if you set ddl-auto=none.
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    password      VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL,
    full_name     VARCHAR(120),
    role          VARCHAR(20)  NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS accounts (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number       VARCHAR(20)  NOT NULL,
    ifsc_code            VARCHAR(11)  NOT NULL,
    account_holder_name  VARCHAR(120) NOT NULL,
    balance              DECIMAL(19,4) NOT NULL DEFAULT 0,
    status               VARCHAR(20)  NOT NULL,
    owner_id             BIGINT       NOT NULL,
    version              BIGINT,
    created_at           TIMESTAMP    NOT NULL,
    updated_at           TIMESTAMP    NOT NULL,
    CONSTRAINT uk_accounts_number UNIQUE (account_number),
    CONSTRAINT fk_accounts_owner  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    account_number  VARCHAR(20)  NOT NULL,
    ifsc_code       VARCHAR(11)  NOT NULL,
    bank_name       VARCHAR(120),
    owner_id        BIGINT       NOT NULL,
    verified        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL,
    updated_at      TIMESTAMP    NOT NULL,
    CONSTRAINT uk_beneficiary_owner_acct UNIQUE (owner_id, account_number),
    CONSTRAINT fk_beneficiary_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    txn_reference        VARCHAR(32)  NOT NULL,
    idempotency_key      VARCHAR(80)  NOT NULL,
    source_account_id    BIGINT       NOT NULL,
    dest_account_number  VARCHAR(20)  NOT NULL,
    dest_ifsc            VARCHAR(11)  NOT NULL,
    amount               DECIMAL(19,4) NOT NULL,
    transfer_type        VARCHAR(10)  NOT NULL,
    status               VARCHAR(15)  NOT NULL,
    remarks              VARCHAR(255),
    failure_reason       VARCHAR(255),
    created_at           TIMESTAMP    NOT NULL,
    updated_at           TIMESTAMP    NOT NULL,
    CONSTRAINT uk_txn_reference   UNIQUE (txn_reference),
    CONSTRAINT uk_txn_idempotency UNIQUE (idempotency_key),
    CONSTRAINT fk_txn_source FOREIGN KEY (source_account_id) REFERENCES accounts(id)
);
CREATE INDEX idx_txn_source ON transactions (source_account_id);
CREATE INDEX idx_txn_status ON transactions (status);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50),
    http_method  VARCHAR(10),
    path         VARCHAR(255),
    status_code  INT,
    client_ip    VARCHAR(45),
    duration_ms  BIGINT,
    timestamp    TIMESTAMP    NOT NULL
);
CREATE INDEX idx_audit_user ON audit_logs (username);
CREATE INDEX idx_audit_ts   ON audit_logs (timestamp);
