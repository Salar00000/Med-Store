import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret';

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
