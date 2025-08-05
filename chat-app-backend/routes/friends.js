// routes/friends.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Friend = require('../models/Friend');
const Invite = require('../models/Invite');

// Setup nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Middleware to authenticate JWT token
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

// Send invite via email with accept/decline links
router.post('/invite-email', authenticateToken, async (req, res) => {
  const { toEmail, senderName, senderEmail } = req.body;

  if (!toEmail || !senderName || !senderEmail) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const token = uuidv4();

    await Invite.create({
      senderId: req.user.userId,  // Use userId from JWT payload
      recipientEmail: toEmail,
      token,
    });

    const acceptUrl = `http://localhost:5001/api/friends/respond/${token}/accept`;
    const declineUrl = `http://localhost:5001/api/friends/respond/${token}/decline`;

    const mailOptions = {
      from: `"Chatme" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `${senderName} invited you to Chatme!`,
      html: `
        <p>${senderName} (${senderEmail}) invited you to join <strong>Chatme</strong>!</p>
        <p>Click below to respond to the Invitation:</p>
        <p>
          <a href="${acceptUrl}">✅ Accept</a> &nbsp;&nbsp;
          <a href="${declineUrl}">❌ Decline</a>
        </p>
        <br />
        <p>See you on <a href="https://chatme-project.netlify.app/">Chatme</a> 💬</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Invitation email sent successfully' });
  } catch (error) {
    console.error('Error sending invite email:', error);
    res.status(500).json({ message: 'Failed to send invitation email' });
  }
});

// Handle accept/decline invite link click (email)
router.get('/respond/:token/:action', async (req, res) => {
  const { token, action } = req.params;

  try {
    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(404).send('Invalid or expired invitation.');

    if (invite.status !== 'pending') {
      return res.send(`This invitation has already been ${invite.status}.`);
    }

    const recipient = await User.findOne({ email: invite.recipientEmail });
    if (!recipient) {
      return res.send("⚠️ You're not registered. Please sign up to accept the invite.");
    }

    if (action === 'accept') {
      invite.status = 'accepted';
      await invite.save();

      const alreadyFriends = await Friend.findOne({
        $or: [
          { user1: invite.senderId, user2: recipient._id },
          { user1: recipient._id, user2: invite.senderId },
        ],
      });

      if (!alreadyFriends) {
        const newFriend = new Friend({ user1: invite.senderId, user2: recipient._id });
        await newFriend.save();
      }

      return res.send("✅ Invitation accepted! You're now friends on Chatme.");
    }

    if (action === 'decline') {
      invite.status = 'declined';
      await invite.save();
      return res.send("❌ Invitation declined.");
    }

    return res.status(400).send("Invalid action.");
  } catch (err) {
    console.error("Respond error:", err);
    res.status(500).send("Server error.");
  }
});

// Invite registered user via app (real-time socket)
router.post('/invite', authenticateToken, async (req, res) => {
  const { email } = req.body;  // invitee email
  const senderId = req.user.userId;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findOne({ email });

    if (!recipient) return res.status(404).json({ message: "User not found" });

    // Emit socket invite event if io available (make sure io is set on app)
    const io = req.app.get('io');
    if (io) {
      io.to(recipient._id.toString()).emit("receive_invite", {
        from: { id: sender._id, username: sender.username },
      });
    }

    return res.json({ message: "Invite sent via app" });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ message: "Invite failed", error: err.message });
  }
});

// Accept friend invite API endpoint
router.put('/accept', authenticateToken, async (req, res) => {
  const { fromUserId } = req.body;
  const toUserId = req.user.userId;

  try {
    const alreadyFriends = await Friend.findOne({
      $or: [
        { user1: fromUserId, user2: toUserId },
        { user1: toUserId, user2: fromUserId },
      ],
    });

    if (alreadyFriends) {
      return res.status(400).json({ message: 'Already friends' });
    }

    const newFriend = new Friend({ user1: fromUserId, user2: toUserId });
    await newFriend.save();

    res.json({ message: 'Friend added' });
  } catch (err) {
    console.error('Accept invite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friends list for a user
router.get('/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  try {
    const friendships = await Friend.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate(['user1', 'user2']);

    const friends = friendships.map((f) =>
      f.user1._id.toString() === userId ? f.user2 : f.user1
    );

    res.json({ friends });
  } catch (err) {
    console.error('Fetch friends error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
