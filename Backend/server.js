require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;
const frontendBuildPath = path.join(__dirname, "../Frontend/build");

// --- Middleware ---
app.use(cors());
app.use(express.json());

console.log("Mongo URI:", process.env.MONGO_URI);

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// --- User Model ---
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Consider hashing passwords
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// --- API Routes ---
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, password }); // Consider hashing password
      console.log("🆕 New user created:", email);
    } else {
      if (password !== user.password) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }
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

// --- Serve React Frontend (Production) ---
if (process.env.NODE_ENV === "production") {
  console.log("✅ Frontend static serving enabled");
  // Serve static files from the build directory
  app.use(express.static(frontendBuildPath));
  // For handling client-side routing, serve the index.html file
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, "index.html"));
  });
}

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${API_BASE_URL}`);
});
