require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;



// ✅ Use CORS middleware first, before routes
const allowedOrigins = [
  "https://dhll-1.onrender.com",
  "http://localhost:3000"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// OR use cors() library directly
// app.use(cors({ origin: allowedOrigins, credentials: true }));

// --- Middleware ---
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://dhll-1.onrender.com",     // ✅ your actual frontend Render URL
      "https://dhll-frontend.onrender.com", // (optional if you had another)
      "http://localhost:3000"             // ✅ local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


console.log("Mongo URI:", process.env.MONGO_URI);

// --- Connect MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// --- Schema & Model ---
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

// --- API Routes ---
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, password });
      console.log("🆕 New user created:", email);
    } else if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// --- Serve React build ---
const frontendBuildPath = path.join(__dirname, "../Frontend/build");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(frontendBuildPath, "index.html"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${API_BASE_URL}`);
});
