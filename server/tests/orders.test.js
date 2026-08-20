process.env.JWT_SECRET = 'test-secret';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { startMemoryDb, stopMemoryDb } from './setup.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import PromoCode from '../src/models/PromoCode.js';
import User from '../src/models/User.js';
import { seedProducts, seedPromoCodes } from '../src/seed.js';

let token;
let product;
let promo;

beforeAll(async () => { await startMemoryDb(); });
afterAll(async () => { await mongoose.disconnect(); await stopMemoryDb(); });

beforeEach(async () => {
  await Promise.all([Product.deleteMany({}), Order.deleteMany({}), PromoCode.deleteMany({}), User.deleteMany({})]);
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
