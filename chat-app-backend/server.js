const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const server = http.createServer(app);

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://chatme-production-6ae4.up.railway.app',
  'https://chatmeapplication.netlify.app/', //Netlify Host URL
];

// CORS setup
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve profile images or any uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test base route
app.get('/', (req, res) => {
  res.send('🚀 Chatme backend is running!');
});

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const friendsRoutes = require('./routes/friends');
const notificationRoutes = require('./routes/notifications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ Registered user: ${userId} with socket: ${socket.id}`);
  });

  // Add more socket events here

  socket.on('disconnect', () => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User disconnected: ${userId}`);
        break;
      }
    }
  });
});

// MongoDB connection
console.log('Mongo URI:', process.env.ATLAS_URI);

mongoose
  .connect(process.env.ATLAS_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    console.log('🗄️ Connected database:', db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log('📚 Collections in database:');
    collections.forEach((col) => console.log(' -', col.name));

    console.log('🚆 Railway deployment connected and running!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error on Railway deployment:', err.message);
    console.error('❌ Railway deployment is NOT connected or there is a MongoDB connection issue.');
  });

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
