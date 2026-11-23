# Med-Store (MediCare) — MERN Stack

A full-stack pharmacy e-commerce application. React (Vite) frontend + Express/Mongoose API + MongoDB.

This is the MERN upgrade of the original static Med-Store site. The glassmorphism dark design is preserved; products, users, orders, promo codes, and newsletter subscribers now live in MongoDB, and orders are placed through a real API.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite 5, react-router-dom 6, Context + localStorage (cart/wishlist) |
| Backend  | Node 20+, Express 4, Mongoose 7, JWT auth (bcryptjs + jsonwebtoken) |
| Database | MongoDB (Mongoose ODM) |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, compression |
| Tests    | Vitest + supertest + mongodb-memory-server (server), Vitest + Testing Library (client) |

## Project Structure

```
med-store/
├── server/                 # Express REST API
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── models/         # Product, User, Order, PromoCode, Subscriber
│   │   ├── routes/         # /api/products, /api/auth, /api/orders, /api/promo, /api/newsletter
│   │   ├── controllers/
│   │   ├── middleware/     # auth (JWT), error handling
│   │   ├── app.js          # Express app + security middleware
│   │   ├── index.js        # entry point
│   │   └── seed.js         # seeds products + promo codes
│   └── tests/
├── client/                 # React SPA (Vite)
│   ├── src/
│   │   ├── pages/          # Home, Products, Medicines, Cart, Checkout, Auth, Account, NotFound
│   │   ├── components/     # Header, ProductCard, ProductGrid, ProductModal, MiniCart, Footer, Fab, ErrorBoundary, ...
│   │   ├── context/        # Auth (token-verified), Cart, Wishlist, Toast
│   │   ├── api/            # axios client (401 interceptor) + endpoint modules
│   │   ├── hooks/          # useDebounce, useScrollEffects, useCountUp
│   │   ├── utils/          # format helpers
│   │   └── styles/global.css   # ported design system
│   ├── vite.config.js      # /api proxy → localhost:5000
│   └── .env.example        # client env vars
└── package.json            # npm workspaces (server + client) + concurrently
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

# 3. (Optional) Configure the client
cp client/.env.example client/.env

# 4. Seed the database (8 products + MEDICARE10 promo code)
npm run seed

# 5. Start both services (API on :5000, client on :5173)
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` requests to the Express API on port 5000.

To run the two services in separate terminals instead:

```bash
npm run dev:server
npm run dev:client
```

## Build

```bash
# Production build for the client
npm run build
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
| GET | `/api/products` | – | List products (`?category=&search=&sort=&page=&limit=`) |
| GET | `/api/products/:id` | – | Product detail |
| POST | `/api/auth/register` | – | Create account → `{ token, user }` |
| POST | `/api/auth/login` | – | Sign in → `{ token, user }` |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/orders` | Bearer | Place order (totals computed server-side) |
| GET | `/api/orders` | Bearer | Current user's orders |
| GET | `/api/promo/:code` | – | Validate promo code |
| POST | `/api/newsletter` | – | Subscribe email |

### Pagination

The `GET /api/products` endpoint supports pagination via `page` and `limit` query parameters. The response includes a `pagination` object:

```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 42,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Security Features

| Feature | Description |
|---------|-------------|
| **Helmet** | Sets secure HTTP headers (CSP, XSS protection, etc.) |
| **Rate Limiting** | 300 req/15min for general API, 20 req/15min for auth endpoints |
| **Mongo Sanitize** | Strips `$` and `.` from req.body to prevent NoSQL injection |
| **JWT Auth** | 7-day tokens verified on every protected request |
| **Error Masking** | 500-level errors return generic message; stack traces logged server-side only |

## Frontend Features

| Feature | Description |
|---------|-------------|
| **Lazy-loaded Routes** | All pages are code-split for smaller initial bundle |
| **ErrorBoundary** | Catches unhandled render errors with a friendly fallback UI |
| **404 Page** | Dedicated NotFound page instead of silent redirect to home |
| **Auth Token Verification** | JWT verified against API on app startup; stale tokens auto-cleared |
| **Auto-logout on 401** | Axios interceptor clears auth state on expired/invalid tokens |
| **Normalised API Errors** | All API rejections return a clean `Error` with a readable message |

## Demo Credentials

- Promo code: `MEDICARE10` (10% off)
- Register a new account from the "Sign In" link in the header.

## Notes

- Cart and wishlist persist in `localStorage` (same behavior as the original site).
- Checkout payment fields are UI-only; orders are persisted via the API but no real payment gateway is integrated.
- Product images are emoji icons preserved from the original site.
- The root-level `index.html`, `cart.html`, `checkout.html`, `medicines.html`, `script.js`, and `styles.css` are the original static site, preserved for reference. The active application lives in `client/` and `server/`.
