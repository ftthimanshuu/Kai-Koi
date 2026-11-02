# 🏗️ Kai Koi — System Architecture Overview
## Modern Movie Ticket Management & Real-Time Booking Platform

> ✅ **DECISIONS LOCKED** — Architecture updated for Movie Ticket Booking + Supabase Auth & Database.  
> **Last updated:** November 2026

---

## High-Level Architecture

```
                          ┌──────────────────────────────┐
                          │         BROWSER              │
                          │   React 18 + TypeScript      │
                          │   Tailwind CSS + shadcn/ui   │
                          │   Supabase JS SDK (@supabase)│
                          └──────────┬──────────┬────────┘
                                     │ REST     │ WebSocket
                                     │ (HTTP)   │ (STOMP)
                          ┌──────────▼──────────▼─────────┐
                          │        BACKEND                │
                          │   Java 17 + Spring Boot 3.3   │
                          │   Supabase JWT Auth Filter    │
                          │   REST Controllers            │
                          │   WebSocket / STOMP Broker    │
                          │   Redis Seat-Hold Engine      │
                          │   Razorpay Service            │
                          └────┬───────────┬─────────┬────┘
                               │           │         │
              ┌────────────────▼──┐  ┌─────▼─────┐ ┌─▼────────────────┐
              │     Supabase      │  │   Redis   │ │  Supabase Auth   │
              │    PostgreSQL     │  │(Seat Hold │ │ (Token Issue /   │
              │ Flyway Migrations │  │ & Expiry) │ │  OAuth / User)   │
              └───────────────────┘  └───────────┘ └──────────────────┘
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
- **Styling:** Tailwind CSS + shadcn/ui components (Cinematic dark theme)
- **State:** TanStack Query (server state & caching) + Zustand (client seat selection & checkout timer)
- **WebSocket:** STOMP client (`@stomp/stompjs`) for real-time seat map synchronization
- **Auth:** Supabase JS SDK (`@supabase/supabase-js`) for login/signup; passes Supabase JWT to backend via `Authorization: Bearer <token>`

### Backend (Dev 1 + Dev 2)
- **Framework:** Java 17 + Spring Boot 3.3.x
- **API:** REST controllers + Spring WebSocket (STOMP broker)
- **Auth:** Spring Security OAuth2 Resource Server validating Supabase JWT signatures via JWKS or JWT secret
- **DB Access:** Spring Data JPA + Hibernate connecting via JDBC to Supabase PostgreSQL
- **Migrations:** Flyway (versioned SQL migration files)
- **Payments:** Razorpay Java SDK + Webhook signature verification

### Redis
- **Purpose:** Distributed seat hold storage with atomic locking and auto-expiry TTL
- **Client:** Spring Data Redis (Lettuce)
- **Key pattern:** `seat_hold:{showtimeId}:{seatId}` $\rightarrow$ value: `userId`, TTL: 10 minutes (600s)
- **Keyspace notifications:** `notify-keyspace-events=Ex` enabled on Redis; triggers Spring listener on key expiration to broadcast `AVAILABLE` to all WebSocket subscribers

### Database (Supabase PostgreSQL)
- **Engine:** PostgreSQL 15+ hosted on Supabase
- **Migrations:** Managed exclusively by Flyway
- **Tables:** `movies`, `screens`, `sections`, `seats`, `showtimes`, `showtime_pricing`, `bookings`, `tickets`, `payments`, `refunds`, `users`

---

## Request Lifecycle — Booking a Movie Ticket

```
1. Customer opens seat map for a movie showtime
   → GET /api/showtimes/{id}/seats               (REST — initial full seat map)
   → WS  SUBSCRIBE /topic/showtimes/{id}/seats   (WebSocket — live seat deltas)

2. Customer selects seats → clicks "Proceed to Pay"
   → POST /api/bookings/hold                     (REST — lock seats for 10 min)
   ← Backend locks keys in Redis (SET ... NX EX 600)
   ← Backend broadcasts HELD status via WebSocket to all viewers
   ← Returns: holdId, heldUntil, totalAmount

3. Backend creates Razorpay order
   → POST /api/payments/create-order             (REST)
   ← Returns: razorpayOrderId, amount, keyId

4. Frontend opens Razorpay checkout modal
   → Customer completes UPI / Card payment in Razorpay modal

5. Razorpay calls server webhook (redundant callback)
   → POST /api/payments/webhook                  (from Razorpay servers)
   ← Backend verifies HMAC-SHA256 signature
   ← Backend persists Booking (CONFIRMED) + Tickets in Supabase PostgreSQL
   ← Backend removes Redis seat_hold keys
   ← Backend broadcasts BOOKED status via WebSocket to all viewers

6. Frontend confirms booking
   → POST /api/bookings/confirm                  (REST — with payment details)
   ← Backend returns booking detail + QR code digital ticket
```

---

## Backend Domain Split

```
com.kaikoi/
  ├── auth/           ← Supabase JWT filter, User sync, SecurityConfig    [Dev 1]
  ├── booking/        ← Redis SeatHold, confirm, cancel, my-bookings      [Dev 1]
  ├── payment/        ← Razorpay order creation, webhook, refund          [Dev 1]
  ├── cinema/         ← Screen, Section, Seat configuration & layout      [Dev 2]
  ├── movie/          ← Movie catalog, genres, posters, censor ratings    [Dev 2]
  ├── showtime/       ← Showtime scheduling, dynamic section pricing      [Dev 2]
  ├── websocket/      ← STOMP broker config, seat broadcasts, Redis sync  [Dev 2]
  └── common/         ← Shared exceptions, DTOs, configs, utils           [Both]
```

---

## Technology Decisions

| Decision | Choice | Status | Reason |
|---|---|---|---|
| Domain Scope | Movies Only | ✅ Final | Focused MVP, avoids multi-vertical complexity |
| Frontend build tool | Vite (React 18 + TS) | ✅ Final | Fast dev server, strict typing |
| UI Components | shadcn/ui + Tailwind | ✅ Final | Accessible, composable, dark-mode cinema aesthetic |
| Backend framework | Spring Boot 3.3.x | ✅ Final | High concurrency, type-safe, enterprise ecosystem |
| Database | Supabase (PostgreSQL 15+) | ✅ Final | Managed PostgreSQL with automated backups & dashboards |
| Database migrations | Flyway | ✅ Final | Version-controlled, immutable schema migrations |
| Auth provider | Supabase Auth | ✅ Final | Handles Email/Password + Google OAuth with standard JWTs |
| In-memory locks | Redis (TTL keys) | ✅ Final | Atomic `NX EX`, zero DB bloat, Keyspace expiry triggers |
| Real-time push | STOMP over WebSocket | ✅ Final | Efficient pub-sub channels to seat-map clients |
| Payment Gateway | Razorpay (INR) | ✅ Final | Standard Indian gateway, instant UPI, test mode |
| Primary keys | UUID | ✅ Final | Cryptographically random, URL safe, non-guessable |
