<div align="center">

<h1>🎬 Kai Koi 🍿</h1>

<p><strong>Modern Real-Time Movie Ticket Management & Booking Platform</strong></p>

<p>
  <img src="https://img.shields.io/badge/Status-In%20Development-f59e0b?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-Supabase%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/In--Memory-Redis%207-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-02042B?style=for-the-badge" />
</p>

</div>

---

## 🌟 What is Kai Koi?

**Kai Koi** is a high-performance, real-time movie ticket management and booking platform. Built specifically for modern cinema operations, it eliminates double-booking race conditions while providing patrons with an instantaneous, live-synced visual seat map.

---

## ✨ Core Features

### ⚡ Sub-Second Live Seat Map (STOMP / WebSocket)
- Live seat status changes (`AVAILABLE`, `HELD`, `BOOKED`, `BLOCKED`) are broadcasted to all active browsers in real time.
- Delta updates minimize network overhead.

### 🔒 High-Concurrency Seat Locking (Redis Hold Engine)
- Atomic 10-minute seat holds via Redis (`SET ... NX EX 600`) prevent double-booking under heavy load.
- Automatic seat release driven by Redis Keyspace Expiration notifications (`notify-keyspace-events=Ex`) pushes releases to WebSockets with zero database polling.

### 🗺️ Interactive Visual Seat Map
- Color-coded, responsive seat layout supporting tiered pricing: **Recliner**, **Prime**, and **Classic**.
- Persistent checkout tray showing selected seats, countdown timer, and price calculations.

### 🔐 Supabase Authentication & Database
- Turnkey customer authentication (Google OAuth, Email/Password) via Supabase Auth.
- Spring Boot backend validates Supabase JWTs via stateless Spring Security resource server filters.
- Cloud-hosted PostgreSQL 15+ managed by Supabase with Flyway migration versioning.

### 💳 Razorpay Payments & QR Check-In
- Seamless checkout in INR supporting UPI, Cards, and Netbanking.
- Webhook signature verification guarantees booking integrity.
- Automated QR code digital ticket generation for cinema staff scanner verification.

---

## 🏗️ Architecture Overview

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

## 📁 Repository Structure

```
.
├── backend/                  # Java 17 + Spring Boot 3.3 Backend
│   ├── src/main/java/com/kaikoi/
│   │   ├── auth/             # Supabase JWT filter & User sync
│   │   ├── booking/          # Redis HoldService, Bookings & QR tickets
│   │   ├── cinema/           # Screens, Sections & Seat layout
│   │   ├── movie/            # Movie catalog, genres & ratings
│   │   ├── showtime/         # Showtime scheduling & dynamic pricing
│   │   ├── payment/          # Razorpay integration & refunds
│   │   ├── websocket/        # STOMP broker & Redis event listener
│   │   └── common/           # Shared configs (Security, CORS, Redis), DTOs, exceptions
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/     # Flyway version-controlled SQL migrations
├── docs/                     # Comprehensive technical documentation
│   ├── PRODUCT_AND_TECHNICAL_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   └── WEBSOCKET.md
└── docker-compose.yml        # Local development environment (Postgres & Redis)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java 17+**
- **Docker & Docker Compose** (for local Redis/PostgreSQL)
- **Node.js 18+**

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase project credentials and Razorpay test keys:
```bash
cp .env.example .env
```

### 3. Start Local Infrastructure
```bash
docker compose up -d
```

### 4. Run Spring Boot Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend health check is accessible at `http://localhost:8080/api/health`.
