import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json({ limit: "50mb" }));

  // API Route: Translate text and extract words
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Text is required and must be a valid non-empty string." });
        return;
      }

      console.log(`Translating and analyzing text: ${text.slice(0, 50)}...`);

      const ai = getGenAI();
      const prompt = `Translate the following English text to clear, natural Myanmar (Burmese) language.
Also, analyze and extract all meaningful words/vocabulary items from this text.
EXCLUDE grammatical function words:
- Articles (a, an, the)
- Pronouns (I, me, my, we, us, you, he, she, they, this, that, etc.)
- Prepositions (of, to, in, for, on, with, at, by, from, of, etc.)
- Conjunctions (and, but, or, nor, yet, so, because, if, etc.)
- Basic auxiliary/be verbs (is, am, are, was, were, be, been, do, does, did) unless they carry a unique lexical meaning.

For each extracted word:
- Extract its base/dictionary form (e.g. 'studies' -> 'study', 'went' -> 'go', 'running' -> 'run', 'apples' -> 'apple').
- Provide its lexical part of speech (pos) (e.g., noun, verb, adjective, adverb).
- Provide a brief, simple fallback Myanmar definition ('fallback_my') specifically suited to how the word is used in this sentence context.

Input text:
"""
${text}
"""

Return the output as a strict JSON object with this exact shape:
{
  "translation": "Full Myanmar translation here",
  "words": [
    {
      "original": "original word from the text",
      "base": "its base/infinitve/dictionary form in lowercase",
      "pos": "noun/verb/adjective/adverb etc. in lowercase",
      "fallback_my": "simple backup translation in Myanmar"
    }
  ]
}

Ensure the response contains absolutely nothing except the direct JSON object.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: {
                type: Type.STRING,
                description: "The complete translation of the English text into Myanmar.",
              },
              words: {
                type: Type.ARRAY,
                description: "List of interesting/meaningful vocabulary words containing actual semantic content.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    base: { type: Type.STRING },
                    pos: { type: Type.STRING },
                    fallback_my: { type: Type.STRING },
                  },
                  required: ["original", "base", "pos", "fallback_my"],
                },
              },
            },
            required: ["translation", "words"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini.");
      }

      const parsedJSON = JSON.parse(responseText.trim());
      res.json(parsedJSON);
    } catch (err: any) {
      console.error("Translation API error:", err);
      res.status(500).json({ error: err.message || "An error occurred during translation." });
    }
  });

  // API Route: List uploaded .txt dictionary files in the workspace directory
  app.get("/api/dictionary-files", (req, res) => {
    try {
      const workspaceDir = process.cwd();
      const files = fs.readdirSync(workspaceDir);
      
      const txtFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === ".txt" && file !== ".env.example" && file !== "requirements.txt";
      }).map(file => {
        const stats = fs.statSync(path.join(workspaceDir, file));
        return {
          filename: file,
          size: stats.size,
          mtime: stats.mtime,
        };
      });

      res.json({ files: txtFiles });
    } catch (err: any) {
      console.error("Error listing dictionary files:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Read the content of a dictionary .txt file from the workspace
  app.get("/api/dictionary-file", (req, res) => {
    try {
      const { filename } = req.query;
      if (!filename || typeof filename !== "string") {
        res.status(400).json({ error: "Filename is required" });
        return;
      }

      // Safeguard against path traversal
      const safeFilename = path.basename(filename);
      if (!safeFilename.endsWith(".txt") || safeFilename === ".env.example") {
        res.status(400).json({ error: "Invalid file type. Only .txt files are allowed." });
        return;
      }

      const filePath = path.join(process.cwd(), safeFilename);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      // Check size limit (e.g. 15MB)
      const stats = fs.statSync(filePath);
      if (stats.size > 15 * 1024 * 1024) {
        res.status(400).json({ error: "File size is too large to load in memory (Max 15MB)." });
        return;
      }

      const content = fs.readFileSync(filePath, "utf-8");
      res.json({ filename: safeFilename, content });
    } catch (err: any) {
      console.error("Error reading dictionary file:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the Express server:", error);
});
