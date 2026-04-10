const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS: allow only your Vercel frontend in production
const allowedOrigins = [
  "https://resume-forge-ai-nine.vercel.app",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "5mb" }));

const uploadRoute = require("./upload");
app.use("/api", uploadRoute);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "ResumeForge AI API running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
