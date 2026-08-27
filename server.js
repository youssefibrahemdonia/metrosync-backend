const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// CRITICAL: Parses incoming JSON payloads from your frontend fetch calls
app.use(express.json());

// Serve static frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Authentication Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/v1/auth', authRoutes);

// Station Routes
const stationRoutes = require('./src/routes/stationRoutes');
app.use('/api/v1/stations', stationRoutes);

// Announcement Routes
const announcementRoutes = require('./src/routes/announcementRoutes');
app.use('/api/v1/announcements', announcementRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/metrosync';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('// Connected to MongoDB successfully.');

    app.listen(PORT, () => {
      console.log(`// Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('ERROR: Database connection failed:', err.message);
    process.exit(1);
  }
}

startServer();