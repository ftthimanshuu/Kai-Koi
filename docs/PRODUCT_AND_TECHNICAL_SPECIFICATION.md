# 🎬 Kai Koi — Product & Technical Specification
## Modern Real-Time Movie Ticket Booking & Management Platform

> **Status:** ✅ Active & Finalized  
> **Last Updated:** November 2026  
> **Scope:** Movie Ticket Management & Real-Time Booking System  
> **Target Audience:** Engineering Team (Dev 1: Booking & Payments, Dev 2: Cinema & Catalog, Dev 3: Frontend & UI)

---

## Table of Contents
1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Key Architecture Decisions & Tech Stack](#2-key-architecture-decisions--tech-stack)
3. [Users, Roles & Security Model](#3-users-roles--security-model)
4. [Functional Requirements](#4-functional-requirements)
5. [System Architecture & Backend Modular Monolith](#5-system-architecture--backend-modular-monolith)
6. [Real-Time Seat Hold Engine (Redis + WebSockets)](#6-real-time-seat-hold-engine-redis--websockets)
7. [Database Schema & ERD (Supabase PostgreSQL)](#7-database-schema--erd-supabase-postgresql)
8. [REST API Contract](#8-rest-api-contract)
9. [WebSocket Event Specification](#9-websocket-event-specification)
10. [Payment Flow & Razorpay Integration](#10-payment-flow--razorpay-integration)
11. [Frontend Architecture & UI/UX Guidelines](#11-frontend-architecture--uiux-guidelines)
12. [Environment Configuration & Deployment](#12-environment-configuration--deployment)

---

## 1. Executive Summary & Product Vision

### 1.1 Overview
**Kai Koi** is a high-performance, real-time movie ticket management and booking platform built for modern cinema operations. The system provides moviegoers with an intuitive interface to browse movies, choose showtimes, and select seats from an interactive real-time seat map.

### 1.2 Core Value Proposition
- **Zero Race Conditions & Double-Booking Prevention:** High-concurrency seat locking ensures no two patrons can purchase or hold the same seat simultaneously.
- **Sub-Second Live Seat Map Updates:** Instant STOMP/WebSocket synchronization of seat holds, bookings, and releases across all active browser sessions.
- **Enterprise-Grade Identity & Data Platform:** Hosted on **Supabase** for robust authentication (OAuth/Email) and managed PostgreSQL.
- **Unified Checkout & Payments:** Razorpay integration supporting UPI, Cards, Netbanking with automated signature verification and webhook redundancy.

### 1.3 Project Scope Boundaries
- **In Scope (v1 MVP):**
  - Multi-screen cinema management (Screens/Audi, Sections, Rows, Seats).
  - Movie catalog management (Genres, Censor Ratings, Languages, Formats, Durations, Posters).
  - Showtime scheduling with section-based dynamic pricing (Recliner, Prime, Classic).
  - Interactive SVG/Canvas seat map with live color-coded statuses (`AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`).
  - Redis distributed seat hold mechanism with 10-minute TTL.
  - Razorpay payment order creation, webhook handling, and refund processing.
  - Supabase Auth integration (Google OAuth + Email/Password) with JWT validation in Spring Boot.
  - Digital Ticket generation with secure QR code payload for staff check-in scanning.
  - Admin dashboard for screen layout design, movie scheduling, and real-time occupancy monitoring.
- **Out of Scope (v1):**
  - Dining/Restaurant table reservations (deferred to future expansion).
  - Live stage shows (deferred to future expansion).
  - Concession/F&B pre-ordering during movie ticket checkout.
  - Multi-city cinema chain routing (scoped exclusively to the Kai Koi complex).

---

## 2. Key Architecture Decisions & Tech Stack

| Domain | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | **React 18 + TypeScript + Vite** | Blazing fast client bundle, strict type safety, predictable state. |
| **Styling & Components** | **Tailwind CSS + shadcn/ui + Lucide Icons** | Accessible Radix UI primitives, sleek cinema aesthetic, responsive layout. |
| **Client State & API Cache** | **TanStack Query (React Query) + Zustand** | Optimistic UI updates, caching server state, minimal re-renders. |
| **Authentication Provider** | **Supabase Auth** | Turnkey identity management, built-in OAuth (Google), secure JWT issuance. |
| **Primary Database** | **Supabase PostgreSQL 15+** | ACID-compliant relational model, managed cloud hosting, automated backups. |
| **Database Migrations** | **Flyway** | Code-driven, immutable, versioned SQL migrations (`V1__init_movie_schema.sql`). |
| **Backend Framework** | **Java 17 + Spring Boot 3.3.x** | Enterprise robustness, strong concurrency primitives, type-safe ecosystem. |
| **Real-Time Push Broker** | **Spring WebSocket + STOMP** | Efficient pub-sub channels (`/topic/showtimes/{id}/seats`) over standard WebSocket. |
| **Distributed Seat Holds** | **Redis 7 (Lettuce Client)** | In-memory atomic `SET NX EX 600`, zero DB vacuum churn, Keyspace Expiry notifications. |
| **Payment Gateway** | **Razorpay (India - INR)** | Seamless UPI/Card flow, robust test mode, cryptographically signed webhooks. |

---

## 3. Users, Roles & Security Model

### 3.1 Roles
1. **GUEST (Unauthenticated):**
   - Browse movies, genres, languages, and formats.
   - View showtimes and upcoming screening dates.
   - Inspect live seat map availability.
2. **CUSTOMER (Authenticated via Supabase):**
   - Select seats and initiate a 10-minute hold.
   - Complete Razorpay payment and receive confirmed digital tickets with QR codes.
   - View booking history under "My Bookings".
   - Cancel bookings up to 2 hours prior to showtime (subject to cancellation policy).
3. **ADMIN / CINEMA STAFF (Role stored in `public.users`):**
   - Create, update, or archive movies.
   - Configure screen layouts (sections, rows, seats).
   - Schedule showtimes and assign pricing tiers.
   - Scan customer ticket QR codes for admittance.
   - View live showtime analytics and occupancy metrics.

### 3.2 Authentication & Authorization Architecture
1. The frontend authenticates directly against Supabase via `@supabase/supabase-js`.
2. Supabase issues a cryptographically signed JWT access token (`Bearer <token>`).
3. The frontend attaches this token to all protected API calls: `Authorization: Bearer <jwt>`.
4. Spring Security intercepts incoming requests using an `OAuth2ResourceServer` filter:
   - Validates the token signature against Supabase's JWKS endpoint or JWT secret.
   - Extracts the Supabase `sub` (User UUID) and email.
   - Maps user roles from `public.users` for granular authorization checks (`@PreAuthorize("hasRole('ADMIN')")`).

---

## 4. Functional Requirements

### 4.1 Movie Catalog Management
- Admins can add movies with Title, Synopsis, Duration (mins), Language (e.g., English, Hindi), Censor Rating (`U`, `UA_13`, `UA_16`, `A`), Format (`2D`, `3D`, `IMAX`, `4DX`), Release Date, and Poster/Banner URLs.
- Movies can be set to `NOW_SHOWING`, `UPCOMING`, or `ARCHIVED`.

### 4.2 Screens & Seating Layout
- Support for multiple screens within Kai Koi Cinema (e.g., Screen 1, Screen 2 / IMAX Hall).
- Screens are divided into **Sections** (Pricing Tiers):
  - **Recliner:** Top tier, motorized recliners, premium pricing.
  - **Prime:** Middle tier, optimal sightlines and sound.
  - **Classic:** Front rows, budget-friendly.
- Individual seats possess a Row (A, B, C...), Number (1, 2, 3...), and Section reference.
- Admin support for flagging individual seats as `BLOCKED` (maintenance/wheelchair access).

### 4.3 Showtime Scheduling & Pricing
- Admins schedule showtimes by selecting a Movie, Screen, Start Time, and End Time (automatically suggested based on movie duration + 20 min interval/cleaning window).
- Dynamic Pricing: Each showtime assigns specific ticket prices per section (e.g., Classic: ₹220, Prime: ₹320, Recliner: ₹480; weekday vs. weekend pricing).

### 4.4 Seat Selection & Real-Time Locking
- Customers select up to **10 seats** per booking transaction.
- When the customer clicks "Proceed to Pay":
  - Spring Boot executes atomic Redis hold requests: `SET seat_hold:{showtimeId}:{seatId} {userId} NX EX 600`.
  - If any seat fails acquisition (already held or booked), the entire transaction rolls back and returns `409 CONFLICT`.
  - If successful, Redis stores the hold with a 10-minute TTL (600 seconds).
  - Backend broadcasts `HELD` status to all other viewers via STOMP WebSocket.

### 4.5 Payment & Confirmation
- Backend initiates a Razorpay Order matching the exact price of held seats + GST/convenience fees.
- Frontend opens Razorpay Checkout modal.
- On payment capture:
  - Razorpay sends a server-to-server webhook (`order.paid`).
  - Spring Boot verifies HMAC-SHA256 signature, commits `bookings` and `tickets` records in Supabase PostgreSQL, releases the Redis hold key, and broadcasts `BOOKED` status to WebSocket subscribers.
  - Customer receives ticket confirmation and QR code.

### 4.6 Cancellations & Refunds
- Customers can cancel bookings if `now() < (showtime.start_time - 2 hours)`.
- System triggers Razorpay Refund API (net of configurable cancellation fee, e.g., 10%).
- Booking status updates to `CANCELLED`, tickets marked `REVOKED`, and seats are released back to `AVAILABLE`.

---

## 5. System Architecture & Backend Modular Monolith

```
com.kaikoi/
├── KaiKoiApplication.java
│
├── common/               # Shared cross-cutting concerns
│   ├── config/           # CORS, Security, Redis, WebSocket, Supabase/OAuth2
│   ├── controller/       # HealthController
│   ├── dto/              # Standard ApiResponse, ErrorResponse, PageResult
│   └── exception/        # GlobalExceptionHandler, ApiException, ResourceNotFound, Conflict
│
├── auth/                 # User synchronization & Supabase token integration
│   ├── controller/       # AuthController (POST /api/auth/sync)
│   ├── service/          # UserService
│   └── model/            # User entity & UserRole enum
│
├── cinema/               # Screen, Section & Seat domain
│   ├── controller/       # ScreenController, AdminScreenController
│   ├── service/          # ScreenService, LayoutService
│   ├── repository/       # ScreenRepository, SectionRepository, SeatRepository
│   └── model/            # Screen, Section, Seat
│
├── movie/                # Movie catalog domain
│   ├── controller/       # MovieController, AdminMovieController
│   ├── service/          # MovieService
│   ├── repository/       # MovieRepository
│   └── model/            # Movie, CensorRating, MovieFormat, MovieStatus
│
├── showtime/             # Showtime scheduling & seat-map availability
│   ├── controller/       # ShowtimeController, AdminShowtimeController
│   ├── service/          # ShowtimeService, PricingService
│   ├── repository/       # ShowtimeRepository, ShowtimePricingRepository
│   └── model/            # Showtime, ShowtimePricing
│
├── booking/              # Seat hold, checkout, confirmation & QR tickets
│   ├── controller/       # BookingController, CustomerBookingController
│   ├── service/          # SeatHoldService (Redis), BookingService, QrCodeService
│   ├── repository/       # BookingRepository, TicketRepository
│   └── model/            # Booking, Ticket, BookingStatus
│
├── payment/              # Razorpay integration & refunds
│   ├── controller/       # PaymentWebhookController, PaymentController
│   ├── service/          # RazorpayService, RefundService
│   ├── repository/       # PaymentRepository, RefundRepository
│   └── model/            # Payment, Refund, PaymentStatus
│
└── websocket/            # STOMP broker event publishing & Redis listener
    ├── controller/       # (Optional STOMP incoming handlers)
    ├── service/          # SeatBroadcastService
    └── listener/         # RedisKeyExpirationListener
```

---

## 6. Real-Time Seat Hold Engine (Redis + WebSockets)

### 6.1 Concurrency Strategy
1. **Acquisition (Atomic):**
   ```
   SET seat_hold:{showtimeId}:{seatId} {userId} NX EX 600
   ```
   - `NX`: Set only if Not eXists. Guarantees that only the first concurrent thread succeeds.
   - `EX 600`: Automatic 10-minute time-to-live.
2. **Hold Verification:**
   - Before creating a Razorpay order, the backend verifies that all seats are still held by the requesting `userId`.
3. **Auto-Expiry Handling (Zero Polling):**
   - Redis is configured with `--notify-keyspace-events Ex`.
   - When a hold key expires, Redis publishes an expiry message to `__keyevent@0__:expired`.
   - Spring Boot's `KeyExpirationEventMessageListener` catches `seat_hold:{showtimeId}:{seatId}`, parses the IDs, and immediately emits an `AVAILABLE` event to `/topic/showtimes/{showtimeId}/seats`.

---

## 7. Database Schema & ERD (Supabase PostgreSQL)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────────┐
│    movies    │       │   screens    │       │       sections       │
├──────────────┤       ├──────────────┤       ├──────────────────────┤
│ id (PK)      │       │ id (PK)      │──┐    │ id (PK)              │
│ title        │       │ name         │  └───▶│ screen_id (FK)       │──┐
│ duration_mins│       │ total_seats  │       │ name (Recliner, etc) │  │
└──────┬───────┘       └──────┬───────┘       └──────────────────────┘  │
       │                      │                                         │
       │               ┌──────▼───────┐       ┌──────────────────────┐  │
       │               │  showtimes   │       │        seats         │  │
       └──────────────▶├──────────────┤       ├──────────────────────┤  │
                       │ id (PK)      │       │ id (PK)              │◀─┘
                       │ movie_id (FK)│       │ screen_id (FK)       │
                       │ screen_id(FK)│       │ section_id (FK)      │
                       │ start_time   │       │ row (A, B...)        │
                       │ end_time     │       │ number (1, 2...)     │
                       └──────┬───────┘       └──────────┬───────────┘
                              │                          │
                       ┌──────▼───────────────┐          │
                       │   showtime_pricing   │          │
                       ├──────────────────────┤          │
                       │ id (PK)              │          │
                       │ showtime_id (FK)     │          │
                       │ section_id (FK)      │          │
                       │ price                │          │
                       └──────────────────────┘          │
                                                         │
┌──────────────┐       ┌──────────────────────┐          │
│    users     │       │       bookings       │          │
├──────────────┤       ├──────────────────────┤          │
│ id (PK)      │◀──────│ id (PK)              │          │
│ supabase_uid │       │ user_id (FK)         │          │
│ email        │       │ showtime_id (FK)     │          │
│ name         │       │ total_amount         │          │
│ role         │       │ status (CONFIRMED..) │          │
└──────────────┘       └──────┬───────────────┘          │
                              │                          │
                       ┌──────▼───────────────┐          │
                       │       tickets        │          │
                       ├──────────────────────┤          │
                       │ id (PK)              │          │
                       │ booking_id (FK)      │          │
                       │ seat_id (FK)         │◀─────────┘
                       │ price                │
                       │ qr_code              │
                       │ checked_in_at        │
                       └──────────────────────┘
```

---

## 8. REST API Contract

### 8.1 Public & Customer Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | System health check (`{"status": "UP"}`) |
| `POST` | `/api/auth/sync` | Bearer (Supabase) | Synchronize user record into `public.users` |
| `GET` | `/api/movies` | No | List now showing & upcoming movies |
| `GET` | `/api/movies/{id}` | No | Get movie details & synopsis |
| `GET` | `/api/movies/{id}/showtimes` | No | Get scheduled showtimes for a movie |
| `GET` | `/api/showtimes/{id}/seats` | No | Current visual seat map state & prices |
| `POST` | `/api/bookings/hold` | Bearer | Lock selected seats for 10 minutes |
| `POST` | `/api/bookings/release` | Bearer | Manually release held seats |
| `POST` | `/api/payments/create-order` | Bearer | Create Razorpay order for active hold |
| `POST` | `/api/payments/webhook` | Signature | Razorpay server-to-server webhook callback |
| `POST` | `/api/bookings/confirm` | Bearer | Finalize booking after payment success |
| `GET` | `/api/bookings/my` | Bearer | Current user's booking history |
| `GET` | `/api/bookings/{id}` | Bearer | Booking detail with ticket QR codes |
| `POST` | `/api/bookings/{id}/cancel` | Bearer | Cancel booking & trigger refund |

### 8.2 Admin Endpoints (`hasRole('ADMIN')`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/movies` | Create a new movie record |
| `PUT` | `/api/admin/movies/{id}` | Update movie metadata & poster URLs |
| `POST` | `/api/admin/screens` | Create a new screen & configure seating matrix |
| `POST` | `/api/admin/showtimes` | Schedule a showtime & configure section prices |
| `GET` | `/api/admin/bookings` | Search all cinema bookings & occupancy |
| `POST` | `/api/admin/tickets/check-in` | Scan ticket QR code & validate admittance |

---

## 9. WebSocket Event Specification

- **Connection URL:** `ws://localhost:8080/ws` (STOMP over WebSocket)
- **Topic Subscription:** `/topic/showtimes/{showtimeId}/seats`

### Event Payload: `SEAT_STATUS_UPDATE`
```json
{
  "type": "SEAT_STATUS_UPDATE",
  "showtimeId": "c9b1f2e0-8a7d-4b8c-9a1f-0e8d7c6b5a4f",
  "updates": [
    {
      "seatId": "d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a",
      "seatLabel": "E12",
      "status": "HELD"
    }
  ],
  "timestamp": "2026-11-02T08:45:00Z"
}
```
*Statuses:* `AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`.

---

## 10. Payment Flow & Razorpay Integration

```
Customer              Frontend             Backend (Spring)             Razorpay
   │                     │                         │                        │
   │───Select Seats─────▶│                         │                        │
   │───"Proceed to Pay"─▶│──POST /bookings/hold───▶│                        │
   │                     │◀─holdId, 10m timer──────│ (Holds in Redis)       │
   │                     │                         │                        │
   │                     │──POST /payments/create─▶│──Create Order─────────▶│
   │                     │◀─razorpayOrderId────────│◀─order_id, amount──────│
   │                     │                         │                        │
   │                     │──Open Razorpay Modal───▶│                        │
   │───Completes UPI/Card──────────────────────────────────────────────────▶│
   │                     │                         │                        │
   │                     │                         │◀──Webhook (order.paid)─│
   │                     │                         │   (Verify Signature)   │
   │                     │                         │   (Insert Bookings)    │
   │                     │                         │   (Broadcast BOOKED WS)│
   │                     │──POST /bookings/confirm▶│                        │
   │◀──Display Ticket────│◀─Booking + QR Code──────│                        │
```

---

## 11. Frontend Architecture & UI/UX Guidelines

- **Theme & Vibe:** Cinematic dark mode (deep charcoal `#0B0F17`, obsidian, warm amber/gold accents `#F59E0B`, cinema red `#E11D48`).
- **Seat Map Interaction:**
  - Interactive SVG grid grouping rows A through M.
  - Section headers indicating `Recliner - ₹450`, `Prime - ₹300`, `Classic - ₹200`.
  - Visual status cues:
    - White/Outline: `AVAILABLE`
    - Amber pulsing: `HELD` (by another user)
    - Dark gray muted: `BOOKED`
    - Neon green: `SELECTED` (by current user)
- **Persistent Bottom Bar:** Shows selected seat tags (e.g. `[E12] [E13]`), ticket count, subtotal, and countdown timer (`09:45 remaining`).

---

## 12. Environment Configuration & Deployment

### Backend `.env` / `application.properties`
```properties
# Supabase PostgreSQL
spring.datasource.url=jdbc:postgresql://${SUPABASE_DB_HOST:localhost}:5432/${SUPABASE_DB_NAME:postgres}?sslmode=require
spring.datasource.username=${SUPABASE_DB_USER:postgres}
spring.datasource.password=${SUPABASE_DB_PASSWORD}

# Supabase Auth / JWT Validation
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/.well-known/jwks.json

# Redis
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}

# Razorpay
razorpay.key.id=${RAZORPAY_KEY_ID}
razorpay.key.secret=${RAZORPAY_KEY_SECRET}
razorpay.webhook.secret=${RAZORPAY_WEBHOOK_SECRET}
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```
