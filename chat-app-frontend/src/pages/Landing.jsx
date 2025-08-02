import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../images/landing hero image.png";
import featureImg from "../images/landing feature search image.png";

const LandingPage = () => {
  const texts = ["Welcome To Chatme", "Chat with your friends now"];
  const typingSpeed = 100; // ms per letter
  const deletingSpeed = 50;
  const pauseTime = 1500; // pause before deleting or typing next

  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;

    if (!isDeleting && displayedText.length < texts[textIndex].length) {
      // Typing
      timer = setTimeout(() => {
        setDisplayedText(texts[textIndex].substring(0, displayedText.length + 1));
      }, typingSpeed);
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      timer = setTimeout(() => {
        setDisplayedText(texts[textIndex].substring(0, displayedText.length - 1));
      }, deletingSpeed);
    } else if (!isDeleting && displayedText.length === texts[textIndex].length) {
      // Pause then start deleting
      timer = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayedText.length === 0) {
      // Move to next text and start typing
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, textIndex, texts]);

  // Animations triggers for paragraph and buttons
  const [showParagraph, setShowParagraph] = React.useState(false);
  const [showFirstButton, setShowFirstButton] = React.useState(false);
  const [showSecondButton, setShowSecondButton] = React.useState(false);

  React.useEffect(() => {
    const paraTimeout = setTimeout(() => setShowParagraph(true), 100);
    const btn1Timeout = setTimeout(() => setShowFirstButton(true), 1000);
    const btn2Timeout = setTimeout(() => setShowSecondButton(true), 1600);
    return () => {
      clearTimeout(paraTimeout);
      clearTimeout(btn1Timeout);
      clearTimeout(btn2Timeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 shadow-lg">
        <h1
          className="text-5xl font-bold tracking-wide"
          style={{
            animation: "glow 2s ease-in-out infinite",
            textShadow:
              "0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6",
          }}
        >
          Chatme
        </h1>
        <div className="space-x-4">
          <Link to="/login">
            <button className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Register
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-center px-10 md:px-24 py-16 gap-10">
          <div className="md:w-1/2">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight min-w-[22ch]"
              aria-live="polite"
            >
              {displayedText.includes("Chatme") ? (
                <>
                  {displayedText.replace("Chatme", "")}
                  <span className="text-blue-400">Chatme</span>
                </>
              ) : (
                displayedText
              )}
              <span className="blinking-cursor">|</span>
            </h2>

            {showParagraph && (
              <p className="text-lg text-gray-300 mb-6 animate-slideInLeft mt-10">
                Connect instantly with friends, colleagues, and communities using
                blazing fast, secure, and intelligent messaging.
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {showFirstButton && (
                <Link to="/login">
                  <button className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition animate-slideInLeft">
                    Already have an account?
                  </button>
                </Link>
              )}
              {showSecondButton && (
                <Link to="/register">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition animate-slideInLeft">
                    Get Started
                  </button>
                </Link>
              )}
            </div>
          </div>

          <img
            src={heroImg}
            alt="Chat Illustration"
            className="md:w-1/4 w-full rounded-xl shadow-xl"
          />
        </section>

        {/* Features Section */}
        <section className="bg-[#111827] py-16 px-8 md:px-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold">Features of the Chatme</h3>
            <p className="text-gray-400 mt-4">
              Smart chat experience with real-time delivery and AI-enhanced
              suggestions.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl shadow-xl p-8 w-full md:w-4/5 lg:w-3/4 flex flex-col md:flex-row items-center gap-8">
              {/* Image Left */}
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={featureImg}
                  alt="AI Chat Features"
                  className="w-3/4 md:w-full rounded-xl shadow-xl"
                />
              </div>

              {/* List Right */}
              <div className="w-full md:w-1/2">
                <ul className="space-y-6 text-lg text-gray-300 text-left">
                  <li>✅ Real-time one-on-one & group messaging</li>
                  <li>✅ AI-powered message suggestions</li>
                  <li>✅ End-to-end encryption for privacy</li>
                  <li>✅ Typing indicators and read receipts</li>
                  <li>✅ Easy account creation and secure login</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm bg-[#0f172a] shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
        © {new Date().getFullYear()} Chatme. All rights reserved.
      </footer>

      {/* Styles */}
      <style>{`
        @keyframes glow {
          0% { text-shadow: 0 0 5px #3b82f6; }
          50% { text-shadow: 0 0 20px #3b82f6, 0 0 30px #60a5fa; }
          100% { text-shadow: 0 0 5px #3b82f6; }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-60px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .blinking-cursor {
          font-weight: 100;
          font-size: 24px;
          color: #60a5fa;
          animation: blink 1.2s infinite;
          user-select: none;
          margin-left: 2px;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
