import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app.js';
import { startMemoryDb, stopMemoryDb } from './setup.js';
import Product from '../src/models/Product.js';
import { seedProducts } from '../src/seed.js';

beforeAll(async () => { await startMemoryDb(); await mongoose.connect(process.env.MONGO_URI); });
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
