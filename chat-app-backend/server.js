const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load env variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const server = http.createServer(app);

// Allow frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://chatmeapplication.netlify.app',
  'https://chatme-production-6ae4.up.railway.app',
];

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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Chatme backend is running!');
});

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const friendsRoutes = require('./routes/friends');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO
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
  console.log('🔌 Client connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ Registered: ${userId} - ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ Disconnected: ${userId}`);
        break;
      }
    }
  });
});

// MongoDB connection
mongoose
  .connect(process.env.ATLAS_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    const db = mongoose.connection.db;
    console.log('📂 DB:', db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections:', collections.map((c) => c.name));
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
  });

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
