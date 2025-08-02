import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Landingpage from './pages/Landing';
import Chat from './pages/Chat';
import Register from './pages/Register';
import './App.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Backend server

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Register user with socket
  useEffect(() => {
    if (user && socket) {
      socket.emit("register", user._id); // ✅ Register socket on backend
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} /> {/* 👈 Changed from Login to Landingpage */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat socket={socket} user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
