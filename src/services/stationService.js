const Station = require('../models/stationModel');

const getAllStations = async () => {
  return await Station.find().sort({ line: 1, order: 1 });
};

const createStation = async ({ name, line, order, metroTimes }) => {
  const existing = await Station.findOne({ name });
  if (existing) {
    return { error: 'Station already exists.' };
  }
  const station = await Station.create({ name, line, order, metroTimes: metroTimes || [] });
  return { station };
};

const deleteStation = async (id) => {
  const station = await Station.findByIdAndDelete(id);
  return station;
};

const addMetroTime = async (id, time) => {
  const station = await Station.findById(id);
  if (!station) return null;
  station.metroTimes.push(time);
  await station.save();
  return station;
};

module.exports = { getAllStations, createStation, deleteStation, addMetroTime };