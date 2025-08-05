const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const router = express.Router();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'supersecurechatappkey123!';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage and filter config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profileImage-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
    }
  }
});

// Route: POST /api/auth/register
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      profileImage
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profileImage: newUser.profileImage
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration', details: err.message });
  }
});

// Route: POST /api/auth/login
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
        profileImage: user.profileImage
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login', details: err.message });
  }
});

// JWT Auth Middleware
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

// Route: GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ error: "Failed to fetch user", details: err.message });
  }
});

module.exports = router;
