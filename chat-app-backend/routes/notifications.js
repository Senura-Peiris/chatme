const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/authenticateToken'); // see step 4

// Get all notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).populate('senderId', 'username');
    res.json({ notifications });
  } catch (err) {
    console.error('Notification fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
