# ⚡ Kai Koi — Proposed WebSocket Event Schema

> ⚠️ STATUS: PROPOSED DRAFT — Review and finalize with team before writing any code.
> Last updated: 24 October 2026

---

## Why WebSockets?

When multiple users view the same session's seat map simultaneously, they need to see real-time changes — the moment someone holds or books a seat, everyone else should see it update instantly without refreshing the page.

**Technology:** STOMP over WebSocket (Spring's built-in support via `spring-websocket`)

---

## Connection

**WebSocket Endpoint:** `ws://localhost:8080/ws`

**Client connects using STOMP:**
```javascript
const client = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  onConnect: () => {
    // Subscribe to seat updates for a specific session
    client.subscribe(`/topic/session/${sessionId}/seats`, (message) => {
      const update = JSON.parse(message.body);
      // update the UI
    });
  }
});
client.activate();
```

---

## Topics (Subscriptions)

### 1. `/topic/session/{sessionId}/seats`

**Who subscribes:** Any browser viewing the seat map for that session.

**When it fires:** Whenever a seat's status changes — held, released, or booked.

**Message Payload:**
```json
{
  "type": "SEAT_STATUS_UPDATE",
  "sessionId": "uuid",
  "updates": [
    {
      "seatId": "uuid",
      "seatLabel": "A12",
      "status": "HELD"
    },
    {
      "seatId": "uuid",
      "seatLabel": "A13",
      "status": "HELD"
    }
  ],
  "timestamp": "2026-10-25T10:00:00Z"
}
```

**Status Values:**

| Status      | Meaning                                              |
|-------------|------------------------------------------------------|
| `AVAILABLE` | Seat is free to select                               |
| `HELD`      | Seat is temporarily locked by another user (checkout)|
| `BOOKED`    | Seat is confirmed — cannot be selected               |

---

### 2. `/topic/session/{sessionId}/availability`

**Who subscribes:** The session listing page (home screen) to update the available seat count.

**When it fires:** When the total available seat count changes meaningfully.

**Message Payload:**
```json
{
  "type": "AVAILABILITY_UPDATE",
  "sessionId": "uuid",
  "availableSeats": 84,
  "timestamp": "2026-10-25T10:00:00Z"
}
```

---

## Events That Trigger a Broadcast

| Action                              | Broadcast Topic                         | New Status   |
|-------------------------------------|-----------------------------------------|--------------|
| User selects seats → hold created   | `/topic/session/{id}/seats`             | `HELD`       |
| Hold expires (user abandoned cart)  | `/topic/session/{id}/seats`             | `AVAILABLE`  |
| User cancels hold manually          | `/topic/session/{id}/seats`             | `AVAILABLE`  |
| Payment confirmed → booking created | `/topic/session/{id}/seats`             | `BOOKED`     |
| Booking cancelled                   | `/topic/session/{id}/seats`             | `AVAILABLE`  |

---

## Initial State on Connect

When the frontend first loads the seat map, it calls the REST endpoint to get full seat state:

```
GET /api/sessions/{sessionId}/seats
```

After that, it subscribes to the WebSocket topic and applies **delta updates only** — it does not re-fetch the full map on every change.

---

## Error Handling on WebSocket

If the WebSocket connection drops:
1. Client should attempt to reconnect every 3 seconds (STOMP client handles this automatically)
2. On reconnect, client should re-fetch `/api/sessions/{sessionId}/seats` to get fresh state
3. Then re-subscribe to the topic

---

## Open Questions for Team Discussion

- [ ] Do we send **delta updates** (only changed seats) or the **full seat list** every time?
  - Delta is more efficient but requires the frontend to maintain local state correctly
  - Full list is simpler but wastes bandwidth for large venues
  - **Recommendation:** Delta updates with reconnect fallback to full fetch

- [ ] Should `HELD` seats show a countdown timer on the UI?
  - The `heldUntil` timestamp is returned at hold creation time — frontend can compute the countdown locally without another WebSocket message

- [ ] Do we need a **user-level** private WebSocket channel?
  - e.g., `/user/queue/booking-status` to push booking confirmation to the specific user
  - Or can we rely on the POST /bookings/confirm REST response?
  - **Recommendation:** Use REST response for confirmation, WebSocket only for seat map updates

- [ ] What happens to held seats shown to User A when User B's hold expires?
  - The expiry cleanup job fires → backend broadcasts `AVAILABLE` on the topic → User A's map auto-updates

- [ ] Do admin users need a separate topic with extra info (e.g., which user holds which seat)?
  - `/topic/admin/session/{id}/seats` with `heldByUserId` in the payload?
