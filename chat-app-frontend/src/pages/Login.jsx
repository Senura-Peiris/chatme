import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginImg from '../images/login.webp';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">

        {/* Chatme text logo */}
        <h1
          className="text-5xl font-extrabold mb-8 cursor-default select-none"
          style={{
            animation: "glow 2.5s ease-in-out infinite",
            textShadow:
              "0 0 10px #3b82f6, 0 0 25px #3b82f6, 0 0 40px #60a5fa",
          }}
        >
          Chatme
        </h1>

        {/* Login illustration */}
        <img
          src={LoginImg}
          alt="Chatme Illustration"
          className="w-full h-auto rounded mb-4"
          style={{ animation: 'fadeInUp 1s ease forwards', animationDelay: '0.2s' }}
        />

        <h2
          className="text-2xl font-bold mb-4 text-blue-700"
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.4s' }}
        >
          Login
        </h2>

        {error && (
          <div
            className="mb-4 text-red-600 font-semibold"
            style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.6s' }}
          >
            {error}
          </div>
        )}

        <input
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="username"
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.8s' }}
        />
        <input
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1s' }}
        />

        <button
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition duration-200`}
          onClick={handleLogin}
          disabled={loading}
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1.2s' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p
          className="mt-4 text-sm text-gray-700"
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1.4s' }}
        >
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
