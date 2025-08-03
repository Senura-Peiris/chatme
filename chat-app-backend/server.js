const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Routes
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const notificationRoutes = require('./routes/notifications');

// Models
const Notification = require('./models/Notification');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route to confirm server is working
app.get('/', (req, res) => {
  console.log('👀 GET / received');
  res.send('🚀 Chatme backend is deployed and running on Railway!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// In-memory map of connected users (userId -> socketId)
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Register user by ID
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ Registered user: ${userId} with socket: ${socket.id}`);
  });

  // Handle chat invite
  socket.on('send_invite', async ({ from, to }) => {
    const toSocketId = connectedUsers.get(to.id);

    try {
      await Notification.create({
        userId: to.id,
        senderId: from.id,
        type: 'invite',
        message: `${from.username} invited you to chat.`,
      });

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

  // Handle invite acceptance
  socket.on('accept_invite', ({ from, to }) => {
    const fromSocketId = connectedUsers.get(from);
    if (fromSocketId) {
      io.to(fromSocketId).emit('invite_accepted', { by: to });
      console.log(`✅ ${to.username} accepted invite from ${from}`);
    }
  });

  // Handle private message
  socket.on('send-private-message', ({ to, message }) => {
    const toSocketId = connectedUsers.get(to);
    if (toSocketId) {
      io.to(toSocketId).emit('receive-private-message', message);
      console.log(`📬 Message from ${message.senderId} to ${to}`);
    } else {
      console.log(`⚠️ Private message failed – user ${to} not connected`);
    }
  });

  // Handle disconnect
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
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:');
    collections.forEach(col => console.log(` - ${col.name}`));

    const admin = db.admin();
    const result = await admin.listDatabases();
    console.log('🗃️ Databases:');
    result.databases.forEach(db => console.log(` - ${db.name}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
