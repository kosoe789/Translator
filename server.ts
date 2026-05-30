import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Lazy-initialized fallback Gemini client
let fallbackGenAI: GoogleGenAI | null = null;

function getGenAIClient(customApiKey?: string): GoogleGenAI {
  if (customApiKey && customApiKey.trim()) {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  if (!fallbackGenAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set on the server, and no custom API Key is provided in settings.");
    }
    fallbackGenAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return fallbackGenAI;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json({ limit: "50mb" }));

  // API Route: Translate text and extract words
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, image, mimeType, customApiKey, passcode } = req.body;
      if ((!text || !text.trim()) && !image) {
        res.status(400).json({ error: "အင်္ဂလိပ် စာသား သို့မဟုတ် ပုံတစ်ပုံ တင်ပေးရန် လိုအပ်ပါသည်။ (Text or Image is required.)" });
        return;
      }

      // If no custom API key is provided, restrict the default server API key to the owner (with valid passcode)
      const isCustomKeyProvided = !!(customApiKey && customApiKey.trim());
      if (!isCustomKeyProvided) {
        const adminPasscode = process.env.ADMIN_UPLOAD_PASSCODE || "admin123";
        if (!passcode || passcode.trim() !== adminPasscode) {
          res.status(403).json({ 
            error: "ဆာဗာရှိ ပင်မ API Key ကို အသုံးပြုခွင့် ကန့်သတ်ထားပါသည်။ ဆက်လက်အသုံးပြုရန် 'ဆက်တင် (Settings)' တက်ဘ်တွင် သင်၏ကိုယ်ပိုင် Gemini API Key ကို ထည့်သွင်းပေးပါ။ အကယ်၍ သင်သည် ပိုင်ရှင်ဖြစ်ပါက 'Dictionary' တက်ဘ်တွင် လျှို့ဝှက်နံပါတ် (Passcode) ကို အရင်ဆုံး ဖြည့်စွက် အတည်ပြုပေးပါ။" 
          });
          return;
        }
      }

      const ai = getGenAIClient(customApiKey);
      let contents: any;

      if (image) {
        console.log(`Analyzing image with mime: ${mimeType || "image/png"}...`);
        const imagePart = {
          inlineData: {
            mimeType: mimeType || "image/png",
            data: image, // base64 representation without data: prefix
          },
        };
        const textPart = {
          text: `You are an expert bilingual English to Myanmar translator and lexicographer.
Read and analyze the English text present in this image. 
If an English text context is provided below, use it to aid extraction:
Text prompt: "${text || ""}"

1. Extract/transcribe ALL of the visible English text from the image accurately as "extractedText".
2. Translate the identified English text into clear, natural, and contextually precise Myanmar (Burmese) language as "translation".
3. Extract ALL meaningful content/vocabulary words from the transcribed English text (e.g., nouns, verbs, adjectives, adverbs).
   CRITICAL: Do NOT skip or omit any vocabulary noun, verb, adjective, or adverb. Even if a word is very common, simple, or short, it MUST be extracted! For example:
   - Extract words like 'round', 'first', 'place', 'third', 'most', 'study', 'time', 'day', 'show', 'vote', 'ballot', 'finished', etc.
   - Do NOT be selective. Be EXHAUSTIVE and list every single content word in chronological order as they appear in the text.
   EXCLUDE ONLY purely grammatical function words:
   - Articles (a, an, the)
   - Pronouns (I, me, my, we, us, you, he, she, they, this, that, etc.)
   - Prepositions (of, to, in, for, on, with, at, by, from, of, etc.)
   - Conjunctions (and, but, or, nor, yet, so, because, if, etc.)
   - Basic auxiliary/be verbs (is, am, are, was, were, be, been, do, does, did) unless they carry a unique lexical meaning.

For each extracted word:
- Provide its base/dictionary form in lowercase (e.g., 'went' -> 'go', 'studies' -> 'study', 'hopes' -> 'hope', 'finished' -> 'finish').
- Provide its lexical part of speech (pos) (e.g., noun, verb, adjective, adverb).
- Provide a brief, simple fallback Myanmar definition ('fallback_my') specifically tailored to how the word is used in this sentence context.

Return the result strictly conforming to the requested JSON schema.`,
        };
        contents = { parts: [imagePart, textPart] };
      } else {
        console.log(`Translating and analyzing text: ${text.slice(0, 50)}...`);
        contents = `You are an expert bilingual English to Myanmar translator and lexicographer.
Translate the following English text to clear, natural Myanmar (Burmese) language.
Also, analyze and extract ALL meaningful words/vocabulary items from this text.
CRITICAL: Do NOT skip or omit any vocabulary noun, verb, adjective, or adverb. Even if a word is very common, simple, or short, it MUST be extracted! For example:
- Extract words like 'round', 'first', 'place', 'third', 'most', 'study', 'time', 'day', 'show', 'vote', 'ballot', 'finished', etc.
- Do NOT be selective. Be EXHAUSTIVE and list every single content word in chronological order as they appear in the text.
EXCLUDE ONLY purely grammatical function words:
- Articles (a, an, the)
- Pronouns (I, me, My, we, us, you, he, she, they, this, that, etc.)
- Prepositions (of, to, in, for, on, with, at, by, from, of, etc.)
- Conjunctions (and, but, or, nor, yet, so, because, if, etc.)
- Basic auxiliary/be verbs (is, am, are, was, were, be, been, do, does, did) unless they carry a unique lexical meaning.

For each extracted word:
- Extract its base/dictionary form in lowercase (e.g., 'went' -> 'go', 'studies' -> 'study', 'hopes' -> 'hope', 'finished' -> 'finish').
- Provide its lexical part of speech (pos) (e.g., noun, verb, adjective, adverb).
- Provide a brief, simple fallback Myanmar definition ('fallback_my') specifically suited to how the word is used in this sentence context.

Input text:
"""
${text}
"""

Return the output containing:
"extractedText": output the exact input text string.
"translation": Myanmar translation.
"words": array of extracted words.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedText: {
                type: Type.STRING,
                description: "The transcribed/extracted English text from the image, or the original unchanged input text if no image is used.",
              },
              translation: {
                type: Type.STRING,
                description: "The complete natural translation of the English text into Myanmar.",
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
            required: ["extractedText", "translation", "words"],
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

  // API Route: Securely upload a .txt dictionary file to the workspace
  app.post("/api/upload-dictionary", (req, res) => {
    try {
      const { filename, content, passcode } = req.body;
      
      // Determine secret passcode, defaulting to "admin123" if not defined in env
      const adminPasscode = process.env.ADMIN_UPLOAD_PASSCODE || "admin123";
      if (!passcode || passcode !== adminPasscode) {
        res.status(401).json({ error: "လျှို့ဝှက်နံပါတ် (Passcode) မှားယွင်းနေပါသည်။" });
        return;
      }

      if (!filename || typeof filename !== "string" || !content || typeof content !== "string") {
        res.status(400).json({ error: "Filename and content are required." });
        return;
      }

      const safeFilename = path.basename(filename);
      if (!safeFilename.endsWith(".txt") || safeFilename === ".env.example" || safeFilename === "requirements.txt") {
        res.status(400).json({ error: "Invalid file type. Only .txt files can be uploaded to the server." });
        return;
      }

      const filePath = path.join(process.cwd(), safeFilename);
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Secured upload: ${safeFilename} saved successfully.`);
      res.json({ success: true, message: "ဖိုင်ကို ဆာဗာသို့ အောင်မြင်စွာ တင်ပြီးပါပြီ။" });
    } catch (err: any) {
      console.error("Error securing dictionary upload:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Securely delete a .txt dictionary file from the server workspace
  app.post("/api/delete-dictionary", (req, res) => {
    try {
      const { filename, passcode } = req.body;
      
      const adminPasscode = process.env.ADMIN_UPLOAD_PASSCODE || "admin123";
      if (!passcode || passcode !== adminPasscode) {
        res.status(401).json({ error: "လျှို့ဝှက်နံပါတ် (Passcode) မှားယွင်းနေပါသည်။" });
        return;
      }

      if (!filename || typeof filename !== "string") {
        res.status(400).json({ error: "Filename is required" });
        return;
      }

      const safeFilename = path.basename(filename);
      if (!safeFilename.endsWith(".txt") || safeFilename === ".env.example" || safeFilename === "requirements.txt") {
        res.status(400).json({ error: "Invalid file type." });
        return;
      }

      const filePath = path.join(process.cwd(), safeFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Secured delete: ${safeFilename} deleted successfully.`);
        res.json({ success: true, message: "ဖိုင်ကို ဆာဗာမှ ပယ်ဖျက်လိုက်ပါပြီ။" });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (err: any) {
      console.error("Error securing dictionary deletion:", err);
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
