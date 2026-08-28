const { getAnnouncementsByStation, createAnnouncement } = require('../services/announcementService');
const catchAsync = require('../utils/catchAsync');

exports.getAnnouncements = catchAsync(async (req, res) => {
  const { stationId } = req.params;
  const { page, limit } = req.query;

  const result = await getAnnouncementsByStation(stationId, page, limit);
  res.json(result);
});

exports.postAnnouncement = catchAsync(async (req, res) => {
  const { stationId } = req.params;
  const { text } = req.body;

  const announcement = await createAnnouncement(stationId, text);

  const io = req.app.get('io');
  if (io) {
    io.to(stationId).emit('newAnnouncement', announcement);
  }

  res.status(201).json(announcement);
});