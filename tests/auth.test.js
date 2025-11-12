const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@bluepay.rw',
          phone: '+250788123456',
          password: 'password123',
          pin: '1234'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should not register with invalid phone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@bluepay.rw',
          phone: '0788123456',
          password: 'password123',
          pin: '1234'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@bluepay.rw',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@bluepay.rw',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});