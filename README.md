# AssetFlow

Enterprise asset and resource management. Two-service project:

- `frontend/` — Next.js 16 app (UI, pages, auth forms)
- `backend/` — Express API (auth, dashboard data, Prisma/Postgres)

## Prerequisites

- Node.js 20+
- Docker (for local Postgres) — or your own Postgres instance

## Setup

1. **Database**

   ```bash
   cp .env.example .env      # set a real POSTGRES_PASSWORD
   docker compose up -d
   ```

2. **Backend**

   ```bash
   cd backend
   cp .env.example .env      # set JWT_SECRET, and DATABASE_URL to match step 1
   npm install
   npx prisma migrate dev
   npm run dev                # http://localhost:4000
   ```

3. **Frontend**

   ```bash
   cd frontend
   cp .env.example .env      # JWT_SECRET must match the backend's exactly
   npm install
   npm run dev                # http://localhost:3000
   ```

Open [http://localhost:3000](http://localhost:3000).

## Why two `.env` files need the same `JWT_SECRET`

The frontend (Next.js middleware) and backend (Express) each verify the
session JWT independently — there's no shared session store. If the
secrets don't match, every request will look logged-out even after a
successful login. In production, set `JWT_SECRET` via your hosting
platform's secret manager for both services, and keep them in sync.

## Architecture notes

- The frontend never talks to Postgres directly — all data access goes
  through the backend API. Auth forms call the backend at
  `NEXT_PUBLIC_API_URL` with `credentials: 'include'` so the session
  cookie set by the backend is stored and sent back on later requests.
- `backend/src/middleware/auth.middleware.ts` guards any route that
  requires a session (currently `/api/dashboard/summary`).
- Rate limiting and CSRF origin checks are enforced in the backend
  (`backend/src/middleware/`), since that's where the browser's requests
  actually land — not in the Next.js middleware, which only ever sees
  requests to Next.js's own routes.
- Password reset links are logged server-side in development only
  (`NODE_ENV !== 'production'`) and are never included in the API
  response. In a real deployment, wire `forgotPassword` in
  `backend/src/controllers/auth.controller.ts` up to an email provider
  instead of the console.log.

## Deploying

Set `NODE_ENV=production` and a real `JWT_SECRET` on both services —
the app intentionally fails to start in production without one, rather
than silently falling back to an insecure default.
