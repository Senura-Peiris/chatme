const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create notification
router.post('/', authenticateToken, async (req, res) => {
  const { recipientId, senderId, message, type } = req.body;
  try {
    const notification = await Notification.create({ recipientId, senderId, message, type });
    res.status(201).json(notification);
  } catch (err) {
    console.error("Notification creation error:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

// Get notifications for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.userId })
      .populate('senderId', 'username profileImage')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

module.exports = router;
