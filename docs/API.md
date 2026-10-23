# 📡 Kai Koi — Proposed REST API Contract

> ⚠️ STATUS: PROPOSED DRAFT — Review and finalize with team before writing any code.
> Last updated: 24 October 2026

---

## General Conventions

- **Base URL:** `http://localhost:8080/api` (dev) | `https://api.kaikoi.in/api` (prod)
- **Format:** All requests and responses are `application/json`
- **Auth:** Protected routes require `Authorization: Bearer <firebase_id_token>` header
- **Timestamps:** All timestamps in ISO 8601 format (`2026-10-25T10:00:00Z`)
- **IDs:** All IDs are UUIDs (`"id": "a1b2c3d4-..."`)

---

## Standard Error Response

All errors return this shape:

```json
{
  "status": 400,
  "error": "SEAT_ALREADY_HELD",
  "message": "Seat A12 is currently held by another user.",
  "timestamp": "2026-10-25T10:00:00Z",
  "path": "/api/bookings/hold"
}
```

**Agreed Error Codes (add more as needed):**

| Code                    | HTTP | When                                      |
|-------------------------|------|-------------------------------------------|
| `SEAT_ALREADY_HELD`     | 409  | Seat is held by another user              |
| `SEAT_ALREADY_BOOKED`   | 409  | Seat is already confirmed booked          |
| `HOLD_EXPIRED`          | 410  | Seat hold timed out before payment        |
| `SESSION_NOT_FOUND`     | 404  | Session ID does not exist                 |
| `BOOKING_NOT_FOUND`     | 404  | Booking ID does not exist                 |
| `PAYMENT_FAILED`        | 402  | Razorpay payment was not successful       |
| `CANCELLATION_CLOSED`   | 403  | Past the cancellation cutoff window       |
| `UNAUTHORIZED`          | 401  | No or invalid auth token                  |
| `FORBIDDEN`             | 403  | Authenticated but insufficient role       |
| `VALIDATION_ERROR`      | 400  | Request body failed validation            |

---

## Auth Endpoints

### `POST /api/auth/sync`
Called after Firebase login to sync the user into our database (create if first time).

**Auth Required:** Yes (Firebase token)

**Request Body:** _(none — user info is extracted from the Firebase token)_

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Himanshu",
  "role": "CUSTOMER"
}
```

---

## Session Endpoints (Public)

### `GET /api/sessions`
List all published sessions. Optionally filter by venue type and date.

**Auth Required:** No

**Query Params:**

| Param   | Type   | Required | Example                  |
|---------|--------|----------|--------------------------|
| `type`  | String | No       | `MOVIE`, `SHOW`, `RESTAURANT` |
| `date`  | Date   | No       | `2026-10-25`             |

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "title": "Interstellar",
    "venueType": "MOVIE",
    "startTime": "2026-10-25T18:00:00Z",
    "endTime": "2026-10-25T21:00:00Z",
    "posterUrl": "https://...",
    "status": "PUBLISHED",
    "totalSeats": 120,
    "availableSeats": 87
  }
]
```

---

### `GET /api/sessions/{sessionId}`
Get full detail of a single session, including sections and pricing.

**Auth Required:** No

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "title": "Interstellar",
  "description": "...",
  "venueType": "MOVIE",
  "startTime": "2026-10-25T18:00:00Z",
  "endTime": "2026-10-25T21:00:00Z",
  "posterUrl": "https://...",
  "status": "PUBLISHED",
  "cancellationCutoffMins": 60,
  "sections": [
    {
      "id": "uuid",
      "name": "Recliner",
      "type": "SEAT",
      "price": 500.00,
      "totalSeats": 20,
      "availableSeats": 15
    },
    {
      "id": "uuid",
      "name": "Premium",
      "type": "SEAT",
      "price": 350.00,
      "totalSeats": 40,
      "availableSeats": 32
    }
  ]
}
```

---

### `GET /api/sessions/{sessionId}/seats`
Get the full seat map for a session with real-time availability.

**Auth Required:** No

**Response `200 OK`:**
```json
{
  "sessionId": "uuid",
  "sections": [
    {
      "id": "uuid",
      "name": "Recliner",
      "price": 500.00,
      "seats": [
        { "id": "uuid", "label": "A1", "row": "A", "number": 1, "status": "AVAILABLE" },
        { "id": "uuid", "label": "A2", "row": "A", "number": 2, "status": "BOOKED" },
        { "id": "uuid", "label": "A3", "row": "A", "number": 3, "status": "HELD" }
      ]
    }
  ]
}
```

**Seat Status Values:** `AVAILABLE` | `HELD` | `BOOKED`

> 💡 This is also the initial payload sent when a client connects to the WebSocket.

---

## Booking Endpoints

### `POST /api/bookings/hold`
Temporarily lock selected seats for the authenticated user (starts the checkout timer).

**Auth Required:** Yes (CUSTOMER or ADMIN)

**Request Body:**
```json
{
  "sessionId": "uuid",
  "seatIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response `200 OK`:**
```json
{
  "holdId": "uuid",
  "seatIds": ["uuid-1", "uuid-2", "uuid-3"],
  "heldUntil": "2026-10-25T10:10:00Z",
  "totalAmount": 1050.00
}
```

**Error Cases:**
- `409 SEAT_ALREADY_HELD` — one or more seats already held by someone else
- `409 SEAT_ALREADY_BOOKED` — one or more seats already confirmed

---

### `POST /api/bookings/confirm`
Confirm a booking after successful Razorpay payment.

**Auth Required:** Yes (CUSTOMER or ADMIN)

**Request Body:**
```json
{
  "holdId": "uuid",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

**Response `201 Created`:**
```json
{
  "bookingId": "uuid",
  "status": "CONFIRMED",
  "qrCode": "KK-2026-ABCD1234",
  "session": {
    "title": "Interstellar",
    "startTime": "2026-10-25T18:00:00Z"
  },
  "seats": ["A1", "A2", "A3"],
  "totalAmount": 1050.00
}
```

---

### `GET /api/bookings/my`
Get the authenticated user's booking history.

**Auth Required:** Yes (CUSTOMER or ADMIN)

**Query Params:**

| Param    | Type   | Default    | Options                         |
|----------|--------|------------|---------------------------------|
| `status` | String | (all)      | `CONFIRMED`, `CANCELLED`        |
| `page`   | Int    | 0          |                                 |
| `size`   | Int    | 10         |                                 |

**Response `200 OK`:**
```json
{
  "content": [
    {
      "bookingId": "uuid",
      "sessionTitle": "Interstellar",
      "sessionStart": "2026-10-25T18:00:00Z",
      "seats": ["A1", "A2"],
      "totalAmount": 700.00,
      "status": "CONFIRMED",
      "createdAt": "2026-10-24T12:00:00Z"
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

### `GET /api/bookings/{bookingId}`
Get full detail of a single booking (owner or admin only).

**Auth Required:** Yes

**Response `200 OK`:**
```json
{
  "bookingId": "uuid",
  "status": "CONFIRMED",
  "qrCode": "KK-2026-ABCD1234",
  "checkedInAt": null,
  "session": {
    "id": "uuid",
    "title": "Interstellar",
    "venueType": "MOVIE",
    "startTime": "2026-10-25T18:00:00Z"
  },
  "items": [
    { "seatLabel": "A1", "section": "Recliner", "price": 500.00 },
    { "seatLabel": "A2", "section": "Recliner", "price": 500.00 }
  ],
  "totalAmount": 1000.00,
  "payment": {
    "razorpayOrderId": "order_xxx",
    "status": "SUCCESS",
    "paidAt": "2026-10-24T12:01:00Z"
  }
}
```

---

### `POST /api/bookings/{bookingId}/cancel`
Cancel a booking and trigger a Razorpay refund.

**Auth Required:** Yes (owner) or ADMIN (any booking)

**Response `200 OK`:**
```json
{
  "bookingId": "uuid",
  "status": "CANCELLED",
  "refundAmount": 950.00,
  "refundStatus": "PENDING",
  "message": "Refund will be processed within 5-7 business days."
}
```

**Error Cases:**
- `403 CANCELLATION_CLOSED` — past the cutoff window for this session

---

## Payment Endpoints

### `POST /api/payments/create-order`
Create a Razorpay order for a held booking (called before showing the payment modal).

**Auth Required:** Yes

**Request Body:**
```json
{
  "holdId": "uuid"
}
```

**Response `200 OK`:**
```json
{
  "razorpayOrderId": "order_xxx",
  "amount": 105000,
  "currency": "INR",
  "keyId": "rzp_test_xxx"
}
```

> Note: `amount` is in paise (₹1050 = 105000 paise) — required by Razorpay.

---

### `POST /api/payments/webhook`
Razorpay webhook callback — called by Razorpay server, NOT from browser.

**Auth Required:** No (but webhook signature is verified server-side)

**Request Body:** Raw Razorpay webhook payload

**Response `200 OK`:** _(empty — just acknowledge receipt)_

> ⚠️ This endpoint MUST verify `X-Razorpay-Signature` header before processing.

---

## Admin Endpoints

> All admin endpoints require `role = ADMIN`.

### Sessions
| Method | Endpoint                       | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/api/admin/sessions`          | List all sessions (all statuses) |
| POST   | `/api/admin/sessions`          | Create a new session           |
| PATCH  | `/api/admin/sessions/{id}`     | Update session details         |
| PATCH  | `/api/admin/sessions/{id}/publish` | Publish a draft session   |
| DELETE | `/api/admin/sessions/{id}`     | Cancel / delete a session      |

### Layouts & Seats
| Method | Endpoint                       | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/api/admin/layouts`           | List all layouts               |
| POST   | `/api/admin/layouts`           | Create a new layout            |
| POST   | `/api/admin/layouts/{id}/sections` | Add a section to a layout |
| POST   | `/api/admin/sections/{id}/seats`   | Bulk add seats to a section |

### Bookings
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | `/api/admin/bookings`                 | List all bookings (filterable) |
| POST   | `/api/admin/bookings/{id}/checkin`    | Mark a booking as checked in |

---

## Open Questions for Team Discussion

- [ ] Do all list endpoints support pagination? What is the default page size?
- [ ] Should the seat map (`/sessions/{id}/seats`) be cached? For how long?
- [ ] Do we return `totalSeats` and `availableSeats` on the session list, or compute on demand?
- [ ] For admin booking list — what filters do we support? (sessionId, date, status, userId)
- [ ] Do we need a `PATCH /api/users/me` endpoint for profile updates?
- [ ] Should `/api/payments/webhook` be on a separate port or have rate limiting?
