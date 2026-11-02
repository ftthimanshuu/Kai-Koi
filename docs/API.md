# 📡 Kai Koi — REST API Specification
## Movie Ticket Management & Booking Platform

> ✅ **STATUS: LOCKED** — Updated for Movie Ticket Booking domain and Supabase JWT authentication.  
> **Last updated:** November 2026

---

## General Conventions

- **Base URL:** `http://localhost:8080/api` (dev) | `https://api.kaikoi.in/api` (prod)
- **Format:** Requests and responses are `application/json`
- **Auth:** Protected routes require `Authorization: Bearer <supabase_jwt>` header
- **Timestamps:** ISO 8601 (`2026-11-02T10:00:00Z`)
- **IDs:** UUIDs (`"a1b2c3d4-..."`)

---

## Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-11-02T10:00:00Z"
}
```

### Error Response Envelope
```json
{
  "status": 409,
  "error": "SEAT_ALREADY_HELD",
  "message": "Seat E12 is currently held by another customer.",
  "timestamp": "2026-11-02T10:00:00Z",
  "path": "/api/bookings/hold"
}
```

**Common Error Codes:**
- `SEAT_ALREADY_HELD` (409) — Another user has locked this seat in Redis
- `SEAT_ALREADY_BOOKED` (409) — Seat is already confirmed in PostgreSQL
- `HOLD_EXPIRED` (410) — 10-minute hold window expired
- `SHOWTIME_NOT_FOUND` (404) — Invalid showtime ID
- `MOVIE_NOT_FOUND` (404) — Invalid movie ID
- `BOOKING_NOT_FOUND` (404) — Invalid booking ID
- `CANCELLATION_CLOSED` (403) — Within 2 hours of showtime start
- `UNAUTHORIZED` (401) — Missing or invalid Supabase JWT
- `FORBIDDEN` (403) — Insufficient role permissions

---

## 1. Authentication Endpoints

### `POST /api/auth/sync`
Synchronizes the user profile into `public.users` upon Supabase login.

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Request Body:**
```json
{
  "name": "Himanshu Lokhande",
  "phone": "+919876543210"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "e4f8b2c1-3d9a-4c7b-8e1f-2a3b4c5d6e7f",
    "supabaseUid": "bb8e5472-8813-4a11-b0db-6e11504d80a1",
    "email": "himanshu@example.com",
    "name": "Himanshu Lokhande",
    "role": "CUSTOMER"
  }
}
```

---

## 2. Movies & Showtimes (Public)

### `GET /api/movies`
List movies currently screening or upcoming.

- **Query Parameters:** `status` (`NOW_SHOWING` \| `UPCOMING`), `genre`, `language`
- **Response `200 OK`:**
```json
[
  {
    "id": "8a7d6c5b-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
    "title": "Interstellar",
    "description": "A team of explorers travel through a wormhole in space...",
    "durationMins": 169,
    "language": "English",
    "censorRating": "UA_13",
    "genres": "Sci-Fi, Adventure, Drama",
    "posterUrl": "https://images.kaikoi.in/posters/interstellar.jpg",
    "bannerUrl": "https://images.kaikoi.in/banners/interstellar-banner.jpg",
    "releaseDate": "2026-11-05",
    "status": "NOW_SHOWING"
  }
]
```

### `GET /api/movies/{id}/showtimes`
Retrieve all showtimes scheduled for a specific movie.

- **Query Parameters:** `date` (e.g. `2026-11-05`)
- **Response `200 OK`:**
```json
[
  {
    "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
    "screenId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "screenName": "Screen 1 - Dolby Atmos",
    "format": "IMAX",
    "startTime": "2026-11-05T18:00:00Z",
    "endTime": "2026-11-05T20:49:00Z",
    "startingPrice": 220.00,
    "availableSeats": 112,
    "totalSeats": 140
  }
]
```

### `GET /api/showtimes/{id}/seats`
Returns the full screen layout, sections, dynamic pricing, and current availability status.

- **Auth Required:** No
- **Response `200 OK`:**
```json
{
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "movieTitle": "Interstellar",
  "screenName": "Screen 1 - Dolby Atmos",
  "startTime": "2026-11-05T18:00:00Z",
  "sections": [
    {
      "sectionId": "sec-rec-01",
      "name": "Recliner",
      "price": 480.00,
      "rows": [
        {
          "rowLabel": "A",
          "seats": [
            { "id": "seat-a1", "number": 1, "label": "A1", "status": "AVAILABLE" },
            { "id": "seat-a2", "number": 2, "label": "A2", "status": "HELD" },
            { "id": "seat-a3", "number": 3, "label": "A3", "status": "BOOKED" }
          ]
        }
      ]
    },
    {
      "sectionId": "sec-prm-02",
      "name": "Prime",
      "price": 320.00,
      "rows": [ ... ]
    }
  ]
}
```

---

## 3. Seat Holds & Booking (Customer)

### `POST /api/bookings/hold`
Acquires atomic distributed Redis locks on selected seats (max 10).

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Request Body:**
```json
{
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "seatIds": [
    "seat-a1",
    "seat-a2"
  ]
}
```
- **Response `201 Created`:**
```json
{
  "holdId": "hld-9f8e7d6c5b4a",
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "seatCount": 2,
  "seatLabels": ["A1", "A2"],
  "totalPrice": 960.00,
  "heldUntil": "2026-11-02T10:10:00Z",
  "expiresInSeconds": 600
}
```

### `POST /api/bookings/release`
Manually releases an active hold before expiration.

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Request Body:**
```json
{
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "seatIds": ["seat-a1", "seat-a2"]
}
```
- **Response `200 OK`:** `{"success": true, "message": "Seats released"}`

---

## 4. Payments (Razorpay Integration)

### `POST /api/payments/create-order`
Creates a Razorpay order for an active hold.

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Request Body:**
```json
{
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "seatIds": ["seat-a1", "seat-a2"]
}
```
- **Response `200 OK`:**
```json
{
  "razorpayOrderId": "order_Nz83Ka90AklZ8q",
  "amount": 96000,
  "currency": "INR",
  "keyId": "rzp_test_KA12345678"
}
```

### `POST /api/payments/webhook`
Razorpay callback fired on payment success. Verifies HMAC-SHA256 signature, commits booking, and releases Redis lock.

- **Headers:** `X-Razorpay-Signature: <hmac_hex>`
- **Response `200 OK`:** `{"status": "OK"}`

### `POST /api/bookings/confirm`
Called by frontend upon successful checkout modal return to retrieve confirmed ticket with QR code.

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Request Body:**
```json
{
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "razorpayOrderId": "order_Nz83Ka90AklZ8q",
  "razorpayPaymentId": "pay_Nz84Ll39ZqaL0r",
  "razorpaySignature": "9a8b7c6d5e4f3a2b1c..."
}
```
- **Response `200 OK`:**
```json
{
  "bookingId": "bk-1102-892401",
  "bookingReference": "KK-892401",
  "movieTitle": "Interstellar",
  "screenName": "Screen 1 - Dolby Atmos",
  "startTime": "2026-11-05T18:00:00Z",
  "totalAmount": 960.00,
  "status": "CONFIRMED",
  "tickets": [
    {
      "ticketId": "tkt-01",
      "seatLabel": "A1",
      "sectionName": "Recliner",
      "price": 480.00,
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
    },
    {
      "ticketId": "tkt-02",
      "seatLabel": "A2",
      "sectionName": "Recliner",
      "price": 480.00,
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
    }
  ]
}
```

---

## 5. Booking History & Cancellations

### `GET /api/bookings/my`
Retrieves past and upcoming movie ticket bookings for the logged-in customer.

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Response `200 OK`:** Array of booking records with ticket details.

### `POST /api/bookings/{id}/cancel`
Cancels booking and initiates refund if prior to the 2-hour cutoff window.

- **Auth Required:** Yes (`Bearer <supabase_jwt>`)
- **Response `200 OK`:**
```json
{
  "bookingId": "bk-1102-892401",
  "status": "CANCELLED",
  "refundAmount": 864.00,
  "cancellationFee": 96.00,
  "message": "Refund initiated via Razorpay"
}
```

---

## 6. Admin Endpoints (`hasRole('ADMIN')`)

- `POST /api/admin/movies` — Create movie record
- `PUT /api/admin/movies/{id}` — Update movie metadata
- `POST /api/admin/screens` — Create screen & seat layout
- `POST /api/admin/showtimes` — Schedule showtime & set dynamic section prices
- `POST /api/admin/tickets/check-in` — Validate ticket QR code scan at cinema entrance
