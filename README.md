AssetFlow

Enterprise Asset & Resource Management, Simplified.

AssetFlow is a centralized ERP platform designed to simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources. By transitioning away from manual tracking spreadsheets, AssetFlow provides real-time visibility into asset lifecycles, condition, and ownership. The platform strictly focuses on core operational functionality, purposefully excluding purchasing, invoicing, and accounting workflows.

🛠 Tech Stack
The platform is built on a highly scalable, modern web stack utilizing a monorepo architecture (npm workspaces) to cleanly separate the frontend and backend.
Layer
Technology

Description

Frontend
Next.js 16 (App Router)
Handles Server-Side Rendering and routing. Styled with Tailwind CSS v4 for highly performant, utility-driven UI components.

Backend
Node.js / Express
Robust API layer with strict end-to-end type safety.

Database
PostgreSQL 17
Industry-standard relational database handling concurrent operations.

ORM
Prisma
Manages database schemas, migrations, and queries with end-to-end TypeScript safety.

Validation
Zod
Ensures robust data schema validation across the stack.

✨ Core Features

Role-Based Access Control: Strict hierarchical roles including Employees (book/view resources), Department Heads (intra-department approvals), Asset Managers (cross-department transfers, maintenance), and Admins (master data).
Targeted Dashboards: * Admins: Global real-time KPI view (Available/Allocated assets, active bookings, overdue returns).
Employees: Personalized userspace showing only assigned assets, upcoming returns, and pending requests.
Asset Lifecycle & Conflict Resolution: Assets transition through dynamic states (Available, Allocated, Reserved, Under Maintenance, etc.). The system strictly prevents double-allocation, automatically routing blocked requests to a Transfer Request workflow.
Advanced Resource Booking: A dedicated daily/weekly schedule interface prevents time-slot overlaps and allows users to manage upcoming bookings.
Maintenance Management: A Kanban-style dashboard for Managers to track, approve/reject, and assign technicians to repair tickets before an asset's state transitions to "Under Maintenance."
Structured Audits: Admins can define audit scopes and assign auditors. The system auto-generates discrepancy reports upon closure, locking in status updates (e.g., marking unverified items as "Lost").

🚀 Local Development Setup

Prerequisites
Node.js 20+
Docker (for local Postgres) — or your own Postgres instance
1. Database Configuration
Bash
cp .env.example .env      # Set a real POSTGRES_PASSWORD
docker compose up -d

2. Backend Setup
Bash
cd backend
cp .env.example .env      # Set JWT_SECRET, and DATABASE_URL to match step 1
npm install
npx prisma migrate dev
npm run dev               # API runs on http://localhost:4000

3. Frontend Setup
Bash
cd frontend
cp .env.example .env      # JWT_SECRET MUST match the backend's exactly
npm install
npm run dev               # App runs on http://localhost:3000

⚠️ Important Note on JWT_SECRET: > The frontend (Next.js middleware) and backend (Express) each verify the session JWT independently—there is no shared session store. If the secrets do not match, every request will look logged-out even after a successful login. In production, set JWT_SECRET via your hosting platform's secret manager for both services, and keep them in sync.

🏗 Architecture Notes
Data Flow: The frontend never talks to Postgres directly. All data access goes through the backend API. Auth forms call the backend at NEXT_PUBLIC_API_URL with credentials: 'include' so the session cookie set by the backend is stored and sent back on later requests.
Route Guarding: backend/src/middleware/auth.middleware.ts guards any route that requires a session (e.g., /api/dashboard/summary).
Security: Rate limiting and CSRF origin checks are enforced in the backend (backend/src/middleware/), since that's where the browser's requests actually land—not in the Next.js middleware, which only ever sees requests to Next.js's own routes.
Development vs. Production: Password reset links are logged server-side in development only (NODE_ENV !== 'production') and are never included in the API response. In a real deployment, wire forgotPassword in backend/src/controllers/auth.controller.ts up to an email provider.

🌍 Deployment
Set NODE_ENV=production and a real JWT_SECRET on both services. The app intentionally fails to start in production without a secret, rather than silently falling back to an insecure default.
Future Scalability Roadmap: To take this from a solid foundation to enterprise-level scale, the following are planned:
App Containerization (Docker): Dedicated Dockerfiles for both Next.js and Express for deployment on Kubernetes or AWS ECS.
Caching Layer (Redis): Caching frequent, read-heavy database queries to reduce Postgres load.
CI/CD Pipelines: Automated GitHub Actions for TS checks, linting, and testing prior to merges.
Enterprise Authentication: Migrating to a managed provider (Auth.js/Clerk) for OAuth, SSO, and MFA support.

