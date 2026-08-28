const express = require('express');
const router = express.Router();
const {
  getStations,
  postStation,
  removeStation,
  addTime
} = require('../controllers/stationController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const activeViewers = {};

router.get('/', getStations);

router.post('/', verifyToken, requireAdmin, postStation);
router.delete('/:id', verifyToken, requireAdmin, removeStation);
router.post('/:id/times', verifyToken, requireAdmin, addTime);

router.post('/:id/join', (req, res) => {
  const stationId = req.params.id;
  activeViewers[stationId] = (activeViewers[stationId] || 0) + 1;
  res.json({ count: activeViewers[stationId] });
});

router.post('/:id/leave', (req, res) => {
  const stationId = req.params.id;
  if (activeViewers[stationId] && activeViewers[stationId] > 0) {
    activeViewers[stationId] -= 1;
  }
  res.json({ count: activeViewers[stationId] || 0 });
});

module.exports = router;