# StockFlow

> Inventory Management System built for **Allo Health**

StockFlow is a full-stack inventory and reservation management platform supporting role-based access, concurrency-safe reservations, auto-expiry, and real-time monitoring.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Cache / Idempotency**: Upstash Redis
- **Auth**: NextAuth.js (JWT + role-based sessions)
- **Styling**: Tailwind CSS
- **Cron Jobs**: Vercel Cron
- **Deployment**: Vercel

## Roles

| Role | Access |
|---|---|
| Customer | Browse products, reserve items, track orders |
| Warehouse Manager | Manage stock, process orders |
| Admin | Full control — products, warehouses, monitoring |
| Delivery Agent | View assigned orders, mark as delivered |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd stockflow
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your DATABASE_URL, NEXTAUTH_SECRET, and Upstash Redis credentials
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

See `allo_system_architecture.svg` for the full system map.

```
Auth & Roles (NextAuth + JWT)
       ↓
Inventory Management (Product Catalog + Warehouse + Stock Tracker)
       ↓
Customer Storefront (Listing + Detail + Cart/Checkout)
       ↓
Reservation Engine (SELECT FOR UPDATE + 409/410 handling)
       ↓
Auto-expiry & Reliability (Vercel Cron + Redis Idempotency + Countdown UI)
       ↓
Order Lifecycle & Delivery (Order Mgmt + Agent Dispatch + Customer Tracking)
       ↓
Admin Monitoring Dashboard (Live Metrics + Conflict Alerts + Stock Audit)
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth JWT signing |
| `NEXTAUTH_URL` | App base URL (e.g. http://localhost:3000) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
