const {
  getAllStations,
  createStation,
  deleteStation,
  addMetroTime
} = require('../services/stationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getStations = catchAsync(async (req, res) => {
  const stations = await getAllStations();
  res.json(stations);
});

exports.postStation = catchAsync(async (req, res, next) => {
  const { name, line, order, metroTimes } = req.body;

  if (!name) {
    return next(new AppError('Station name is required.', 400));
  }

  const result = await createStation({ name, line, order, metroTimes });

  if (result.error) {
    return next(new AppError(result.error, 400));
  }

  const io = req.app.get('io');
  if (io) io.emit('stationsChanged', { type: 'added', station: result.station });

  res.status(201).json({ message: 'Station added successfully', station: result.station });
});

exports.removeStation = catchAsync(async (req, res, next) => {
  const station = await deleteStation(req.params.id);

  if (!station) {
    return next(new AppError('Station not found.', 404));
  }

  const io = req.app.get('io');
  if (io) io.emit('stationsChanged', { type: 'deleted', stationId: req.params.id });

  res.json({ message: 'Station deleted successfully.' });
});

exports.addTime = catchAsync(async (req, res, next) => {
  const { time } = req.body;

  if (!time) {
    return next(new AppError('Time is required.', 400));
  }

  const station = await addMetroTime(req.params.id, time);

  if (!station) {
    return next(new AppError('Station not found.', 404));
  }

  const io = req.app.get('io');
  if (io) io.emit('stationsChanged', { type: 'timeAdded', station });

  res.json({ message: 'Time added successfully.', station });
});