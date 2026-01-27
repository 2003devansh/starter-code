# QUESTIONS.md

## Technical Questions

### 1. If this app had 10,000 employees checking in simultaneously, what would break first? How would you fix it?

The database would be the first bottleneck.

Each check-in currently performs multiple synchronous database operations:

- Assignment validation
- Active check-in check
- Client lookup
- Insert into checkins table

With 10,000 concurrent requests, this would cause:

- Connection pool exhaustion
- Increased query latency
- Potential write locks on the checkins table

**Fixes:**

- Increase database connection pool size
- Add proper indexes on `checkins(employee_id, status)` and `employee_clients(employee_id, client_id)`
- Use transactions where necessary
- Use a queue (e.g., Redis / Kafka) for non-critical writes like analytics

---

### 2. The current JWT implementation has a security issue. What is it and how would you improve it?

**Issue:**
The JWT payload includes sensitive information such as the user's password (even if hashed).  
Additionally, tokens are long-lived and not revocable.

**Improvements:**

- Never include sensitive data (like passwords) in JWT payloads
- Keep JWT payload minimal (user_id, role only)
- Use short-lived access tokens with refresh tokens
- Store refresh tokens securely (HTTP-only cookies or database)
- Implement token revocation on logout

---

### 3. How would you implement offline check-in support?

**Approach:**

- Detect offline status using browser APIs
- Store check-in data locally (IndexedDB or localStorage)
- Mark check-ins as `pending_sync`
- When connectivity is restored:
  - Sync pending check-ins to backend
  - Resolve conflicts using timestamps
  - Update UI once server confirms persistence

This ensures uninterrupted usage while maintaining data consistency.

---

## Theory / Research Questions

### 4. Explain the difference between SQL and NoSQL databases. Which would you recommend here?

**SQL Databases:**

- Structured schema
- Strong consistency
- Complex joins supported
- Ideal for relational data

**NoSQL Databases:**

- Schema-less or flexible schema
- Horizontally scalable
- Optimized for high-volume reads/writes
- Limited join support

**Recommendation:**
SQL is the better choice for this application because:

- Data is highly relational (users, employees, clients, check-ins)
- Strong consistency is required (attendance, time tracking)
- Complex queries and reports are common

---

### 5. What is the difference between authentication and authorization? Where are they implemented?

**Authentication:**

- Verifies who the user is
- Implemented using JWT (`authenticateToken` middleware)

**Authorization:**

- Determines what the user is allowed to do
- Implemented using role checks (`requireManager` middleware)

Both are clearly separated in the middleware layer.

---

### 6. What is a race condition? Are there any in this codebase?

A race condition occurs when multiple requests modify shared data simultaneously, leading to inconsistent results.

**Potential race condition:**

- Two check-in requests arriving at the same time could bypass the "active check-in" check.

**Prevention strategies:**

- Use database transactions
- Add unique constraints (employee_id + status = checked_in)
- Use row-level locking
- Perform atomic operations at the database level

---
