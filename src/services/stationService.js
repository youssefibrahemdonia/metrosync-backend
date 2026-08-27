const Station = require('../models/Station');

const getAllStations = async () => {
  return await Station.find().sort({ line: 1, order: 1 });
};

module.exports = { getAllStations };