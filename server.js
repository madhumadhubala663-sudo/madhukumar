// EduGenie: Google Gemini Powered Learning Assistant (Node.js Server)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const PORT = process.env.PORT || 5000;
const GEMINI_URL = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model || MODEL}:generateContent`;

const app = express();
app.use(cors());
app.use(express.json({ limit: "500kb" }));
app.use(express.static(__dirname));

// Health / status endpoint
app.get("/api/status", (req, res) => {
    const hasKey = Boolean(API_KEY && API_KEY.trim());
    const maskedKey = hasKey && API_KEY.length > 10 ? `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}` : "Configured";
    res.json({
        status: "online",
        service: "EduGenie Backend (Node.js Express)",
        model: MODEL,
        hasKey,
        maskedKey,
        port: PORT
    });
});

// Generate Content endpoint
app.post("/api/generate", async (req, res) => {
    const key = (req.headers["x-goog-api-key"] || req.body.apiKey || API_KEY || "").trim();
    if (!key) {
        return res.status(400).json({ error: "No Gemini API key configured. Add it in Settings (⚙️) or .env." });
    }
    if (key.startsWith("AQ.") || !key.startsWith("AIzaSy")) {
        return res.status(400).json({ error: "Invalid API key format. Google Gemini API keys start with 'AIzaSy...'. Get a free key at https://aistudio.google.com/app/apikey" });
    }

    const model = req.body.model || MODEL;
    const prompt = req.body.prompt || "";
    const systemInstruction = req.body.systemInstruction || "You are EduGenie, an expert, encouraging learning assistant.";
    const temperature = req.body.temperature !== undefined ? Number(req.body.temperature) : 0.7;
    const responseMimeType = req.body.responseMimeType;

    const payload = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature,
            ...(responseMimeType ? { responseMimeType } : {})
        }
    };

    try {
        const response = await fetch(`${GEMINI_URL(model)}?key=${key}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": key
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error?.message || `Gemini request failed (${response.status})`,
                details: data
            });
        }

        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        return res.json({ text, raw: data, model });
    } catch (err) {
        return res.status(500).json({ error: `Server error: ${err.message}` });
    }
});

// Chat endpoint with multi-turn conversation
app.post("/api/chat", async (req, res) => {
    const key = req.headers["x-goog-api-key"] || req.body.apiKey || API_KEY;
    if (!key) {
        return res.status(400).json({ error: "No Gemini API key provided." });
    }

    const model = req.body.model || MODEL;
    const contents = req.body.contents || [];
    const systemInstruction = req.body.systemInstruction || "You are EduGenie, a Socratic learning tutor.";
    const temperature = req.body.temperature !== undefined ? Number(req.body.temperature) : 0.7;

    const payload = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature }
    };

    try {
        const response = await fetch(`${GEMINI_URL(model)}?key=${key}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": key
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error?.message || `Gemini request failed (${response.status})`,
                details: data
            });
        }

        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        return res.json({ text, raw: data, model });
    } catch (err) {
        return res.status(500).json({ error: `Server error: ${err.message}` });
    }
});

app.listen(PORT, () => {
    console.log("=================================================");
    console.log(` ✨ EduGenie Node.js Server listening on http://localhost:${PORT}`);
    console.log(` 🤖 Model: ${MODEL}`);
    console.log(` 🔑 API Key: ${API_KEY ? "Loaded" : "Missing"}`);
    console.log("=================================================");
});
