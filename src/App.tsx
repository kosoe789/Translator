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
  ArrowRight
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

  // History / Logs
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // UI helper alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Parser debug info
  const [parserDebugInfo, setParserDebugInfo] = useState<{
    totalLines: number;
    parsedCount: number;
    sampleEntries: string[];
  } | null>(null);

  // Ref for copy-to-clipboard trick
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Main Action: Translate Sentence and Match Dictionary
  const handleTranslateAndProcess = async () => {
    if (!inputText.trim()) {
      showError("ကျေးဇူးပြု၍ ဘာသာပြန်ရန် အင်္ဂလိပ်စာသား တစ်ခုခု အရင်ထည့်သွင်းပါ!");
      return;
    }

    setIsTranslating(true);
    setTranslationResult(null);

    try {
      // Connect to server api
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "ဘာသာပြန်ယူရန် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။");
      }

      const data = await response.json();
      
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

      // Add to history list
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        originalText: inputText,
        translation: data.translation,
        timestamp: Date.now(),
        words: analyzedWordsWithLookups,
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
      showSuccess("ဘာသာပြန်ဆိုပြီး ဝါစင်္ဂများကို တိုက်ဆိုင်ရှာဖွေပြီးပါပြီ။");
    } catch (err: any) {
      console.error(err);
      showError(`ဘာသာပြန်ဆိုမှု မအောင်မြင်ပါ- ${err.message}`);
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
      {/* Visual Header / Banner */}
      <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Languages className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 font-display flex items-center gap-2">
                မြန်မာ အမြန်ဘာသာပြန်နှင့် Dictionary ဖတ်စက်
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                English to Myanmar Smart Sentence Translator & Dictionary Lookup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Dictionary:{" "}
              <b className="text-slate-800">
                {dictionarySource === "sample" 
                  ? "နမူနာ စကားလုံး ၅၀" 
                  : `${loadedFileName || "ထည့်သွင်းပြီး"} (${dictionaryMap.size.toLocaleString()} လုံး)`}
              </b>
            </span>

            {dictionarySource === "user_file" && (
              <button
                onClick={handleResetToSample}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-dashed border-rose-200"
                title="နမူနာစကားလုံးများသို့ ပြန်ပြောင်းရန်"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
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
                <label className="text-sm font-semibold tracking-wide text-slate-700 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  စစ်ဆေးလိုသော အင်္ဂလိပ် စာသား (English sentence / paragraph)
                </label>
                <button
                  onClick={() => setInputText("")}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors py-1 px-2.5 rounded hover:bg-rose-50"
                  disabled={isTranslating}
                >
                  အကုန်ဖျက်ရန်
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="လေ့လာလိုသော အင်္ဂလိပ် ဝါကျ သို့မဟုတ် စာပိုဒ်တိုများကို ဤနေရာတွင် ထည့်သွင်းပါ..."
                rows={5}
                className="w-full text-base p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-y transition-all font-sans leading-relaxed"
                disabled={isTranslating}
              />

              {/* Sample helper sentences clickers */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  စမ်းသပ်ရန် စာကြောင်းများ:
                </span>
                
                <button
                  onClick={() => loadTestSentence("A quick brown fox jumps over the lazy dog.")}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-all"
                  title="A classic sentence with all alphabets"
                >
                  🦊 Black Fox jump
                </button>
                <button
                  onClick={() => loadTestSentence("He studies English vocabulary using a digital dictionary to improve his reading life.")}
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
                      ဘာသာပြန်ပြီး ဝေါဟာရစကားလုံးများ တွဲဖက်ရှာဖွေပါ
                      <ArrowRight className="w-4 h-4" />
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
                        မြန်မာဘာသာပြန်ချက် (Google Gemini AI Translation)
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
                      <p className="text-lg text-slate-800 leading-relaxed font-medium">
                        {translationResult.translation}
                      </p>
                    </div>
                  </div>

                  {/* Word by word listings (SKIPPING prepositions, pronouns, articles etc as requested) */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <BookMarked className="w-5 h-5 text-indigo-500" />
                          ဝေါဟာရနှင့် ဖွင့်ဆိုချက်များ (Vocabulary Lookups)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          အင်္ဂလိပ်စာလုံးထဲမှ ဝိဘတ်၊ နာမ်စား၊ အာတီကယ်များ ချန်လှပ်၍ သက်ဆိုင်ရာ အဓိပ္ပါယ်များကို စီစဉ်ထုတ်ပေးထားခြင်းဖြစ်ပါသည်
                        </p>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full font-semibold shrink-0">
                        {translationResult.words.length} Words Traced
                      </span>
                    </div>

                    <div className="space-y-4">
                      {translationResult.words.map((word, index) => {
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs overflow-hidden transition-all duration-200 group"
                          >
                            <div className="p-5">
                              {/* Word identifiers tags */}
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-sm font-mono text-slate-400 font-bold bg-slate-50 w-6 h-6 rounded-full flex items-center justify-center border border-slate-100">
                                    {index + 1}
                                  </span>
                                  <h4 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {word.original}
                                  </h4>
                                  <span className="text-xs text-slate-400">➔</span>
                                  <span className="text-md font-extrabold text-indigo-600 bg-indigo-50/50 px-2.5 py-0.5 rounded-md border border-indigo-100/30">
                                    {word.base}
                                  </span>
                                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                                    {word.pos}
                                  </span>
                                </div>

                                <button
                                  onClick={() => {
                                    copyText(word.base);
                                    setCopiedIndex(index);
                                    setTimeout(() => setCopiedIndex(null), 1500);
                                  }}
                                  className="text-xs text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-slate-50"
                                  title="Copy root word"
                                >
                                  {copiedIndex === index ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Definition lookups */}
                              <div className="mt-3">
                                {word.dictionary_definition ? (
                                  <div className="space-y-1">
                                    <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase flex items-center gap-1.5 mb-1 bg-indigo-50/20 max-w-max px-2 py-0.5 rounded">
                                      <BookOpen className="w-3 h-3" />
                                      E-M Dictionary ဖွင့်ဆိုချက်အမှန်
                                    </div>
                                    <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed border-l-3 border-indigo-500 pl-3">
                                      {word.dictionary_definition}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="text-xs font-semibold tracking-wider text-amber-600 uppercase flex items-center gap-1.5 mb-1 bg-amber-50/30 max-w-max px-2 py-0.5 rounded">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      Gemini ရိုးရှင်းဝါကျဆိုင်ရာ အဓိပ္ပါယ် (Fallback Context)
                                    </div>
                                    <p className="text-slate-600 italic whitespace-pre-line leading-relaxed border-l-3 border-amber-300 pl-3 bg-amber-50/20 py-2 rounded-r-lg pr-3">
                                      {word.fallback_my}
                                    </p>
                                    <p className="text-[11px] text-amber-600/80 pl-3">
                                      * ဤစကားလုံးကို loaded dictionary ထဲတွင်မတွေ့ရသဖြင့် Gemini model က ဝါကျအလိုက် အနီးစပ်ဆုံး တိုက်ရိုက်ဘာသာပြန်ပေးထားပါသည်။
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </section>

          {/* Sidebar Area: 5 columns on large desktop. Holds Dictionary Loader & Tools */}
          <section className="lg:col-span-5 space-y-8">
            
            {/* 1. Quick Search lookup widget */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative">
              <h3 className="text-sm font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-slate-500" />
                အဘိဓာန်အမြန်ရှာ (Single Word Dictionary Search)
              </h3>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ဥပမာ- learn, beautiful, fox..."
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Search className="w-4.5 h-4.5" />
                </div>
              </div>

              {searchQuery.trim() && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Results for &quot;{searchQuery.trim()}&quot; :
                  </h4>
                  {searchResult ? (
                    <div className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed pr-2">
                      {searchResult}
                    </div>
                  ) : (
                    <div className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4.5 h-4.5" />
                      မတွေ့ရှိပါ။ သင့်ဖိုင်ထဲရှိ စကားလုံးလုံးဝတူကိုသာ ရှာနိုင်မည်ဖြစ်သည်။
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. File Uploader Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              
              <div>
                <h3 className="text-sm font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Dictionary ဖိုင်တင်ရန် (Load Dictionary File)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  E to Myanmar dictionary txt file ကို တင်ပေးပါ။ (စကားလုံး တစ်ကြောင်းစီတွင် separation တစ်မျိုးမျိုး ပါဝင်ရပါမည်)
                </p>
              </div>

              {/* Drag and Drop area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-50/40 text-indigo-700" 
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLocalFileUpload}
                  accept=".txt"
                  className="hidden"
                />
                
                <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2.5" />
                <p className="text-sm font-bold">
                  {isDragging ? "ဤနေရာသို့ ဖိုင်ကိုလွှတ်ချပါ" : "နှိပ်၍ တင်ပါ သို့မဟုတ် ဖိုင်ဆွဲထည့်ပါ"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Only .txt dictionary files allowed (Max 15MB)
                </p>
              </div>

              {/* Server-side discovered files */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    ရရှိနိုင်သော Server Dictionary ဖိုင်များ
                  </h4>
                  <button
                    onClick={scanServerFiles}
                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-sm"
                    title="ဆာဗာဖိုင်များ ပြန်လည်ရှာဖွေရန်"
                    disabled={isScanningServer}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanningServer ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {serverFiles.length > 0 ? (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 bg-slate-50/50 max-h-48 overflow-y-auto">
                    {serverFiles.map((srv, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-800 truncate" title={srv.filename}>
                            📄 {srv.filename}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(srv.size / 1024).toFixed(1)} KB • {new Date(srv.mtime).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleLoadServerFile(srv.filename)}
                          disabled={isLoadingServerFile !== null}
                          className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-md text-slate-700 font-semibold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {isLoadingServerFile === srv.filename ? "Loading..." : "Load File"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-100">
                    <p className="text-[11px] text-slate-400 italic">
                      ဆာဗာ workspace root ထဲတွင် မည်သည့် dictionary .txt ဖိုင်မျှ မတွေ့သေးပါ။ Code sidebar တွင် file ကိုတင်ပြီး refresh လုပ်နိုင်သည်။
                    </p>
                  </div>
                )}
              </div>

              {/* Debug Parse Details */}
              {parserDebugInfo && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    📜 Parsing Debug Info
                  </div>
                  <div>- ဖိုင်အကြောင်းရေစုစုပေါင်း: <b className="text-slate-800">{parserDebugInfo.totalLines.toLocaleString()} lines</b></div>
                  <div>- အဘိဓာန်အညွှန်းပေါင်း: <b className="text-emerald-600">{parserDebugInfo.parsedCount.toLocaleString()} words matched</b></div>
                  <div className="border-t border-slate-200/60 pt-2 mt-1">
                    <span className="font-semibold block mb-1 text-[10px] text-slate-400 uppercase">စကားလုံး နမူနာ ၅ ခု-</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-500 font-mono text-[11px] break-all">
                      {parserDebugInfo.sampleEntries.map((sm, i) => (
                        <li key={i}>{sm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Translation History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    ယခင်ရှာဖွေမှုမှတ်တမ်း (Recent History)
                  </h3>
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-rose-500 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                  >
                    မှတ်တမ်းဖြတ်ပါ
                  </button>
                </div>

                <div className="space-y-2.5 divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                  {history.map((hist) => (
                    <div 
                      key={hist.id} 
                      className="pt-2.5 first:pt-0 cursor-pointer group"
                      onClick={() => {
                        setInputText(hist.originalText);
                        setTranslationResult({
                          translation: hist.translation,
                          words: hist.words,
                        });
                      }}
                    >
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 truncate">
                        {hist.originalText}
                      </p>
                      <p className="text-xs text-emerald-600 truncate mt-0.5">
                        {hist.translation}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(hist.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
