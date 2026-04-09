const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const analyzeResume = require("./analyse");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jd =
      req.body.jd?.trim() ||
      "Software Engineering Intern role";

    // Read PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    // AI Analysis
    const analysis = await analyzeResume(pdfData.text, jd);

    // Cleanup
    fs.unlinkSync(req.file.path);

    return res.json(analysis);
  } catch (error) {
    console.error("🔥 UPLOAD ERROR:", error);

    return res.status(500).json({
      error: "Processing failed",
    });
  }
});

module.exports = router;
