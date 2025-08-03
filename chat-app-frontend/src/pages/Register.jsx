import React, { useState } from 'react';
import axios from 'axios';
import RegisterImg from '../images/Register.webp';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      await axios.post(
        "https://chatme-application.up.railway.app/api/auth/register",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setSuccessMessage("✅ Registration successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      alert("Registration failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">

        {/* Chatme logo with glow animation */}
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

        <img
          src={RegisterImg}
          alt="Register"
          className="w-full h-auto rounded mb-6 shadow-md"
          style={{ animation: 'fadeInUp 1s ease forwards' }}
        />

        <h2
          className="text-2xl font-bold mb-5 text-blue-700"
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.2s' }}
        >
          Register
        </h2>

        {successMessage && (
          <p
            className="mb-4 text-green-600 font-medium"
            style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.4s' }}
          >
            {successMessage}
          </p>
        )}

        <input
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Email"
          type="email"
          onChange={e => setEmail(e.target.value)}
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.6s' }}
        />
        <input
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '0.8s' }}
        />
        <input
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Password"
          type="password"
          onChange={e => setPassword(e.target.value)}
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1s' }}
        />
        <input
          className="w-full px-4 py-2 mb-6 border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          type="file"
          accept="image/*"
          onChange={e => setProfileImage(e.target.files[0])}
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1.2s' }}
        />

        <button
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition text-lg font-semibold"
          onClick={handleRegister}
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1.4s' }}
        >
          Register
        </button>

        <p
          className="mt-5 text-sm text-gray-700"
          style={{ animation: 'fadeInRight 0.8s ease forwards', animationDelay: '1.6s' }}
        >
          Have an account?{' '}
          <a href="/" className="text-blue-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>

      {/* Glow and fade animations */}
      <style>{`
        @keyframes glow {
          0% { text-shadow: 0 0 5px #3b82f6; }
          50% { text-shadow: 0 0 20px #3b82f6, 0 0 30px #60a5fa; }
          100% { text-shadow: 0 0 5px #3b82f6; }
        }
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

export default Register;
