const express = require('express');
const router = express.Router({ mergeParams: true });
const { param, body } = require('express-validator');
const { getAnnouncements, postAnnouncement } = require('../controllers/announcementController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const stationIdValidation = [
  param('stationId').isMongoId().withMessage('Invalid station id.')
];

const createValidation = [
  ...stationIdValidation,
  body('text').trim().notEmpty().withMessage('Announcement text is required.')
];

router.get('/', stationIdValidation, validate, getAnnouncements);

router.post('/', verifyToken, requireAdmin, createValidation, validate, postAnnouncement);

module.exports = router;