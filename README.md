# fashion-store-server

REST API backend for FashionStore — an E-Commerce platform built with Express, Prisma, and PostgreSQL.

## Live Demo

**API Base URL:** https://fashion-store-server-production.up.railway.app  
**Health check:** `/health`

## Tech Stack

- **Runtime** — Node.js 22 + TypeScript
- **Framework** — Express.js
- **ORM** — Prisma (type-safe database access)
- **Database** — PostgreSQL (Neon serverless on production)
- **Auth** — JWT (jsonwebtoken) + bcryptjs
- **Validation** — Zod
- **Deploy** — Railway

## Features

- ✅ JWT authentication with role-based access control (USER / ADMIN)
- ✅ Product catalog — 38 products across 8 categories with search and filter
- ✅ Order management with full status flow: PENDING → CONFIRMED → SHIPPED → DELIVERED
- ✅ Shipping address captured at checkout
- ✅ Stock management with Prisma Transaction (prevents overselling)
- ✅ Order cancellation with automatic stock restoration (PENDING only)
- ✅ Admin-only endpoints for user and order management

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | — |
| POST | `/auth/login` | Login → returns JWT | — |
| GET | `/auth/me` | Get current user | 🔒 |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List all products | — |
| GET | `/products/:id` | Get product detail | — |
| GET | `/products/search?q=` | Search products | — |
| GET | `/products/category/:slug` | Filter by category | — |
| GET | `/products/category-list` | List all categories | — |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders` | Get my orders | 🔒 |
| POST | `/orders` | Create order | 🔒 |
| GET | `/orders/:id` | Get order detail | 🔒 |
| PATCH | `/orders/:id/cancel` | Cancel order (PENDING only) | 🔒 |
| GET | `/orders/all` | Get all orders | 🔒 Admin |
| PATCH | `/orders/:id/status` | Update order status | 🔒 Admin |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | 🔒 Admin |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/suriyaDseela/fashion-store-server.git
cd fashion-store-server

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and JWT_SECRET
```

### Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fashion_store?sslmode=require"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed sample data (38 products, 8 categories, 1 admin user)
npm run db:seed
```

**Default admin credentials:**
- Email: `admin@fashionstore.com`
- Password: `admin1234`

### Running Locally

```bash
npm run dev
# Server starts at http://localhost:3000
```

## Database Schema

```
users         — id, email, password, name, role (USER|ADMIN)
categories    — id, name, slug
products      — id, name, description, price, stock, imageUrl, categoryId
orders        — id, status, total, shippingAddress, userId
order_items   — id, quantity, unitPrice, orderId, productId
```

## Project Structure

```
src/
├── app.ts                  # Express app entry point
├── routes/
│   ├── auth.routes.ts
│   ├── products.routes.ts
│   ├── orders.routes.ts
│   └── users.routes.ts
├── controllers/            # Request handlers + validation
├── services/               # Business logic
├── middlewares/
│   ├── auth.middleware.ts  # JWT verify + role guard
│   └── error.middleware.ts
├── utils/
│   ├── prisma.ts           # Prisma singleton
│   └── response.ts         # Standardized response helpers
└── types/
    └── index.ts            # TypeScript types

prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration history
└── seed.ts                 # Sample data
```

## Git Branches

| Branch | Description |
|--------|-------------|
| `main` | Stable version — core CRUD + auth |
| `feature/order-status-pdf` | Order status flow + cancel |
| `feature/address` | Shipping address at checkout |

## Scripts

```bash
npm run dev          # Start development server (tsx watch)
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```
