import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Landingpage from './pages/Landing';
import Chat from './pages/Chat';
import Register from './pages/Register';
import './App.css';
import { io } from 'socket.io-client';

// Use environment variable or fallback to production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://chatme-production-6ae4.up.railway.app';

// Create socket connection
const socket = io(API_URL);

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Register user once when socket & user are ready
  useEffect(() => {
    if (user?._id) {
      socket.emit('register', user._id);
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/chat" element={<Chat socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
