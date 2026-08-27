const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);