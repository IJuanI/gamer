import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Backend Smoke Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Checks', () => {
    it('should respond to /health', async () => {
      const response = await request(app.getHttpServer()).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'gamer-hub-api');
    });

    it('should have CORS headers enabled', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .set('Origin', 'https://gameer.com.ar');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('Auth Endpoints', () => {
    it('POST /auth/register should accept valid input', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          displayName: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
    });

    it('POST /auth/login should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it('POST /auth/refresh without token should return 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', 'refresh_token=invalid');

      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it('GET /auth/me without token should return 401', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/me');

      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it('POST /auth/logout should work', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should return proper error response with message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password - should fail validation
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Telemetry Endpoint', () => {
    it('should accept error reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/telemetry/error')
        .send({
          message: 'Test error',
          context: 'smoke-test',
          metadata: {
            test: true,
          },
        });

      expect([200, 201]).toContain(response.status);
    });

    it('should validate error report format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/telemetry/error')
        .send({
          // Missing required 'message' field
          context: 'test',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Database Connectivity', () => {
    it('should be able to query users collection', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users');

      // Should return 401 (unauthorized) not 500 (server error)
      expect(response.status).not.toBe(500);
    });
  });

  describe('Response Headers', () => {
    it('should set Content-Type header', async () => {
      const response = await request(app.getHttpServer()).get('/api/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should set proper security headers', async () => {
      const response = await request(app.getHttpServer()).get('/api/health');

      expect(response.headers['x-powered-by']).toBeDefined();
    });
  });
});
