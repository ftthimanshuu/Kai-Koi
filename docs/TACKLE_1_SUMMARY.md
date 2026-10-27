# 📋 Tackle #1 — Foundation & Skeleton Summary

> **Commit:** `3532f91` | **Branch:** `develop` | **Status:** ✅ Complete & Verified

---

## 1. Local Environment & Infrastructure

- **[`docker-compose.yml`](file:///d:/Projects/Kai%20Koi/docker-compose.yml)**:
  - **PostgreSQL 15**: Running on port `5432:5432`, database `kaikoi_db`, user `kaikoi`, password `kaikoisecret` with a persistent docker volume.
  - **Redis 7**: Running on port `6379:6379` with `--notify-keyspace-events Ex` enabled (for automatic WebSocket seat-hold release when 10-minute TTL expires).
  - **Command to run**:
    ```bash
    docker compose up -d
    ```
- **[`.env.example`](file:///d:/Projects/Kai%20Koi/.env.example)**:
  - Template environment file containing default local connection strings for DB, Redis, Firebase, and Razorpay.

---

## 2. Spring Boot 3.3.5 Backend Skeleton

- **[`backend/pom.xml`](file:///d:/Projects/Kai%20Koi/backend/pom.xml)**:
  - Java 17 + Spring Boot 3.3.5
  - Lombok 1.18.36 with compiler plugin annotation processor
  - Web (`spring-boot-starter-web`)
  - WebSocket (`spring-boot-starter-websocket` with STOMP)
  - Data JPA (`spring-boot-starter-data-jpa` + `postgresql`)
  - Flyway (`flyway-core` + `flyway-database-postgresql`)
  - Redis (`spring-boot-starter-data-redis` with Lettuce)
  - Security (`spring-boot-starter-security`)
  - Validation (`spring-boot-starter-validation`)
- **Maven Wrapper**:
  - `backend/mvnw` and `backend/mvnw.cmd` included so developers don't need Maven pre-installed.
  - Run via:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```

---

## 3. Configuration & Core Architecture

All shared configuration is set up in `backend/src/main/java/com/kaikoi/common/`:

| Component | File | Responsibility |
|---|---|---|
| **CORS** | [`CorsConfig.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/config/CorsConfig.java) | Allows frontend access from `http://localhost:5173` (Vite) |
| **Security** | [`SecurityConfig.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/config/SecurityConfig.java) | Stateless REST security filter chain; permits `/api/health`, `/api/sessions/**`, `/ws/**` |
| **Redis** | [`RedisConfig.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/config/RedisConfig.java) | `StringRedisTemplate` & `RedisMessageListenerContainer` for seat holds |
| **WebSocket** | [`WebSocketConfig.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/config/WebSocketConfig.java) | STOMP message broker with `/topic` and `/queue` prefixes; endpoint `/ws` |
| **Health Check** | [`HealthController.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/controller/HealthController.java) | `GET /api/health` returning `{"status": "UP"}` |
| **Standard Error** | [`ErrorResponse.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/dto/ErrorResponse.java) | Adheres strictly to `docs/API.md` error response contract |
| **Global Handler** | [`GlobalExceptionHandler.java`](file:///d:/Projects/Kai%20Koi/backend/src/main/java/com/kaikoi/common/exception/GlobalExceptionHandler.java) | `@RestControllerAdvice` catching validation, 404, 409 conflict, and 500 errors |

---

## 4. Backend Domain Package Layout

```
backend/src/main/java/com/kaikoi/
├── KaiKoiApplication.java
├── common/        # Shared DTOs, configs, exceptions, and health controller
├── auth/          # Dev 1: Firebase Auth & User sync (POST /api/auth/sync)
├── venue/         # Dev 2: Venues, Layouts, Sections, Seats
├── session/       # Dev 2: Sessions, Timetables, Dynamic Pricing
├── booking/       # Dev 1: Redis HoldService & PostgreSQL Bookings
└── payment/       # Dev 1: Razorpay Integration & Webhook Handling
```

---

## 5. Verification Status

- **Maven Compile**: `BUILD SUCCESS` (0 compilation errors).
- **Unit Tests**: `BUILD SUCCESS` (tests passed).
- **Git**: Pushed to `origin/develop`.
