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
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://chatmeapplication.netlify.app',
  'https://chatme-production-6ae4.up.railway.app',
];

// CORS options
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

// Serve uploaded files (profile images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const friendsRoutes = require('./routes/friends');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Chatme backend is running!');
});

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

  socket.on("send_invite", async ({ from, to }) => {
    try {
      // Save notification in DB
      const Notification = require("./models/Notification");
      await Notification.create({
        recipientId: to.id,
        senderId: from.id,
        message: `${from.username} invited you to chat on Chatme.`,
        type: "chat_invite",
      });
  
      // Emit to recipient
      const recipientSocketId = connectedUsers.get(to.id);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_invite", from);
      }
    } catch (err) {
      console.error("Socket invite error:", err);
    }
  });
  

  socket.on('send_invite', ({ from, to }) => {
    const recipientSocketId = connectedUsers.get(to.id);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_invite', { from });
      console.log(`📩 Invite sent from ${from.username} to ${to.username}`);
    }
  });

  socket.on('accept_invite', ({ from, to }) => {
    const senderSocketId = connectedUsers.get(from);
    if (senderSocketId) {
      io.to(senderSocketId).emit('invite_accepted', { by: to });
      console.log(`✅ Invite accepted by ${to.username} for ${from}`);
    }
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

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend allowed: ${allowedOrigins.join(', ')}`);
});
