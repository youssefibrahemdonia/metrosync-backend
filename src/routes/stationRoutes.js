const express = require('express');
const router = express.Router();
const Station = require('../models/stationModel');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// In-memory tracker for active real users per station ID: { stationId: count }
const activeViewers = {};

router.get('/', async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching stations.' });
  }
});

// Join station (Increment real user count)
router.post('/:id/join', async (req, res) => {
  try {
    const stationId = req.params.id;
    activeViewers[stationId] = (activeViewers[stationId] || 0) + 1;
    res.json({ count: activeViewers[stationId] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Leave station (Decrement real user count)
router.post('/:id/leave', async (req, res) => {
  try {
    const stationId = req.params.id;
    if (activeViewers[stationId] && activeViewers[stationId] > 0) {
      activeViewers[stationId] -= 1;
    }
    res.json({ count: activeViewers[stationId] || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, metroTimes } = req.body;
    if (!name) return res.status(400).json({ error: 'Station name required.' });

    const existing = await Station.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Station already exists.' });

    const newStation = new Station({ name, metroTimes: metroTimes || [] });
    await newStation.save();
    res.status(201).json({ message: 'Station added successfully', station: newStation });
  } catch (err) {
    res.status(500).json({ error: 'Server error adding station.' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found.' });
    delete activeViewers[req.params.id];
    res.json({ message: 'Station deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting station.' });
  }
});

module.exports = router;