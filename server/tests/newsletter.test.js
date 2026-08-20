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
