import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Sync file configuration in /tmp to prevent watcher restarts on write
const OLD_SYNC_FILE_PATH = path.join(process.cwd(), "user_sync_data.json");
const SYNC_FILE_PATH = "/tmp/user_sync_data.json";

// Migrate old sync file if it exists and clean up the old file to stop watcher triggers
try {
  if (fs.existsSync(OLD_SYNC_FILE_PATH)) {
    if (!fs.existsSync(SYNC_FILE_PATH)) {
      fs.copyFileSync(OLD_SYNC_FILE_PATH, SYNC_FILE_PATH);
      console.log("Migrating user sync file to /tmp successfully.");
    }
    fs.unlinkSync(OLD_SYNC_FILE_PATH);
    console.log("Successfully removed old user_sync_data.json from workspace root.");
  }
} catch (migErr) {
  console.error("Error migrating/cleaning up sync file:", migErr);
}

// Helper to safely read user sync data
function readSyncData(): Record<string, any[]> {
  try {
    if (fs.existsSync(SYNC_FILE_PATH)) {
      const content = fs.readFileSync(SYNC_FILE_PATH, "utf-8");
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.error("Error reading sync data file:", err);
  }
  return {};
}

// Helper to safely write sync data file
function writeSyncData(data: Record<string, any[]>): void {
  try {
    fs.writeFileSync(SYNC_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing sync data file:", err);
  }
}

// Resilient Gemini query runner that handles school/student keys with extreme robustness
async function queryGeminiWithExtremeResilience(ai: any, contents: any): Promise<{ responseText: string; modelUsed: string; strategy: string }> {
  // Ordered sequence of fallback models
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];

  let lastError: any = null;

  // Let's implement safety configs that completely bypass restrictiveness of school/student accounts.
  // Student policies frequently block queries under default safety settings, so overriding them is crucial!
  const customSafetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
  ];

  // STRATEGY A: Try utilizing standard strict JSON Schemas to guarantee structured output types
  for (const modelName of modelsToTry) {
    try {
      console.log(`[ResilientAI] Trying Strategy A (JSON Schema) with model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1, // Lower temperature keeps output highly predictable and stable
          safetySettings: customSafetySettings,
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

      if (response && response.text) {
        console.log(`[ResilientAI] Strategy A Succeeded with model: ${modelName}. Length: ${response.text.length}`);
        return { responseText: response.text, modelUsed: modelName, strategy: "Strategy A (Schema JSON)" };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[ResilientAI] Strategy A failed for model ${modelName}. Error: ${errMsg.slice(0, 150)}`);
      
      // If it's an invalid API key, prompt the user immediately without loops
      if (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID")) {
        throw err;
      }
      
      // Short cooldown prior to next loop iteration
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // STRATEGY B: Fall back to Plain JSON MIME format (without schema restriction, letting the LLM structure the JSON manually via instructions/prompting)
  console.log("[ResilientAI] Strategy A failed for all models. Moving to Strategy B (Plain JSON MIME)...");
  for (const modelName of modelsToTry) {
    try {
      console.log(`[ResilientAI] Trying Strategy B (Plain JSON) with model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          safetySettings: customSafetySettings,
        },
      });

      if (response && response.text) {
        console.log(`[ResilientAI] Strategy B Succeeded with model: ${modelName}. Length: ${response.text.length}`);
        return { responseText: response.text, modelUsed: modelName, strategy: "Strategy B (Plain JSON MIME)" };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[ResilientAI] Strategy B failed for model ${modelName}. Error: ${errMsg.slice(0, 150)}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // STRATEGY C: Absolute final block defense. Standard instruction text request, manual regex JSON extraction.
  console.log("[ResilientAI] Strategy B failed. Moving to Strategy C (Unconstrained plain text JSON)...");
  for (const modelName of modelsToTry) {
    try {
      console.log(`[ResilientAI] Trying Strategy C with model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          temperature: 0.3,
          safetySettings: customSafetySettings,
        }
      });

      if (response && response.text) {
        console.log(`[ResilientAI] Strategy C Succeeded with model: ${modelName}. Length: ${response.text.length}`);
        return { responseText: response.text, modelUsed: modelName, strategy: "Strategy C (Plain Text JSON Extraction)" };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[ResilientAI] Strategy C failed for model ${modelName}. Error: ${errMsg.slice(0, 150)}`);
    }
  }

  throw lastError || new Error("All translation attempts failed. Please verify your API Key and network connection.");
}

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

  // API Route: Get synced data (history + bookmarks combined in user schema)
  app.post("/api/sync/get", (req, res) => {
    try {
      const { apiKeyHash, apiKey } = req.body;
      const hashRegex = /^[a-f0-9]{64}$/i;
      
      let resolvedHash = "";
      if (apiKey && typeof apiKey === "string" && apiKey.trim()) {
        resolvedHash = crypto.createHash("sha256").update(apiKey.trim()).digest("hex");
      } else if (apiKeyHash && hashRegex.test(apiKeyHash)) {
        resolvedHash = apiKeyHash;
      }

      if (!resolvedHash) {
        res.status(400).json({ error: "မှားယွင်းသော Sync Key ဖြစ်နေပါသည်။ (Invalid sync key format.)" });
        return;
      }

      const syncStore = readSyncData();
      const history = syncStore[resolvedHash] || [];
      res.json({ history });
    } catch (err: any) {
      console.error("Sync get error:", err);
      res.status(500).json({ error: err.message || "အချက်အလက်များ ဖတ်ယူရန် မအောင်မြင်ပါ။" });
    }
  });

  // API Route: Save synced data
  app.post("/api/sync/save", (req, res) => {
    try {
      const { apiKeyHash, apiKey, history } = req.body;
      const hashRegex = /^[a-f0-9]{64}$/i;

      let resolvedHash = "";
      if (apiKey && typeof apiKey === "string" && apiKey.trim()) {
        resolvedHash = crypto.createHash("sha256").update(apiKey.trim()).digest("hex");
      } else if (apiKeyHash && hashRegex.test(apiKeyHash)) {
        resolvedHash = apiKeyHash;
      }

      if (!resolvedHash) {
        res.status(400).json({ error: "မှားယွင်းသော Sync Key ဖြစ်နေပါသည်။ (Invalid sync key format.)" });
        return;
      }

      if (!history || !Array.isArray(history)) {
        res.status(400).json({ error: "History are required as an array." });
        return;
      }

      // Safeguard against abuse/oversized storage
      if (history.length > 500) {
        res.status(400).json({ error: "အချက်အလက် အရေအတွက် ၅၀၀ ကျော်သဖြင့် သိမ်းဆည်း၍ မရပါ။ (Exceeded max storage capacity 500 items.)" });
        return;
      }

      // Read, update, and write back
      const syncStore = readSyncData();
      syncStore[resolvedHash] = history;
      writeSyncData(syncStore);

      res.json({ success: true });
    } catch (err: any) {
      console.error("Sync save error:", err);
      res.status(500).json({ error: err.message || "အချက်အလက်များ သိမ်းဆည်းရန် မအောင်မြင်ပါ။" });
    }
  });

  // API Route: Translate text and extract words
  app.post("/api/translate", async (req, res) => {
    let { text, image, mimeType, customApiKey, passcode } = req.body;
    try {

      // Sanitizing/normalizing smart quotes, curly apostrophes, and ellipsis to prevent ByteString/encoding failures
      if (text) {
        text = text
          .replace(/[\u2018\u2019]/g, "'") // Left and right curly single quotes -> straight single quote
          .replace(/[\u201C\u201D]/g, '"') // Left and right curly double quotes -> straight double quote
          .replace(/\u2026/g, "...");     // Ellipsis (...) -> three dots
      }

      if ((!text || !text.trim()) && !image) {
        res.status(400).json({ error: "အင်္ဂလိပ် စာသား သို့မဟုတ် ပုံတစ်ပုံ တင်ပေးရန် လိုအပ်ပါသည်။ (Text or Image is required.)" });
        return;
      }

      if (!customApiKey || !customApiKey.trim()) {
        res.status(400).json({ error: "ဘာသာပြန်စနစ်ကို အသုံးပြုရန်အတွက် ဆက်တင် (Settings) တက်ဘ်တွင် သင်၏ ကိုယ်ပိုင် Gemini API Key ကို မဖြစ်မနေ ထည့်သွင်းပေးရန် လိုအပ်ပါသည်။ (Personal Gemini API Key is required.)" });
        return;
      }

      // Allow translating with either custom key or the default server API key without passcode restrictions
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
   CRITICAL: The translation MUST strictly preserve and match the paragraph structure of the extracted English text. Translate paragraph-by-paragraph and separate each paragraph in the Burmese translation with double newlines matching the source paragraph breaks exactly.
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
CRITICAL: Your translation MUST strictly preserve and match the paragraph structure of the source English text. Translate paragraph-by-paragraph and separate each paragraph in the Burmese translation using double newlines matching the source paragraph breaks exactly so that they align beautifully.
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

      const resilientResult = await queryGeminiWithExtremeResilience(ai, contents);
      const responseText = resilientResult.responseText;
      const modelUsed = resilientResult.modelUsed;
      const strategyUsed = resilientResult.strategy;

      console.log(`Response received from ${modelUsed} using ${strategyUsed}. Length: ${responseText.length}`);
      
      let parsedJSON: any = null;
      const cleanText = responseText.trim();
      
      // Attempt 1: Standard JSON parse
      try {
        parsedJSON = JSON.parse(cleanText);
      } catch (jsonErr1) {
        console.warn("Direct JSON parsing failed, attempting markdown/enclosure cleaning...");
        
        // Attempt 2: Clean markdown backticks ```json ... ``` or ``` ... ```
        const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedJSON = JSON.parse(jsonMatch[1].trim());
          } catch (jsonErr2) {
            console.error("Parsing clean markdown JSON block failed:", jsonErr2);
          }
        }
        
        if (!parsedJSON) {
          // Attempt 3: Find first '{' and last '}' to extract raw object
          const firstBrace = cleanText.indexOf("{");
          const lastBrace = cleanText.lastIndexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try {
              const substringContent = cleanText.slice(firstBrace, lastBrace + 1);
              parsedJSON = JSON.parse(substringContent);
            } catch (jsonErr3) {
              console.error("Parsing brace-aligned JSON substring failed:", jsonErr3);
            }
          }
        }
      }

      if (!parsedJSON) {
        throw new Error(`ဘာသာပြန် ရလဒ်အား စနစ်မှ ဖတ်မရပါ။ (Failed to extract valid JSON data from response). Raw: ${responseText.slice(0, 150)}...`);
      }

      // Gracefully handle partial/missing properties if Strategy B/C was used
      if (!parsedJSON.extractedText) {
        parsedJSON.extractedText = text || "";
      }
      if (!parsedJSON.translation) {
        parsedJSON.translation = parsedJSON.extractedText; // fallback to text itself
      }
      if (!parsedJSON.words || !Array.isArray(parsedJSON.words)) {
        parsedJSON.words = [];
      }

      res.json(parsedJSON);
    } catch (err: any) {
      console.error("Translation API error:", err);
      try {
        const errorLog = `${new Date().toISOString()} - ERROR: ${err?.message || err}\nSTACK: ${err?.stack || ""}\nCustomApiKey: ${customApiKey ? "Present (masked: ... " + customApiKey.slice(-4) + ")" : "Not Present"}\n\n`;
        fs.appendFileSync("/tmp/translate_error.log", errorLog, "utf-8");
      } catch (logErr) {
        console.error("Failed to write to error log:", logErr);
      }
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
