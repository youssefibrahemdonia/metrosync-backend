const Announcement = require('../models/Announcement');

const getAnnouncementsByStation = async (stationId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const filter = { station: stationId };

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
    Announcement.countDocuments(filter)
  ]);

  return {
    announcements,
    meta: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }
  };
};

const createAnnouncement = async (station, text) => {
  return await Announcement.create({ station, text });
};

module.exports = { getAnnouncementsByStation, createAnnouncement };