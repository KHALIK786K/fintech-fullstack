# FinTech Banking Application — RTGS & NEFT Payment System

An enterprise-style Spring Boot banking backend that simulates realistic fintech
payment workflows: JWT-secured accounts, RTGS (instant) and NEFT (batch) money
transfers, fraud controls, idempotency, audit logging, and async notifications.

> **Build status note:** this project was generated and reviewed file-by-file but
> **not compiled in the authoring environment** (no Maven Central access there).
> The very first `mvn` command below performs the real compile on your machine.
> If anything fails to resolve, it will be a dependency download, not missing code.

---

## 1. Tech stack

| Concern        | Choice                                  |
|----------------|-----------------------------------------|
| Language       | Java 17                                 |
| Framework      | Spring Boot 3.2.5                        |
| Security       | Spring Security + JWT (jjwt 0.12.5)     |
| Persistence    | Spring Data JPA / Hibernate             |
| Database       | H2 (default, zero-setup) or MySQL 8     |
| Build          | Maven                                   |
| Boilerplate    | Lombok                                  |
| Docs           | springdoc-openapi (Swagger UI)          |
| Testing        | JUnit 5 + Mockito + AssertJ             |
| Async (opt.)   | Kafka                                   |
| Cache (opt.)   | Redis                                   |
| Containers     | Docker Compose (MySQL + Kafka + Redis)  |

Kafka and Redis are **optional** and **off by default** so the app boots with no
external infrastructure.

---

## 2. Quick start (H2, zero setup)

Requires JDK 17+ and Maven.

```bash
# from the project root (where pom.xml lives)
mvn spring-boot:run
```

That's it. The app starts on **http://localhost:8080** with an in-memory H2
database, auto-generated schema, and seeded sample data.

- Swagger UI:  http://localhost:8080/swagger-ui.html
- H2 console:  http://localhost:8080/h2-console
  (JDBC URL `jdbc:h2:mem:fintechbank`, user `sa`, empty password)

### Seeded logins

| Username | Password     | Role     | Account        | Balance     |
|----------|--------------|----------|----------------|-------------|
| alice    | Password123  | CUSTOMER | 100000000001   | 5,000,000   |
| bob      | Password123  | CUSTOMER | 100000000002   | 1,000,000   |
| admin    | Admin123     | ADMIN    | —              | —           |

Passwords are hashed at startup by `DataSeeder` using the real `PasswordEncoder`,
so these logins are guaranteed to work.

---

## 3. Try it end-to-end (curl)

```bash
# 1) Login -> capture token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"Password123"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')

# 2) RTGS transfer (must be >= 200000)
curl -s -X POST http://localhost:8080/api/transfers/rtgs \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"sourceAccountNumber":"100000000001","destAccountNumber":"100000000002",
       "destIfsc":"FINB0001234","amount":300000,"remarks":"Rent",
       "idempotencyKey":"rtgs-demo-001"}'

# 3) Repeat the SAME request -> idempotent: returns the original txn, no double charge

# 4) History
curl -s "http://localhost:8080/api/transactions/account/100000000001" \
  -H "Authorization: Bearer $TOKEN"
```

A Postman collection (`postman_collection.json`) is included; the Login request
auto-stores the token for every other request.

---

## 4. Running tests

```bash
mvn test
```

Includes Mockito unit tests for the transfer engine (idempotency, RTGS minimum,
insufficient funds, successful debit) and the auth service (duplicate username).

---

## 5. Running on MySQL

Start MySQL (or use the included compose file), then activate the `mysql` profile:

```bash
docker compose up -d mysql           # optional: containerized MySQL on :3306
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

The `mysql` profile (`application-mysql.properties`) connects to
`jdbc:mysql://localhost:3306/fintechbank` as `root/root` and uses
`ddl-auto=update`. A hand-written reference schema is in
`src/main/resources/db/schema.sql`.

---

## 6. Enabling Kafka & Redis (optional)

```bash
docker compose up -d                 # MySQL + Redis + Kafka + Zookeeper
mvn spring-boot:run \
  -Dspring-boot.run.profiles=mysql \
  -Dspring-boot.run.arguments=--app.kafka.enabled=true
```

With Kafka enabled, transaction notifications are published to the
`txn-notifications` topic and delivered by `NotificationConsumer`. With it
disabled, the same notifications are logged (simulated email/SMS). **This is the
most likely spot to need tuning** — if the broker isn't ready, set
`app.kafka.enabled=false` and the app behaves identically minus the async hop.

---

## 7. Architecture

```
controller  -> REST endpoints, validation, HTTP status mapping
service     -> business logic (interfaces) + impl/ (implementations)
repository  -> Spring Data JPA interfaces (incl. pessimistic-lock query)
entity      -> JPA @Entity domain model (BaseEntity adds auditing)
dto         -> request/ + response/ (never expose entities directly)
mapper      -> entity <-> DTO translation
security    -> JWT issue/validate, filter, UserDetails, SecurityConfig
config      -> OpenAPI, Kafka, WebMvc, audit interceptor, data seeder
exception   -> custom exceptions + GlobalExceptionHandler (@RestControllerAdvice)
scheduler   -> NEFT batch settlement job
kafka       -> event payload, producer (in service), consumer
util        -> reference / account-number generation
enums       -> Role, TransferType, TransactionStatus, AccountStatus
```

Design principles applied: **SOLID** (service interfaces decouple controllers
from implementations; single-responsibility classes), **clean layering** (no
business logic in controllers, no web concerns in services), and **DTO isolation**
(entities never cross the HTTP boundary).

---

## 8. FinTech concepts (and where they live in the code)

**RTGS (Real Time Gross Settlement)** — high-value transfers settled
*individually* and *immediately* with finality. In `TransferServiceImpl`, RTGS
debits the source and credits an internal destination within the same
transaction, then marks the txn `SUCCESS`. A minimum amount is enforced
(`app.rtgs.min-amount`), mirroring RTGS being a high-value rail.

**NEFT (National Electronic Funds Transfer)** — any-value transfers settled in
*deferred batches*. NEFT transfers reserve (debit) funds immediately but stay in
`PROCESSING`; `NeftBatchScheduler` periodically calls `processNeftBatch()` to
settle the queue, simulating NEFT's half-hourly settlement windows.

**Settlement process** — the act of finalizing fund movement between parties.
RTGS settles per-transaction in real time; NEFT settles per-batch.

**Transaction lifecycle** — `INITIATED -> PROCESSING -> SUCCESS | FAILED`, with
`FLAGGED` for fraud holds. Modeled by the `TransactionStatus` enum and driven
through `TransferServiceImpl`.

**ACID transactions** — each transfer runs inside one `@Transactional` unit.
*Atomicity*: a failure rolls back the debit so money is never lost or created.
*Consistency*: balances and txn records always agree. *Isolation*: see locking
below. *Durability*: committed rows persist.

**Idempotency** — clients send an `idempotencyKey`. A unique DB constraint plus a
pre-check guarantee a retried request (e.g., after a timeout) returns the original
result instead of transferring twice. This is the core defense against duplicate
payments.

**Concurrency / isolation** — the source account is loaded with
`PESSIMISTIC_WRITE` (`SELECT ... FOR UPDATE`) via `findByIdForUpdate`, serializing
concurrent debits on the same account so the balance can't be overdrawn by a race.
`@Version` on `Account` adds optimistic-locking as a second safety net.

**Money representation** — balances and amounts use `BigDecimal` (never
`double`/`float`), because binary floating point cannot represent decimal currency
exactly.

**Reconciliation** — every movement is an auditable `Transaction` row with a
unique reference; summing successful debits/credits per account reproduces the
balance, which is the basis of reconciliation. `TransactionRepository` exposes the
aggregate queries this needs.

**Distributed transaction concepts** — true cross-bank settlement spans systems
you can't wrap in a single DB transaction. The realistic pattern is
*eventual consistency* via events: here NEFT's queue + batch settlement and the
Kafka notification flow illustrate decoupling a long-running/external step from
the synchronous request. (A production design would add an outbox + saga.)

**Payment gateway architecture** — clients hit a secured API layer, which
validates, runs fraud checks, moves funds atomically, and emits events for
downstream consumers (notifications, ledgers). This project mirrors that shape.

**Banking security best practices** — BCrypt-hashed passwords, stateless JWT auth,
role-based access, per-request audit logging, input validation at the edge,
ownership checks (a user can only act on their own accounts), and never exposing
entities directly.

---

## 9. API reference

All endpoints except `/api/auth/**`, Swagger, and the H2 console require
`Authorization: Bearer <token>`.

| Method | Path                                      | Description                          | Success |
|--------|-------------------------------------------|--------------------------------------|---------|
| POST   | /api/auth/signup                          | Register, returns JWT                | 201     |
| POST   | /api/auth/login                           | Login, returns JWT                   | 200     |
| POST   | /api/accounts                             | Open an account                      | 201     |
| GET    | /api/accounts                             | List my accounts                     | 200     |
| GET    | /api/accounts/{accountNumber}             | Account detail + balance             | 200     |
| POST   | /api/beneficiaries                        | Add beneficiary                      | 201     |
| GET    | /api/beneficiaries                        | List beneficiaries                   | 200     |
| DELETE | /api/beneficiaries/{id}                   | Remove beneficiary                   | 200     |
| POST   | /api/transfers/rtgs                       | RTGS transfer (instant)              | 201     |
| POST   | /api/transfers/neft                       | NEFT transfer (queued)               | 202     |
| GET    | /api/transactions/{reference}             | Transaction status                   | 200     |
| GET    | /api/transactions/account/{accountNumber} | Paginated history                    | 200     |

### Sample request/response — RTGS

Request `POST /api/transfers/rtgs`:
```json
{
  "sourceAccountNumber": "100000000001",
  "destAccountNumber": "100000000002",
  "destIfsc": "FINB0001234",
  "amount": 300000,
  "remarks": "Rent",
  "idempotencyKey": "rtgs-demo-001"
}
```
Response `201 Created`:
```json
{
  "txnReference": "RTGS20260522XXXXXXXXXX",
  "sourceAccountNumber": "100000000001",
  "destAccountNumber": "100000000002",
  "destIfsc": "FINB0001234",
  "amount": 300000,
  "transferType": "RTGS",
  "status": "SUCCESS",
  "remarks": "Rent",
  "failureReason": null,
  "createdAt": "2026-05-22T10:15:30Z"
}
```

### Error shape (all handled errors)
```json
{
  "timestamp": "2026-05-22T10:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "RTGS minimum transfer amount is 200000",
  "path": "/api/transfers/rtgs",
  "fieldErrors": null
}
```

HTTP status mapping: 400 (validation / bad request / insufficient funds),
401 (bad credentials / missing token), 403 (access denied), 404 (not found),
409 (duplicate resource), 422 (fraud rule rejection), 500 (unexpected).

---

## 10. Configuration knobs (`application.properties`)

| Property                              | Default   | Meaning                              |
|---------------------------------------|-----------|--------------------------------------|
| app.jwt.secret                        | (dev key) | HMAC signing key — **change in prod**|
| app.jwt.expiration-ms                 | 3600000   | Token lifetime (1h)                  |
| app.rtgs.min-amount                   | 200000    | RTGS minimum transfer                |
| app.fraud.daily-limit                 | 1000000   | Per-account daily debit cap          |
| app.fraud.duplicate-window-seconds    | 60        | Duplicate-detection window           |
| app.neft.batch-interval-ms            | 30000     | NEFT batch scheduler interval        |
| app.kafka.enabled                     | false     | Toggle async notifications           |

---

## 11. Known limitations (honest list)

- Not compiled in the authoring environment; first build happens on your machine.
- Cross-bank settlement is simulated — external payees aren't actually credited
  (only internal destination accounts are), as a single DB can't span banks.
- MapStruct is on the classpath but the mappers are hand-written for readability.
- Redis is wired as a dependency but the idempotency store uses the database; the
  Redis hooks are left as an extension point.
- Fraud rules are deterministic thresholds, not ML scoring.
