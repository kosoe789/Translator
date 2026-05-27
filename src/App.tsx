import React, { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { 
  BookOpen, 
  Upload, 
  RefreshCw, 
  Languages, 
  HelpCircle, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  BookMarked,
  ArrowRight,
  Image as ImageIcon,
  X,
  History,
  Lock,
  Unlock,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DictionaryEntry, WorkspaceFile, AnalyzedWord, HistoryItem } from "./types";

// Pre-loaded elegant small sample E to M dictionary so they can test the app immediately
const SAMPLE_DICTIONARY: Record<string, string> = {
  "apple": "ပန်းသီး (နာမ် - သစ်သီးတစ်မျိုး)",
  "book": "စာအုပ် (နာမ်), စာရင်းသွင်းသည် (ကြိယာ)",
  "cat": "ကြောင် (နာမ်)",
  "dog": "ခွေး (နာမ်)",
  "eat": "စားသည် (ကြိယာ)",
  "food": "အစားအစာ (နာမ်)",
  "go": "သွားသည် (ကြိယာ)",
  "happy": "ပျော်ရွှင်သော (နာမဝိသေသန)",
  "run": "ပြေးသည် (ကြိယာ)",
  "study": "လေ့လာသင်ယူသည် (ကြိယာ), လေ့လာမှု (နာမ်)",
  "learn": "သင်ယူသည် (ကြိယာ)",
  "love": "ချစ်သည် (ကြိယာ), အချစ် (နာမ်)",
  "school": "ကျောင်း (နာမ်)",
  "teacher": "ဆရာ၊ ဆရာမ (နာမ်)",
  "student": "ကျောင်းသား၊ ကျောင်းသူ (နာမ်)",
  "write": "ရေးသည် (ကြိယာ)",
  "read": "ဖတ်သည် (ကြိယာ)",
  "work": "အလုပ်လုပ်သည် (ကြိယာ), အလုပ် (နာမ်)",
  "home": "အိမ် (နာမ်)",
  "family": "မိသားစု (နာမ်)",
  "beautiful": "လှပသော (နာမဝိသေသန)",
  "friend": "သူငယ်ချင်း (နာမ်)",
  "good": "ကောင်းသော (နာမဝိသေသန)",
  "morning": "နံနက်ခင်း (နာမ်)",
  "water": "ရေ (နာမ်)",
  "city": "မြို့ (နာမ်)",
  "country": "နိုင်ငံ၊ တောနယ် (နာမ်)",
  "language": "ဘာသာစကား (နာမ်)",
  "dictionary": "အဘိဓာန် (နာမ်)",
  "translate": "ဘာသာပြန်သည် (ကြိယာ)",
  "sentence": "ဝါကျ (နာမ်)",
  "word": "စကားလုံး (နာမ်)",
  "english": "အင်္ဂလိပ်စာ၊ အင်္ဂလိပ်လူမျိုး (နာမ်)",
  "myanmar": "မြန်မာစာ၊ မြန်မာလူမျိုး (နာမ်)",
  "people": "လူများ (နာမ်)",
  "life": "ဘဝ၊ အသက် (နာမ်)",
  "time": "အချိန် (နာမ်)",
  "day": "နေ့ (နာမ်)",
  "new": "သစ်သော၊ သစ်လွင်သော (နာမဝိသေသန)",
  "great": "ကြီးမြတ်သော၊ ကောင်းမွန်သော (နာမဝိသေသန)",
  "think": "စဉ်းစားသည်၊ ထင်မြင်သည် (ကြိယာ)",
  "know": "သိသည် (ကြိယာ)",
  "make": "ပြုလုပ်သည် (ကြိယာ)",
  "see": "မြင်သည် (ကြိယာ)",
  "come": "လာသည် (ကြိယာ)",
  "take": "ယူသည်၊ ဆောင်ယူသည် (ကြိယာ)",
  "use": "အသုံးပြုသည် (ကြိယာ), အသုံးပြုခြင်း (နာမ်)",
  "give": "ပေးသည် (ကြိယာ)",
  "find": "ရှာဖွေတွေ့ရှိသည် (ကြိယာ)",
  "fox": "မြေခွေး (နာမ်)",
  "brown": "ညိုသော၊ အညိုရောင် (နာမဝေသသန/နာမ်)",
  "quick": "လျင်မြန်သော (နာမဝိသေသန)",
  "jump": "ခုန်သည် (ကြိယာ)",
  "lazy": "ပျင်းရိသော (နာမဝိသေသန)"
};

// IndexedDB parameters
const DB_NAME = "EMDictionaryDB";
const STORE_NAME = "dictionary_store";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "word" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveDictionaryToDB(dictionary: Map<string, string>): Promise<void> {
  return openDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      
      // Clear current entries
      store.clear();
      
      // Put entries in batches or simply loop
      dictionary.forEach((definition, word) => {
        store.put({ word, definition });
      });
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

function loadDictionaryFromDB(): Promise<Map<string, string>> {
  return openDB().then((db) => {
    return new Promise<Map<string, string>>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const list = request.result || [];
        const map = new Map<string, string>();
        list.forEach((item: { word: string; definition: string }) => {
          map.set(item.word, item.definition);
        });
        resolve(map);
      };
      
      request.onerror = () => reject(request.error);
    });
  });
}

function clearDictionaryFromDB(): Promise<void> {
  return openDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

export default function App() {
  // Inputs
  const [inputText, setInputText] = useState("");
  const [dictionaryMap, setDictionaryMap] = useState<Map<string, string>>(new Map());
  const [dictionarySource, setDictionarySource] = useState<"sample" | "user_file">("sample");
  const [loadedFileName, setLoadedFileName] = useState<string>("");
  
  // Server files lists
  const [serverFiles, setServerFiles] = useState<WorkspaceFile[]>([]);
  const [isScanningServer, setIsScanningServer] = useState(false);
  const [isLoadingServerFile, setIsLoadingServerFile] = useState<string | null>(null);

  // States
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    translation: string;
    words: {
      original: string;
      base: string;
      pos: string;
      fallback_my: string;
      dictionary_definition: string | null;
    }[];
  } | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // History / Logs with local persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("em_translator_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("em_translator_history", JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history to localStorage:", err);
    }
  }, [history]);

  // UI helper alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Admin upload states for Server dictionary files
  const [passcode, setPasscode] = useState("");
  const [isUploadingToServer, setIsUploadingToServer] = useState(false);
  const [isDeletingFromServer, setIsDeletingFromServer] = useState<string | null>(null);
  
  // Parser debug info
  const [parserDebugInfo, setParserDebugInfo] = useState<{
    totalLines: number;
    parsedCount: number;
    sampleEntries: string[];
  } | null>(null);

  // Ref for copy-to-clipboard trick
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serverFileInputRef = useRef<HTMLInputElement>(null);

  // States for Image Translator
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedImageMime, setSelectedImageMime] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Tab State for right-sidebar content
  const [activeRightTab, setActiveRightTab] = useState<"vocab" | "search" | "dict" | "history">("vocab");

  // Initial load: Fetch server dictionary files and check IndexedDB
  useEffect(() => {
    // 1. Attempt to load from IndexedDB
    loadDictionaryFromDB()
      .then((savedMap) => {
        if (savedMap && savedMap.size > 0) {
          setDictionaryMap(savedMap);
          setDictionarySource("user_file");
          setLoadedFileName("IndexedDB Cache");
          showSuccess(`Loaded saved dictionary containing ${savedMap.size.toLocaleString()} words.`);
        } else {
          // Initialize with Sample Dictionary
          const initialMap = new Map<string, string>();
          Object.entries(SAMPLE_DICTIONARY).forEach(([word, def]) => {
            initialMap.set(word, def);
          });
          setDictionaryMap(initialMap);
          setDictionarySource("sample");
        }
      })
      .catch((err) => {
        console.error("Failed to load from IndexedDB:", err);
        // Fallback to sample map
        const initialMap = new Map<string, string>();
        Object.entries(SAMPLE_DICTIONARY).forEach(([word, def]) => {
          initialMap.set(word, def);
        });
        setDictionaryMap(initialMap);
      });

    // 2. Scan server folder for dictionary .txt files
    scanServerFiles();
  }, []);

  // Update single search lookup when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }
    const normalized = searchQuery.trim().toLowerCase().replace(/[^a-z0-9'\s-]/g, "").replace(/\d+$/, "");
    const definition = dictionaryMap.get(normalized);
    if (definition) {
      setSearchResult(definition);
    } else {
      setSearchResult(null);
    }
  }, [searchQuery, dictionaryMap]);

  // Utility toast display
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  // Helper function to scan server files
  const scanServerFiles = async () => {
    setIsScanningServer(true);
    try {
      const res = await fetch("/api/dictionary-files");
      if (!res.ok) throw new Error("Could not list server files.");
      const data = await res.json();
      setServerFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsScanningServer(false);
    }
  };

  // Helper to clean definition by truncating Derived forms, Synonyms, Antonyms, Extra Examples
  const cleanDefinition = (def: string): string => {
    if (!def) return "";
    const ignoreHeaders = [
      "Derived forms",
      "Word Form",
      "Synonyms",
      "Antonyms",
      "Extra Examples",
      "Usage notes"
    ];

    const defLines = def.split(/\r?\n/);
    const cleanLines: string[] = [];

    for (const dline of defLines) {
      const trimmedLine = dline.trim();
      if (!trimmedLine) continue;

      let shouldTruncate = false;

      // Check if line matches or starts with any of our ignored headers
      for (const h of ignoreHeaders) {
        const regex = new RegExp(`^\\s*${h}\\b`, "i");
        if (
          regex.test(trimmedLine) ||
          trimmedLine.toLowerCase().replace(/[^a-z\s]/g, "").trim() === h.toLowerCase()
        ) {
          shouldTruncate = true;
          break;
        }
      }

      if (shouldTruncate) {
        break; // Stop including anything from this line onwards
      }

      // Skip lines that represent listed synonyms/antonyms (they typically end with --- in this dictionary format)
      if (trimmedLine.endsWith("---") || trimmedLine.includes("---")) {
        continue; // skip this synonym list line
      }

      cleanLines.push(dline);
    }

    return cleanLines.join("\n").trim();
  };

  // Helper to extract headword from block lines using phonetic transcription clues
  const extractHeadwordFromBlock = (blockLines: string[]): string | null => {
    // Look for lines containing phonetic markers like /.../
    const phoneticRegex = /\/([^/]+)\//;

    let phoneticLineIdx = -1;
    let wordFromPhoneticLine = "";

    for (let i = 0; i < blockLines.length; i++) {
      const line = blockLines[i];
      const match = phoneticRegex.exec(line);
      if (match) {
        phoneticLineIdx = i;
        const slashIndex = line.indexOf("/");
        const preSlash = line.slice(0, slashIndex).trim();
        
        // Remove common keywords and tags
        let cleanPre = preSlash
          .replace(/\b(EN|US|UK|also|infml|con|syn|adj|v|n|prep)\b/gi, "")
          .replace(/[^a-zA-Z0-9'\s-]/g, "")
          .trim();

        if (cleanPre) {
          const tokens = cleanPre.split(/\s+/);
          const firstWord = tokens[0];
          if (/^[a-zA-Z]/.test(firstWord) && firstWord.length >= 2) {
            wordFromPhoneticLine = firstWord;
            break;
          }
        }
      }
    }

    if (wordFromPhoneticLine) {
      return wordFromPhoneticLine;
    }

    // Fallback: If phonetic line exists but has no prefixed alphabetic word, look backwards from it
    if (phoneticLineIdx !== -1) {
      for (let j = phoneticLineIdx; j >= 0; j--) {
        const line = blockLines[j].trim();
        if (!line) continue;
        const cleaned = line.replace(/[^a-zA-Z0-9'\s-]/g, "").trim();
        if (cleaned && /^[a-zA-Z]/.test(cleaned)) {
          const tokens = cleaned.split(/\s+/);
          if (tokens[0].length >= 2) {
            return tokens[0];
          }
        }
      }
    }

    // Ultimate Fallback: Take the first line starting with English letters
    for (const line of blockLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const cleaned = trimmed.replace(/[^a-zA-Z0-9'\s-]/g, "").trim();
      if (cleaned && /^[a-zA-Z]/.test(cleaned)) {
        const tokens = cleaned.split(/\s+/);
        if (tokens[0].length >= 2) {
          return tokens[0];
        }
      }
    }

    return null;
  };

  // Parsing helper to process E to M text files
  const processDictionaryText = (text: string, sourceName: string) => {
    const map = new Map<string, string>();
    const lines = text.split(/\r?\n/);
    const sampleEntries: string[] = [];

    // Format detection: Is it predominantly line-by-line with separators (tabs, double-colons, dashes, equal-signs)?
    let isTabOrSeparated = false;
    let separatorMatches = 0;
    let nonBlankLines = 0;

    for (let i = 0; i < Math.min(lines.length, 100); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      nonBlankLines++;
      if (
        line.includes("\t") || 
        line.includes(" :: ") || 
        line.includes(" : ") || 
        line.includes(" - ") || 
        line.includes(" = ")
      ) {
        separatorMatches++;
      }
    }

    if (nonBlankLines > 0 && (separatorMatches / nonBlankLines) > 0.4) {
      isTabOrSeparated = true;
    }

    if (isTabOrSeparated) {
      // 1. SINGLE-LINE FORMAT: Every line is an independent word + definition
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let word = "";
        let rawDef = "";

        // Separation parsing
        if (trimmed.includes("\t")) {
          const parts = trimmed.split("\t");
          word = parts[0].trim();
          rawDef = parts.slice(1).join("\t").trim();
        } else if (trimmed.includes(" :: ")) {
          const parts = trimmed.split(" :: ");
          word = parts[0].trim();
          rawDef = parts.slice(1).join(" :: ").trim();
        } else if (trimmed.includes(" : ")) {
          const parts = trimmed.split(" : ");
          word = parts[0].trim();
          rawDef = parts.slice(1).join(" : ").trim();
        } else if (trimmed.includes(" - ")) {
          const parts = trimmed.split(" - ");
          word = parts[0].trim();
          rawDef = parts.slice(1).join(" - ").trim();
        } else if (trimmed.includes(" = ")) {
          const parts = trimmed.split(" = ");
          word = parts[0].trim();
          rawDef = parts.slice(1).join(" = ").trim();
        } else {
          const firstColon = trimmed.indexOf(":");
          if (firstColon > 0) {
            word = trimmed.slice(0, firstColon).trim();
            rawDef = trimmed.slice(firstColon + 1).trim();
          } else {
            const firstSpace = trimmed.indexOf(" ");
            if (firstSpace > 0) {
              word = trimmed.slice(0, firstSpace).trim();
              rawDef = trimmed.slice(firstSpace + 1).trim();
            }
          }
        }

        if (word && rawDef) {
          const cleanWord = word.replace(/\d+$/, "");
          const normalized = cleanWord.toLowerCase().replace(/[^a-z0-9'\s-]/g, "").trim();
          if (normalized) {
            const cleanedDef = cleanDefinition(rawDef);
            if (cleanedDef) {
              if (map.has(normalized)) {
                map.set(normalized, map.get(normalized) + "\n\n" + cleanedDef);
              } else {
                map.set(normalized, cleanedDef);
              }
            }
          }
        }
      }
    } else {
      // 2. MULTI-LINE / BLOCK-BASED FORMAT: entries are separated by '---'
      const blocks = text.split("---");
      
      for (const block of blocks) {
        const blockLines = block.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (blockLines.length === 0) continue;

        // Extract headword guided by phonetic symbol search
        const word = extractHeadwordFromBlock(blockLines);
        if (!word) continue;

        const cleanWord = word.replace(/\d+$/, "");
        const normalized = cleanWord.toLowerCase().replace(/[^a-z0-9'\s-]/g, "").trim();
        if (normalized) {
          // Adjust visually the lines of the block: if the first line starts with original raw word (like shock1), replace it with the cleanWord (shock)
          let adjustedBlockLines = [...blockLines];
          if (word !== cleanWord) {
            const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`^${escapedWord}\\b`, "i");
            if (adjustedBlockLines.length > 0 && regex.test(adjustedBlockLines[0])) {
              adjustedBlockLines[0] = adjustedBlockLines[0].replace(regex, cleanWord);
            }
          }

          const combinedRawDef = adjustedBlockLines.join("\n");
          const cleanedDef = cleanDefinition(combinedRawDef);
          if (cleanedDef) {
            if (map.has(normalized)) {
              map.set(normalized, map.get(normalized) + "\n\n" + cleanedDef);
            } else {
              map.set(normalized, cleanedDef);
            }
          }
        }
      }
    }

    if (map.size === 0) {
      throw new Error("ကျေးဇူးပြု၍ စာကြောင်းတစ်ခုစီတွင် စကားလုံး နှင့် အဓိပ္ပါယ် ပုံစံဖြင့် တင်ပေးပါ။ (No dictionary entries could be parsed. Check your txt file format).");
    }

    // Capture first 5 entries for parser debug list
    let idx = 0;
    map.forEach((def, word) => {
      if (idx < 5) {
        sampleEntries.push(`${word} ➔ ${def.slice(0, 50).replace(/\r?\n/g, " ")}${def.length > 50 ? "..." : ""}`);
        idx++;
      }
    });

    // Set map to state
    setDictionaryMap(map);
    setDictionarySource("user_file");
    setLoadedFileName(sourceName);
    setParserDebugInfo({
      totalLines: lines.length,
      parsedCount: map.size,
      sampleEntries,
    });

    // Save to cache IndexedDB in background
    saveDictionaryToDB(map)
      .then(() => {
        showSuccess(`အောင်မြင်စွာ ဖတ်ရှုပြီးပါပြီ။ ဖွင့်ဆိုချက်ပေါင်း ${map.size.toLocaleString()} ကို စက်ထဲတွင် သိမ်းဆည်းထားပြီး ဖြစ်သဖြင့် နောက်တစ်ကြိမ် တင်ရန်မလိုပါ။ ဥပမာ Derived forms, Antonyms, Synonyms စသည်တို့ကို အလိုအလျောက် သန့်စင်လိုက်ပါပြီ။`);
      })
      .catch((err) => {
        console.error("IndexedDB write error:", err);
        showSuccess(`ဖွင့်ဆိုချက်ပေါင်း ${map.size.toLocaleString()} ခု တင်ပြီးပါပြီ။`);
      });
  };

  // Load a file from the server
  const handleLoadServerFile = async (filename: string) => {
    setIsLoadingServerFile(filename);
    try {
      const response = await fetch(`/api/dictionary-file?filename=${encodeURIComponent(filename)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "ဖိုင်ကို ဖတ်၍မရပါ။");
      }
      const data = await response.json();
      processDictionaryText(data.content, filename);
    } catch (err: any) {
      showError(`ဆာဗာဖိုင်ဖတ်ရန် မအောင်မြင်ပါ: ${err.message}`);
    } finally {
      setIsLoadingServerFile(null);
    }
  };

  // Load an uploaded local file
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        try {
          processDictionaryText(text, file.name);
        } catch (err: any) {
          showError(err.message);
        }
      }
    };
    reader.onerror = () => {
      showError("ဖိုင်ဖတ်ရှုနေစဉ် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။");
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = "";
  };

  // Upload file securely to Node server workspace
  const handleServerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      showError("ကျေးဇူးပြု၍ .txt file အမျိုးအစားကိုသာ တင်ပေးပါ။");
      e.target.value = "";
      return;
    }

    if (!passcode.trim()) {
      showError("ဆာဗာသို့ တင်ရန် လျှို့ဝှက်နံပါတ် (Passcode) ကို အရင်ဆုံး ညာဘက် panel အောက်တွင် ထည့်သွင်းပေးပါ။");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setIsUploadingToServer(true);
        try {
          const res = await fetch("/api/upload-dictionary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              content: text,
              passcode: passcode.trim(),
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "ဖိုင်တင်ရန် မအောင်မြင်ပါ။");
          }
          showSuccess(`ဖိုင် '${file.name}' ကို ဆာဗာသို့ အောင်မြင်စွာ တင်ပြီးပါပြီ။`);
          // Automatically run local parser for instant cache load
          processDictionaryText(text, file.name);
          // Refresh lists
          scanServerFiles();
        } catch (err: any) {
          showError(`ဆာဗာသို့တင်ရန် မအောင်မြင်ပါ: ${err.message}`);
        } finally {
          setIsUploadingToServer(false);
        }
      }
    };
    reader.onerror = () => {
      showError("ဖိုင်ဖတ်ရှုနေစဉ် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Delete file securely from server workspace directory
  const handleServerFileDelete = async (filename: string) => {
    if (!passcode.trim()) {
      showError("ဆာဗာမှ ဖျက်ရန် လျှို့ဝှက်နံပါတ် (Passcode) ကို ညာဘက် panel အောက်တွင် အရင်ဆုံး ထည့်သွင်းပေးပါ။");
      return;
    }

    if (!confirm(`ဆာဗာပေါ်ရှိ '${filename}' ဖိုင်ကို အပြီးသတ် ဖျက်ပစ်ရန် သေချာပါသလား?`)) {
      return;
    }

    setIsDeletingFromServer(filename);
    try {
      const res = await fetch("/api/delete-dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          passcode: passcode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ဖိုင်ဖျက်ရန် မအောင်မြင်ပါ။");
      }
      showSuccess(`ဖိုင် '${filename}' ကို ဆာဗာမှ အောင်မြင်စွာ ဖျက်ဆီးပြီးပါပြီ။`);
      scanServerFiles();
    } catch (err: any) {
      showError(`ဆာဗာဖိုင်ဖျက်ရန် မအောင်မြင်ပါ: ${err.message}`);
    } finally {
      setIsDeletingFromServer(null);
    }
  };

  // Drag over dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      showError("ကျေးဇူးပြု၍ .txt file အမျိုးအစားကိုသာ တင်ပေးပါ။");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        try {
          processDictionaryText(text, file.name);
        } catch (err: any) {
          showError(err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset to sample dictionary
  const handleResetToSample = async () => {
    if (confirm("လက်ရှိ dictionary ကို ရှင်းထုတ်ပြီး မူလနမူနာစကားလုံး ၅၀ ကို ပြန်လည် ပြောင်းလဲမလား?")) {
      try {
        await clearDictionaryFromDB();
        const initialMap = new Map<string, string>();
        Object.entries(SAMPLE_DICTIONARY).forEach(([word, def]) => {
          initialMap.set(word, def);
        });
        setDictionaryMap(initialMap);
        setDictionarySource("sample");
        setLoadedFileName("");
        setParserDebugInfo(null);
        showSuccess("နမူနာ စကားလုံးများကို ပြန်လည် ပြောင်းလဲပေးလိုက်ပါပြီ။");
      } catch (err: any) {
        showError("အမှားအယွင်းတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။");
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("ကျေးဇူးပြု၍ ပုံဖိုင် (Image) သာ ရွေးချယ်ပေးပါ!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedImageName(file.name);
      setSelectedImageMime(file.type);
      showSuccess("ပုံကို စစ်ဆေးရန် တင်သွင်းပြီးပါပြီ။");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedImageName("");
    setSelectedImageMime("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Main Action: Translate Sentence and Match Dictionary
  const handleTranslateAndProcess = async () => {
    if (!inputText.trim() && !selectedImage) {
      showError("ကျေးဇူးပြု၍ ဘာသာပြန်ရန် အင်္ဂလိပ်စာသား တစ်ခုခုထည့်ပါ သို့မဟုတ် ပုံတစ်ပုံ တင်ပေးပါ!");
      return;
    }

    setIsTranslating(true);
    setTranslationResult(null);

    let imageBase64 = null;
    if (selectedImage) {
      const commaIndex = selectedImage.indexOf(",");
      if (commaIndex !== -1) {
        imageBase64 = selectedImage.slice(commaIndex + 1);
      }
    }

    try {
      // Connect to server api
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: inputText, 
          image: imageBase64,
          mimeType: selectedImageMime
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "ဘာသာပြန်ယူရန် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။");
      }

      const data = await response.json();
      
      // If extractedText is returned and we used an image, update input text so they can see/edit it
      if (data.extractedText && selectedImage) {
        setInputText(data.extractedText);
      }

      // Match words in the response with our dictionary map
      const analyzedWordsWithLookups = data.words.map((aw: AnalyzedWord) => {
        // Match base word first
        const baseKey = aw.base.toLowerCase().trim().replace(/\d+$/, "");
        let definition = dictionaryMap.get(baseKey);
        
        // If not found, match original word directly as fallback
        if (!definition && aw.original) {
          const originalKey = aw.original.toLowerCase().trim().replace(/\d+$/, "");
          definition = dictionaryMap.get(originalKey);
        }

        return {
          ...aw,
          dictionary_definition: definition || null,
        };
      });

      const finalResult = {
        translation: data.translation,
        words: analyzedWordsWithLookups,
      };

      setTranslationResult(finalResult);
      setSelectedWordIndex(0);
      setActiveRightTab("vocab");

      // Add to history list with bookmark preservation and duplicate filtering
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        originalText: (data.extractedText || inputText).trim(),
        translation: data.translation,
        timestamp: Date.now(),
        isBookmarked: false,
        words: analyzedWordsWithLookups,
      };

      setHistory((prev) => {
        // Prevent duplicate items. If the item already exists, preserve its isBookmarked status.
        const existing = prev.find(
          (item) => item.originalText.toLowerCase() === newItem.originalText.toLowerCase()
        );
        const filtered = prev.filter(
          (item) => item.originalText.toLowerCase() !== newItem.originalText.toLowerCase()
        );
        
        const itemToInsert = existing 
          ? { ...newItem, isBookmarked: existing.isBookmarked } 
          : newItem;

        const merged = [itemToInsert, ...filtered];
        
        // If history list becomes very large (e.g. > 50), prune excess items that are NOT bookmarked
        if (merged.length > 50) {
          const bookmarkedList = merged.filter((item) => item.isBookmarked);
          const nonBookmarkedList = merged.filter((item) => !item.isBookmarked);
          // Keep up to 30 recent non-bookmarked items
          return [...bookmarkedList, ...nonBookmarkedList.slice(0, 30)];
        }
        return merged;
      });
      showSuccess("ဘာသာပြန်ဆိုပြီး ဝါစင်္ဂများကို တိုက်ဆိုင်ရှာဖွေပြီးပါပြီ။");
    } catch (err: any) {
      console.error(err);
      let friendlyError = err.message || "";
      if (typeof friendlyError === "object") {
        friendlyError = JSON.stringify(friendlyError);
      }
      
      if (
        friendlyError.includes("429") || 
        friendlyError.toUpperCase().includes("QUOTA") || 
        friendlyError.toUpperCase().includes("RESOURCE_EXHAUSTED") || 
        friendlyError.toUpperCase().includes("RATE_LIMIT") || 
        friendlyError.toLowerCase().includes("exceeded") || 
        friendlyError.toLowerCase().includes("limit")
      ) {
        friendlyError = "Gemini API ၏ တစ်မိနစ်အတွင်း အသုံးပြုမှုအကြိမ်ရေ (Rate Limit / Quota) ကန့်သတ်ချက် ပြည့်သွားသောကြောင့် ဖြစ်ပါသည်။ Google ၏ အခမဲ့ Free Tier စနစ်တွင် တစ်မိနစ်လျှင် အကြိမ်ရေ ၂၀ သာ ခွင့်ပြုထားခြင်းကြောင့် ဖြစ်ပြီး၊ ခေတ္တစက္ကန့် ၃၀ ခန့် စောင့်ဆိုင်းပြီးမှ ပြန်လည်စမ်းသပ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။";
      } else if (
        friendlyError.toUpperCase().includes("API KEY") || 
        friendlyError.toUpperCase().includes("API_KEY") || 
        friendlyError.toLowerCase().includes("key not found")
      ) {
        friendlyError = "Gemini API Key မတွေ့ရှိပါ သို့မဟုတ် လွဲမှားနေပါသည်။ ကျေးဇူးပြု၍ .env သို့မဟုတ် Settings တွင် API Key ထည့်ထားမှု ပြန်လည်စစ်ဆေးပေးပါ။";
      }
      
      showError(`ဘာသာပြန်ဆိုမှု မအောင်မြင်ပါ- ${friendlyError}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Quick helper to fill input text with a beautiful sample sentence
  const loadTestSentence = (text: string) => {
    setInputText(text);
  };

  const copyText = (text: string, isTranslation = false) => {
    navigator.clipboard.writeText(text);
    if (isTranslation) {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    }
  };

  // Language helper translations (Burmese is default, but clean bilingual captions are used)
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* International-Standard Premium Header Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl border border-slate-900/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-xl py-8 px-8 flex items-center justify-center text-center">
          {/* Stunning subtle glowing orb effects for high productivity feel */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-32 bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
          
          <h1 className="relative text-2xl sm:text-3.5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-50 drop-shadow-sm">
            English to Myanmar Translator and Definitions
          </h1>
        </div>

        {/* Dynamic Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-800 text-sm flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold shrink-0">✓</div>
              <p className="font-medium">{successMessage}</p>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200/60 rounded-xl text-rose-800 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="font-medium">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace arena: 7 columns on large desktop */}
          <section className="lg:col-span-7 space-y-8">
            
            {/* Input card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-600" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <button
                  onClick={() => {
                    setInputText("");
                    handleRemoveImage();
                  }}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors py-1 px-2.5 rounded hover:bg-rose-50 font-medium cursor-pointer"
                  disabled={isTranslating}
                >
                  အကုန်ဖျက်ရန်
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="မြန်မာဘာသာပြန်လိုသော အင်္ဂလိပ်စာကို ထည့်ပါ။"
                rows={5}
                className="w-full text-base p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-y transition-all font-sans leading-relaxed text-slate-900"
                disabled={isTranslating}
              />

              {/* Image attachment / input control */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isTranslating}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isTranslating}
                    className="text-xs font-semibold px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    📷 ပုံတင်ဘာသာပြန်ရန်
                  </button>
                </div>
              </div>

              {selectedImage && (
                <div className="mt-4 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 flex items-center justify-between gap-3 animate-fade-in animate-duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={selectedImage} 
                      alt="Selected upload" 
                      className="w-12 h-12 object-cover rounded-md border border-indigo-100 shadow-3xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                        {selectedImageName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {(selectedImageMime || "").split("/")[1] || "image"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                    title="Remove attached image"
                    disabled={isTranslating}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sample helper sentences clickers */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  စမ်းသပ်ရန် စာကြောင်းများ:
                </span>
                
                <button
                  type="button"
                  onClick={() => loadTestSentence("A quick brown fox jumps over the lazy dog.")}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-all"
                  title="A classic sentence with all alphabets"
                >
                  🦊 Black Fox jump
                </button>
                <button
                  type="button"
                  onClick={() => loadTestSentence("Studies show studies improve vocabulary.")}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-all"
                >
                  📖 Studies vocabulary
                </button>
              </div>

              {/* Perform translator CTA */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleTranslateAndProcess}
                  disabled={isTranslating}
                  className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium tracking-wide shadow-md shadow-indigo-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Gemini ဘာသာပြန်ဆိုနေပါသည်...
                    </>
                  ) : (
                    <>
                      <Languages className="w-5 h-5" />
                      ဘာသာပြန်၍ E-M dictionary မှ ဝေါဟာရ ရှာမည်။
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Translation and word matcher output values */}
            <AnimatePresence mode="wait">
              {translationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-6"
                >
                  {/* Full sentence translates Box */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold tracking-wider text-emerald-700 uppercase flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        မြန်မာဘာသာပြန်ချက်
                      </h3>

                      <button
                        onClick={() => copyText(translationResult.translation, true)}
                        className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 transition-all font-medium"
                      >
                        {copiedTranslation ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ကူးယူပြီးပါပြီ
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            ဘာသာပြန်ယူရန်
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-100/55 rounded-xl">
                      <p className="text-lg text-slate-800 leading-relaxed font-semibold">
                        {translationResult.translation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </section>

          {/* Sidebar Area: 5 columns on large desktop. Holds Dictionary Loader & Tools in a Tabbed Interface */}
          <section className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              {/* Tab Navigation Menu Bar */}
              <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5 gap-1 overflow-x-auto scroller-hide">
                <button
                  onClick={() => setActiveRightTab("vocab")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "vocab"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  ဝေါဟာရများ {translationResult ? `(${translationResult.words.length})` : ""}
                </button>
                <button
                  onClick={() => setActiveRightTab("search")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "search"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  အဘိဓာန်ရှာဖွေမှု
                </button>
                <button
                  onClick={() => setActiveRightTab("dict")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "dict"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  ဖိုင်တင်ရန်
                </button>
                <button
                  onClick={() => setActiveRightTab("history")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "history"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  မှတ်တမ်း {history.length > 0 ? `(${history.length})` : ""}
                </button>
              </div>

              {/* Tab Panel Contents */}
              <div className="p-5 min-h-[350px]">
                <AnimatePresence mode="wait">
                  {activeRightTab === "vocab" && (
                    <motion.div
                      key="vocab-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {translationResult ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <BookMarked className="w-4 h-4 text-indigo-500" />
                                ဝေါဟာရနှင့် ဖွင့်ဆိုချက်များ
                              </h3>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                ဝိဘတ်၊ နာမ်စား၊ အာတီကယ်များ ချန်လှပ်၍ တိုက်ဆိုင်ရှာဖွေမှု
                              </p>
                            </div>
                            <span className="text-[10px] font-sans px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-full font-bold">
                              {translationResult.words.length} Words Traced
                            </span>
                          </div>

                          {/* Selection Dropdown Form */}
                          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 flex flex-col gap-1.5 shadow-3xs">
                            <label className="text-xs font-bold text-indigo-950 flex items-center gap-1" htmlFor="traced-words-select-sb">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                              စကားလုံး ရွေးချယ်ရန် (Select Traced Word):
                            </label>
                            <select
                              id="traced-words-select-sb"
                              value={selectedWordIndex}
                              onChange={(e) => setSelectedWordIndex(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-3xs cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%23475569%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:18px_18px] bg-[right_10px_center] bg-no-repeat pr-8"
                            >
                              {translationResult.words.map((word, idx) => (
                                <option key={idx} value={idx}>
                                  {idx + 1}. {word.original} ({word.pos})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Display active word card */}
                          {translationResult.words.length > 0 ? (
                            (() => {
                              const word = translationResult.words[selectedWordIndex] || translationResult.words[0];
                              const index = translationResult.words[selectedWordIndex] ? selectedWordIndex : 0;

                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-slate-50/50 rounded-xl border border-slate-150 p-4 space-y-3"
                                >
                                  {/* Header metadata */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-white w-5 h-5 rounded-full flex items-center justify-center border border-slate-200">
                                        {index + 1}
                                      </span>
                                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-[120px]" title={word.original}>
                                        {word.original}
                                      </h4>
                                      <span className="text-[10px] text-slate-400">➔</span>
                                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/40 px-2 py-0.5 rounded-md">
                                        {word.base}
                                      </span>
                                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 uppercase font-semibold">
                                        {word.pos}
                                      </span>
                                    </div>

                                    {/* Small paginator & copy */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setSelectedWordIndex((prev) => Math.max(0, prev - 1))}
                                        disabled={index === 0}
                                        className="p-1 px-1.5 text-[10px] font-bold bg-white border border-slate-200 text-slate-600 rounded disabled:opacity-30 hover:bg-slate-50 disabled:pointer-events-none cursor-pointer"
                                      >
                                        ◀
                                      </button>
                                      <button
                                        onClick={() => setSelectedWordIndex((prev) => Math.min(translationResult.words.length - 1, prev + 1))}
                                        disabled={index === translationResult.words.length - 1}
                                        className="p-1 px-1.5 text-[10px] font-bold bg-white border border-slate-200 text-slate-600 rounded disabled:opacity-30 hover:bg-slate-50 disabled:pointer-events-none cursor-pointer"
                                      >
                                        ▶
                                      </button>
                                      <button
                                        onClick={() => {
                                          copyText(word.base);
                                          setCopiedIndex(index);
                                          setTimeout(() => setCopiedIndex(null), 1500);
                                        }}
                                        className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-white border border-slate-200 transition-all ml-0.5"
                                        title="Copy root word"
                                      >
                                        {copiedIndex === index ? (
                                          <Check className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Definition container */}
                                  <div className="pt-1">
                                    {word.dictionary_definition ? (
                                      <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase flex items-center gap-1">
                                          <BookOpen className="w-3 h-3" />
                                          E-M Dictionary ဖွင့်ဆိုချက်အမှန်
                                        </div>
                                        <div className="text-xs text-slate-755 font-medium whitespace-pre-wrap leading-relaxed border-l-3 border-indigo-500 pl-2.5 bg-indigo-50/10 py-1.5 rounded-r">
                                          {word.dictionary_definition}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold tracking-wider text-amber-600 uppercase flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-amber-500" />
                                          Gemini ရှင်းလင်းချက် (Fallback)
                                        </div>
                                        <div className="text-xs text-slate-600 italic whitespace-pre-line leading-relaxed border-l-3 border-amber-300 pl-2.5 bg-amber-50/25 py-2 rounded-r pr-2">
                                          {word.fallback_my}
                                        </div>
                                        <p className="text-[9px] text-amber-500/80 pl-2.5 leading-normal">
                                          * ဤစကားလုံးကို loaded dictionary ထဲတွင်မတွေ့ရသဖြင့် ဝါကျအလိုက် Gemini က တိုက်ရိုက်အဓိပ္ပါယ် ဖွင့်ပေးထားသည်။
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })()
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 space-y-3">
                          <BookMarked className="w-10 h-10 mx-auto stroke-1 text-slate-350" />
                          <p className="text-xs max-w-xs mx-auto leading-relaxed">
                            အင်္ဂလိပ်ဝါကျကို ဘာသာပြန်စစ်ဆေးလိုက်ပါက ၎င်းတွင်ပါရှိသော ဝေါဟာရနှင့် ဖွင့်ဆိုချက်များ၊ စကားလုံး ရွေးချယ်မှုများနှင့် E-M Dictionary တိုက်ဆိုင်မှုများကို ဤသီးသန့် panel တွင် မြင်တွေ့လေ့လာနိုင်မည် ဖြစ်သည်။
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeRightTab === "search" && (
                    <motion.div
                      key="search-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="border-b border-slate-100 pb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-750 flex items-center gap-1.5">
                          <Search className="w-4 h-4 text-slate-500" />
                          အဘိဓာန်အမြန်ရှာ (Single Word Search)
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          ဒေတာဘေ့စ်ထဲမှ စကားလုံးတစ်လုံးချင်းစီကို တိုက်ရိုက် ရှာဖွေနိုင်သည့်အကွက်
                        </p>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="learn, dictionary, code, test..."
                          className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                        />
                        <div className="absolute left-3.5 top-2.5 text-slate-400">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {searchQuery.trim() && (
                        <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 transition-all">
                          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                            Results for &quot;{searchQuery.trim()}&quot; :
                          </h4>
                          {searchResult ? (
                            <div className="text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed pr-1 max-h-56 overflow-y-auto">
                              {searchResult}
                            </div>
                          ) : (
                            <div className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 pt-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              ရှာမတွေ့ပါ။ စာလုံးပေါင်းမှန်ကန်မှုကို စစ်ဆေးပေးပါ။
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeRightTab === "dict" && (
                    <motion.div
                      key="dict-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="border-b border-slate-100 pb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-750 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-indigo-500" />
                          Dictionary စီမံခန့်ခွဲမှု (Manage Database)
                        </h3>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          စကားလုံးဖွင့်ဆိုချက်များပါရှိသော .txt ဖိုင်များကို တင်သွင်းရန်နှင့် စီမံရန်
                        </p>
                      </div>

                      {/* Securing Block: Passcode Verification Input */}
                      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                            {passcode.trim() ? (
                              <Unlock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                            ပိုင်ရှင်ဖြစ်ကြောင်း အတည်ပြုရန် လျှို့ဝှက်နံပါတ် (Passcode)
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="ဆာဗာသို့ တင်ရန် / လှမ်းဖျက်ရန် Passcode ရိုက်ထည့်ပါ..."
                            className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg py-1.5 pl-8 pr-3 transition-all font-mono placeholder:text-slate-400 placeholder:font-sans text-slate-755"
                          />
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          * <span className="font-semibold text-slate-500">Local Browser စနစ်ကို လူတိုင်းသုံးနိုင်သည်</span>။ သို့သော် ဆာဗာသို့ အပြီးသတ်တင်သွင်းရန်နှင့် ဆာဗာရှိ file များကို ဖျက်ရန်အတွက်မူ ပိုင်ရှင်သီးသန့် လျှို့ဝှက်နံပါတ် လိုအပ်ပါသည်။
                        </p>
                      </div>

                      {/* Mode 1: Local Session for normal visitors */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          ၁။ မိမိစက်မှဖိုင်ကို Browser တွင် ခေတ္တတင်ရန် (Local Browser Mode)
                        </h4>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                            isDragging 
                              ? "border-indigo-500 bg-indigo-50/45 text-indigo-700" 
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-605"
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLocalFileUpload}
                            accept=".txt"
                            className="hidden"
                          />
                          <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                          <p className="text-[11px] font-bold text-slate-700">
                            {isDragging ? "ဤနေရာသို့ လွှတ်ချလိုက်ပါ" : "ဖိုင်ဆွဲထည့်ပါ သို့မဟုတ် ဤနေရာကို နှိပ်ပါ"}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            ဖိုင်ရွေးပြီးပါက ဤ Browser ၏ Local Session တွင် ချက်ချင်းသိမ်းဆည်းပါမည်
                          </p>
                        </div>
                      </div>

                      {/* Mode 2: Server Admin mode (Upload directly to code root directory) */}
                      <div className="bg-indigo-50/40 border border-indigo-100/60 p-3 rounded-xl space-y-2">
                        <h4 className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          ၂။ ဆာဗာပေါ်သို့ အမြဲတမ်း သိမ်းဆည်းရန် တင်သွင်းမည် (Server Upload)
                        </h4>
                        
                        <input
                          type="file"
                          ref={serverFileInputRef}
                          onChange={handleServerFileUpload}
                          accept=".txt"
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (!passcode.trim()) {
                              showError("ဆာဗာသို့ တင်သွင်းရန် အပေါ်ရှိ Passcode လျှို့ဝှက်ချက်ကို အရင်ဆုံး ဖြည့်စွက်ပေးပါ။");
                              return;
                            }
                            serverFileInputRef.current?.click();
                          }}
                          disabled={isUploadingToServer}
                          className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          {isUploadingToServer ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>ဆာဗာသို့ တင်ပို့နေသည်...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              <span>ဆာဗာပေါ်သို့ အပြီးသတ်တင်မည်</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Server files load and delete list */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-indigo-550" />
                            Server Dictionary ဖိုင်များ
                          </h4>
                          <button
                            onClick={scanServerFiles}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-all cursor-pointer"
                            title="ပြန်လည်ရှာဖွေရန်"
                            disabled={isScanningServer}
                          >
                            <RefreshCw className={`w-3 h-3 ${isScanningServer ? "animate-spin" : ""}`} />
                          </button>
                        </div>

                        {serverFiles.length > 0 ? (
                          <div className="border border-slate-100 rounded-lg divide-y divide-slate-50 bg-slate-50/50 max-h-36 overflow-y-auto">
                            {serverFiles.map((srv, idx) => (
                              <div key={idx} className="p-2 flex items-center justify-between gap-1.5">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-medium text-slate-700 truncate" title={srv.filename}>
                                    📄 {srv.filename}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-mono">
                                    {(srv.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleLoadServerFile(srv.filename)}
                                    disabled={isLoadingServerFile !== null}
                                    className="text-[10px] bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-205 px-2.5 py-1 rounded font-bold transition-all cursor-pointer disabled:opacity-50"
                                    title="ဤ database ဖိုင်ကို system တွင် select လုပ်၍ parse လုပ်ပါ"
                                  >
                                    {isLoadingServerFile === srv.filename ? "..." : "Load"}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleServerFileDelete(srv.filename)}
                                    disabled={isDeletingFromServer !== null}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                    title="ဆာဗာပေါ်မှ အပြီးတိုင် ဖျက်ဆီးပစ်မည်"
                                  >
                                    {isDeletingFromServer === srv.filename ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-50 rounded-lg text-center border border-dashed border-slate-150">
                            <p className="text-[9px] text-slate-400 italic">
                              ဆာဗာ workspace root တွင် parse လုပ်ရန် .txt ဖိုင်ရှာမတွေ့ပါ။
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Debug parse info */}
                      {parserDebugInfo && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500 space-y-1">
                          <div className="font-bold text-slate-600 text-[9px] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                            <span>📜 လက်ရှိ Active ဖြစ်နေသော Data Info:</span>
                          </div>
                          <div>• ဖိုင်အမည်: <span className="font-bold text-slate-700">{loadedFileName || "မသိရှိရပါ"}</span></div>
                          <div>• စာကြောင်းစုစုပေါင်း: <b>{parserDebugInfo.totalLines.toLocaleString()} ကြောင်း</b></div>
                          <div>• အောင်မြင်စွာဖတ်ပြီးသော စကားလုံးအရေအတွက်: <b className="text-emerald-600">{parserDebugInfo.parsedCount.toLocaleString()} လုံး</b></div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeRightTab === "history" && (
                    <motion.div
                      key="history-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-755 flex items-center gap-1.5">
                            <History className="w-4 h-4 text-slate-500" />
                            ယခင်ရှာဖွေမှုမှတ်တမ်း (Recent)
                          </h3>
                          <p className="text-[10px] text-slate-450 mt-0.5">
                            ရှာဖွေခဲ့သမျှ စာရင်းဇယားမှတ်တမ်း (Bookmark များ မပျက်ပါ)
                          </p>
                        </div>
                        {history.length > 0 && (
                          <button
                            onClick={() => {
                              const bookmarkedOnly = history.filter(item => item.isBookmarked);
                              setHistory(bookmarkedOnly);
                              if (bookmarkedOnly.length < history.length) {
                                showSuccess("သမိုင်းမှတ်တမ်းကို ရှင်းလင်းလိုက်ပါပြီ။ Bookmark ပြုလုပ်ထားသော အရာများသာ ချန်လှပ်ထားပါသည်။");
                              } else {
                                showSuccess("ဖျက်ရန် သမိုင်းမှတ်တမ်းအသစ် မရှိသေးပါ။");
                              }
                            }}
                            className="text-[9px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-all font-bold cursor-pointer"
                            title="Bookmark ပြုလုပ်ထားသော အရာများကို ချန်လှပ်၍ ကျန်ရှိသမျှကို ရှင်းလင်းပါမည်"
                          >
                            ရှင်းလင်းရန်
                          </button>
                        )}
                      </div>

                      {history.length > 0 ? (
                        <div className="space-y-2.5 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                          {history.map((hist) => (
                            <div 
                              key={hist.id} 
                              className="pt-2.5 first:pt-0 pb-1.5 flex items-start justify-between gap-2 border-b border-dashed border-slate-100 last:border-0 group cursor-pointer"
                              onClick={() => {
                                setInputText(hist.originalText);
                                setTranslationResult({
                                  translation: hist.translation,
                                  words: hist.words,
                                });
                                setSelectedWordIndex(0);
                                setActiveRightTab("vocab");
                              }}
                            >
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {hist.isBookmarked && (
                                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 shrink-0" />
                                  )}
                                  <p className="text-xs font-semibold text-slate-755 group-hover:text-indigo-600 truncate">
                                    {hist.originalText}
                                  </p>
                                </div>
                                <p className="text-xs text-emerald-600 truncate font-medium">
                                  {hist.translation}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1.5">
                                  <span>{new Date(hist.timestamp).toLocaleTimeString()}</span>
                                  {hist.isBookmarked && (
                                    <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-1 py-0.2 rounded border border-amber-100 uppercase tracking-wide">
                                      Saved
                                    </span>
                                  )}
                                </p>
                              </div>
                              
                              {/* Row action buttons */}
                              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHistory((prev) =>
                                      prev.map((item) =>
                                        item.id === hist.id 
                                          ? { ...item, isBookmarked: !item.isBookmarked } 
                                          : item
                                      )
                                    );
                                  }}
                                  className={`p-1 rounded-md transition-colors hover:bg-slate-50 ${
                                    hist.isBookmarked 
                                      ? "text-amber-500 hover:text-amber-600" 
                                      : "text-slate-350 hover:text-amber-500"
                                  }`}
                                  title={hist.isBookmarked ? "Bookmark ဖျက်သိမ်းရန်" : "Bookmark မှတ်သားရန် (ရှင်းလင်းသော်လည်း ချန်ထားမည်)"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${hist.isBookmarked ? "fill-current" : ""}`} />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHistory((prev) => prev.filter((item) => item.id !== hist.id));
                                  }}
                                  className="p-1 rounded-md text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="ဤမှတ်တမ်းကိုဖျက်ရန်"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-slate-400">
                          <History className="w-8 h-8 mx-auto stroke-1 mb-1 text-slate-350" />
                          <p className="text-xs">သမိုင်းမှတ်တမ်း မရှိသေးပါ။</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20 py-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-3">
          <p className="text-sm">
            <b>မြန်မာ အမြန်ဘာသာပြန်နှင့် ဝါစင်္ဂ Dictionary တွဲဖက်စက်</b> — Designed with Google Gemini 3.5 Flash API
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-sm">Skip prepositions, pronouns & articles: Activated</span>
            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-sm">Persistent cache: IndexedDB Enabled</span>
          </div>
          <p className="text-xs text-slate-600">
            Current session tracking since 2026. All operations processed on secure Cloud-based servers.
          </p>
        </div>
      </footer>
    </div>
  );
}
