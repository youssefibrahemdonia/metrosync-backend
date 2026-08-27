const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  metroTimes: [{ type: String }] // e.g., ["08:00 AM", "09:30 AM", "11:00 AM"]
});

module.exports = mongoose.model('Station', stationSchema);