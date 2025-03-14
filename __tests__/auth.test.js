import mongoose from 'mongoose';
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/csm-test';
        await mongoose.connect(url);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('fullName', 'Test User');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should not create a user with existing email', async () => {
            await User.create({
                fullName: 'Existing User',
                email: 'test@example.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User.create({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
        });

        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should not login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        });
    });
});
