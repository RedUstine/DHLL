require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 1000;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;
const frontendBuildPath = path.join(__dirname, "..", "Frontend", "build");

// -----------------------------------------
// ✅ CORS Configuration
// -----------------------------------------

// ✅ 1. Correct CORS setup
const allowedOrigins = [
  "https://dhll-nobx.onrender.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ 2. Handle OPTIONS (preflight) explicitly
app.options("*", cors());
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log("❌ Blocked by CORS:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

// ✅ Explicitly handle preflight OPTIONS requests
app.options("*", cors());

// -----------------------------------------
// ✅ Middleware
// -----------------------------------------
app.use(express.json());

// -----------------------------------------
// ✅ MongoDB Connection
// -----------------------------------------
console.log("Mongo URI:", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// -----------------------------------------
// ✅ Mongoose User Model
// -----------------------------------------
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // NOTE: For demo only — hash in production
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

// -----------------------------------------
// ✅ API Routes
// -----------------------------------------
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
    } else if (user.password !== password) {
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

// -----------------------------------------
// ✅ Serve React Frontend (for production)
// -----------------------------------------
if (process.env.NODE_ENV === "production") {
  console.log("✅ Serving frontend build...");
  app.use(express.static(frontendBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, "index.html"));
  });
}

// -----------------------------------------
// ✅ Start Server
// -----------------------------------------
app.listen(PORT, () => {
  console.log("Allowed Origins:", allowedOrigins);
  console.log(`🚀 Server running on ${API_BASE_URL}`);
});
