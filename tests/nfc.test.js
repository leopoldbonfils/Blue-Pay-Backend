const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

describe('Payment Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const user = await User.create({
      name: 'Test User',
      email: 'payment@bluepay.rw',
      phone: '+250788999888',
      password: 'password123',
      pin: '1234',
      balance: 100000
    });

    userId = user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'payment@bluepay.rw',
        password: 'password123'
      });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/payments/bluepay', () => {
    it('should send money via BluePay', async () => {
      const receiver = await User.create({
        name: 'Receiver',
        email: 'receiver@bluepay.rw',
        phone: '+250788777666',
        password: 'password123',
        pin: '1234',
        balance: 0
      });

      const res = await request(app)
        .post('/api/payments/bluepay')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+250788777666',
          amount: 5000,
          message: 'Test payment'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.transaction).toHaveProperty('transaction_id');
    });

    it('should fail with insufficient balance', async () => {
      const res = await request(app)
        .post('/api/payments/bluepay')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '+250788777666',
          amount: 1000000,
          message: 'Test payment'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Insufficient balance');
    });
  });
});