const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// ✅ Frontend Build Path
// ---------------------------
const frontendBuildPath = path.join(__dirname, "..", "Frontend","build");

// ---------------------------
// ✅ CORS Setup
// ---------------------------
// const allowedOrigins = [
//   "http://localhost:3000",
//    "https://dhll-1.onrender.com",//frontend
//   "https://dhll-xnuy.onrender.com",    // backend URL

// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log("Blocked by CORS:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// };
const allowedOrigins = [
  "http://localhost:3000",
  /^https:\/\/[\w-]+\.onrender\.com$/,  // ✅ Fixed regex
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
   credentials: true
}
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---------------------------
// ✅ Body Parser
// ---------------------------
app.use(express.json());


// ---------------------------
// ✅ MongoDB Connection
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// ---------------------------
// ✅ User Model
// ---------------------------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ---------------------------
// ✅ API Routes
// ---------------------------

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, password });
      console.log("🆕 New user created:", email);
    } else if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true, message: "Login successful", user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ---------------------------
// ✅ Serve React Frontend
// ---------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });

  console.log("✅ Serving frontend build...");
}

// ---------------------------
// ✅ Start Server
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Allowed Origins:", allowedOrigins);
});
