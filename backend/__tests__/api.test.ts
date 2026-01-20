import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

// Mock environment variables before importing app
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.COMPOSIO_API_KEY = 'test-composio-key';
process.env.NODE_ENV = 'test';

// Import after env setup
import app from '../src/index';

describe('Backend API Tests', () => {
  describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'aariv-backend');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limits to API endpoints', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Auth Endpoints', () => {
    it('should reject auth request without idToken', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('should validate idToken format with Zod', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'ab' }); // Too short
      
      expect(response.status).toBe(400);
    });
  });

  describe('Chat Endpoints', () => {
    it('should reject chat without userId', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });
      
      expect(response.status).toBe(400);
    });

    it('should reject chat without message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: 'test-user' });
      
      expect(response.status).toBe(400);
    });

    it('should validate message format with Zod', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ userId: 'test-user', message: '' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Integration Endpoints', () => {
    it('should require userId for listing integrations', async () => {
      const response = await request(app).get('/api/integrations');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require userId and appName for connection', async () => {
      const response = await request(app)
        .post('/api/integrations/connect')
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('should require userId and appName for disconnection', async () => {
      const response = await request(app)
        .post('/api/integrations/disconnect')
        .send({});
      
      expect(response.status).toBe(400);
    });
  });

  describe('Toolkits Endpoints', () => {
    it('should require userId for listing toolkits', async () => {
      const response = await request(app).get('/api/toolkits');
      
      expect(response.status).toBe(400);
    });
  });
});
