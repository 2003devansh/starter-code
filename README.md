# Unolo Field Force Tracker

A web application for tracking field employee check-ins at client locations.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js, SQLite
- **Authentication:** JWT

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm run setup    # Installs dependencies and initializes database
cp .env.example .env
npm run dev
```

Backend runs on: `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Test Credentials

| Role     | Email              | Password    |
|----------|-------------------|-------------|
| Manager  | manager@unolo.com | password123 |
| Employee | rahul@unolo.com   | password123 |
| Employee | priya@unolo.com   | password123 |

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── scripts/         # Database init scripts
│   └── server.js        # Express app entry
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── utils/       # API helpers
│   └── index.html
└── database/            # SQL schemas (reference only)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Check-ins
- `GET /api/checkin/clients` - Get assigned clients
- `POST /api/checkin` - Create check-in
- `PUT /api/checkin/checkout` - Checkout
- `GET /api/checkin/history` - Get check-in history
- `GET /api/checkin/active` - Get active check-in

### Dashboard
- `GET /api/dashboard/stats` - Manager stats
- `GET /api/dashboard/employee` - Employee stats

## Notes

- The database uses SQLite - no external database setup required
- Run `npm run init-db` to reset the database to initial state
