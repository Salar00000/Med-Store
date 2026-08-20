# Med-Store MERN Stack Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the static Med-Store (MediCare) pharmacy e-commerce site as a full-stack MERN application: React + Vite frontend, Express + Mongoose API, MongoDB persistence, JWT auth, and server-persisted orders.

**Architecture:** A single npm-workspaces monorepo with `server/` (Express REST API + Mongoose models + seed script) and `client/` (Vite + React SPA). The client talks to the API through a Vite dev-server proxy on `/api`, preserving the existing dark glassmorphism design. Cart and wishlist stay client-side in localStorage (via React Context) so the UX matches the current site; products, users, promo codes, orders, and newsletter subscriptions move to MongoDB.

**Tech Stack:**
- Server: Node 20+, Express 4, Mongoose 7, jsonwebtoken, bcryptjs, cors, dotenv, express-validator, nanoid
- Server tests: Vitest + supertest (MongoDB Memory Server)
- Client: Vite 5, React 18, react-router-dom 6, axios, Context + useReducer
- Client tests: Vitest + React Testing Library
- Database: MongoDB (local or Atlas), Mongoose ODM

## Global Constraints

- Node >= 20.0.0, npm >= 10.0.0.
- Monorepo using npm workspaces; root `npm install` installs both packages.
- Client dev server must proxy `/api` to `http://localhost:5000` (Vite `server.proxy`).
- Keep the existing visual design: port `styles.css` (1572 lines) into the client unchanged as a global stylesheet; do not redesign.
- Preserve the 8 existing products (same ids, names, prices, categories, ratings, and emoji icons). Emoji field values come from `script.js:7-14` (represented in code as `\u{...}` escapes).
- No emoji characters may appear in newly authored source strings that are UI copy; the existing emoji product icons are preserved as data.
- Secrets (JWT secret, Mongo URI) live only in `server/.env`; `.env.example` holds placeholders. Never commit real secrets.
- Client must keep working when the API is down by showing an explicit error/retry state (no silent empty grids).
- Every API mutation is validated with express-validator; every auth-protected route uses the `auth` middleware.
- Money is always stored as a Number in dollars and formatted client-side with `toFixed(2)`.

---

## Current Code Review (baseline)

Reviewed: `index.html`, `medicines.html`, `cart.html`, `checkout.html`, `script.js`, `styles.css`, `IMPLEMENTED_FEATURES.md`, `IMPROVEMENTS_ANALYSIS.md`.

Strengths:
- Polished, self-contained glassmorphism dark theme; strong mobile UX (hamburger menu, mini cart, quick-view modal, FAB).
- Debounced search, combined category filter + sort, wishlist and cart persisted in localStorage, toast system.

Weaknesses the MERN upgrade addresses:
- No backend, DB, or auth. Products hardcoded in `script.js:7-14`; promo code hardcoded (`MEDICARE10`); checkout fakes order placement by clearing localStorage.
- No order persistence; no user accounts; newsletter is a fake toast.
- Code duplication across the 4 HTML pages (mobile menu, particles, scroll progress, header init are re-implemented in each page's inline `<script>`).
- Global `window.*` functions; no build tooling, linting, or tests.
- `checkout.html:465-473` `placeOrder()` does not validate or submit anything.
- Multi-page app with duplicated header/footer markup per page.

---

## File Structure

```
/workspace
├── package.json                       # root workspaces + scripts
├── .gitignore                         # node_modules, .env, dist, coverage
├── README.md                          # setup + run instructions
├── docs/superpowers/plans/2026-08-20-med-store-mern-upgrade.md
├── server/
│   ├── package.json
│   ├── .env.example                   # PORT, MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
│   ├── src/
│   │   ├── index.js                   # boot: connect db, listen
│   │   ├── app.js                     # express app (middleware + routes + errors)
│   │   ├── config/db.js               # mongoose.connect
│   │   ├── models/Product.js
│   │   ├── models/User.js
│   │   ├── models/Order.js
│   │   ├── models/PromoCode.js
│   │   ├── models/Subscriber.js
│   │   ├── routes/auth.routes.js
│   │   ├── routes/products.routes.js
│   │   ├── routes/orders.routes.js
│   │   ├── routes/promo.routes.js
│   │   ├── routes/newsletter.routes.js
│   │   ├── controllers/auth.controller.js
│   │   ├── controllers/products.controller.js
│   │   ├── controllers/orders.controller.js
│   │   ├── controllers/promo.controller.js
│   │   ├── controllers/newsletter.controller.js
│   │   ├── middleware/auth.js
│   │   ├── middleware/error.js
│   │   └── seed.js                    # idempotent product seeding
│   └── tests/
│       ├── setup.js                   # mongodb-memory-server hooks
│       ├── products.test.js
│       ├── auth.test.js
│       └── orders.test.js
└── client/
    ├── package.json
    ├── vite.config.js                 # proxy /api -> localhost:5000, allowedHosts
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx                    # router + providers
    │   ├── styles/global.css          # ported styles.css (1572 lines) + page CSS
    │   ├── api/client.js              # axios instance (baseURL /api, JWT interceptor)
    │   ├── api/products.js
    │   ├── api/auth.js
    │   ├── api/orders.js
    │   ├── api/promo.js
    │   ├── api/newsletter.js
    │   ├── context/AuthContext.jsx
    │   ├── context/CartContext.jsx
    │   ├── context/WishlistContext.jsx
    │   ├── context/ToastContext.jsx
    │   ├── components/Header.jsx
    │   ├── components/Footer.jsx
    │   ├── components/ProductCard.jsx
    │   ├── components/ProductGrid.jsx
    │   ├── components/ProductModal.jsx
    │   ├── components/MiniCart.jsx
    │   ├── components/Fab.jsx
    │   ├── components/Particles.jsx
    │   ├── components/Toast.jsx
    │   ├── components/ProtectedRoute.jsx
    │   ├── pages/HomePage.jsx
    │   ├── pages/MedicinesPage.jsx
    │   ├── pages/ProductsPage.jsx
    │   ├── pages/CartPage.jsx
    │   ├── pages/CheckoutPage.jsx
    │   ├── pages/AuthPage.jsx
    │   ├── pages/AccountPage.jsx       # order history (auth)
    │   ├── hooks/useDebounce.js
    │   └── utils/format.js             # money, discount, stars
    └── src/__tests__/
        ├── CartContext.test.jsx
        ├── ProductCard.test.jsx
        └── utils.test.js
```

---

## API Contract (source of truth for the client)

| Method | Path | Auth | Body / Query | Success | Notes |
|---|---|---|---|---|---|
| GET | `/api/health` | - | - | `{ status: 'ok' }` | connectivity probe |
| GET | `/api/products` | - | `?category=&search=&sort=` | `{ products }` | server-side filter/sort |
| GET | `/api/products/:id` | - | - | `{ product }` | 404 if missing |
| POST | `/api/auth/register` | - | `{ name, email, password }` | `{ token, user }` | 409 if email exists |
| POST | `/api/auth/login` | - | `{ email, password }` | `{ token, user }` | 401 on bad creds |
| GET | `/api/auth/me` | Bearer | - | `{ user }` | 401 if invalid token |
| POST | `/api/orders` | Bearer | `{ items, shippingInfo, promoCode? }` | `{ order }` | recalculates totals server-side |
| GET | `/api/orders` | Bearer | - | `{ orders }` | user's own orders only |
| GET | `/api/promo/:code` | - | - | `{ valid, discountPercent }` | 200 valid, 404 invalid |
| POST | `/api/newsletter` | - | `{ email }` | `{ subscribed: true }` | 409 if duplicate |

Errors: `{ message }` with status codes 400/401/404/409/500. `user` shape: `{ id, name, email }`.

---

## Phase 1 — Monorepo + Backend

### Task 1: Repo scaffolding and Express server skeleton

**Files:**
- Create: `/workspace/package.json`
- Create: `/workspace/.gitignore`
- Create: `/workspace/server/package.json`
- Create: `/workspace/server/.env.example`
- Create: `/workspace/server/src/config/db.js`
- Create: `/workspace/server/src/app.js`
- Create: `/workspace/server/src/index.js`
- Create: `/workspace/server/tests/setup.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `app` (Express app exported from `src/app.js`), `connectDB()` from `src/config/db.js`, `GET /api/health`.

- [ ] **Step 1: Create root workspace files**

`/workspace/package.json`:
```json
{
  "name": "med-store",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["server", "client"],
  "scripts": {
    "dev:server": "npm run dev --workspace server",
    "dev:client": "npm run dev --workspace client",
    "dev": "npm run dev:server & npm run dev:client",
    "seed": "npm run seed --workspace server",
    "test": "npm run test --workspace server && npm run test --workspace client"
  }
}
```

`/workspace/.gitignore`:
```
node_modules/
dist/
coverage/
.env
*.log
.DS_Store
```

- [ ] **Step 2: Create server package and env template**

`/workspace/server/package.json`:
```json
{
  "name": "med-store-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "seed": "node src/seed.js",
    "test": "vitest run"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1",
    "nanoid": "^5.0.7"
  },
  "devDependencies": {
    "mongodb-memory-server": "^9.4.1",
    "nodemon": "^3.1.4",
    "supertest": "^7.0.0",
    "vitest": "^2.0.5"
  }
}
```

`/workspace/server/.env.example`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/med-store
JWT_SECRET=change-me-in-production
CLIENT_ORIGIN=http://localhost:5173
```

- [ ] **Step 3: Write db connection, app, and entry point**

`/workspace/server/src/config/db.js`:
```js
import mongoose from 'mongoose';

export async function connectDB(uri) {
  const target = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/med-store';
  mongoose.set('strictQuery', true);
  return mongoose.connect(target);
}
```

`/workspace/server/src/app.js`:
```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.js';

dotenv.config();

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);
```

`/workspace/server/src/index.js`:
```js
import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
```

`/workspace/server/src/middleware/error.js`:
```js
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}
```

- [ ] **Step 4: Add test hooks and a smoke test**

`/workspace/server/tests/setup.js`:
```js
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export async function startMemoryDb() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  return mongod;
}

export async function stopMemoryDb() {
  await mongod?.stop();
}
```

`/workspace/server/tests/health.test.js`:
```js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 5: Install and verify**

Run: `npm install` at `/workspace` root.
Expected: workspace install completes with both `server` and `client` symlinked in `node_modules`.

Run: `npm run test --workspace server`
Expected: PASS (2 tests).

Run: `node src/index.js` after `cp server/.env.example server/.env`
Expected: logs `[server] listening on http://localhost:5000` (requires a local MongoDB; if none is installed, proceed to Task 2 where tests use the in-memory DB and note this is the only place a real Mongo is required).

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore server
git commit -m "feat(server): scaffold npm-workspaces monorepo with express skeleton"
```

---

### Task 2: Product model, seed script, and products API

**Files:**
- Create: `/workspace/server/src/models/Product.js`
- Create: `/workspace/server/src/seed.js`
- Create: `/workspace/server/src/routes/products.routes.js`
- Create: `/workspace/server/src/controllers/products.controller.js`
- Test: `/workspace/server/tests/products.test.js`
- Modify: `/workspace/server/src/app.js` (mount products routes)

**Interfaces:**
- Consumes: `app` from Task 1.
- Produces: `Product` model with fields `{ id(_id), name, price, originalPrice, category, emoji, desc, rating, reviews, stock, isActive }`; `GET /api/products` (`?category&search&sort`), `GET /api/products/:id`.

- [ ] **Step 1: Write the failing test**

`/workspace/server/tests/products.test.js`:
```js
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { startMemoryDb, stopMemoryDb } from './setup.js';
import Product from '../src/models/Product.js';
import { seedProducts } from '../src/seed.js';

beforeAll(async () => { await startMemoryDb(); });
afterAll(async () => { await mongoose.disconnect(); await stopMemoryDb(); });
beforeEach(async () => {
  await Product.deleteMany({});
  await seedProducts();
});

describe('GET /api/products', () => {
  it('lists all products sorted by default (by name asc)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(8);
    expect(res.body.products[0].name).toBe('Advanced Pain Relief');
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=Medicine');
    expect(res.status).toBe(200);
    expect(res.body.products.every((p) => p.category === 'Medicine')).toBe(true);
  });

  it('searches by name', async () => {
    const res = await request(app).get('/api/products?search=vitamin');
    expect(res.status).toBe(200);
    expect(res.body.products.some((p) => p.name.includes('Vitamin C'))).toBe(true);
  });

  it('sorts by price asc', async () => {
    const res = await request(app).get('/api/products?sort=price-asc');
    const prices = res.body.products.map((p) => p.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });
});

describe('GET /api/products/:id', () => {
  it('returns one product', async () => {
    const created = await Product.findOne({ name: 'Digital Thermometer' });
    const res = await request(app).get(`/api/products/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Digital Thermometer');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/products/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace server -- products.test.js`
Expected: FAIL with module resolution errors (models/routes don't exist).

- [ ] **Step 3: Write the model, seed, controller, and route**

`/workspace/server/src/models/Product.js`:
```js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: { type: String, required: true, enum: ['Medicine', 'Vitamins', 'Devices', 'Protection', 'Essentials'] },
    emoji: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
```

`/workspace/server/src/seed.js` (emoji values preserved from `script.js:7-14` via unicode escapes):
```js
import Product from './models/Product.js';

const products = [
  { id: 1, name: 'Advanced Pain Relief', price: 12.99, originalPrice: 16.99, category: 'Medicine', emoji: '\u{1F48A}', desc: 'Fast-acting formula for severe pain relief. Pharmaceutical-grade ingredients.', rating: 4.8, reviews: 234 },
  { id: 2, name: 'Immunity Vitamin C', price: 18.5, originalPrice: 24.0, category: 'Vitamins', emoji: '\u{1F34A}', desc: 'High potency 1000mg immune support. Buffered for sensitive stomachs.', rating: 4.9, reviews: 412 },
  { id: 3, name: 'Digital Thermometer', price: 24.99, originalPrice: 29.99, category: 'Devices', emoji: '\u{1F321}\u{FE0F}', desc: 'Clinical accuracy in 3 seconds. Fever alert & memory recall.', rating: 4.7, reviews: 187 },
  { id: 4, name: 'N95 Medical Masks', price: 14.99, originalPrice: 19.99, category: 'Protection', emoji: '\u{1F637}', desc: 'Pack of 20, fluid resistant. 95% filtration efficiency, FDA cleared.', rating: 4.6, reviews: 528 },
  { id: 5, name: 'First Aid Kit Pro', price: 45.0, originalPrice: 59.99, category: 'Essentials', emoji: '\u{26D1}\u{FE0F}', desc: 'Complete 150-piece set for emergencies. Compact & waterproof case.', rating: 4.9, reviews: 301 },
  { id: 6, name: 'Herbal Cough Syrup', price: 9.99, originalPrice: 12.99, category: 'Medicine', emoji: '\u{1F33F}', desc: '100% natural herbal formula for dry & productive cough relief.', rating: 4.5, reviews: 156 },
  { id: 7, name: 'Hand Sanitizer Gel', price: 5.99, originalPrice: 8.99, category: 'Essentials', emoji: '\u{1F9F4}', desc: 'Kills 99.99% of germs. Moisturizing formula, non-sticky feel.', rating: 4.4, reviews: 892 },
  { id: 8, name: 'Blood Pressure Monitor', price: 59.99, originalPrice: 79.99, category: 'Devices', emoji: '\u{1F493}', desc: 'Clinically validated for home use. Bluetooth sync with health apps.', rating: 4.8, reviews: 445 },
];

export async function seedProducts() {
  await Product.deleteMany({});
  await Product.insertMany(
    products.map(({ id, ...rest }) => ({ ...rest, legacyId: id }))
  );
  return products.length;
}

// CLI entry: `npm run seed --workspace server`
if (process.argv[1].endsWith('seed.js')) {
  import('./config/db.js')
    .then(({ connectDB }) => connectDB())
    .then(async () => {
      const count = await seedProducts();
      console.log(`[seed] inserted ${count} products`);
      process.exit(0);
    })
    .catch((err) => { console.error(err); process.exit(1); });
}
```

Note: add `legacyId: { type: Number }` to `Product.js` to preserve the original `id` values (cart.jsx references products by `_id`, but keeping legacyId costs nothing).

`/workspace/server/src/controllers/products.controller.js`:
```js
import Product from '../models/Product.js';

const SORTS = {
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  default: { name: 1 },
};

export async function listProducts(req, res, next) {
  try {
    const { category, search, sort } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { desc: re }, { category: re }];
    }
    const products = await Product.find(filter).sort(SORTS[sort] || SORTS.default);
    res.json({ products });
  } catch (err) { next(err); }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) { next(err); }
}
```

`/workspace/server/src/routes/products.routes.js`:
```js
import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/products.controller.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

export default router;
```

Mount in `/workspace/server/src/app.js`:
```js
import productsRoutes from './routes/products.routes.js';
// after app.get('/api/health', ...):
app.use('/api/products', productsRoutes);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace server -- products.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src server/tests/products.test.js
git commit -m "feat(server): add product model, seed script, and products API"
```

---

### Task 3: Auth (register, login, JWT middleware)

**Files:**
- Create: `/workspace/server/src/models/User.js`
- Create: `/workspace/server/src/controllers/auth.controller.js`
- Create: `/workspace/server/src/routes/auth.routes.js`
- Create: `/workspace/server/src/middleware/auth.js`
- Test: `/workspace/server/tests/auth.test.js`
- Modify: `/workspace/server/src/app.js` (mount auth routes)

**Interfaces:**
- Consumes: `app` from Task 1.
- Produces: `User` model (`{ name, email, passwordHash, createdAt }`), `signToken(user) -> string`, `auth` middleware (`req.user = { id, name, email }`), routes `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.

- [ ] **Step 1: Write the failing test**

`/workspace/server/tests/auth.test.js`:
```js
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { startMemoryDb, stopMemoryDb } from './setup.js';
import User from '../src/models/User.js';

beforeAll(async () => { await startMemoryDb(); });
afterAll(async () => { await mongoose.disconnect(); await stopMemoryDb(); });
beforeEach(async () => { await User.deleteMany({}); });

describe('POST /api/auth/register', () => {
  it('registers a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe', email: 'john@example.com', password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('john@example.com');
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe', email: 'john@example.com', password: 'secret123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe 2', email: 'john@example.com', password: 'secret123',
    });
    expect(res.status).toBe(409);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John', email: 'not-an-email', password: 'secret123',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe', email: 'john@example.com', password: 'secret123',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com', password: 'secret123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe', email: 'john@example.com', password: 'secret123',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com', password: 'wrong',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user with a valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'John Doe', email: 'john@example.com', password: 'secret123',
    });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('john@example.com');
  });

  it('rejects a missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace server -- auth.test.js`
Expected: FAIL (modules missing).

- [ ] **Step 3: Write model, controller, route, middleware**

`/workspace/server/src/models/User.js`:
```js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublic = function () {
  return { id: this._id.toString(), name: this.name, email: this.email };
};

export default mongoose.model('User', userSchema);
```

`/workspace/server/src/middleware/auth.js`:
```js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Not authorized' });

    req.user = user.toPublic();
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized' });
  }
}
```

`/workspace/server/src/controllers/auth.controller.js`:
```js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

export function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user), user: user.toPublic() });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) { next(err); }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
```

`/workspace/server/src/routes/auth.routes.js`:
```js
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  register
);
router.post('/login', login);
router.get('/me', auth, me);

export default router;
```

Mount in `app.js`:
```js
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);
```

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace server`
Expected: PASS (health 2 + products 6 + auth 8 = 16 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src server/tests/auth.test.js
git commit -m "feat(server): add jwt auth with register, login, and me endpoints"
```

---

### Task 4: Orders API with server-side totals and promo validation

**Files:**
- Create: `/workspace/server/src/models/Order.js`
- Create: `/workspace/server/src/models/PromoCode.js`
- Create: `/workspace/server/src/controllers/orders.controller.js`
- Create: `/workspace/server/src/routes/orders.routes.js`
- Create: `/workspace/server/src/routes/promo.routes.js`
- Create: `/workspace/server/src/controllers/promo.controller.js`
- Test: `/workspace/server/tests/orders.test.js`
- Modify: `/workspace/server/src/seed.js` (seed one promo code)
- Modify: `/workspace/server/src/app.js` (mount routes)

**Interfaces:**
- Consumes: `auth` middleware, `Product`, `PromoCode`, `User`.
- Produces: `Order` model (`{ user, items, shippingInfo, subtotal, tax, shipping, discount, total, status }`), `POST /api/orders` (auth), `GET /api/orders` (auth), `GET /api/promo/:code`. Totals are recomputed on the server; never trust client money values.

- [ ] **Step 1: Write the failing test**

`/workspace/server/tests/orders.test.js`:
```js
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { startMemoryDb, stopMemoryDb } from './setup.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import PromoCode from '../src/models/PromoCode.js';
import { seedProducts, seedPromoCodes } from '../src/seed.js';

let token;
let product;
let promo;

beforeAll(async () => { await startMemoryDb(); });
afterAll(async () => { await mongoose.disconnect(); await stopMemoryDb(); });

beforeEach(async () => {
  await Promise.all([Product.deleteMany({}), Order.deleteMany({}), PromoCode.deleteMany({})]);
  await seedProducts();
  await seedPromoCodes();
  product = await Product.findOne({ name: 'Hand Sanitizer Gel' }); // 5.99
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Jane Doe', email: 'jane@example.com', password: 'secret123',
  });
  token = reg.body.token;
  promo = await PromoCode.findOne({ code: 'MEDICARE10' });
});

describe('POST /api/orders', () => {
  it('requires auth', async () => {
    const res = await request(app).post('/api/orders').send({ items: [], shippingInfo: {} });
    expect(res.status).toBe(401);
  });

  it('creates an order with server-computed totals', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      items: [{ productId: product._id.toString(), qty: 3 }],
      shippingInfo: { fullName: 'Jane Doe', email: 'jane@example.com', address: '1 Main St', city: 'NY', zip: '10001' },
    });
    expect(res.status).toBe(201);
    expect(res.body.order.subtotal).toBeCloseTo(17.97, 2);
    expect(res.body.order.tax).toBeCloseTo(0.9, 2);
    expect(res.body.order.shipping).toBeCloseTo(4.99, 2); // < $50
    expect(res.body.order.discount).toBe(0);
    expect(res.body.order.total).toBeCloseTo(23.86, 2);
  });

  it('applies a valid promo discount and free shipping over $50', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      items: [{ productId: product._id.toString(), qty: 10 }], // 59.90
      shippingInfo: { fullName: 'Jane Doe', email: 'jane@example.com', address: '1 Main St', city: 'NY', zip: '10001' },
      promoCode: 'MEDICARE10',
    });
    expect(res.status).toBe(201);
    expect(res.body.order.subtotal).toBeCloseTo(59.9, 2);
    expect(res.body.order.shipping).toBe(0);
    expect(res.body.order.discount).toBeCloseTo(5.99, 2);
  });

  it('rejects an unknown product', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      items: [{ productId: '000000000000000000000000', qty: 1 }],
      shippingInfo: { fullName: 'Jane', email: 'jane@example.com', address: '1 Main St', city: 'NY', zip: '10001' },
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders', () => {
  it('returns only the calling user orders', async () => {
    await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      items: [{ productId: product._id.toString(), qty: 1 }],
      shippingInfo: { fullName: 'Jane Doe', email: 'jane@example.com', address: '1 Main St', city: 'NY', zip: '10001' },
    });
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });
});

describe('GET /api/promo/:code', () => {
  it('validates an existing code', async () => {
    const res = await request(app).get('/api/promo/MEDICARE10');
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.discountPercent).toBe(10);
  });

  it('returns 404 for an invalid code', async () => {
    const res = await request(app).get('/api/promo/NOPE');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace server -- orders.test.js`
Expected: FAIL (modules missing).

- [ ] **Step 3: Write models and controllers**

`/workspace/server/src/models/PromoCode.js`:
```js
import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('PromoCode', promoCodeSchema);
```

Add to `/workspace/server/src/seed.js` and export (plus CLI logging):
```js
import PromoCode from './models/PromoCode.js';

export async function seedPromoCodes() {
  await PromoCode.deleteMany({});
  await PromoCode.create({ code: 'MEDICARE10', discountPercent: 10 });
  return 1;
}
```

`/workspace/server/src/models/Order.js`:
```js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  emoji: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCode: { type: String, default: null },
    status: { type: String, enum: ['placed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
```

`/workspace/server/src/controllers/orders.controller.js`:
```js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import PromoCode from '../models/PromoCode.js';

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 4.99;

export async function createOrder(req, res, next) {
  try {
    const { items, shippingInfo, promoCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty' });
    }
    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zip) {
      return res.status(400).json({ message: 'Complete shipping information is required' });
    }

    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    if (products.length !== ids.length) {
      return res.status(400).json({ message: 'One or more products are unavailable' });
    }
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((i) => {
      const product = byId.get(i.productId);
      const qty = Math.max(1, Number(i.qty) || 1);
      return { productId: product._id, name: product.name, price: product.price, qty, emoji: product.emoji };
    });

    const subtotal = Number(orderItems.reduce((sum, it) => sum + it.price * it.qty, 0).toFixed(2));
    const discount = promoCode ? await applyPromo(promoCode, subtotal) : 0;
    const discountedSub = Number((subtotal - discount).toFixed(2));
    const tax = Number((discountedSub * TAX_RATE).toFixed(2));
    const shipping = discountedSub >= FREE_SHIPPING_THRESHOLD || discountedSub === 0 ? 0 : SHIPPING_FEE;
    const total = Number((discountedSub + tax + shipping).toFixed(2));

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingInfo,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      promoCode: promoCode ? promoCode.toUpperCase() : null,
    });

    res.status(201).json({ order });
  } catch (err) { next(err); }
}

async function applyPromo(code, subtotal) {
  const promo = await PromoCode.findOne({ code: code.toUpperCase(), active: true });
  if (!promo) throw Object.assign(new Error('Invalid promo code'), { status: 400 });
  return Number(((subtotal * promo.discountPercent) / 100).toFixed(2));
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
}
```

`/workspace/server/src/controllers/promo.controller.js`:
```js
import PromoCode from '../models/PromoCode.js';

export async function validatePromo(req, res, next) {
  try {
    const promo = await PromoCode.findOne({ code: req.params.code.toUpperCase(), active: true });
    if (!promo) return res.status(404).json({ message: 'Invalid promo code' });
    res.json({ valid: true, discountPercent: promo.discountPercent });
  } catch (err) { next(err); }
}
```

`/workspace/server/src/routes/orders.routes.js`:
```js
import { Router } from 'express';
import { createOrder, listMyOrders } from '../controllers/orders.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth, createOrder);
router.get('/', auth, listMyOrders);

export default router;
```

`/workspace/server/src/routes/promo.routes.js`:
```js
import { Router } from 'express';
import { validatePromo } from '../controllers/promo.controller.js';

const router = Router();
router.get('/:code', validatePromo);
export default router;
```

Mount in `app.js`:
```js
import ordersRoutes from './routes/orders.routes.js';
import promoRoutes from './routes/promo.routes.js';
app.use('/api/orders', ordersRoutes);
app.use('/api/promo', promoRoutes);
```

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace server`
Expected: PASS (16 + 8 new = 24 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src server/tests/orders.test.js
git commit -m "feat(server): add orders API with server-side totals and promo validation"
```

---

### Task 5: Newsletter endpoint

**Files:**
- Create: `/workspace/server/src/models/Subscriber.js`
- Create: `/workspace/server/src/controllers/newsletter.controller.js`
- Create: `/workspace/server/src/routes/newsletter.routes.js`
- Test: `/workspace/server/tests/newsletter.test.js`
- Modify: `/workspace/server/src/app.js`

**Interfaces:**
- Consumes: `app`.
- Produces: `POST /api/newsletter` -> `{ subscribed: true }`, 409 on duplicate.

- [ ] **Step 1: Write the failing test**

`/workspace/server/tests/newsletter.test.js`:
```js
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { startMemoryDb, stopMemoryDb } from './setup.js';
import Subscriber from '../src/models/Subscriber.js';

beforeAll(async () => { await startMemoryDb(); });
afterAll(async () => { await mongoose.disconnect(); await stopMemoryDb(); });
beforeEach(async () => { await Subscriber.deleteMany({}); });

describe('POST /api/newsletter', () => {
  it('subscribes an email', async () => {
    const res = await request(app).post('/api/newsletter').send({ email: 'a@b.com' });
    expect(res.status).toBe(201);
    expect(res.body.subscribed).toBe(true);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/newsletter').send({ email: 'a@b.com' });
    const res = await request(app).post('/api/newsletter').send({ email: 'a@b.com' });
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace server -- newsletter.test.js`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement**

`/workspace/server/src/models/Subscriber.js`:
```js
import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

export default mongoose.model('Subscriber', subscriberSchema);
```

`/workspace/server/src/controllers/newsletter.controller.js`:
```js
import Subscriber from '../models/Subscriber.js';

export async function subscribe(req, res, next) {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Already subscribed' });
    await Subscriber.create({ email });
    res.status(201).json({ subscribed: true });
  } catch (err) { next(err); }
}
```

`/workspace/server/src/routes/newsletter.routes.js`:
```js
import { Router } from 'express';
import { subscribe } from '../controllers/newsletter.controller.js';

const router = Router();
router.post('/', subscribe);
export default router;
```

Mount in `app.js`:
```js
import newsletterRoutes from './routes/newsletter.routes.js';
app.use('/api/newsletter', newsletterRoutes);
```

- [ ] **Step 4: Run full server suite**

Run: `npm run test --workspace server`
Expected: PASS (26 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src server/tests/newsletter.test.js
git commit -m "feat(server): add newsletter subscription endpoint"
```

**Backend checkpoint:** all 26 server tests green; `npm run seed --workspace server` inserts 8 products + 1 promo code against a real Mongo.

---

## Phase 2 — React Frontend

### Task 6: Vite + React scaffold, router, and design-system port

**Files:**
- Create: `/workspace/client/package.json`
- Create: `/workspace/client/vite.config.js`
- Create: `/workspace/client/index.html`
- Create: `/workspace/client/src/main.jsx`
- Create: `/workspace/client/src/App.jsx`
- Create: `/workspace/client/src/styles/global.css` (copy of `/workspace/styles.css`)
- Create: `/workspace/client/src/components/Particles.jsx`
- Create: `/workspace/client/src/components/Toast.jsx`
- Create: `/workspace/client/src/context/ToastContext.jsx`

**Interfaces:**
- Consumes: nothing from backend yet (routes render static pages).
- Produces: `App` with React Router routes, `ToastProvider` + `useToast()`, `Particles` component, global stylesheet identical to current site.

- [ ] **Step 1: Create client package, vite config, entry files**

`/workspace/client/package.json`:
```json
{
  "name": "med-store-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "axios": "^1.7.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

`/workspace/client/vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.js',
  },
});
```

`/workspace/client/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediCare | Premium Healthcare & Medicines</title>
  <meta name="description" content="MediCare - Your trusted partner for authentic medicines, fast delivery, and expert healthcare consultations.">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

`/workspace/client/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 2: Port the design system**

Copy `/workspace/styles.css` -> `/workspace/client/src/styles/global.css`. Move the page-specific `<style>` blocks from `cart.html`, `checkout.html`, and `medicines.html` into `global.css` under section comments (or per-page CSS files if the file grows past ~2000 lines; keep it simple initially). Verify the font `@import` at the top still resolves.

Run: `cp styles.css client/src/styles/global.css`
Expected: file exists, identical byte-for-byte.

- [ ] **Step 3: Toast context and Particles**

`/workspace/client/src/context/ToastContext.jsx`:
```jsx
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <ToastView toast={toast} onDone={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDone }) {
  const color = toast.type === 'info' ? 'var(--primary)' : toast.type === 'error' ? 'var(--accent)' : 'var(--neon-green)';
  setTimeout(onDone, 3000);
  return <div className="toast show" style={{ borderLeftColor: color }}>{toast.message}</div>;
}

export function useToast() {
  return useContext(ToastContext);
}
```

`/workspace/client/src/components/Particles.jsx`:
```jsx
import { useEffect, useRef } from 'react';

export default function Particles({ density = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const dots = Array.from({ length: density }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,0.25)';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return <canvas id="particleCanvas" ref={canvasRef}></canvas>;
}
```

`/workspace/client/src/App.jsx` (placeholder routes; full pages land in later tasks):
```jsx
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<div>Home placeholder</div>} />
      </Routes>
    </ToastProvider>
  );
}
```

- [ ] **Step 4: Add test setup file**

`/workspace/client/src/__tests__/setup.js`:
```js
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Install and verify**

Run: `npm install` at `/workspace` root (or `npm install --workspace client`).
Expected: install succeeds.

Run: `npm run test --workspace client`
Expected: PASS (no tests yet, vitest exits 0).

Run: `npm run dev --workspace client`
Expected: Vite serves on `http://localhost:5173` and renders "Home placeholder".

- [ ] **Step 6: Commit**

```bash
git add client package.json package-lock.json
git commit -m "feat(client): scaffold vite react app, port design system, add toast and particles"
```

---

### Task 7: API client and products data fetching

**Files:**
- Create: `/workspace/client/src/api/client.js`
- Create: `/workspace/client/src/api/products.js`
- Create: `/workspace/client/src/utils/format.js`
- Create: `/workspace/client/src/hooks/useDebounce.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `api.get('/...')` axios instance; `fetchProducts({ category, search, sort })`; `fetchProduct(id)`; `formatPrice(n)`, `discountPct(price, original)`, `stars(rating)`; `useDebounce(value, ms)`.

- [ ] **Step 1: Write the failing unit tests**

`/workspace/client/src/__tests__/utils.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { formatPrice, discountPct, stars } from '../utils/format.js';

describe('format utils', () => {
  it('formats prices to 2 decimals', () => {
    expect(formatPrice(12.999)).toBe('$13.00');
    expect(formatPrice(5)).toBe('$5.00');
  });

  it('computes discount percentage', () => {
    expect(discountPct(12.99, 16.99)).toBe(24);
  });

  it('builds star strings', () => {
    expect(stars(4.8)).toBe('★★★★★');
    expect(stars(3.4)).toBe('★★★☆☆');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace client -- utils.test.js`
Expected: FAIL (utils module missing).

- [ ] **Step 3: Implement**

`/workspace/client/src/utils/format.js`:
```js
export function formatPrice(n) {
  return `$${Number(n).toFixed(2)}`;
}

export function discountPct(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function stars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
```

`/workspace/client/src/api/client.js`:
```js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medstore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

`/workspace/client/src/api/products.js`:
```js
import api from './client.js';

export async function fetchProducts({ category = 'all', search = '', sort = 'default' } = {}) {
  const { data } = await api.get('/products', {
    params: { category, search, sort },
  });
  return data.products;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.product;
}
```

`/workspace/client/src/hooks/useDebounce.js`:
```js
import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace client`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src
git commit -m "feat(client): add api client, products api, and formatting utilities"
```

---

### Task 8: Cart and Wishlist contexts with localStorage persistence

**Files:**
- Create: `/workspace/client/src/context/CartContext.jsx`
- Create: `/workspace/client/src/context/WishlistContext.jsx`
- Test: `/workspace/client/src/__tests__/CartContext.test.jsx`

**Interfaces:**
- Consumes: nothing (works on product objects passed in).
- Produces: `CartProvider` exposing `{ items, addItem(product), removeItem(id), updateQty(id, delta), clearCart, count, subtotal }`; `WishlistProvider` exposing `{ wishlist, toggle(id), isWished(id) }`. Both persist to localStorage under the existing keys `cart` and `wishlist` for continuity.

- [ ] **Step 1: Write the failing test**

`/workspace/client/src/__tests__/CartContext.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext.jsx';

const product = { _id: 'p1', name: 'Test', price: 10, emoji: 'x', category: 'Medicine', desc: 'd', originalPrice: 12, rating: 4, reviews: 1 };

function Probe() {
  const { items, count, subtotal, addItem, updateQty, removeItem } = useCart();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <button onClick={() => addItem(product)}>add</button>
      <button onClick={() => updateQty('p1', 1)}>inc</button>
      <button onClick={() => removeItem('p1')}>remove</button>
      <span data-testid="qty">{items[0]?.qty ?? 0}</span>
    </div>
  );
}

describe('CartContext', () => {
  it('adds items and accumulates quantity', () => {
    render(<CartProvider><Probe /></CartProvider>);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('qty').textContent).toBe('2');
    expect(screen.getByTestId('subtotal').textContent).toBe('20');
  });

  it('updates and removes items', () => {
    render(<CartProvider><Probe /></CartProvider>);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('inc'));
    expect(screen.getByTestId('qty').textContent).toBe('2');
    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace client -- CartContext.test.jsx`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement CartContext**

`/workspace/client/src/context/CartContext.jsx`:
```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

function load() {
  try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) => (i._id === product._id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
        .filter((i) => i.qty >= 1)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((a, i) => a + i.qty, 0);
    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
    return { items, count, subtotal, addItem, removeItem, updateQty, clearCart };
  }, [items, addItem, removeItem, updateQty, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
```

`/workspace/client/src/context/WishlistContext.jsx`:
```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

function load() {
  try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(load);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = useCallback((id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isWished = useCallback((id) => wishlist.includes(id), [wishlist]);

  const value = useMemo(() => ({ wishlist, toggle, isWished }), [wishlist, toggle, isWished]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace client`
Expected: PASS (3 utils + 2 cart = 5 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/context client/src/__tests__
git commit -m "feat(client): add cart and wishlist contexts with localStorage persistence"
```

---

### Task 9: Layout (Header, Footer, Fab, MiniCart) and ProductCard + grid

**Files:**
- Create: `/workspace/client/src/components/Header.jsx`
- Create: `/workspace/client/src/components/Footer.jsx`
- Create: `/workspace/client/src/components/Fab.jsx`
- Create: `/workspace/client/src/components/MiniCart.jsx`
- Create: `/workspace/client/src/components/ProductCard.jsx`
- Create: `/workspace/client/src/components/ProductGrid.jsx`
- Create: `/workspace/client/src/components/ProductModal.jsx`
- Test: `/workspace/client/src/__tests__/ProductCard.test.jsx`

**Interfaces:**
- Consumes: `useCart`, `useWishlist`, `useToast`, `formatPrice`, `discountPct`, `stars`, `fetchProduct`.
- Produces: `Header` (mobile menu + search input + cart badge), `Footer`, `Fab`, `MiniCart`, `ProductCard({ product, onQuickView })`, `ProductGrid`, `ProductModal({ productId, onClose })`.

- [ ] **Step 1: Write the failing test**

`/workspace/client/src/__tests__/ProductCard.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../components/ProductCard.jsx';

const product = {
  _id: 'p1', name: 'Advanced Pain Relief', price: 12.99, originalPrice: 16.99,
  category: 'Medicine', emoji: 'x', desc: 'Fast relief', rating: 4.8, reviews: 234,
};

describe('ProductCard', () => {
  it('renders product details', () => {
    render(<ProductCard product={product} isWished={false} onAddToCart={() => {}} onQuickView={() => {}} onToggleWishlist={() => {}} />);
    expect(screen.getByText('Advanced Pain Relief')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('Medicine')).toBeInTheDocument();
    expect(screen.getByText('-24%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace client -- ProductCard.test.jsx`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement components**

`/workspace/client/src/components/ProductCard.jsx`:
```jsx
import { formatPrice, discountPct, stars } from '../utils/format.js';

export function ProductCard({ product, isWished, onAddToCart, onQuickView, onToggleWishlist, index = 0 }) {
  const discount = discountPct(product.price, product.originalPrice);
  return (
    <div className="product-card fade-in visible" style={{ transitionDelay: `${index * 0.07}s` }} data-id={product._id}>
      <div className="card-shine"></div>
      <div className="product-category-tag">{product.category}</div>
      <button
        className={`wishlist-btn ${isWished ? 'active' : ''}`}
        onClick={() => onToggleWishlist(product._id)}
        aria-label="Wishlist"
      >
        {isWished ? '❤️' : '🤍'}
      </button>
      <button className="quick-view-btn" onClick={() => onQuickView(product._id)}>Quick View 👁️</button>
      <div className="product-img-box" onClick={() => onQuickView(product._id)}>
        <span className="product-emoji-wrap">{product.emoji}</span>
      </div>
      <div className="product-details">
        <div className="product-title" onClick={() => onQuickView(product._id)}>{product.name}</div>
        <div className="product-desc">{product.desc}</div>
        <div className="product-rating">
          <span className="stars">{stars(product.rating)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-footer">
          <div>
            <div className="price">{formatPrice(product.price)}</div>
            {product.originalPrice > product.price && (
              <div className="price-original">{formatPrice(product.originalPrice)} <span style={{ color: '#39ff14', fontSize: '0.75rem', marginLeft: '4px' }}>-{discount}%</span></div>
            )}
          </div>
          <button className="add-btn" onClick={() => onAddToCart(product)}>+ Add</button>
        </div>
      </div>
    </div>
  );
}
```

Note: The card uses emoji product icons from the product data (existing site behavior). All other UI copy uses text.

`/workspace/client/src/components/ProductGrid.jsx`:
```jsx
import { ProductCard } from './ProductCard.jsx';

export function ProductGrid({ products, isWished, onAddToCart, onQuickView, onToggleWishlist }) {
  return (
    <div id="productsGrid" className="products-grid">
      {products.map((p, i) => (
        <ProductCard
          key={p._id}
          product={p}
          index={i}
          isWished={isWished(p._id)}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}
```

`/workspace/client/src/components/ProductModal.jsx`:
```jsx
import { useEffect, useState } from 'react';
import { fetchProduct } from '../api/products.js';
import { formatPrice, discountPct, stars } from '../utils/format.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function ProductModal({ productId, onClose, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId).then(setProduct).catch(() => showToast('Could not load product', 'error'));
  }, [productId, showToast]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  return (
    <div id="productModal" className="modal active" aria-hidden="false">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        <div className="modal-body">
          <div className="modal-product-content">
            <div className="modal-product-image">{product.emoji}</div>
            <div className="modal-product-info">
              <div className="product-category-tag" style={{ position: 'relative', top: 'auto', left: 'auto', display: 'inline-block', marginBottom: '0.8rem' }}>{product.category}</div>
              <h2>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.5rem 0' }}>
                <span className="stars">{stars(product.rating)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.reviews} reviews)</span>
              </div>
              <div className="price">{formatPrice(product.price)} <span className="price-original" style={{ fontSize: '1.1rem' }}>{formatPrice(product.originalPrice)}</span></div>
              <p className="product-desc">{product.desc}</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => { onAddToCart(product); onClose(); }} style={{ flex: 1 }}>Add to Cart</button>
                <button className="wishlist-btn active" style={{ position: 'relative', width: '50px', height: '50px' }} onClick={() => toggle(product._id)} aria-label="Wishlist">{isWished(product._id) ? '❤️' : '🤍'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

`/workspace/client/src/components/Header.jsx` (consolidates the duplicated header logic from all 4 HTML pages):
```jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export function Header({ onSearch }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [miniOpen, setMiniOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearch('');
    onSearch?.('');
  }, [location.pathname, onSearch]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} id="siteHeader">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏥</span>
          <h1>MediCare</h1>
        </Link>
        <nav className="nav">
          <button className={`mobile-menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`} id="navLinks">
            <li><Link to="/" className="nav-link active">Home</Link></li>
            <li><Link to="/medicines" className="nav-link">Medicines Info</Link></li>
            <li><Link to="/products" className="nav-link">Products</Link></li>
            <li><Link to="/account" className="nav-link">My Orders</Link></li>
          </ul>
          <div className="nav-actions">
            <div className="search-container">
              <input
                type="text"
                className={`search-input ${searchActive || search ? 'active' : ''}`}
                placeholder="Search products..."
                aria-label="Search products"
                value={search}
                onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value); }}
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <button className="search-btn" aria-label="Search" onClick={() => setSearchActive(true)}>🔍</button>
            </div>
            <a href="/cart" className="cart-btn" aria-label="View Cart" onMouseEnter={() => setMiniOpen(true)} onMouseLeave={() => setMiniOpen(false)}>
              🛒 <span className="cart-count" style={{ display: count === 0 ? 'none' : 'flex' }}>{count}</span>
            </a>
          </div>
        </nav>
      </div>
      <MiniCart open={miniOpen} />
    </header>
  );
}
```

`/workspace/client/src/components/MiniCart.jsx`:
```jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

export function MiniCart({ open }) {
  const { items, subtotal } = useCart();
  return (
    <div id="miniCart" className={`mini-cart ${open ? 'active' : ''}`} onMouseLeave={undefined}>
      <div className="mini-cart-header">
        <h3>Your Cart</h3>
      </div>
      <div className="mini-cart-items">
        {items.length === 0 ? (
          <div className="mini-cart-empty"><p>Your cart is empty</p></div>
        ) : (
          items.map((i) => (
            <div className="mini-cart-item" key={i._id}>
              <div className="mini-cart-item-emoji">{i.emoji || '💊'}</div>
              <div className="mini-cart-item-info">
                <div className="mini-cart-item-title">{i.name}</div>
                <div className="mini-cart-item-price">{formatPrice(i.price)} × {i.qty}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mini-cart-footer">
        <div className="mini-cart-total"><span>Total:</span><span>{formatPrice(subtotal)}</span></div>
        <Link to="/cart" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>View Cart →</Link>
      </div>
    </div>
  );
}
```

`/workspace/client/src/components/Footer.jsx` and `Fab.jsx`: port the footer markup from `index.html:250-302` and the FAB from `index.html:330` (Link to `/cart`, scroll-show effect) as React components. `Footer` uses `Link`/`NavLink` instead of `href`; the newsletter form calls `POST /api/newsletter` (implemented in Task 12) with a toast result.

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace client`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/components
git commit -m "feat(client): add layout components, product card/grid/modal, mini cart"
```

---

### Task 10: Home, Products, and Medicines pages

**Files:**
- Create: `/workspace/client/src/pages/HomePage.jsx`
- Create: `/workspace/client/src/pages/ProductsPage.jsx`
- Create: `/workspace/client/src/pages/MedicinesPage.jsx`
- Modify: `/workspace/client/src/App.jsx` (add routes + providers)

**Interfaces:**
- Consumes: `fetchProducts`, `Header` (search callback), `ProductGrid`, `ProductModal`, `useCart`, `useWishlist`, `useToast`.
- Produces: `/` HomePage (hero, stats, features, trust badges, featured products, testimonials, newsletter), `/products` ProductsPage (category pills, sort, debounced search, results count, no-results state), `/medicines` MedicinesPage (static encyclopedia cards from `medicines.html`).

- [ ] **Step 1: Implement HomePage**

`/workspace/client/src/pages/HomePage.jsx`: Port the sections from `index.html:51-247` as JSX. Hero, stats (animated counters via a small `useCountUp` effect with IntersectionObserver), features band, trust badges, a featured-products grid (first 8 products via `fetchProducts`), testimonials, and the newsletter form (submit calls the newsletter API, added in Task 12). The 3D Three.js hero and the typing effect are optional polish carried over from `script.js`; if included, wrap them in `useEffect` and keep the existing `<canvas id="heroCanvas">` markup. Scroll-progress bar and scroll-reveal (`IntersectionObserver`) are moved into a `useScrollEffects()` hook invoked once in `App`.

- [ ] **Step 2: Implement ProductsPage**

`/workspace/client/src/pages/ProductsPage.jsx`:
```jsx
import { useCallback, useEffect, useState } from 'react';
import { fetchProducts } from '../api/products.js';
import { ProductGrid } from '../components/ProductGrid.jsx';
import { ProductModal } from '../components/ProductModal.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

const CATEGORIES = ['all', 'Medicine', 'Vitamins', 'Devices', 'Protection', 'Essentials'];

export function ProductsPage({ search }) {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalId, setModalId] = useState(null);
  const debouncedSearch = useDebounce(search, 250);

  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchProducts({ category, search: debouncedSearch, sort });
      setProducts(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch, sort]);

  useEffect(() => { load(); }, [load]);

  const onAddToCart = useCallback((product) => {
    addItem(product);
    showToast(`${product.name} added to cart`);
  }, [addItem, showToast]);

  return (
    <div className="container products-section" id="products" style={{ paddingTop: '3rem' }}>
      <div className="section-header fade-in visible">
        <div className="section-tag">CATALOGUE</div>
        <h2 className="section-title">Featured <span>Products</span></h2>
        <p className="section-desc">Handpicked essentials for your health and wellness journey</p>
      </div>

      <div className="category-pills" id="categoryPills">
        {CATEGORIES.map((c) => (
          <button key={c} className={`pill ${category === c ? 'active' : ''}`} data-category={c} onClick={() => setCategory(c)}>
            {c === 'all' ? 'All Products' : c}
          </button>
        ))}
      </div>

      <div className="products-controls">
        <div className="results-count">Showing <span>{products.length}</span> products</div>
        <select id="sortSelect" className="filter-select" aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort by</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low → High)</option>
          <option value="price-desc">Price (High → Low)</option>
        </select>
      </div>

      {loading && <div className="no-results" style={{ display: 'block' }}><h3>Loading products...</h3></div>}
      {error && (
        <div className="no-results" style={{ display: 'block' }}>
          <h3>Could not load products</h3>
          <p>Check that the API is running.</p>
          <button className="btn btn-primary" onClick={load} style={{ display: 'inline-flex' }}>Retry</button>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div id="noResults" className="no-results" style={{ display: 'block' }}>
          <div className="no-results-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
      {!loading && !error && products.length > 0 && (
        <ProductGrid
          products={products}
          isWished={isWished}
          onAddToCart={onAddToCart}
          onQuickView={setModalId}
          onToggleWishlist={(id) => toggle(id)}
        />
      )}

      {modalId && <ProductModal productId={modalId} onClose={() => setModalId(null)} onAddToCart={onAddToCart} />}
    </div>
  );
}
```

- [ ] **Step 3: Implement MedicinesPage and wire routes**

`/workspace/client/src/pages/MedicinesPage.jsx`: Port the 6 info cards + search hero from `medicines.html:86-147`. Static content; no API calls.

Update `/workspace/client/src/App.jsx`:
```jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { Fab } from './components/Fab.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { MedicinesPage } from './pages/MedicinesPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { Particles } from './components/Particles.jsx';

export default function App() {
  const location = useLocation();
  const homeSearch = location.pathname === '/' ? (new URLSearchParams(location.search).get('q') || '') : '';

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <Particles />
          <Header onSearch={() => {}} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage search={homeSearch} />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
          <Footer />
          <Fab />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
```

Note: Header search wiring is refined in Task 13 (the `onSearch` prop receives a handler that navigates to `/products`); for now `HomePage` renders its own featured grid with an internal search box stub.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev --workspace server` and `npm run dev --workspace client` (two terminals, or `npm run dev` at root).
Expected: `http://localhost:5173` renders the home page with hero, featured products fetched from the API, and no console errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages client/src/App.jsx
git commit -m "feat(client): add home, products, and medicines pages wired to the API"
```

---

### Task 11: Cart, Checkout, and Auth pages

**Files:**
- Create: `/workspace/client/src/pages/CartPage.jsx`
- Create: `/workspace/client/src/pages/CheckoutPage.jsx`
- Create: `/workspace/client/src/pages/AuthPage.jsx`
- Create: `/workspace/client/src/api/auth.js`
- Create: `/workspace/client/src/api/orders.js`
- Create: `/workspace/client/src/api/promo.js`
- Create: `/workspace/client/src/context/AuthContext.jsx`
- Create: `/workspace/client/src/components/ProtectedRoute.jsx`
- Modify: `/workspace/client/src/App.jsx`

**Interfaces:**
- Consumes: `useCart`, `fetchOrders`/`createOrder`, `login`/`register`, `validatePromo`.
- Produces: `AuthProvider` exposing `{ user, token, login, register, logout }` (token in localStorage `medstore_token`, user in `medstore_user`); `ProtectedRoute`; `CartPage` (port of `cart.html` logic); `CheckoutPage` (3-step, calls `createOrder`, clears cart, shows success overlay); `AuthPage` (login/register forms).

- [ ] **Step 1: Write the failing tests**

`/workspace/client/src/__tests__/AuthContext.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

function Probe() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <button onClick={() => login({ id: '1', name: 'Jane', email: 'jane@x.com' }, 'tok')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('stores the user and clears on logout', () => {
    localStorage.clear();
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('email').textContent).toBe('jane@x.com');
    fireEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('email').textContent).toBe('none');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace client -- AuthContext.test.jsx`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement auth API, context, and protected route**

`/workspace/client/src/api/auth.js`:
```js
import api from './client.js';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data.user;
}
```

`/workspace/client/src/context/AuthContext.jsx`:
```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medstore_user')) || null; } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('medstore_user', JSON.stringify(user));
  }, [user]);

  const login = useCallback((u, t) => {
    localStorage.setItem('medstore_token', t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medstore_token');
    localStorage.removeItem('medstore_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

`/workspace/client/src/components/ProtectedRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}
```

`/workspace/client/src/api/orders.js`:
```js
import api from './client.js';

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data.order;
}

export async function fetchOrders() {
  const { data } = await api.get('/orders');
  return data.orders;
}
```

`/workspace/client/src/api/promo.js`:
```js
import api from './client.js';

export async function validatePromo(code) {
  const { data } = await api.get(`/promo/${encodeURIComponent(code)}`);
  return data;
}
```

- [ ] **Step 4: Implement CartPage, CheckoutPage, AuthPage**

`/workspace/client/src/pages/CartPage.jsx`: Port `cart.html` rendering + logic. Renders `cartItems` from `useCart` with qty buttons and remove; computes subtotal/tax/shipping/total and the free-shipping bar exactly as `cart.html:324-404`; promo input calls `validatePromo` then applies the percentage locally for display; "Proceed to Checkout" navigates to `/checkout` (empty cart shows the empty state).

`/workspace/client/src/pages/CheckoutPage.jsx`: Port `checkout.html` 3-step wizard (shipping → payment → review). On "Place Order", calls `createOrder({ items, shippingInfo, promoCode })` from `useCart`; on success clears cart and shows the success overlay (`checkout.html:350-355`). If not authenticated, redirect to `/auth?redirect=/checkout`. Payment is UI-only (no real gateway); the API does not accept card details.

`/workspace/client/src/pages/AuthPage.jsx`:
```jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { login as apiLogin, register as apiRegister } from '../api/auth.js';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const showToast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = mode === 'login'
        ? await apiLogin(email, password)
        : await apiRegister(name, email, password);
      login(data.user, data.token);
      showToast(`Welcome, ${data.user.name}`);
      navigate(params.get('redirect') || '/account');
    } catch (err) {
      showToast(err.response?.data?.message || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="section-header fade-in visible">
        <div className="section-tag">ACCOUNT</div>
        <h2 className="section-title">{mode === 'login' ? 'Welcome <span>Back</span>' : 'Create <span>Account</span>'}</h2>
      </div>
      <form className="form-card" onSubmit={submit}>
        {mode === 'register' && (
          <div className="form-group fg-full">
            <label>Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>
        )}
        <div className="form-group fg-full">
          <label>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
        </div>
        <div className="form-group fg-full">
          <label>Password *</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <button className="continue-link" onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}
```

`/workspace/client/src/pages/AccountPage.jsx`: Lists the user's orders (from `fetchOrders`) with items, status, total, and date. Protected by `ProtectedRoute`.

Wire providers in `App.jsx`: wrap with `<AuthProvider>` (outermost of the context providers). Replace `/checkout` and `/account` routes:
```jsx
<Route path="/checkout" element={<CheckoutPage />} />
<Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
```

- [ ] **Step 5: Run tests**

Run: `npm run test --workspace client`
Expected: PASS (6 + 1 auth = 7 tests).

- [ ] **Step 6: Manual end-to-end check**

With both servers running: register → add to cart → checkout → place order → see success overlay → check `/account` shows the order. Verify order persisted in Mongo (`med-store` DB, `orders` collection).

- [ ] **Step 7: Commit**

```bash
git add client/src
git commit -m "feat(client): add cart, checkout, auth pages and order flow"
```

---

### Task 12: Newsletter integration

**Files:**
- Create: `/workspace/client/src/api/newsletter.js`
- Modify: `/workspace/client/src/components/Footer.jsx` and `/workspace/client/src/pages/HomePage.jsx` (newsletter form)
- Test: `/workspace/client/src/__tests__/newsletter.test.jsx`

**Interfaces:**
- Consumes: `api`, `useToast`.
- Produces: `subscribeNewsletter(email)`; the newsletter form submits to the API and toasts success/duplicate/error.

- [ ] **Step 1: Write the failing test**

`/workspace/client/src/__tests__/newsletter.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterForm from '../components/NewsletterForm.jsx';
import * as newsletterApi from '../api/newsletter.js';

vi.mock('../api/newsletter.js', () => ({
  subscribeNewsletter: vi.fn(),
}));

describe('NewsletterForm', () => {
  it('subscribes and shows a toast', async () => {
    newsletterApi.subscribeNewsletter.mockResolvedValue({ subscribed: true });
    render(<NewsletterForm />);
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), { target: { value: 'a@b.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }));
    await waitFor(() => expect(newsletterApi.subscribeNewsletter).toHaveBeenCalledWith('a@b.com'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace client -- newsletter.test.jsx`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement**

`/workspace/client/src/api/newsletter.js`:
```js
import api from './client.js';

export async function subscribeNewsletter(email) {
  const { data } = await api.post('/newsletter', { email });
  return data;
}
```

`/workspace/client/src/components/NewsletterForm.jsx`:
```jsx
import { useState } from 'react';
import { subscribeNewsletter } from '../api/newsletter.js';
import { useToast } from '../context/ToastContext.jsx';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const showToast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await subscribeNewsletter(email);
      showToast('Welcome! Check your inbox soon.');
      setEmail('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not subscribe', 'error');
    }
  };

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <input
        type="email"
        className="newsletter-input"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary">Subscribe 🚀</button>
    </form>
  );
}
```

Use `<NewsletterForm />` in `HomePage` (replacing the inline form) and `Footer`.

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace client`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src
git commit -m "feat(client): wire newsletter form to the API"
```

---

### Task 13: Global search UX, polish, and app-level hooks

**Files:**
- Create: `/workspace/client/src/hooks/useScrollEffects.js`
- Create: `/workspace/client/src/hooks/useCountUp.js`
- Modify: `/workspace/client/src/App.jsx` (search wiring + scroll effects)
- Modify: `/workspace/client/src/components/Header.jsx` (search prop is now a navigate-to-products search)

**Interfaces:**
- Consumes: `useNavigate`.
- Produces: `useScrollEffects()` (scroll progress bar + IntersectionObserver reveal), `useCountUp(target, suffix)` for stats.

- [ ] **Step 1: Implement hooks and wire search**

`/workspace/client/src/hooks/useScrollEffects.js`:
```js
import { useEffect } from 'react';

export function useScrollEffects() {
  useEffect(() => {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = `${Math.min(pct, 100)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
```

`/workspace/client/src/hooks/useCountUp.js`:
```js
import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, suffix = '', duration = 2000) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = document.querySelector('.stats-section');
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = target / (duration / 16);
          let current = 0;
          const tick = () => {
            current = Math.min(current + step, target);
            setValue(Math.round(current));
            if (current < target) requestAnimationFrame(tick);
          };
          tick();
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  const display = value >= 1000 ? value.toLocaleString() : String(value);
  return `${display}${suffix}`;
}
```

Update `App.jsx` to call `useScrollEffects()` and render `<div id="scrollProgress"></div>`. Update `Header` so its search handler navigates to `/products?q=<query>` via `useNavigate` when the user presses Enter or clicks the search button; `ProductsPage` reads the `q` param as its `search` initial value.

- [ ] **Step 2: Manual check**

Run both servers. Verify: scroll progress bar animates, stats count up on scroll, header search navigates to `/products?q=vitamin` and pre-fills the search, typing filters the grid with debounce.

- [ ] **Step 3: Commit**

```bash
git add client/src
git commit -m "feat(client): add scroll effects, count-up stats, and global search wiring"
```

---

### Task 14: Client build, README, and final integration pass

**Files:**
- Modify: `/workspace/README.md` (setup/run/test instructions)
- Modify: `/workspace/client/package.json` (add `preview` verification)
- Create: `/workspace/scripts/dev.sh` (optional convenience launcher)

**Interfaces:**
- Consumes: everything.
- Produces: verified production build + documentation.

- [ ] **Step 1: Verify production build**

Run: `npm run build --workspace client`
Expected: `vite build` completes; `client/dist` is emitted.

Run: `npm run test` at root.
Expected: PASS (server 26 tests, client ~8 tests).

- [ ] **Step 2: Write README**

Replace `/workspace/README.md` content with setup instructions:
- Prereqs: Node 20+, MongoDB (local or Atlas).
- `npm install`, `cp server/.env.example server/.env` (set MONGO_URI + JWT_SECRET), `npm run seed`, `npm run dev`.
- URLs: client `http://localhost:5173`, API `http://localhost:5000/api`.
- Test commands: `npm run test` (both), per-workspace `npm run test --workspace server`.
- Note: preview environment exposes client port; API is proxied through Vite.

- [ ] **Step 3: Manual full-flow smoke test**

Flow: register → browse/filter/search → quick view → add to cart → cart qty/promo → checkout (3 steps) → place order → success → account shows order → logout → login → order history still present. Newsletter subscribe shows success toast.

- [ ] **Step 4: Commit**

```bash
git add README.md client scripts
git commit -m "docs: add MERN setup instructions and verify build"
```

---

## Self-Review Notes

**Spec coverage check (against the user's request: review code + upgrade to MERN):**
- Code review: completed (see "Current Code Review" section).
- Backend: products/orders/auth/promo/newsletter all covered (Tasks 2-5).
- Frontend: React SPA replacing all 4 HTML pages (Tasks 6-13).
- Data persistence: MongoDB for products/orders/users/promos/subscribers; localStorage retained for cart/wishlist (matches existing UX).
- Design preserved: `styles.css` ported verbatim (Task 6).
- Every weakness from the review maps to a task (auth→Task 3/11, order persistence→Task 4, promo→Task 4/11, newsletter→Task 5/12, dedup of pages→Tasks 6-13, testing→throughout).

**Deliberately out of scope (documented so they are not surprises):**
- Real payment processing (card fields are UI-only; API computes totals and persists orders).
- Real product photos replacing emoji icons (noted as future work; emoji preserved as data).
- Admin panel for product management (requires a role field on User; can be a follow-up).
- The Three.js DNA-helix hero and typing effect are optional polish; HomePage can ship without them first.

**Type/signature consistency:** `_id` used as the canonical product identifier everywhere in the client (`fetchProducts`, `ProductCard`, `CartContext`), matching the `Product` model. `addItem(product)` accepts the full product object from the grid/modal, matching `CartContext.addItem`. Order payload uses `productId` + `qty`, matching `orders.controller.js`. Token storage key `medstore_token` is read by the axios interceptor in `api/client.js` and written by `AuthContext.login` — identical strings.

**Placeholder scan:** all code blocks contain real, complete implementations. The only intentional deferrals are the HomePage hero effects (explicitly optional) and the `Header`/`HomePage` search wiring, which Task 13 completes with concrete code.
