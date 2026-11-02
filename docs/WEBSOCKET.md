# ⚡ Kai Koi — WebSocket Event Schema
## Real-Time Seat Status Synchronization via STOMP

> ✅ **STATUS: LOCKED** — Updated for Movie Ticket Booking domain and Redis hold synchronization.  
> **Last updated:** November 2026

---

## Architecture Overview

When multiple users view the seat map for the same movie showtime simultaneously, any status transition (Hold, Release, Expiry, or Booking Confirmation) is pushed **instantly** to all active client browsers via STOMP over WebSocket without page reloads.

- **Technology:** STOMP over WebSocket via Spring's `spring-websocket`
- **Endpoint:** `ws://localhost:8080/ws`
- **Broker Channel:** `/topic/showtimes/{showtimeId}/seats`

---

## Connection & Subscription

### Client Initialization (TypeScript)
```typescript
import { Client } from '@stomp/stompjs';

const stompClient = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  reconnectDelay: 3000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  onConnect: () => {
    // Subscribe to live seat status updates for this showtime
    stompClient.subscribe(`/topic/showtimes/${showtimeId}/seats`, (message) => {
      const update = JSON.parse(message.body);
      handleSeatStatusUpdate(update);
    });
  }
});

stompClient.activate();
```

---

## Topics & Payloads

### 1. `/topic/showtimes/{showtimeId}/seats`

**When it fires:** Whenever seats change status in Redis or Supabase PostgreSQL.

**Payload Schema:**
```json
{
  "type": "SEAT_STATUS_UPDATE",
  "showtimeId": "3b2a1c0d-9e8f-7a6b-5c4d-3e2f1a0b9c8d",
  "updates": [
    {
      "seatId": "d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a",
      "seatLabel": "E12",
      "status": "HELD"
    },
    {
      "seatId": "e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b",
      "seatLabel": "E13",
      "status": "HELD"
    }
  ],
  "timestamp": "2026-11-02T10:00:00Z"
}
```

### Status Definitions

| Status | Meaning | Color / UI State |
|---|---|---|
| `AVAILABLE` | Free for customer selection | White outline / Clickable |
| `HELD` | Temporarily locked during another user's checkout | Amber / Pulsing / Disabled |
| `BOOKED` | Confirmed ticket purchased | Dark Gray / Solid / Disabled |
| `BLOCKED` | Cinema staff hold or wheelchair/maintenance | Crossed out / Disabled |

---

## Event Trigger Matrix

| User / System Action | Trigger Mechanism | Broadcasted Status |
|---|---|---|
| Customer proceeds to pay | Redis `SET seat_hold:... NX EX 600` succeeds | `HELD` |
| Hold times out (10 mins) | Redis Keyspace Expiration (`__keyevent@0__:expired`) | `AVAILABLE` |
| Customer clicks "Cancel Hold" | Backend deletes key `DEL seat_hold:...` | `AVAILABLE` |
| Payment captured | Razorpay Webhook commits tickets to Supabase DB | `BOOKED` |
| Booking cancelled by customer | Refund API completed; ticket revoked | `AVAILABLE` |

---

## Client Synchronization Strategy

1. **Initial Full Load:** When entering the seat selection page, the frontend calls the REST endpoint:
   ```
   GET /api/showtimes/{showtimeId}/seats
   ```
2. **Delta Updates via WebSocket:** After connecting, the frontend applies only the delta `updates` received over the STOMP subscription into its local seat state store.
3. **Reconnection Recovery:** If network connectivity drops, the client automatically re-fetches `GET /api/showtimes/{showtimeId}/seats` upon reconnecting to ensure complete consistency.
