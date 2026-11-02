# 📊 Kai Koi — Movie Database Schema & ERD (Supabase PostgreSQL)

> ✅ **STATUS: LOCKED** — Updated for Movie Ticket Booking domain and Supabase PostgreSQL.  
> **Last updated:** November 2026

---

## Entity Relationship Overview

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

## Table Definitions

### 1. `users`
Synced with Supabase Auth (`auth.users`).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Internal identifier |
| `supabase_uid` | VARCHAR(128) | UNIQUE, NOT NULL | Direct link to Supabase `auth.users(id)` |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| `name` | VARCHAR(255) | NOT NULL | User display name |
| `phone` | VARCHAR(20) | | Optional mobile number |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'CUSTOMER' | `CUSTOMER` or `ADMIN` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Created timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Updated timestamp |

---

### 2. `movies`
Movie catalog and metadata.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique movie ID |
| `title` | VARCHAR(255) | NOT NULL | Movie title |
| `description` | TEXT | | Synopsis / plot outline |
| `duration_mins` | INTEGER | NOT NULL | Runtime in minutes |
| `language` | VARCHAR(50) | NOT NULL | Audio language (English, Hindi, etc.) |
| `censor_rating` | VARCHAR(10) | NOT NULL | `U`, `UA_13`, `UA_16`, `A` |
| `genres` | VARCHAR(255) | NOT NULL | Comma-separated or array (Action, Sci-Fi) |
| `poster_url` | VARCHAR(512) | | Vertical movie poster image |
| `banner_url` | VARCHAR(512) | | Wide backdrop banner image |
| `release_date` | DATE | NOT NULL | Theater premiere date |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'NOW_SHOWING'| `NOW_SHOWING`, `UPCOMING`, `ARCHIVED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Update timestamp |

---

### 3. `screens`
Auditoriums / Halls in Kai Koi Cinema (e.g. Screen 1 - Atmos, Screen 2 - IMAX).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique screen ID |
| `name` | VARCHAR(100) | NOT NULL | Screen name / Hall name |
| `total_seats` | INTEGER | NOT NULL, DEFAULT 0 | Total seat capacity |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Operational status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |

---

### 4. `sections`
Seating tiers within a screen (e.g., Recliner, Prime, Classic).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique section ID |
| `screen_id` | UUID | NOT NULL, FK → screens.id | Associated screen |
| `name` | VARCHAR(100) | NOT NULL | Section name (Recliner, Prime, Classic) |
| `display_order`| INTEGER | NOT NULL, DEFAULT 1 | Display rank on seat map |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |

---

### 5. `seats`
Individual chairs in a screen.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique seat ID |
| `screen_id` | UUID | NOT NULL, FK → screens.id | Associated screen |
| `section_id` | UUID | NOT NULL, FK → sections.id | Associated section / pricing tier |
| `label` | VARCHAR(10) | NOT NULL | Seat label (e.g., "A12") |
| `row` | VARCHAR(5) | NOT NULL | Row identifier ("A", "B", "C") |
| `number` | INTEGER | NOT NULL | Seat index within row (1, 2, 3...) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft-disable broken/blocked seats |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |

**Unique constraint:** `(screen_id, label)`

---

### 6. `showtimes`
Scheduled screenings of a movie in a specific screen.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique showtime ID |
| `movie_id` | UUID | NOT NULL, FK → movies.id | Screened movie |
| `screen_id` | UUID | NOT NULL, FK → screens.id | Auditorium |
| `start_time` | TIMESTAMPTZ | NOT NULL | Screening start time |
| `end_time` | TIMESTAMPTZ | NOT NULL | Screening end time |
| `format` | VARCHAR(20) | NOT NULL, DEFAULT '2D' | `2D`, `3D`, `IMAX`, `4DX` |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'SCHEDULED' | `SCHEDULED`, `OPEN`, `CANCELLED`, `COMPLETED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Update timestamp |

---

### 7. `showtime_pricing`
Dynamic pricing for each section in a specific showtime.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique pricing ID |
| `showtime_id` | UUID | NOT NULL, FK → showtimes.id | Associated showtime |
| `section_id` | UUID | NOT NULL, FK → sections.id | Associated section |
| `price` | NUMERIC(10,2)| NOT NULL | Ticket price in INR |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |

**Unique constraint:** `(showtime_id, section_id)`

---

### 8. `seat_holds` (In-Memory in Redis)
Temporary distributed locks for seats undergoing checkout.
- **Key:** `seat_hold:{showtimeId}:{seatId}`
- **Value:** `{userId}`
- **TTL:** 600 seconds (10 minutes)
- **Lock acquisition:** `SET seat_hold:{showtimeId}:{seatId} {userId} NX EX 600`
- **Auto-release:** Redis keyspace notifications (`notify-keyspace-events=Ex`) push expiry events to Spring WebSocket broker to broadcast `AVAILABLE` to all clients.

---

### 9. `bookings`
Confirmed ticket order record.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique booking ID |
| `booking_reference` | VARCHAR(20) | NOT NULL, UNIQUE | Human-readable ref (e.g. `KK-892401`) |
| `user_id` | UUID | NOT NULL, FK → users.id | Customer who booked |
| `showtime_id` | UUID | NOT NULL, FK → showtimes.id | Associated showtime |
| `total_amount` | NUMERIC(10,2)| NOT NULL | Total paid in INR |
| `convenience_fee` | NUMERIC(10,2)| NOT NULL, DEFAULT 0.00 | Convenience fee |
| `gst` | NUMERIC(10,2)| NOT NULL, DEFAULT 0.00 | Tax amount |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'CONFIRMED'| `PENDING`, `CONFIRMED`, `CANCELLED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Booking timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Update timestamp |

---

### 10. `tickets`
Individual seat ticket with QR code for hall admittance.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique ticket ID |
| `booking_id` | UUID | NOT NULL, FK → bookings.id | Parent booking |
| `seat_id` | UUID | NOT NULL, FK → seats.id | Booked seat |
| `price` | NUMERIC(10,2)| NOT NULL | Snapshot seat price |
| `qr_code` | TEXT | NOT NULL | Signed QR payload for check-in |
| `checked_in_at` | TIMESTAMPTZ | | Admittance scan timestamp |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'VALID' | `VALID`, `USED`, `REVOKED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |

**Unique constraint:** `(booking_id, seat_id)`

---

### 11. `payments`
Razorpay payment transactions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique payment record ID |
| `booking_id` | UUID | NOT NULL, UNIQUE, FK → bookings.id | Associated booking |
| `razorpay_order_id` | VARCHAR(255) | NOT NULL, UNIQUE | Order ID from Razorpay |
| `razorpay_payment_id` | VARCHAR(255) | UNIQUE | Payment ID from Razorpay capture |
| `amount` | NUMERIC(10,2)| NOT NULL | Amount in INR |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'INR' | Currency code |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | `PENDING`, `SUCCESS`, `FAILED` |
| `webhook_verified` | BOOLEAN | NOT NULL, DEFAULT false | Verified via webhook HMAC |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Update timestamp |

---

### 12. `refunds`
Refund transactions for cancelled movie bookings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, gen_random_uuid() | Unique refund record ID |
| `payment_id` | UUID | NOT NULL, FK → payments.id | Associated payment |
| `razorpay_refund_id` | VARCHAR(255) | UNIQUE | Refund ID from Razorpay |
| `amount` | NUMERIC(10,2)| NOT NULL | Refunded amount |
| `cancellation_fee` | NUMERIC(10,2)| NOT NULL, DEFAULT 0.00 | Fee retained by cinema |
| `reason` | TEXT | | Reason for refund |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | `PENDING`, `SUCCESS`, `FAILED` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
