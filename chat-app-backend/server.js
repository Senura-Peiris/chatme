const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env (make sure .env is at project root or update path)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import routes
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const notificationRoutes = require('./routes/notifications');

// Import models if needed (for Socket.IO logic)
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // allow your frontend origin here
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // if you use cookies or authorization headers
};

app.use(cors(corsOptions)); // Apply CORS with options
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route for health check
app.get('/', (req, res) => {
  console.log('👀 GET / received');
  res.send('🚀 Chatme backend is deployed and running on Railway!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO setup with CORS allowing the same origin as above
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Store io instance in app for route access if needed
app.set('io', io);

// Map to keep track of connected users (userId => socket.id)
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Register socket with userId
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ Registered user: ${userId} with socket: ${socket.id}`);
  });

  // Handle sending invites
  socket.on('send_invite', async ({ from, to }) => {
    const toSocketId = connectedUsers.get(to.id);

    try {
      // Save notification to DB
      await Notification.create({
        userId: to.id,
        senderId: from.id,
        type: 'invite',
        message: `${from.username} invited you to chat.`,
      });

      // Emit invite if user online
      if (toSocketId) {
        io.to(toSocketId).emit('receive_invite', { from });
        console.log(`📨 Invite sent from ${from.username} to ${to.username}`);
      } else {
        console.log(`📥 ${to.username} not online – stored invite notification only`);
      }
    } catch (err) {
      console.error('❌ Failed to store notification:', err.message);
    }
  });

  // Handle accepting invites
  socket.on('accept_invite', ({ from, to }) => {
    const fromSocketId = connectedUsers.get(from);
    if (fromSocketId) {
      io.to(fromSocketId).emit('invite_accepted', { by: to });
      console.log(`✅ ${to.username} accepted invite from ${from}`);
    }
  });

  // Private message handling
  socket.on('send-private-message', ({ to, message }) => {
    const toSocketId = connectedUsers.get(to);
    if (toSocketId) {
      io.to(toSocketId).emit('receive-private-message', message);
      console.log(`📬 Message from ${message.senderId} to ${to}`);
    } else {
      console.log(`⚠️ Private message failed – user ${to} not connected`);
    }
  });

  // Clean up on disconnect
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

// MongoDB connection with modern options
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB Atlas');

  const db = mongoose.connection.db;

  // Log collections and databases
  const collections = await db.listCollections().toArray();
  console.log('📦 Collections:');
  collections.forEach(col => console.log(` - ${col.name}`));

  const admin = db.admin();
  const result = await admin.listDatabases();
  console.log('🗃️ Databases:');
  result.databases.forEach(db => console.log(` - ${db.name}`));
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Listen on Railway port or 5001 locally
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
