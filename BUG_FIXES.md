# 🛠 Bug Fix Documentation

This file tracks critical bug fixes, logic corrections, and database query optimizations within the backend services.

---

## 1. Login Sometimes Fails Even With Correct Credentials

### Location

- File: `backend/routes/auth.js`
- Route: `POST /login`
- Lines: ~27–35 (password validation logic)

---

### What Was Wrong

The login API was validating passwords using `bcrypt.compare()` without awaiting its result:

````js
const isValidPassword = bcrypt.compare(password, user.password);

### 🛠 How It Was Fixed
I awaited the result of bcrypt.compare() so that password validation uses the resolved boolean value

```js
const isValidPassword = await bcrypt.compare(password, user.password);
````

### Why This Fix Is Correct

bcrypt.compare() must be awaited to return a true/false result and Prevents race conditions during authentication

---

## 2. Check-in Form Submission Failure

**Location:** `backend/routes/checkin.js`  
**Scope:** `GET /clients` controller (Lines 6–25)

### ❌ What Was Wrong

The `/clients` API was returning an empty array (`[]`) even though data existed in the database.

- **Logic Error:** The SQL query used `WHERE ec.employee_id = req.user.id`.
- **Entity Mismatch:** This assumed the logged-in user’s ID was interchangeable with an `employee_id`.
- **The Conflict:** In the current schema, `req.user.id` represents a **Manager/User**, whereas `employee_clients.employee_id` represents a specific **Employee entity**. Because these IDs belong to different tables/entities, the match failed, resulting in zero rows returned.

### 🛠 How It Was Fixed

The incorrect filter was removed, and the query was updated to fetch clients based on the actual many-to-many relationship structure.

**Updated Query:**

```sql
SELECT DISTINCT c.*
FROM clients c
JOIN employee_clients ec ON c.id = ec.client_id;
```

---

# 3. Dashboard shows incorrect data for some users

**File Path:** `backend/routes/dashboard.js`  
**Controller:** `/employee` (Lines 80–90)

---

## 📝 Problem Statement

The Employee Dashboard was failing to load, returning a `500 Internal Server Error` with the message: `{ "success": false, "message": "Failed to fetch dashboard" }`.

### Root Cause

The application threw a `SqliteError: near "7": syntax error`. This occurred because the backend was attempting to execute **MySQL-specific** date functions on a **SQLite** database.

- **Incompatible Functions:** SQLite does not recognize `NOW()`, `DATE_SUB()`, or the `INTERVAL` keyword.
- **Failure Point:** When the query engine hit the `INTERVAL 7 DAY` syntax, it crashed, triggering the `catch` block and failing the entire API request.

---

## 🛠️ Changes Implemented

I refactored the SQL query to use SQLite-compliant date syntax to calculate the 7-day lookback period.

### SQL Logic Comparison

**❌ Old Logic (MySQL - Incompatible):**

```sql
SELECT COUNT(*) AS total_checkins
FROM checkins
WHERE employee_id = ?
AND checkin_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)


SELECT COUNT(*) AS total_checkins,
COUNT(DISTINCT client_id) AS unique_clients
FROM checkins
WHERE employee_id = ?
AND checkin_time >= datetime('now', '-7 days');
```

---

# 4. Attendance history page crashes on load

**Location:** `frontend/pages/History.jsx` | **Component:** `History.jsx` ,line:- 5

### ❌ What Was Wrong

The page would completely crash (White Screen) on load.

- **The Cause:** The `checkins` state was initialized as `null` (`useState(null)`).
- **The Trigger:** The component attempted to call `.reduce()` on `checkins` before the data had finished fetching. Since `.reduce()` cannot be called on `null`, React threw a fatal runtime error.

### 🛠 How It Was Fixed

Changed the initial state from `null` to an empty array `[]`.

**Code Change:**

```javascript
// ❌ Old Logic
const [checkins, setCheckins] = useState(null);

// ✅ New Logic
const [checkins, setCheckins] = useState([]);
```

---

# 5. API returns wrong status codes in certain scenarios

## Location

- **File:** `backend/routes/checkIn.js`
- **Route:** `POST /`
- **Line:** 33

---

## What Was Wrong

The API was incorrectly returning a `200 OK` status code even when validation failed due to a missing `client_id`.

- **The Issue:** A `200` status signifies a successful operation, which contradicts the response body `{ "success": false }`. This makes it difficult for frontend error-handling logic (like Axios interceptors) to detect the failure automatically.

```js
// ❌ Incorrect logic: Returning 200 for a client error
if (!client_id) {
  return res
    .status(200)
    .json({ success: false, message: "Client ID is required" });
}
// ✅ Corrected logic: Returning 400 for missing parameters
if (!client_id) {
  return res
    .status(400)
    .json({ success: false, message: "Client ID is required" });
}
```

---

# 6. Location data is not being saved correctly

## Location

- **Frontend:** `frontend/components/CheckIn.jsx`
  - **Function:** `handleCheckIn` (~Lines 65–72) Note:- code between these lines are modified
- **Backend:** `backend/routes/checkIn.js`
  - **Route:** `POST /` (~Lines 30–55)

---

## What Was Wrong

The application was saving incorrect or `NULL` coordinates (`lat`, `lng`) during the check-in process without alerting the user or the system.

- **Frontend Issue:** The request used optional chaining (`location?.latitude`). If permissions were denied or the location hadn't been fetched yet, the values sent were `undefined`.
- **Backend Issue:** The API did not validate these coordinates before executing the database `INSERT`. This led to "silent failures" where check-in records were created without any geographical data.

---

## How I Fixed It

### Frontend Fix

Added a guard clause to prevent the API call if the location object or its coordinates are missing.

```javascript
if (!location || location.latitude == null || location.longitude == null) {
  setError("Location is required to check in");
  return;
}

# Backend Fix:
if (latitude == null || longitude == null) {
  return res.status(400).json({
    success: false,
    message: "Location (latitude and longitude) is required",
  });
}

```

---

## 7. Some React components have performance issues and don't update correctly

### Location

- File: `frontend/components/History.jsx`
- Component: `History.jsx`
- Lines: ~45–54 (derived calculations)
- Lines: ~10–12 (data fetching logic)

---

### What Was Wrong

The `History` component had performance and update issues due to two main problems:

1. **Expensive derived calculations were executed on every render**

The total working hours were calculated directly inside the component body using `.reduce()`.  
This calculation ran on every render, even when the `checkins` data had not changed, causing unnecessary computation.

2. **Data fetching was not reactive to filter state changes**

The history data depended on `startDate` and `endDate`, but the component did not automatically re-fetch data when these values changed.  
This caused the UI to sometimes display stale data and required manual refresh logic.

---

### How I Fixed It

1. **Optimized derived calculations using `useMemo`**

Wrapped the total hours calculation in `useMemo` so it only recalculates when the `checkins` array changes:

```js
const totalHours = useMemo(() => {
  return checkins.reduce((total, checkin) => {
    if (checkin.checkout_time) {
      const checkinTime = new Date(checkin.checkin_time);
      const checkoutTime = new Date(checkin.checkout_time);
      return total + (checkoutTime - checkinTime) / (1000 * 60 * 60);
    }
    return total;
  }, 0);
}, [checkins]);

2. **Updated `useMemo` dependencies to keep data in sync**
 useEffect(() => {
  fetchHistory();
}, [startDate, endDate]);

```
