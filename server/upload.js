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

    const jd = req.body.jd || "Software Engineering Intern role";

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const analysis = await analyzeResume(pdfData.text, jd);

    fs.unlinkSync(req.file.path);

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;
