const Announcement = require('../models/announcementModel');

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const newAnnouncement = await Announcement.create({ title, message });
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};