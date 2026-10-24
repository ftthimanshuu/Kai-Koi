# 🏗️ Kai Koi — System Architecture Overview

> ✅ DECISIONS LOCKED — Core stack finalized. Update only after team discussion.
> Last updated: 25 October 2026

---

## High-Level Architecture

```
                          ┌──────────────────────────────┐
                          │         BROWSER              │
                          │   React + TypeScript (Vite)  │
                          │   Tailwind CSS + shadcn/ui   │
                          └──────────┬──────────┬────────┘
                                     │ REST     │ WebSocket
                                     │ (HTTP)   │ (STOMP)
                          ┌──────────▼──────────▼─────────┐
                          │        BACKEND                │
                          │   Java 17 + Spring Boot       │
                          │   REST Controllers            │
                          │   WebSocket / STOMP Broker    │
                          │   Booking Engine              │
                          │   Payment Service             │
                          └────┬───────────┬─────────┬────┘
                               │           │         │
             ┌─────────────────▼──┐  ┌─────▼─────┐ ┌─▼────────────────┐
             │     PostgreSQL     │  │   Redis   │ │  Firebase Auth   │
             │   (Primary DB)     │  │(Seat Hold │ │  (Token Verify)  │
             │ Flyway Migrations  │  │ & Expiry) │ └──────────────────┘
             └────────────────────┘  └───────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Razorpay       │
                    │  (Payment Gateway)  │
                    │   Test Mode (INR)   │
                    └─────────────────────┘
```

---

## Component Responsibilities

### Frontend (Dev 3)
- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** TanStack Query (server state) + Zustand (client state — TBD)
- **WebSocket:** STOMP client (`@stomp/stompjs`) for real-time seat map
- **Auth:** Firebase SDK for login, passes ID token to backend via `Authorization` header

### Backend (Dev 1 + Dev 2)
- **Framework:** Java 17 + Spring Boot 3.x _(chosen intentionally to learn Spring Boot)_
- **API:** REST controllers + Spring WebSocket (STOMP) _(chosen intentionally to learn WebSocket/STOMP)_
- **Auth:** Spring Security filter that verifies Firebase ID tokens
- **DB Access:** Spring Data JPA + Hibernate
- **Migrations:** Flyway (versioned SQL migration files)
- **Payments:** Razorpay Java SDK + webhook handler

### Redis
- **Purpose:** Seat hold storage with automatic TTL expiry
- **Client:** Spring Data Redis (Lettuce)
- **Key pattern:** `seat_hold:{sessionId}:{seatId}` → value: `userId`, TTL: 10 minutes
- **Why Redis over DB table:** Keys auto-expire — no scheduled cleanup job needed. When a TTL fires, a Redis keyspace notification can trigger the WebSocket broadcast to release the seat.
- **Keyspace notifications:** Enable `notify-keyspace-events=Ex` on Redis server to listen for key expiry events in Spring

### Database
- **Engine:** PostgreSQL 15+
- **Migrations:** Managed by Flyway — no manual schema changes ever
- **Naming:** snake_case table and column names

---

## Request Lifecycle — Booking a Seat

```
1. User opens seat map
   → GET /api/sessions/{id}/seats                (REST — initial state)
   → WS  SUBSCRIBE /topic/session/{id}/seats     (WebSocket — live updates)

2. User selects seats → clicks "Proceed"
   → POST /api/bookings/hold                     (REST — lock seats for 10 min)
   ← Backend creates SeatHold rows in DB
   ← Backend broadcasts HELD status via WebSocket to all viewers
   ← Returns: holdId, heldUntil, totalAmount

3. Backend creates Razorpay order
   → POST /api/payments/create-order             (REST)
   ← Returns: razorpayOrderId, amount, keyId

4. Frontend opens Razorpay checkout modal
   → User completes payment in Razorpay UI

5. Razorpay calls our webhook (server-to-server)
   → POST /api/payments/webhook                  (from Razorpay servers)
   ← Backend verifies signature
   ← Backend creates Booking (CONFIRMED) + BookingItem rows
   ← Backend deletes SeatHold rows
   ← Backend broadcasts BOOKED status via WebSocket to all viewers

6. Frontend confirms booking
   → POST /api/bookings/confirm                  (REST — with payment IDs)
   ← Backend returns booking detail + QR code
```

---

## Backend Domain Split

```
com.kaikoi/
  ├── auth/           ← Firebase token filter, SecurityConfig     [Dev 1]
  ├── booking/        ← Hold, confirm, cancel, my-bookings        [Dev 1]
  ├── payment/        ← Razorpay order, webhook, refund           [Dev 1]
  ├── venue/          ← Venue, Layout, Section, Seat CRUD         [Dev 2]
  ├── session/        ← Session scheduling, pricing               [Dev 2]
  ├── websocket/      ← STOMP broker config, seat broadcasts      [Dev 2]
  ├── admin/          ← Admin-only controllers                    [Dev 2]
  └── common/         ← Shared exceptions, DTOs, utils            [Both]
```

---

## Technology Decisions (Proposed)

| Decision | Choice | Status | Reason |
|---|---|---|---|
| Frontend build tool | Vite | ✅ Final | Fast dev server, native TypeScript support |
| UI Components | shadcn/ui | ✅ Final | Accessible, composable, Tailwind-native |
| Backend framework | Spring Boot 3.x | ✅ Final | Intentional — learning Spring Boot on a real project |
| ORM | Spring Data JPA | ✅ Final | Standard with Spring, works well with PostgreSQL |
| DB migrations | Flyway | ✅ Final | SQL-first, version-controlled, team-safe |
| Auth | Firebase Auth | ✅ Final | Handles Google OAuth and email/password out of the box |
| Payments | Razorpay | ✅ Final | Indian payment gateway, good test mode |
| Real-time | STOMP over WebSocket | ✅ Final | Intentional — learning WebSocket/STOMP on a real project |
| Seat holds | Redis (TTL keys) | ✅ Final | Auto-expiry, no cleanup job, keyspace notifications for WS |
| Primary keys | UUID | ✅ Final | Avoids sequential ID guessing, safe to expose in URLs |

---

## Environment Configuration

### Backend (`src/main/resources/application.properties`)
```properties
# Server
server.port=8080

# Database
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# Redis
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}
spring.data.redis.password=${REDIS_PASSWORD:}

# Firebase
firebase.credentials.path=${FIREBASE_CREDENTIALS_PATH}

# Razorpay
razorpay.key.id=${RAZORPAY_KEY_ID}
razorpay.key.secret=${RAZORPAY_KEY_SECRET}
razorpay.webhook.secret=${RAZORPAY_WEBHOOK_SECRET}

# Seat Hold Duration (minutes)
booking.hold.duration.minutes=10
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## Open Questions for Team Discussion

- [ ] Do we use Docker Compose to spin up PostgreSQL + Redis locally for all devs? (Recommended)
- [ ] Do we set up a staging environment, or just local + production?
- [ ] What is our strategy for exposing the Razorpay webhook URL during local development? (ngrok)
- [ ] Do we add CORS configuration from Day 1? (Yes — frontend runs on port 5173, backend on 8080)
- [ ] Do we use Lombok in the backend to reduce boilerplate? (Recommended: Yes)
- [ ] Do we use MapStruct for entity ↔ DTO mapping, or write mappers manually?
- [ ] Enable Redis keyspace notifications (`notify-keyspace-events=Ex`) to auto-broadcast seat release on TTL expiry?
