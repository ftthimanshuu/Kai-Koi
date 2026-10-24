# 📊 Kai Koi — Proposed Database Schema (ERD)

> ✅ STATUS: UPDATED — Core stack & seat-hold strategy finalized (Redis + PostgreSQL).
> Last updated: 25 October 2026

---

## Entity Relationship Overview

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  User   │     │  Venue  │────▶│  Layout  │────▶│ Section │
└────┬────┘     └────┬────┘     └──────────┘     └────┬────┘
     │               │                                  │
     │          ┌────▼────┐     ┌───────────────┐  ┌───▼────┐
     │          │ Session │────▶│ SessionSection│  │  Seat  │
     │          └────┬────┘     └───────────────┘  └───┬────┘
     │               │                                  │
     │          ┌────▼──────────────────────────────────▼────┐
     │          │                 SeatHold                    │
     │          └──────────────────────────────────────────── ┘
     │               │
     │          ┌────▼────┐     ┌─────────────┐
     └─────────▶│ Booking │────▶│ BookingItem │
                └────┬────┘     └─────────────┘
                     │
                ┌────▼────┐     ┌────────┐
                │ Payment │────▶│ Refund │
                └─────────┘     └────────┘
```

---

## Table Definitions

---

### 1. `users`
Stores all platform users — customers and admins.

| Column        | Type          | Constraints                    | Notes                          |
|---------------|---------------|-------------------------------|--------------------------------|
| `id`          | UUID          | PRIMARY KEY, DEFAULT gen_uuid | Internal ID                    |
| `firebase_uid`| VARCHAR(128)  | UNIQUE, NOT NULL              | From Firebase Auth             |
| `email`       | VARCHAR(255)  | UNIQUE, NOT NULL              |                                |
| `name`        | VARCHAR(255)  | NOT NULL                      |                                |
| `role`        | ENUM          | NOT NULL, DEFAULT 'CUSTOMER'  | CUSTOMER \| ADMIN              |
| `created_at`  | TIMESTAMPTZ   | NOT NULL, DEFAULT now()       |                                |
| `updated_at`  | TIMESTAMPTZ   | NOT NULL, DEFAULT now()       |                                |

**Open Questions:**
- [ ] Do we need a STAFF role separate from ADMIN?
- [ ] Do we store phone number for check-in purposes?

---

### 2. `venues`
Represents the three physical spaces inside the Kai Koi building.

| Column        | Type         | Constraints          | Notes                              |
|---------------|--------------|---------------------|------------------------------------|
| `id`          | UUID         | PRIMARY KEY          |                                    |
| `name`        | VARCHAR(255) | NOT NULL             | e.g., "Kai Koi Cinema Hall"        |
| `type`        | ENUM         | NOT NULL             | RESTAURANT \| MOVIE \| SHOW        |
| `description` | TEXT         |                      |                                    |
| `created_at`  | TIMESTAMPTZ  | NOT NULL             |                                    |

**Seed Data (fixed — no admin creation needed at start):**
```
id=1  name="Kai Koi Dining"   type=RESTAURANT
id=2  name="Kai Koi Cinema"   type=MOVIE
id=3  name="Kai Koi Stage"    type=SHOW
```

**Open Questions:**
- [ ] Is `venues` a static seed table or can admins add venues?
- [ ] Do we need operating hours stored here?

---

### 3. `layouts`
A versioned floor plan for a venue. A venue can have multiple layout versions over time.

| Column        | Type         | Constraints                     | Notes                              |
|---------------|--------------|---------------------------------|------------------------------------|
| `id`          | UUID         | PRIMARY KEY                     |                                    |
| `venue_id`    | UUID         | NOT NULL, FK → venues.id        |                                    |
| `version`     | INTEGER      | NOT NULL, DEFAULT 1             | Increment when layout changes      |
| `name`        | VARCHAR(255) | NOT NULL                        | e.g., "Main Layout v1"             |
| `is_active`   | BOOLEAN      | NOT NULL, DEFAULT true          | Only one active layout per venue   |
| `created_at`  | TIMESTAMPTZ  | NOT NULL                        |                                    |

**Open Questions:**
- [ ] Do we support layout versioning? Or is one layout per venue enough for v1?
- [ ] When a new layout is created, do old sessions keep their old layout reference?

---

### 4. `sections`
A named zone within a layout (e.g., Recliner, Premium, Standard for cinema; Window Tables for restaurant).

| Column        | Type         | Constraints                     | Notes                              |
|---------------|--------------|---------------------------------|------------------------------------|
| `id`          | UUID         | PRIMARY KEY                     |                                    |
| `layout_id`   | UUID         | NOT NULL, FK → layouts.id       |                                    |
| `name`        | VARCHAR(255) | NOT NULL                        | e.g., "Recliner", "Window Tables"  |
| `type`        | ENUM         | NOT NULL                        | SEAT \| TABLE                      |
| `display_order`| INTEGER     | NOT NULL                        | Order shown on the floor map       |
| `created_at`  | TIMESTAMPTZ  | NOT NULL                        |                                    |

**Open Questions:**
- [ ] Does a section have a color/hex code for the visual map?
- [ ] Can a section span multiple rows, or is each row its own section?

---

### 5. `seats`
An individual bookable unit — either a theater seat or a restaurant table.

| Column        | Type         | Constraints                     | Notes                                  |
|---------------|--------------|---------------------------------|----------------------------------------|
| `id`          | UUID         | PRIMARY KEY                     |                                        |
| `section_id`  | UUID         | NOT NULL, FK → sections.id      |                                        |
| `label`       | VARCHAR(20)  | NOT NULL                        | e.g., "A12", "T4" (table 4)           |
| `row`         | VARCHAR(10)  |                                 | e.g., "A", "B" — NULL for tables      |
| `number`      | INTEGER      |                                 | Seat number in row — NULL for tables   |
| `capacity`    | INTEGER      | DEFAULT 1                       | 1 for seats; 1,2,4,8 for tables       |
| `is_active`   | BOOLEAN      | NOT NULL, DEFAULT true          | Soft-disable broken/removed seats     |
| `created_at`  | TIMESTAMPTZ  | NOT NULL                        |                                        |

**Open Questions:**
- [ ] For restaurant tables, does `capacity` mean max people or exact seating?
- [ ] Can a table be booked for fewer people than its capacity?
- [ ] How do we handle accessible/wheelchair seats (special flag needed)?

---

### 6. `sessions`
A scheduled event — a movie screening, live show, or a restaurant dining time slot.

| Column          | Type         | Constraints                     | Notes                                |
|-----------------|--------------|---------------------------------|--------------------------------------|
| `id`            | UUID         | PRIMARY KEY                     |                                      |
| `venue_id`      | UUID         | NOT NULL, FK → venues.id        |                                      |
| `layout_id`     | UUID         | NOT NULL, FK → layouts.id       | Snapshot of layout at session time   |
| `title`         | VARCHAR(255) | NOT NULL                        | Movie name, show name, or "Dinner"   |
| `description`   | TEXT         |                                 |                                      |
| `poster_url`    | VARCHAR(512) |                                 | Movie/show poster image              |
| `start_time`    | TIMESTAMPTZ  | NOT NULL                        |                                      |
| `end_time`      | TIMESTAMPTZ  | NOT NULL                        |                                      |
| `status`        | ENUM         | NOT NULL, DEFAULT 'DRAFT'       | DRAFT → PUBLISHED → ONGOING → DONE  |
| `cancellation_cutoff_mins` | INTEGER | NOT NULL, DEFAULT 60  | Mins before start — no cancellation  |
| `created_by`    | UUID         | FK → users.id                   | Admin who created this session       |
| `created_at`    | TIMESTAMPTZ  | NOT NULL                        |                                      |
| `updated_at`    | TIMESTAMPTZ  | NOT NULL                        |                                      |

**Open Questions:**
- [ ] Do we store `language` and `genre` for movies?
- [ ] Is `ONGOING` a status we actually need, or do we derive it from time?
- [ ] For restaurant — is each time slot (12pm, 2pm, 7pm, 9pm) a separate session?

---

### 7. `session_sections`
Maps a section to a session and sets the price for that section in that session (dynamic pricing).

| Column        | Type         | Constraints                      | Notes                              |
|---------------|--------------|----------------------------------|------------------------------------|
| `id`          | UUID         | PRIMARY KEY                      |                                    |
| `session_id`  | UUID         | NOT NULL, FK → sessions.id       |                                    |
| `section_id`  | UUID         | NOT NULL, FK → sections.id       |                                    |
| `price`       | NUMERIC(10,2)| NOT NULL                         | Price in INR for this section      |
| `created_at`  | TIMESTAMPTZ  | NOT NULL                         |                                    |

**Unique constraint:** `(session_id, section_id)`

**Open Questions:**
- [ ] Can price be 0? (Free events / complimentary seats)
- [ ] For restaurant — is the price a per-person deposit or a per-table deposit?

---

### 8. `seat_holds` (Redis In-Memory Key-Value Storage)
Temporary distributed lock on a seat during checkout. Prevents double-booking while the user completes payment.

> **Decision Locked:** Stored in **Redis** with TTL, NOT as a persistent PostgreSQL table.
> - **Zero DB Churn:** 90%+ of holds either convert or abandon. Storing in Redis eliminates dead row bloat and VACUUM pressure in PostgreSQL.
> - **Atomic Operations:** Uses `SET seat_hold:{sessionId}:{seatId} {userId} NX EX 600`. The `NX` (Not eXists) flag guarantees atomic single-user locking without table lock contention.
> - **Auto-Expiry & WebSockets:** When the 10-minute TTL expires, Redis Keyspace Notifications (`notify-keyspace-events=Ex`) notify the Spring Boot backend, which immediately broadcasts a WebSocket `AVAILABLE` update to all clients viewing that session.

| Attribute        | Specification                    | Notes                                             |
|------------------|----------------------------------|---------------------------------------------------|
| **Storage**      | Redis In-Memory Key-Value        | Key auto-expires after TTL                        |
| **Key Pattern**  | `seat_hold:{sessionId}:{seatId}` | Combines session and seat for unique hold scoping |
| **Value**        | `{userId}`                       | UUID of the user who holds the lock               |
| **TTL**          | 600 seconds (10 minutes)         | Configurable via `booking.hold.duration.minutes`  |
| **Lock Command** | `SET key val NX EX 600`          | Fails immediately if already held                 |

**Lifecycle:**
1. **Acquire:** When user proceeds to checkout, Spring executes `SET seat_hold:{sessionId}:{seatId} {userId} NX EX 600`. If all seats succeed, hold is granted.
2. **Success:** Upon payment confirmation, Spring writes the confirmed `bookings` & `booking_items` to PostgreSQL and deletes the Redis key.
3. **Expiry / Abandon:** If TTL expires, Redis drops the key and publishes an expired event; Spring listener broadcasts `AVAILABLE` on WebSocket.

---

### 9. `bookings`
A confirmed reservation — the parent record for one booking transaction.

| Column        | Type         | Constraints                      | Notes                                  |
|---------------|--------------|----------------------------------|----------------------------------------|
| `id`          | UUID         | PRIMARY KEY                      |                                        |
| `user_id`     | UUID         | NOT NULL, FK → users.id          |                                        |
| `session_id`  | UUID         | NOT NULL, FK → sessions.id       |                                        |
| `status`      | ENUM         | NOT NULL                         | PENDING → CONFIRMED → CANCELLED        |
| `total_amount`| NUMERIC(10,2)| NOT NULL                         | Sum of all BookingItems at time of booking |
| `qr_code`     | TEXT         |                                  | Generated QR payload for check-in     |
| `checked_in_at`| TIMESTAMPTZ |                                  | NULL until staff scans QR             |
| `created_at`  | TIMESTAMPTZ  | NOT NULL                         |                                        |
| `updated_at`  | TIMESTAMPTZ  | NOT NULL                         |                                        |

**Open Questions:**
- [ ] Should `total_amount` be stored here, or always computed from BookingItems?
- [ ] What does the QR code contain — just booking ID, or a signed JWT?
- [ ] Can a user have multiple bookings for the same session? (Probably not — add UNIQUE constraint?)

---

### 10. `booking_items`
Each individual seat within a booking. One row per seat booked.

| Column            | Type         | Constraints                      | Notes                              |
|-------------------|--------------|----------------------------------|------------------------------------|
| `id`              | UUID         | PRIMARY KEY                      |                                    |
| `booking_id`      | UUID         | NOT NULL, FK → bookings.id       |                                    |
| `seat_id`         | UUID         | NOT NULL, FK → seats.id          |                                    |
| `price_at_booking`| NUMERIC(10,2)| NOT NULL                         | Snapshot price — never changes     |
| `created_at`      | TIMESTAMPTZ  | NOT NULL                         |                                    |

**Unique constraint:** `(booking_id, seat_id)`

**Open Questions:**
- [ ] Do we need a `status` per item (e.g., if partial cancellation is supported)?
- [ ] For restaurant tables, does one BookingItem = one table, or one per person?

---

### 11. `payments`
Tracks the Razorpay payment for each booking.

| Column               | Type         | Constraints                      | Notes                              |
|----------------------|--------------|----------------------------------|------------------------------------|
| `id`                 | UUID         | PRIMARY KEY                      |                                    |
| `booking_id`         | UUID         | NOT NULL, UNIQUE, FK → bookings.id |                                  |
| `razorpay_order_id`  | VARCHAR(255) | NOT NULL, UNIQUE                 | Created by our backend             |
| `razorpay_payment_id`| VARCHAR(255) | UNIQUE                           | Received after payment success     |
| `amount`             | NUMERIC(10,2)| NOT NULL                         | In INR (paise × 100 for Razorpay) |
| `currency`           | VARCHAR(3)   | NOT NULL, DEFAULT 'INR'          |                                    |
| `status`             | ENUM         | NOT NULL, DEFAULT 'PENDING'      | PENDING → SUCCESS → FAILED         |
| `webhook_verified`   | BOOLEAN      | NOT NULL, DEFAULT false          | True after signature verified      |
| `created_at`         | TIMESTAMPTZ  | NOT NULL                         |                                    |
| `updated_at`         | TIMESTAMPTZ  | NOT NULL                         |                                    |

**Open Questions:**
- [ ] Do we store raw Razorpay webhook payload for debugging/audit?
- [ ] What happens to booking status if payment fails? (PENDING → FAILED, seats released?)

---

### 12. `refunds`
Tracks refund records for cancelled bookings.

| Column               | Type         | Constraints                      | Notes                              |
|----------------------|--------------|----------------------------------|------------------------------------|
| `id`                 | UUID         | PRIMARY KEY                      |                                    |
| `payment_id`         | UUID         | NOT NULL, FK → payments.id       |                                    |
| `razorpay_refund_id` | VARCHAR(255) | UNIQUE                           | From Razorpay refund API response  |
| `amount`             | NUMERIC(10,2)| NOT NULL                         | May be less than original (cancellation fee) |
| `reason`             | TEXT         |                                  | e.g., "Customer cancelled"         |
| `status`             | ENUM         | NOT NULL, DEFAULT 'PENDING'      | PENDING → SUCCESS → FAILED         |
| `created_at`         | TIMESTAMPTZ  | NOT NULL                         |                                    |

**Open Questions:**
- [ ] Is cancellation fee a fixed amount or a percentage?
- [ ] Where is the cancellation fee configuration stored?

---

## Enum Definitions

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');

-- Venue types
CREATE TYPE venue_type AS ENUM ('RESTAURANT', 'MOVIE', 'SHOW');

-- Section types
CREATE TYPE section_type AS ENUM ('SEAT', 'TABLE');

-- Session lifecycle
CREATE TYPE session_status AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- Booking lifecycle
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- Payment status
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- Refund status
CREATE TYPE refund_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
```

---

## Key Relationships Summary

```
users           (1) ──── (∞) bookings
venues          (1) ──── (∞) layouts
venues          (1) ──── (∞) sessions
layouts         (1) ──── (∞) sections
sections        (1) ──── (∞) seats
sessions        (1) ──── (∞) session_sections
sessions        (1) ──── (∞) seat_holds (in Redis, TTL 10m)
sessions        (1) ──── (∞) bookings
bookings        (1) ──── (∞) booking_items
bookings        (1) ──── (1) payments
payments        (1) ──── (∞) refunds
seats           (1) ──── (∞) seat_holds (in Redis, TTL 10m)
seats           (1) ──── (∞) booking_items
```

---

## Decisions Still Open (Bring to Team Meeting)

- [ ] Use UUID or BIGSERIAL for primary keys?
- [ ] Soft deletes (add `deleted_at`) or hard deletes?
- [ ] Store `updated_at` on all tables, or only where needed?
- [ ] Use PostgreSQL enums or VARCHAR with application-level validation?
- [ ] How many pre-seeded venues? Is the venue list fixed forever?
- [ ] Layout versioning: simple (one layout per venue) or full version history?
- [ ] Restaurant booking: is deposit per table or per person?
