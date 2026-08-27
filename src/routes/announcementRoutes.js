const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public route to view announcements
router.get('/', announcementController.getAllAnnouncements);

// Protected route: Only admins can create announcements
router.post('/', verifyToken, requireAdmin, announcementController.createAnnouncement);

module.exports = router;