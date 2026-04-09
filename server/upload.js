const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const analyzeResume = require("./analyze");

const router = express.Router();

// Store uploaded files
const upload = multer({
  dest: path.join(__dirname, "uploads/")
});

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("REQ FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Extract text
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    console.log("PDF parsed successfully");

    // Analyze using AI
    const analysis = await analyzeResume(pdfData.text);

    // Return clean JSON
    res.json(analysis);

    // Delete temp file
    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;