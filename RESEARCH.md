# RESEARCH.md

## Real-Time Location Tracking – Architecture Decision

### Problem Context

Unolo wants to move from manual check-ins to **real-time employee location tracking**, where field employees continuously send their location and managers can see live updates on a dashboard.

The solution needs to work at scale, be reliable on mobile networks, conserve battery, and stay affordable for a startup.

---

## 1. Technology Options Considered

### WebSockets

WebSockets maintain a persistent two-way connection between client and server.

**Pros**

- Very low latency
- True real-time updates

**Cons**

- Hard to scale with thousands of concurrent mobile users
- Persistent connections drain mobile battery
- Mobile networks frequently drop connections
- Requires complex reconnection and load-balancing logic

**Verdict:** Powerful but risky for large-scale mobile tracking.

---

### Server-Sent Events (SSE)

SSE allows the server to push updates to the client over HTTP.

**Pros**

- Simple to implement
- Automatic reconnection
- Lower server overhead than WebSockets

**Cons**

- One-way only (client → server still needs HTTP)
- Not ideal for high-frequency updates

**Verdict:** Good for dashboards, not ideal for ingesting mobile location data.

---

### Long Polling

Client repeatedly requests updates from the server.

**Pros**

- Very simple
- Works everywhere

**Cons**

- High request overhead
- Poor scalability
- Increased latency

**Verdict:** Not suitable beyond small systems.

---

### Third-Party Services (Firebase, Pusher, Ably)

Managed real-time platforms.

**Pros**

- Fast to implement
- Built-in scaling and reliability

**Cons**

- Ongoing cost
- Vendor lock-in
- Less control over data

**Verdict:** Good for prototypes, expensive long-term.

---

## 2. Final Recommendation

### Hybrid Approach: **HTTP + WebSockets**

- **Employees send location updates via HTTP** every 30 seconds
- Backend stores latest location
- **Managers receive live updates via WebSockets**
- WebSockets are used only for broadcasting, not ingestion

---

## 3. Why This Fits Unolo

- **Scales well:** HTTP handles high write volume better than persistent sockets
- **Battery-friendly:** Short HTTP requests are cheaper than long-lived connections
- **Reliable:** HTTP works better on unstable mobile networks
- **Cost-effective:** No third-party dependency
- **Fast to build:** Uses existing REST APIs with minimal WebSocket logic

---

## 4. Trade-offs

- Updates are near real-time, not millisecond-level
- Slightly more complex than a single-technology solution
- Would need redesign if update frequency increases significantly

I would reconsider this approach if:

- Updates are required every few seconds
- Active users exceed tens of thousands simultaneously

---

## 5. High-Level Implementation Plan

**Backend**

- `POST /api/location/update`
- Store latest employee location (DB or Redis)
- WebSocket server for managers
- Authenticate sockets using JWT

**Frontend / Mobile**

- Background task sending location every 30 seconds
- Retry logic for network failures
- Manager dashboard subscribes to live updates

**Infrastructure**

- Load balancer
- Optional Redis for fast reads
- Horizontal API scaling

---

## Conclusion

There is no perfect real-time solution. This hybrid model balances **scale, reliability, battery usage, cost, and development speed**, making it a practical choice for Unolo’s current stage while leaving room to evolve later.
