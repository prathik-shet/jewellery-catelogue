const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = [
  "https://jewellery-catelogue.onrender.com", // production frontend
  "http://localhost:3000"                     // local dev frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server, Postman, curl
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  })
);

// ===============================
// BODY PARSERS
// ===============================
// NOTE: Files are handled by Multer (not here)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===============================
// API ROUTES
// ===============================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jewellery", require("./routes/jewellery"));

// ===============================
// PRODUCTION FRONTEND SERVING
// ===============================
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "client", "build");
  app.use(express.static(clientBuildPath));

  // SPA fallback (React Router support)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ===============================
// GLOBAL ERROR HANDLER (OPTIONAL BUT PRO)
// ===============================
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ error: err.message });
});

// ===============================
// DATABASE & SERVER START
// ===============================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
