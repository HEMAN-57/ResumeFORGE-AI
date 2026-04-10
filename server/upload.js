const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const analyzeResume = require("./analyse");

// Store files in /uploads, max 5MB, PDF only
const upload = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

router.post("/upload", upload.single("resume"), async (req, res) => {
  const filePath = req.file ? req.file.path : null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }

    const jd = (req.body.jd || "").trim() || "Software Engineering Internship role";

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      return res.status(400).json({
        error: "Could not extract text from PDF. Make sure it is a text-based PDF, not a scanned image.",
      });
    }

    console.log(`PDF parsed: ${pdfData.text.length} chars`);

    const analysis = await analyzeResume(pdfData.text, jd);
    return res.json(analysis);

  } catch (err) {
    console.error("Upload route error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to process resume." });
  } finally {
    // Always clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

module.exports = router;
