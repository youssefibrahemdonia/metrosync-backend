const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const errorHandler = require('../src/middleware/errorMiddleware');
const initSockets = require('../src/sockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.set('io', io);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/v1/stations', require('../src/routes/stationRoutes'));
app.use('/api/v1/auth', require('../src/routes/authRoutes'));
app.use('/api/v1/stations/:stationId/announcements', require('../src/routes/announcementRoutes'));
initSockets(io);
app.use(errorHandler);

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in your .env file!');
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  }
}, 15000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  await server.close();
});

describe('MetroSync Integration Tests', () => {
  
  test('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('POST /api/v1/auth/login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@admin.com', password: 'badpassword' });
    expect(res.statusCode).toEqual(401);
  }, 10000);

});