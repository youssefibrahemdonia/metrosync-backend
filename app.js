const express = require('express');
const cors = require('cors');
const path = require('path');

const stationRoutes = require('./src/routes/stationRoutes');
const authRoutes = require('./src/routes/authRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend assets from the 'interface' folder
app.use(express.static(path.join(__dirname, 'interface')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/announcements', announcementRoutes);

app.use(errorHandler);

module.exports = app;