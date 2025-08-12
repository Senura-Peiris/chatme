const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { cloudinary, storage } = require('../config/cloudinary'); // cloudinary config + multer storage

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecurechatappkey123!';

// Create multer parser middleware using the imported storage
const parser = multer({ storage });

// Helper to get profile image URL (Cloudinary URL stored directly)
const getImageUrl = (user) => {
  return user.profileImageUrl || null;
};

// Registration route with profile image upload support
router.post('/register', parser.single('profileImage'), async (req, res) => {
  try {
    const { email, username, password } = req.body;
    // Cloudinary multer puts uploaded file info in req.file.path
    const profileImageUrl = req.file ? req.file.path : null;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profileImageUrl from Cloudinary upload
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      profileImageUrl,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send response with user info & token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profileImageUrl: getImageUrl(newUser),
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration', details: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImageUrl: getImageUrl(user),
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login', details: err.message });
  }
});

// JWT middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        ...user.toObject(),
        profileImageUrl: getImageUrl(user),
      }
    });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ error: "Failed to fetch user", details: err.message });
  }
});

module.exports = router;
