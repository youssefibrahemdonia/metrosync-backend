const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorMiddleware');
const initSockets = require('./src/sockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.set('io', io);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', require('./src/routes/authRoutes'));
app.use('/api/v1/users', require('./src/routes/userRoutes'));
app.use('/api/v1/stations', require('./src/routes/stationRoutes'));
app.use('/api/v1/stations/:stationId/announcements', require('./src/routes/announcementRoutes'));

initSockets(io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`// Server running on http://localhost:${PORT}`);
  });
}

startServer();