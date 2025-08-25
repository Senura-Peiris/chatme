const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Create notification
router.post('/', async (req, res) => {
  try {
    const { recipientId, senderId, message, type } = req.body;

    const notification = new Notification({
      recipientId,
      senderId,
      message,
      type,
      read: false,
      createdAt: new Date(),
    });

    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error("Error saving notification:", err);
    res.status(500).json({ success: false, message: "Failed to create notification" });
  }
});

// Fetch notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

module.exports = router;
