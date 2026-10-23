<div align="center">

<h1>🎬 Kai Koi 🎭</h1>

<p><strong>One building · Three experiences · One seamless booking platform</strong></p>

<p>
  <img src="https://img.shields.io/badge/Status-In%20Development-f59e0b?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-02042B?style=for-the-badge" />
</p>

</div>

---

## 🌟 What is Kai Koi?

**Kai Koi** is a unified entertainment booking platform built for a **single physical entertainment complex** housing three distinct businesses under one brand:

| Venue | What You Book | Capacity |
|---|---|---|
| 🍽️ **Restaurant** | Dining tables by time slot | 1 · 2 · 4 · 8 seater tables |
| 🎬 **Movie Theater** | Seats for film screenings | Recliner · Premium · Standard sections |
| 🎭 **Show Theater** | Seats for live performances | Stand-up comedy · Music · Theater |

> Unlike large-scale platforms like BookMyShow, Kai Koi is **intentionally scoped to one building** — delivering a focused, real-time booking experience with zero multi-venue friction.

---

## ✨ Features

### ⚡ Real-Time Seat Availability
WebSocket (STOMP) broadcasts live seat and table status changes to **all active browser sessions simultaneously** — no refreshing, no stale data, no race conditions.

### 🔒 Concurrent Booking Protection
A **temporary hold mechanism** locks seats during checkout, ensuring that under high concurrent load, each seat goes to exactly one winner.

### 🗺️ Interactive Visual Floor Plans
Color-coded, clickable seat maps and table layouts that show live availability status at a glance across all three venue verticals.

### 💳 Integrated Payments (Razorpay)
End-to-end Razorpay checkout for:
- Full ticket payments for movies and shows
- Fixed-deposit restaurant reservations (credited toward the final dining bill at the venue)

### 🔄 Flexible Cancellations & Refunds
- Configurable cancellation cutoff window per session
- Automated Razorpay refunds with optional cancellation fee

### 🎛️ Admin Dashboard
A dedicated staff interface to:
- Design and manage seating/table layouts
- Schedule sessions and set per-section dynamic pricing
- Monitor live bookings and handle customer check-in

### 🔐 Firebase Authentication
- Email/password & Google Sign-In
- Role-based access control (Customer vs. Admin) managed in the backend

---

## 🏗️ Tech Stack

```
╔══════════════════════════════════════════════════════════════╗
║                         FRONTEND                             ║
║      Vite · React 18 · TypeScript · Tailwind CSS · shadcn/ui ║
╠══════════════════════════════════════════════════════════════╣
║                         BACKEND                              ║
║                 Java · Spring Boot · REST APIs               ║
╠══════════════════════════════════════════════════════════════╣
║                        DATABASE                              ║
║              PostgreSQL · Flyway (Schema Migrations)         ║
╠══════════════════════════════════════════════════════════════╣
║                       REAL-TIME                              ║
║                  WebSocket · STOMP Protocol                  ║
╠══════════════════════════════════════════════════════════════╣
║                    AUTHENTICATION                            ║
║          Firebase Auth — Email/Password + Google OAuth       ║
╠══════════════════════════════════════════════════════════════╣
║                       PAYMENTS                               ║
║                Razorpay SDK (Test Mode · INR)                ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🗺️ Application Screens

```
🏠  Home / Landing Page
     ├── 🎬 Now Showing (Movies)
     ├── 🎭 Upcoming Live Shows
     └── 🍽️ Dining Availability

🎟️  Booking Flow
     ├── 1. Session / Time Slot Selection
     ├── 2. Interactive Floor Plan & Seat Map  ← Live WebSocket updates
     ├── 3. Checkout & Payment (Razorpay)
     └── 4. Booking Confirmation + QR Code

👤  User Profile
     └── My Bookings (Upcoming · Past · Cancelled)

🛠️  Admin Dashboard
     ├── Venue Layout Editor
     ├── Session Scheduler & Dynamic Pricing Manager
     └── Live Booking Monitor & Check-in Console
```

---

## 🚀 Getting Started

> ⚙️ This project is currently in active development. Full setup docs will be added as the codebase matures.

### Prerequisites

- **Node.js** ≥ 18
- **Java** ≥ 17
- **PostgreSQL** ≥ 15
- A **Firebase** project (for Authentication)
- A **Razorpay** account (Test mode API keys)

### Frontend Dev Server

```bash
cd frontend
npm install
npm run dev
```

### Backend Dev Server

```bash
cd backend
./mvnw spring-boot:run
```

---

## 📁 Project Structure

```
Kai-Koi/
├── frontend/                  # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components (shadcn/ui)
│   │   ├── pages/             # Route-level page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API client, WebSocket, utilities
│   │   └── types/             # Shared TypeScript types
│   └── package.json
├── backend/                   # Spring Boot REST + WebSocket server
│   ├── src/main/java/
│   │   ├── controller/        # REST & WebSocket controllers
│   │   ├── service/           # Business logic & booking engine
│   │   ├── repository/        # PostgreSQL data access layer
│   │   └── model/             # Domain entities (Booking, Seat, etc.)
│   └── pom.xml
└── README.md
```

---

## 🎯 Core Design Principles

| Principle | Details |
|---|---|
| **Single-building focus** | No multi-city or multi-venue complexity — one building, done right |
| **Shared booking engine** | Restaurant tables and theater seats are unified bookable "units" |
| **Real-time first** | WebSocket is a core architectural primitive, not an afterthought |
| **Concurrent safety** | Temporary seat locking + DB transactions guarantee zero double-bookings |
| **Mobile-first UI** | Every screen designed to feel native on phones, polished on desktop |

---

## 📄 License

This project is proprietary. All rights reserved © Kai Koi.

---

<div align="center">
  <sub>Built with ❤️ — <em>Where every evening becomes a memory.</em></sub>
</div>
