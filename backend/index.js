const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/query", async (req, res) => {
    const { query } = req.body;

    if (!query) return res.status(400).json({ answer: "Empty query!" });

    try {
        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                query
            )}`
        );
        const summary = response.data.extract;
        res.json({ answer: summary });
    } catch (err) {
        res.json({ answer: "Sorry, I couldn’t find anything on that topic." });
    }
});
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        const imagePath = path.join(__dirname, req.file.path);
        const result = await Tesseract.recognize(imagePath, "eng");
        fs.unlinkSync(imagePath);

        let text = result.data.text.trim();

        if (!text) {
            return res.json({
                detectedText: "",
                answer: "No readable text found.",
            });
        }

        // Normalize and extract first line or few keywords
        const cleanedText = text
            .replace(/\n/g, " ")
            .replace(/[^\w\s]/gi, "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 6)
            .join(" ");

        if (!cleanedText) {
            return res.json({
                detectedText: "",
                answer: "No clean text found for search.",
            });
        }

        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                cleanedText
            )}`
        );

        res.json({
            detectedText: cleanedText,
            answer: response.data.extract,
        });
    } catch (err) {
        console.error("Image OCR Error:", err);
        res.json({
            detectedText: "",
            answer: "Could not process image or find relevant data.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
