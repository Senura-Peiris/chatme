const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatme_profiles', // Cloudinary folder
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // optional resize
  },
});

const upload = multer({ storage });

// Register route
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? req.file.path : null; // Cloudinary URL

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profileImage,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profileImage,
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users route
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.json({ users: [] });
    }

    const regex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    })
      .select('_id username email profileImage')
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
