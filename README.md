# StockFlow

> Inventory Management System built for **Allo Health**

StockFlow is a full-stack, concurrency-safe inventory and reservation management platform supporting role-based access, live stock tracking, auto-expiring reservations, and real-time admin monitoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Cache / Idempotency | Upstash Redis |
| Auth | NextAuth.js (JWT + role-based) |
| Styling | Tailwind CSS |
| Cron Jobs | Vercel Cron (every 1 min) |
| Deployment | Vercel |

---

## Roles & Access

| Role | Access |
|---|---|
| **Customer** | Browse products, reserve items, view cart with countdown, track orders |
| **Warehouse Manager** | Manage stock levels, process and advance orders |
| **Admin** | Full control — products, warehouses, monitoring dashboard |
| **Delivery Agent** | View assigned orders, mark as delivered |

---

## Key Features

### ⚡ Concurrency-Safe Reservations
`POST /api/reservations` uses `SELECT FOR UPDATE` inside a Prisma `$transaction` to lock the `StockEntry` row. Concurrent requests cannot double-reserve the same stock. Returns `409 Conflict` when stock is insufficient.

### ⏱️ Auto-Expiry Cron (Vercel Cron)
Reservations expire after **15 minutes**. A Vercel Cron job runs every 1 minute, finds all `PENDING` reservations past their `expiresAt`, marks them `EXPIRED`, and restores `reservedUnits` so stock becomes available again.

### 🔄 Redis Idempotency
`POST /api/reservations` reads the `Idempotency-Key` header. If the key exists in Upstash Redis, the cached response is returned (no double-processing). Results are cached with a **24-hour TTL**.

### 🕐 Live Countdown UI
The cart page shows a live countdown timer per reserved item (`useEffect`, ticks every second). At 0, it automatically calls `POST /release` to restore stock and notifies the user.

### 📊 Admin Monitoring Dashboard
Auto-refreshes every 30s. Shows:
- Active reservations count
- Stock levels (total / reserved / available)
- Orders by status pipeline
- Expiry rate (last 1h)
- Low-stock and out-of-stock alerts

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/pranjal-v7/stockflow.git
cd stockflow
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/stockflow"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
CRON_SECRET="your-cron-secret"
```

### 3. Set Up Database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@allohealth.com | password123 |
| Warehouse Manager | warehouse@allohealth.com | password123 |
| Customer | customer@allohealth.com | password123 |
| Delivery Agent | delivery@allohealth.com | password123 |

---

## Architecture

```
Auth & Roles (NextAuth + JWT)
       ↓
Inventory Management (Product Catalog + Warehouse + Stock Tracker)
       ↓
Customer Storefront (Listing + Detail + Cart/Checkout)
       ↓
Reservation Engine
  ├── POST /reservations → SELECT FOR UPDATE + 409 Conflict
  ├── POST /confirm     → Decrement stock, 410 on expiry
  └── POST /release     → Restore units to available
       ↓
Auto-expiry & Reliability
  ├── Vercel Cron → expire-reservations every 1 min
  ├── Upstash Redis → idempotency key (24h TTL)
  └── Countdown UI → useEffect + auto-release at 0
       ↓
Order Lifecycle & Delivery
  ├── Warehouse → CONFIRMED → PACKED → SHIPPED
  ├── Delivery Agent → Mark DELIVERED
  └── Customer → Live order tracking (polls every 10s)
       ↓
Admin Monitoring Dashboard (live metrics, stock alerts, expiry stats)
```

---

## Git Commit History

Each commit maps to one implementation stage:

```
15  chore: add seed data, complete README with architecture and setup instructions
14  feat: admin monitoring dashboard - live metrics, conflict alerts, stock audit log
13  feat: order lifecycle (confirmed to packed to shipped) and delivery agent dispatch
12  feat: Vercel Cron auto-expiry every 1 min and Redis idempotency middleware (24h TTL)
11  feat: cart/checkout page with live countdown timer and auto-release at 0
10  feat: POST /confirm (decrement stock, 410 on expiry) and POST /release (restore units)
9   feat: reservation engine - POST /reservations with SELECT FOR UPDATE and 409 conflict
8   feat: customer storefront - product listing with stock badges and product detail page
7   feat: warehouse manager panel - stock levels, locations, fulfillment view
6   feat: admin UI - product catalog management and warehouse panel
5   feat: warehouse and stock management API routes
4   feat: product catalog CRUD API routes (admin only)
3   feat: add NextAuth credentials auth with role-based JWT session
2   feat: define Prisma schema - User, Product, Warehouse, StockEntry, Reservation, Order
1   chore: initialize Next.js 14 project with Tailwind, Prisma, and env setup
```
