import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Landingpage from './pages/Landing';
import Chat from './pages/Chat';
import Register from './pages/Register';
import './App.css';
import { io } from 'socket.io-client';

// Create socket outside component to avoid re-creating it
const socket = io('https://chatme-production-6ae4.up.railway.app');

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Register user with socket
  useEffect(() => {
    if (user && socket) {
      socket.emit('register', user._id);
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/chat" element={<Chat socket={socket} user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
