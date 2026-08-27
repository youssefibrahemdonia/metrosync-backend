const Station = require('../models/stationModel');

// Get all stations
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch station telemetry.' });
  }
};