const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const uploadRoute = require("./upload");
app.use("/api", uploadRoute);

// Test route
app.get("/", (req, res) => {
  res.send("ResumeForge API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});