# Med-Store (MediCare) — MERN Stack

A full-stack pharmacy e-commerce application. React (Vite) frontend + Express/Mongoose API + MongoDB.

This is the MERN upgrade of the original static Med-Store site. The glassmorphism dark design is preserved; products, users, orders, promo codes, and newsletter subscribers now live in MongoDB, and orders are placed through a real API.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite 5, react-router-dom 6, Context + localStorage (cart/wishlist) |
| Backend  | Node 20+, Express 4, Mongoose 7, JWT auth (bcryptjs + jsonwebtoken) |
| Database | MongoDB (Mongoose ODM) |
| Tests    | Vitest + supertest + mongodb-memory-server (server), Vitest + Testing Library (client) |

## Project Structure

```
med-store/
├── server/                 # Express REST API
│   ├── src/
│   │   ├── models/         # Product, User, Order, PromoCode, Subscriber
│   │   ├── routes/         # /api/products, /api/auth, /api/orders, /api/promo, /api/newsletter
│   │   ├── controllers/
│   │   ├── middleware/     # auth (JWT), error handling
│   │   ├── app.js          # Express app
│   │   ├── index.js        # entry point
│   │   └── seed.js         # seeds products + promo codes
│   └── tests/
├── client/                 # React SPA (Vite)
│   ├── src/
│   │   ├── pages/          # Home, Products, Medicines, Cart, Checkout, Auth, Account
│   │   ├── components/     # Header, ProductCard, ProductGrid, ProductModal, MiniCart, Footer, Fab, ...
│   │   ├── context/        # Auth, Cart, Wishlist, Toast
│   │   ├── api/            # axios client + endpoint modules
│   │   ├── hooks/          # useDebounce, useScrollEffects, useCountUp
│   │   └── styles/global.css   # ported design system
│   └── vite.config.js      # /api proxy → localhost:5000
└── package.json            # npm workspaces (server + client)
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- MongoDB (local install, Docker, or MongoDB Atlas)

## Setup

```bash
# 1. Install all dependencies (both workspaces)
npm install

# 2. Configure the server
cp server/.env.example server/.env
#   Edit server/.env: set MONGO_URI and JWT_SECRET

# 3. Seed the database (8 products + MEDICARE10 promo code)
npm run seed

# 4. Start both services (API on :5000, client on :5173)
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` requests to the Express API on port 5000.

To run the two services in separate terminals instead:

```bash
npm run dev:server
npm run dev:client
```

## Tests

```bash
# Run both workspaces
npm test

# Or individually
npm run test --workspace server     # uses mongodb-memory-server (no real Mongo needed)
npm run test --workspace client
```

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | – | Health check |
| GET | `/api/products` | – | List products (`?category=&search=&sort=`) |
| GET | `/api/products/:id` | – | Product detail |
| POST | `/api/auth/register` | – | Create account → `{ token, user }` |
| POST | `/api/auth/login` | – | Sign in → `{ token, user }` |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/orders` | Bearer | Place order (totals computed server-side) |
| GET | `/api/orders` | Bearer | Current user's orders |
| GET | `/api/promo/:code` | – | Validate promo code |
| POST | `/api/newsletter` | – | Subscribe email |

## Demo Credentials

- Promo code: `MEDICARE10` (10% off)
- Register a new account from the "Sign In" link in the header.

## Notes

- Cart and wishlist persist in `localStorage` (same behavior as the original site).
- Checkout payment fields are UI-only; orders are persisted via the API but no real payment gateway is integrated.
- Product images are emoji icons preserved from the original site.
