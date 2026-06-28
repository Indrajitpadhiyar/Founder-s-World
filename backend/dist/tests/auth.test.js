import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import dns from 'dns';
import { app } from '../app.js';
import { env } from '../config/env.js';
dns.setServers(['8.8.8.8', '8.8.4.4']);
describe('API Integration Tests', () => {
    beforeAll(async () => {
        // Connect to MongoDB using MONGO_URL
        await mongoose.connect(env.MONGO_URL);
    });
    afterAll(async () => {
        // Cleanup and close mongoose
        await mongoose.connection.db?.dropDatabase();
        await mongoose.connection.close();
    });
    describe('GET /api/v1/health', () => {
        it('should return 200 OK and health indicators', async () => {
            const response = await request(app).get('/api/v1/health');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('up');
            expect(response.body.data.services.database).toBe('up');
        });
    });
    describe('POST /api/v1/auth/signup & login flow', () => {
        const testUser = {
            username: 'test_player_1',
            email: 'player1@empire.com',
            password: 'password123',
        };
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send(testUser);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.username).toBe(testUser.username);
        });
        it('should prevent duplicate registration', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send(testUser);
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });
        it('should log in the user and return tokens', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('tokens');
            expect(response.body.data.user.username).toBe(testUser.username);
        });
    });
});
//# sourceMappingURL=auth.test.js.map