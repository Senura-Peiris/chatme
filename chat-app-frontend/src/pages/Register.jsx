import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RegisterImg from '../images/register.webp';

const API_URL = "https://chatme-production-6ae4.up.railway.app/api";

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const res = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/chat');
    } catch (err) {
      console.error('Registration error:', err.response || err);
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1
          className="text-5xl font-extrabold mb-8 cursor-default select-none"
          style={{
            animation: 'glow 2.5s ease-in-out infinite',
            textShadow:
              '0 0 10px #a855f7, 0 0 25px #d946ef, 0 0 40px #ec4899',
          }}
        >
          Chatme
        </h1>

        <img
          src={RegisterImg}
          alt="Register Illustration"
          className="w-full h-auto rounded mb-4"
        />

        <h2 className="text-2xl font-bold mb-4 text-pink-700">Register</h2>

        {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

        <input
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files[0])}
          className="w-full mb-6 cursor-pointer"
        />

        <button
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-pink-600 hover:bg-pink-700'
          } transition duration-200`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="mt-4 text-sm text-gray-700">
          Already have an account?{' '}
          <a href="/login" className="text-pink-600 hover:underline">
            Login
          </a>
        </p>
      </div>

      <style>{`
        @keyframes glow {
          0% { text-shadow: 0 0 5px #a855f7; }
          50% { text-shadow: 0 0 20px #d946ef, 0 0 30px #ec4899; }
          100% { text-shadow: 0 0 5px #a855f7; }
        }
      `}</style>
    </div>
  );
}

export default Register;
