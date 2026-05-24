# StockFlow

> Inventory Management System built for **Allo Health**
>
> 🚀 **Live Deployed URL**: [https://stockflow-o3um.vercel.app/](https://stockflow-o3um.vercel.app/)

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
| Cron Jobs | Vercel Cron (daily / configurable) |
| Deployment | Vercel |

---

## Repository File Structure

Below is the directory map of StockFlow's codebase, structured logically by feature area:

```
stockflow/
├── app/                                 # Next.js 14 App Router Directory
│   ├── (admin)/                         # Admin Feature Area
│   │   ├── layout.tsx                   # Admin Sidebar & Shell Layout
│   │   └── admin/
│   │       ├── dashboard/page.tsx       # Live Admin Monitoring Metrics & Alerts
│   │       ├── products/page.tsx        # Product catalog table (CRUD view)
│   │       ├── products/new/page.tsx    # Add new product form
│   │       └── warehouses/page.tsx      # Warehouse cards list
│   ├── customer/                        # Customer Storefront Area
│   │   ├── layout.tsx                   # Customer Sidebar
│   │   ├── products/page.tsx            # Catalog browsing & Warehouse selection
│   │   ├── products/[id]/page.tsx       # Detail view with Reserve controls
│   │   ├── cart/page.tsx                # Cart checkout with Countdown Timers
│   │   └── orders/                      # Customer order status listings
│   ├── warehouse/                       # Warehouse Management Area
│   │   ├── layout.tsx                   # Warehouse Manager Sidebar
│   │   ├── stock/page.tsx               # Stock editing table (edit totalUnits)
│   │   └── orders/page.tsx              # Order confirmation pipeline view
│   ├── delivery/                        # Delivery Dispatch Area
│   │   ├── layout.tsx                   # Delivery Sidebar
│   │   └── orders/page.tsx              # Mark orders as DELIVERED
│   ├── api/                             # RESTful Backend API Endpoints
│   │   ├── products/route.ts            # GET: lists products, POST: adds products
│   │   ├── warehouses/route.ts          # GET: lists warehouses
│   │   ├── stock/route.ts               # PUT: updates stock totalUnits
│   │   ├── reservations/                # Concurrency-safe POST & User GET
│   │   ├── reservations/[id]/confirm/   # POST: processes payment & decrements stock
│   │   ├── reservations/[id]/release/   # POST: manual/timer-based stock release
│   │   ├── cron/expire-reservations/    # GET: Vercel Cron database cleaner
│   │   └── auth/                        # NextAuth & registration routes
│   ├── login/page.tsx                   # Premium Role Selector Portal
│   ├── register/page.tsx                # Credentials registration page
│   └── globals.css                      # Glassmorphism design utility configurations
│
├── components/                          # Shared UI & Layout Components
│   ├── canvas/
│   │   └── AnimatedBackground.tsx       # Cinematic drifting 3D camera layer
│   ├── layout/
│   │   ├── DashboardShell.tsx           # Premium glass sidebar wrapper shell
│   │   └── Sidebar.tsx                  # Role-based sidebar navigation
│   ├── ui/
│   │   ├── GlassCard.tsx                # Backdrop-blur container component
│   │   ├── GlowLine.tsx                 # Tech styled custom visual indicators
│   │   ├── MetricNumber.tsx             # Floating dashboard metric counter
│   │   └── CountdownTimer.tsx           # Real-time MM:SS live countdown clock
│   ├── admin/
│   │   └── StockBadge.tsx               # Stock level color indicator (Red/Yellow/Green)
│   └── warehouse/
│   │   └── StockPanel.tsx               # Stock levels audit statistics
│
├── lib/                                 # Helper Libraries & Services
│   ├── prisma.ts                        # Prisma PostgreSQL Client adapter
│   ├── redis.ts                         # Upstash Redis Client initializer
│   └── idempotency.ts                   # Upstash Redis key cache header helpers
│
├── prisma/                              # Prisma ORM Database Directory
│   ├── schema.prisma                    # Relational Data Models & Constraints
│   └── seed.ts                          # Seed Script generating 4 users, products & warehouses
│
├── public/                              # Public Static Assets
│   └── background_stockflow.png         # Animated background asset (1.8 MB)
│
├── vercel.json                          # Vercel deployment cron configuration
└── package.json                         # Build scripts & dependencies definitions
```

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
Reservations expire after **15 minutes**. A Vercel Cron job is configured to run, find all `PENDING` reservations past their `expiresAt`, mark them `EXPIRED`, and restore `reservedUnits` so stock becomes available again.
*   **Deployment Note (Vercel Hobby Tier Limit)**: Vercel Hobby accounts limit cron execution to **once per day** (`0 0 * * *`), which is configured in `vercel.json` to guarantee successful deployment on a free tier. In production (Pro plan), this is set to run every 1 minute (`* * * * *`). To achieve 1-minute execution on a free tier, you can easily plug the `/api/cron/expire-reservations` endpoint (secured via `CRON_SECRET`) into a free external ping service like [Cron-Job.org](https://cron-job.org) or Upstash QStash.
*   **Interactive Safeguard**: The frontend has an automatic countdown timer which triggers instant release at zero, so the cron serves primarily as a passive background cleanup for abandoned checkout sessions.

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

## Trade-offs & Production Architectural Considerations

In building StockFlow, several architectural choices were made to optimize consistency, speed, and real-time user experience. In a massive-scale production environment, we would consider the following trade-offs and future adjustments:

### 1. Database Locking (`SELECT FOR UPDATE`) vs. Optimistic Locking vs. Distributed Locking
*   **Current Approach**: To guarantee absolute consistency and prevent overselling, we acquire a row-level lock on `StockEntry` (`SELECT FOR UPDATE`) inside a Prisma `$transaction` during reservation creation.
*   **Trade-off**: This is highly consistent and simple to reason about. However, row locking holds PostgreSQL connections active during transaction execution. During high-concurrency flash sales for hot products, this can lead to connection pool exhaustion, transaction timeouts, and high database CPU load.
*   **Production Improvement**:
    *   **Pessimistic Redis Counters**: Use `DECRBY` on atomic Redis keys representing available stock to handle the initial inventory filter *before* reaching the database. If Redis returns $< 0$, return `409` immediately. If it returns $\ge 0$, proceed to asynchronously record the DB reservation.
    *   **Optimistic Locking**: Add a `version` column to the `StockEntry` model. Perform updates with `WHERE id = :id AND version = :current_version` and use a retry loop on conflict. This avoids persistent database-level row locks and scales better for high read-to-write ratios.

### 2. Auto-Expiry Expiration: Vercel Cron vs. Message Queues (Exact-Second Releases)
*   **Current Approach**: A Vercel Cron job runs every 1 minute to identify `PENDING` reservations that have exceeded their `expiresAt` timestamp, setting them to `EXPIRED` and restoring stock.
*   **Trade-off**: While robust, the 1-minute cron granularity means an expired reservation may sit inactive for up to 59 seconds before the next cron runs and restores its stock. In addition, cron-based database scanning is a recurring poll query that adds constant overhead.
*   **Production Improvement**:
    *   **Distributed Delay Queues**: Utilize a message broker or queueing system (e.g., BullMQ, AWS SQS, or QStash) to schedule a delayed task at the exact second of reservation creation ($+15$ minutes). When the message is consumed, we check if the reservation is still `PENDING`, and if so, release it.
    *   **Redis Keyspace Notifications**: Save a temporary reservation key in Redis with a 15-minute TTL. Enable key-event notifications so that when the key expires, a background service receives an event and atomically executes the release SQL query.

### 3. Idempotency Cache: Upstash Redis vs. Relational DB Transactions
*   **Current Approach**: We check the `Idempotency-Key` header against Upstash Redis using a 24-hour TTL, saving the response payload to Redis on success.
*   **Trade-off**: This is extremely fast and prevents API processing on duplicate requests. However, it introduces an external caching dependency. If Redis experiences a networking blip, the idempotency layer might fail open or closed, risking duplicate processing.
*   **Production Improvement**:
    *   **Transactional Idempotency Table**: Create an `IdempotentRequests` table inside PostgreSQL. The creation of the reservation and the insertion of the idempotency key run inside the *same* database transaction. This ensures strict atomic commitment (the idempotency key is saved if and only if the reservation succeeds).

### 4. Client-side Countdown vs. Server-side Expiration
*   **Current Approach**: The frontend uses `useEffect` and `setInterval` to tick down the time remaining per item. If the timer hits zero, the client automatically calls `/api/reservations/[id]/release` to release the stock instantly.
*   **Trade-off**: Provides a great real-time UX, but client-side JavaScript can be paused, the tab can be closed, or the user's system clock could skew. The system remains robust because the server-side cron acts as a fallback, but the visual sync is key.
*   **Production Improvement**: Sync frontend countdowns with server-provided remaining durations using WebSockets or relative time offsets derived from a server-time ping endpoint rather than trusting the local client system clock.

---

## Git Commit History

Each commit maps to a specific implementation stage, showing the progressive construction of the platform:

```
20  fix: wire idempotency middleware into reserve and confirm API endpoints
19  feat: premium cinematic UI overhaul with animated background and glassmorphism
18  fix: restore missing dynamic route pages [id] for customer orders and products
17  fix: restructure route groups to prefixed paths - resolve parallel page conflicts
16  fix: Prisma 7 compatibility - use PrismaPg adapter, fix schema and seed config
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
