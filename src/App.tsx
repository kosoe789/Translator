import React, { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { 
  BookOpen, 
  Upload, 
  Download,
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
  Star,
  Settings,
  Key,
  Eye,
  EyeOff,
  Clipboard,
  Link as LinkIcon,
  Globe,
  CloudLightning,
  DownloadCloud,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  Compass,
  ArrowUp,
  Volume2,
  Trophy,
  Plus,
  Edit,
  Save,
  Edit3,
  Mic,
  MicOff,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DictionaryEntry, WorkspaceFile, AnalyzedWord, HistoryItem, BookmarkedWord, StudyNote } from "./types";
import { auth, googleProvider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User, GoogleAuthProvider } from "firebase/auth";

const FAIR_THEMES = [
  { id: "Cinderella", name: "Cinderella", icon: "👑", desc: "ကြင်နာတတ်သော ကောင်မလေးနှင့် မှော်ဖိနပ်" },
  { id: "Snow White", name: "Snow White", icon: "🍎", desc: "နှင်းဖွေးမလေးနှင့် ချစ်စရာပုပုလေးခုနစ်ဖော်" },
  { id: "Aladdin", name: "Aladdin", icon: "🧞", desc: "အာလာဒင်နှင့် မှော်မီးခွက်ဆန်း" },
  { id: "Sleeping Beauty", name: "Sleeping Beauty", icon: "🌹", desc: "ရာစုနှစ်ကြာ အိပ်ပျော်နေသော မင်းသမီးလေး" },
  { id: "Robin Hood", name: "Robin Hood", icon: "🏹", desc: "ဆင်းရဲသားတို့ကို ကူညီသော တောဓားပြ ရော်ဘင်ဂုဒ်" },
  { id: "Little Red Riding Hood", name: "Little Red Riding Hood", icon: "🐺", desc: "ဝံပုလွေဆိုးကို ကြုံတွေ့ခဲ့ရသော ဦးထုပ်နီလေး" },
  { id: "Alice in Wonderland", name: "Alice in Wonderland", icon: "🐇", desc: "အံ့ဖွယ်ကမ္ဘာထဲ ရောက်ရှိသွားသော အဲလစ်" },
  { id: "Jack and the Beanstalk", name: "Jack and the Beanstalk", icon: "🌱", desc: "ပဲပင်ဧရာမနှင့် ဘီလူးကြီး" },
  { id: "The Little Mermaid", name: "The Little Mermaid", icon: "🧜‍♀️", desc: "ချစ်ခြင်းအတွက် အသံသန္ဓေပေးခဲ့သော ရေသူမလေး" },
];

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

// Resilient safeLocalStorage wrapper to prevent DOMException / SecurityError crashes in sandbox/iframes or private mode
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage is not accessible, using temporary session fallback:", e);
      return (window as any).__fallback_storage?.[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage is not accessible, using temporary session fallback:", e);
      if (!(window as any).__fallback_storage) {
        (window as any).__fallback_storage = {};
      }
      (window as any).__fallback_storage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage is not accessible, using temporary session fallback:", e);
      if ((window as any).__fallback_storage) {
        delete (window as any).__fallback_storage[key];
      }
    }
  }
};

// IndexedDB parameters
const DB_NAME = "EMDictionaryDB";
const STORE_NAME = "dictionary_store";
const HISTORY_STORE_NAME = "history_store";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Upgrade to version 2 to create the history_store object store
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "word" });
      }
      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        db.createObjectStore(HISTORY_STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveHistoryToIndexedDB(historyList: HistoryItem[]): Promise<void> {
  return openDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE_NAME, "readwrite");
      const store = tx.objectStore(HISTORY_STORE_NAME);
      store.put({ key: "history_list", data: historyList });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }).catch((err) => {
    console.warn("Failed to write history list to IndexedDB:", err);
  });
}

function loadHistoryFromIndexedDB(): Promise<HistoryItem[]> {
  return openDB().then((db) => {
    return new Promise<HistoryItem[]>((resolve, reject) => {
      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        resolve([]);
        return;
      }
      const tx = db.transaction(HISTORY_STORE_NAME, "readonly");
      const store = tx.objectStore(HISTORY_STORE_NAME);
      const request = store.get("history_list");
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? (result.data || []) : []);
      };
      request.onerror = () => reject(request.error);
    });
  }).catch((err) => {
    console.warn("Failed to read history list from IndexedDB fallback:", err);
    return [];
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

// Resilient fetch helper to automatically handle transient network/proxy errors like 'Failed to fetch' or cold-start timeouts
async function resilientFetch(input: RequestInfo | URL, init?: RequestInit, retries = 5, delay = 1500): Promise<Response> {
  let lastError: any = null;
  let currentDelay = delay;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(input, init);
      // Automatically retry on temporary gateway or server overloaded statuses
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(`Server returned temporary status ${response.status}`);
      }
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Fetch to ${input} attempt ${i + 1} failed: ${err.message || err}. Retrying in ${currentDelay}ms...`);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= 1.8; // Backoff
      }
    }
  }
  throw lastError || new Error(`Failed to fetch ${input} after ${retries} attempts.`);
}

const FORBIDDEN_WORDS_SET = new Set([
  "a", "an", "the",
  "i", "me", "my", "mine", "myself", "we", "us", "our", "ours", "ourselves", 
  "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", 
  "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", 
  "theirs", "themselves", "this", "that", "these", "those", "who", "whom", "whose", 
  "which", "what", "any", "some", "someone", "somebody", "something", "anybody", 
  "anyone", "anything", "nobody", "noone", "nothing", "everyone", "everybody", "everything",
  "of", "to", "in", "for", "on", "with", "at", "by", "from", "up", "about", "into", "over", 
  "after", "during", "through", "before", "between", "under", "along", "behind", "down", "off", 
  "out", "since", "until", "upon", "within", "without", "above", "across", "against", "alongside", 
  "among", "around", "below", "beneath", "beside", "besides", "beyond", "except", "inside", 
  "near", "outside", "past", "throughout", "toward", "towards", "underneath",
  "am", "is", "are", "was", "were", "be", "been", "being", 
  "have", "has", "had", "having", "do", "does", "did", "doing", "done",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must", "ought",
  "to"
]);

const FORBIDDEN_POS_SET = new Set([
  "PRON", "PRONOUN", "PREP", "PREPOSITION", "DET", "ARTICLE", "AUX", "AUXILIARY", "MODAL", "CONJ", "CONJUNCTION", "PART", "PARTICLE"
]);

const cleanDictionaryText = (str: string | null): string => {
  if (!str) return "";
  
  // Normalize and replace any dynamic line breaks within bracket pairs
  let cleaned = str;
  cleaned = cleaned.replace(/\[\s*\r?\n\s*(IDM|PHRV|idm|phrv)\s*\r?\n\s*\]/gi, (match, p1) => {
    return ` [${p1.toUpperCase()}] `;
  });
  
  cleaned = cleaned.replace(/\[\s*\r?\n\s*/g, " [");
  cleaned = cleaned.replace(/\s*\r?\n\s*\]/g, "] ");
  cleaned = cleaned.replace(/\(\s*\r?\n\s*/g, " (");
  cleaned = cleaned.replace(/\s*\r?\n\s*\)/g, ") ");
  
  const lines = cleaned.split(/\r?\n/);
  const processed: string[] = [];
  
  const isMetaTag = (s: string) => {
    const t = s.trim().toLowerCase();
    return (
      t === "idm" ||
      t === "phrv" ||
      t === "infml" ||
      t === "v" ||
      t === "n" ||
      t === "adj" ||
      t === "adv" ||
      t === "prep" ||
      t === "conj" ||
      t === "pron" ||
      t === "brackets" ||
      t === "[" ||
      t === "]" ||
      t === "(" ||
      t === ")"
    );
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      processed.push("");
      continue;
    }
    
    if (processed.length > 0 && isMetaTag(line)) {
      let prevIdx = processed.length - 1;
      while (prevIdx >= 0 && processed[prevIdx] === "") {
        prevIdx--;
      }
      if (prevIdx >= 0) {
        processed[prevIdx] = (processed[prevIdx] + " " + line).trim();
        continue;
      }
    }
    processed.push(line);
  }
  
  const joinedLines: string[] = [];
  for (let i = 0; i < processed.length; i++) {
    const line = processed[i];
    if (line === "" && joinedLines.length > 0 && joinedLines[joinedLines.length - 1] === "") {
      continue;
    }
    joinedLines.push(line);
  }
  
  let result = joinedLines.join("\n").trim();
  result = result.replace(/ +/g, " ");
  result = result.replace(/ \]/g, "]");
  result = result.replace(/ \)/g, ")");
  result = result.replace(/\[ /g, "[");
  result = result.replace(/\( /g, "(");
  
  if (result && !result.startsWith("▪️") && !result.startsWith("▪")) {
    result = "▪️ " + result;
  }
  
  return result;
};

const renderHoverableText = (str: string, parentKey: string | number): React.ReactNode => {
  const tokens = str.split(/(\s+)/g);
  return (
    <React.Fragment key={parentKey}>
      {tokens.map((token, index) => {
        if (!token.trim()) {
          return token;
        }
        return (
          <span
            key={index}
            className="hover:bg-red-100 hover:text-red-900 duration-100 rounded px-0.5 transition-colors inline"
          >
            {token}
          </span>
        );
      })}
    </React.Fragment>
  );
};

const renderTextWithBadges = (text: string | null, isDictionary: boolean = false): React.ReactNode => {
  if (!text) return null;
  const processedText = isDictionary ? cleanDictionaryText(text) : text;
  const parts = processedText.split(/(\[IDM\]|\[PHRV\])/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part === "[IDM]") {
          return (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] uppercase font-extrabold mx-1 align-middle select-all selection:bg-amber-200"
              title="Idiomic Expression"
            >
              [IDM]
            </span>
          );
        } else if (part === "[PHRV]") {
          return (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] uppercase font-extrabold mx-1 align-middle select-all selection:bg-cyan-200"
              title="Phrasal Verb"
            >
              [PHRV]
            </span>
          );
        }
        return renderHoverableText(part, index);
      })}
    </>
  );
};

export default function App() {
  // Inputs
  const [inputText, setInputText] = useState("");
  const [isAnalyzingBreakdown, setIsAnalyzingBreakdown] = useState(false);
  const [breakdownResult, setBreakdownResult] = useState<{
    overallContext: string;
    lineBreakdowns: { segment: string; meaning: string; explanation: string }[];
  } | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Synchronize translator inputText with Smart Reader readerText
  useEffect(() => {
    setReaderText(inputText);
    setReaderIdioms([]); // clear scan results on changes
  }, [inputText]);

  // Initialize Speech Recognition on boot
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsListening(false);
        if (event.error === "not-allowed") {
          showError("မိုက်ကရိုဖုန်း အသုံးပြုခွင့်ကို browser ဆက်တင်တွင် ခွင့်ပြုပေးပါ!");
        } else if (event.error !== "no-speech") {
          showError(`အသံဖမ်းစနစ် မှားယွင်းမှု ဖြစ်ပေါ်ပါသည်: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setInputText((prev) => {
            const separator = prev.trim() ? " " : "";
            return prev + separator + transcript;
          });
          showSuccess("အသံကို စာသားအဖြစ် ပြောင်းလဲထည့်သွင်းပြီးပါပြီ။");
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListening = (lang: "en-US" | "my-MM") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !recognitionRef.current) {
      showError("ဤစက် သို့မဟုတ် Browser တွင် အသံဖြင့်စာရိုက်စနစ် (Speech-to-Text) ကို မထောက်ပံ့ပါ။ Google Chrome သုံးရန် အကြံပြုပါသည်ဗျာ။");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Stop listening error:", err);
      }
    } else {
      setListeningLang(lang);
      recognitionRef.current.lang = lang;
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Start listening error:", err);
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"not_configured" | "synced" | "syncing" | "error" | "unauthorized">("not_configured");
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const isSyncingRef = useRef(false);
  const isTranslatingRef = useRef(false);
  const isSyncingStateRef = useRef(false);
  const isWipingRef = useRef(false);
  const pendingSyncHistoryRef = useRef<HistoryItem[] | null>(null);
  const pendingSyncNotebooksRef = useRef<any[] | null>(null);
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

  // Smart Reader / Storyteller States
  const [activeMainMode, setActiveMainMode] = useState<"translator" | "reader">("translator");
  const [readerText, setReaderText] = useState("");
  const [readerTitle, setReaderTitle] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [readerTextSize, setReaderTextSize] = useState<"normal" | "medium" | "large">("medium");
  const [readerIdioms, setReaderIdioms] = useState<{ phrase: string; type: "IDM" | "PHRV"; meaning: string; startIndex: number; endIndex: number }[]>([]);
  const [isScanningIdioms, setIsScanningIdioms] = useState(false);
  const [translationIdioms, setTranslationIdioms] = useState<{ phrase: string; type: "IDM" | "PHRV"; meaning: string }[]>([]);
  const [isScanningTranslationIdioms, setIsScanningTranslationIdioms] = useState(false);

  // Storyteller (Storytelling Method) States
  const [selectedSampleNotebookId, setSelectedSampleNotebookId] = useState<string>("");
  const [activeStudyTab, setActiveStudyTab] = useState<"fairytale" | "flashcard" | "quiz" | "coach">("fairytale");
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState<number>(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState<boolean>(false);
  const [flashcardViewMode, setFlashcardViewMode] = useState<"standard" | "immersive">("standard");
  const [flashcardOrientation, setFlashcardOrientation] = useState<"portrait" | "landscape">("portrait");
  const [flashcardStartSide, setFlashcardStartSide] = useState<"en" | "my">("en");
  const [storyQuizScore, setStoryQuizScore] = useState<number>(0);
  const [quizSelectionSeed, setQuizSelectionSeed] = useState<number>(0); // for regenerating options
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);
  const [quizChecked, setQuizChecked] = useState<boolean>(false);

  const [customNotebooks, setCustomNotebooks] = useState<{ id: string; title: string; content: string }[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("em_custom_notebooks");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "fairytale",
        title: "Fairytale Idioms (ပုံပြင်ဆင်ရန် ဝေါဟာရစုများ)",
        content: `started off
PHRV
စတင်ဖြစ်ပေါ်ခဲ့သည်၊ အစပြုခဲ့သည်။

got a life of its own
IDM
သူ့အလိုလို အရှိန်အဟုန်ရလာပြီး ပိုမိုကျယ်ပြန့်လာသည်။

absence makes the heart grow fonder
IDM
ဝေးကွာနေရခြင်းက ပို၍ သံယောဇဉ်တိုးစေသည်။

hang around
PHRV
အချိန်ဖြုန်းကာ လျှောက်သွားနေသည်၊ တစ်ဝဲလည်လည် လုပ်နေသည်။

cream of the crop
IDM
အကောင်းဆုံးထဲက အကောင်းဆုံး။

by and large
IDM
ခြုံငုံပြောရလျှင်၊ ယေဘုယျအားဖြင့်။

the real deal
IDM
အတုအယောင်မဟုတ်သော အစစ်အမှန်။

go out of your way
IDM
တကူးတက သွားရသည်၊ အထူးတလည် အားထုတ်လုပ်ဆောင်ရသည်။

spills out
PHRV
ပြည့်လျှံထွက်လာသည်၊ (လူအုပ်) အပြင်ဘက်အထိ လျှံထွက်လာသည်။

make a big deal
IDM
အရေးတကြီး ကิစ္စတစ်ခုလို အကြီးအကျယ် လုပ်သည်။

hands-down
IDM
အပြတ်အသတ်၊ သံသယဖြစ်စရာမလိုဘဲ။

sign up
PHRV
စာရင်းသွင်းသည်၊ အမည်စာရင်းပေးသွင်းသည်။`
      },
      {
        id: "ielts_business",
        title: "IELTS & Business English (အဆင့်မြင့် စီးပွားရေးသုံး စကားလုံးများ)",
        content: `spearhead
Verb
ဦးဆောင်လမ်းပြသည်၊ ရှေ့ဆောင်ပြုလုပ်သည်။

turn a blind eye
IDM
သိလျက်နှင့် မသိချင်ယောင်ဆောင်နေသည်။

keep in the loop
IDM
အခြေအနေအရပ်ရပ်ကို အမြဲအသိပေးထားသည်။

run into a brick wall
IDM
တတိုးမပေါက်သော အခက်အခဲကြီးနှင့် ရင်ဆိုင်ရသည်။

pave the way
IDM
လမ်းခင်းပေးသည်၊ အဆင်ပြေအောင် ခြေလှမ်းပြင်ပေးသည်။

think outside the box
IDM
ဘောင်ကျော်တွေးသည်၊ ဖန်တီးမှုအပြည့်ဖြင့် ဆန်းသစ်တွေးခေါ်သည်။

streamline
Verb
လုပ်ငန်းစဉ်ကို ပိုမိုမြန်ဆန်ချောမွေ့အောင် ပြုလုပ်သည်။

cut corners
IDM
စရိတ် သို့မဟုတ် အချိန်သက်သာစေရန် စည်းကမ်းကျော်လုပ်သည်။`
      },
      {
        id: "daily_phrasals",
        title: "Daily Conversation (နေ့စဉ်သုံး စကားတွဲနှင့် စကားစုများ)",
        content: `look forward to
PHRV
မျှော်လင့်တကြီး စောင့်စားနေသည်။

run out of
PHRV
ကုန်သွားသည်၊ ပြတ်လပ်သွားသည်။

bring about
PHRV
ဖြစ်ပေါ်စေသည်၊ အပြောင်းအလဲများ ယူဆောင်လာသည်။

call off
PHRV
ဖျက်သိမ်းသည်၊ ပယ်ဖျက်သည်။

figure out
PHRV
အဖြေရှာဖွေတွေ့ရှိသည်၊ နားလည်သဘောပေါက်သွားသည်။

get over
PHRV
(စိတ်ထိခိုက်မှု၊ နေမကောင်းမှု) မှ ပြန်လည်သက်သာလာသည်။

give up
PHRV
လက်လျှော့သည်၊ အရှုံးပေးသည်။

make up your mind
IDM
ဆုံးဖြတ်ချက်ချသည်၊ စိတ်ပိုင်းဖြတ်သည်။`
      }
    ];
  });

  const [storyNotes, setStoryNotes] = useState<string>("");

  const [newNotebookTitle, setNewNotebookTitle] = useState<string>("Untitled Note");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  const handleAutoCollectSelectedText = async () => {
    if (!selectedText) return;

    // Copy to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(selectedText);
      }
    } catch (e) {
      console.warn("Clipboard copy failed, continuing app storage...", e);
    }

    // Find the right Note in studyNotes (ကိုယ်ပိုင်မှတ်စု in Translator)
    // Always target the LAST note of the studyNotes array (the bottom-most/oldest note in the list as requested)
    let targetNote = studyNotes.length > 0 ? studyNotes[studyNotes.length - 1] : null;
    let targetId = targetNote ? targetNote.id : null;

    if (!targetNote) {
      // Create a brand new note inside ကိုယ်ပိုင်မှတ်စု
      const newId = "note_" + Date.now().toString(36);
      const newNote: StudyNote = {
        id: newId,
        title: "ကိုယ်ပိုင်မှတ်စု (My Study Note)",
        content: selectedText,
        timestamp: Date.now()
      };
      setStudyNotes(prev => [...prev, newNote]);
      setSelectedNoteId(newId);
      showSuccess(`"${newNote.title}" ကိုယ်ပိုင်မှတ်စုအသစ် ဖွင့်လှစ်ပြီး စာသားကို စတင်သိမ်းဆည်းလိုက်ပါပြီ။`);
    } else {
      // Append strictly to the last note item in the array
      const updatedNotes = studyNotes.map(n => {
        if (n.id === targetId) {
          const separator = n.content.trim() ? "\n\n" : "";
          return {
            ...n,
            content: n.content + separator + selectedText,
            timestamp: Date.now()
          };
        }
        return n;
      });

      setStudyNotes(updatedNotes);
      setSelectedNoteId(targetId);
      showSuccess(`"${targetNote.title}" (နောကျဆုံးအခနျးမှတျစု) ထဲသို့ စာသားအသစ်ကို ပေါင်းထည့်ပြီးပါပြီ။`);
    }

    setSelectionCoords(null);
    setSelectedText("");
  };

  const updateStoryNotes = (newNotes: string) => {
    setStoryNotes(newNotes);
    if (selectedSampleNotebookId) {
      setCustomNotebooks(prev => prev.map(nb => {
        if (nb.id === selectedSampleNotebookId) {
          return { ...nb, content: newNotes, lastUpdated: Date.now() };
        }
        return nb;
      }));
    }
  };

  useEffect(() => {
    try {
      safeLocalStorage.setItem("em_custom_notebooks", JSON.stringify(customNotebooks));
    } catch (e) {
      console.error(e);
    }
  }, [customNotebooks]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem("em_storyteller_active_notes", storyNotes);
    } catch (e) {
      console.error(e);
    }
  }, [storyNotes]);
  const [storyTheme, setStoryTheme] = useState<string>("Cinderella");
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [storyFontSize, setStoryFontSize] = useState<number>(16);
  const [copiedEnglishStory, setCopiedEnglishStory] = useState<boolean>(false);
  const [copiedMyanmarStory, setCopiedMyanmarStory] = useState<boolean>(false);
  const [coachHistory, setCoachHistory] = useState<Array<{ role: "user" | "model" | "assistant"; text: string }>>([
    {
      role: "model",
      text: "မင်္ဂလာပါရှင်! ဆရာမ AI (Sayarma AI) ဖြစ်ပါတယ်ရှင်။ 💖\n\nဒီနေရာမှာ ဆရာမကို အင်္ဂလိပ်စာနဲ့ ပတ်သက်ပြီး စာမေးလို့ရသလို၊ သိချင်တာတွေ ရှင်းပြခိုင်းလို့လည်း ရပါတယ်ရှင်။\n\n📌 **ဘာတွေလုပ်လို့ရလဲဆိုရင် -**\n၁။ ဆရာမကို ဉာဏ်စမ်းမေးခွန်း မေးခိုင်းပြီး ဖြေဆိုလေ့ကျင့်နိုင်ပါတယ်။\n၂။ မိမိလေ့လာနေတဲ့ Vocabulary မှတ်စုတွေထဲက စကားလုံးတွေကို ဥပမာဝါကျနဲ့တကွ ရှင်းပြခိုင်းနိုင်ပါတယ်။\n\nဘယ်အရာကို အတူတူ လေ့လာကြမလဲရှင်?"
    }
  ]);
  const [coachInput, setCoachInput] = useState<string>("");
  const [isCoachThinking, setIsCoachThinking] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<{
    storyTitle: string;
    fairytaleTheme: string;
    storyIntroduction: string;
    storyParagraphs: string[];
    englishStoryParagraphs?: string[];
    vocabularyInsights: {
      term: string;
      type: string;
      meaning: string;
      contextualUse: string;
    }[];
  } | null>(null);

  // Parse vocabulary notes dynamically at Top Level to prevent Rule of Hooks violations inside sub-renders
  const parsedCards = React.useMemo(() => {
    const cards: { term: string; type: string; meaning: string }[] = [];
    if (storyNotes && storyNotes.trim()) {
      const blocks = storyNotes.split(/\n\s*\n/);
      for (const block of blocks) {
        const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          let term = lines[0].replace(/🚀/g, "").trim();
          let type = lines[1];
          let meaning = lines[2] || "";
          
          if (lines.length === 2) {
            type = "VOCAB";
            meaning = lines[1];
          }
          cards.push({ term, type, meaning });
        }
      }
    }
    return cards;
  }, [storyNotes]);

  const activeQuizCard = parsedCards.length > 0 ? parsedCards[currentFlashcardIdx % parsedCards.length] : null;

  const quizOptions = React.useMemo(() => {
    if (!activeQuizCard || parsedCards.length === 0) return [];
    const options = new Set<string>();
    options.add(activeQuizCard.meaning);
    const otherCards = parsedCards.filter(c => c.meaning !== activeQuizCard.meaning);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
    for (const card of shuffledOthers) {
      options.add(card.meaning);
      if (options.size >= 4) break;
    }
    return Array.from(options).sort();
  }, [activeQuizCard, parsedCards, quizSelectionSeed]);

  // Splits text into a basic list of words as fallback if a translation doesn't have the segmented words array (e.g. older backups)
  const getWordsFromText = (text: string): { original: string; base: string; pos: string; fallback_my: string }[] => {
    if (!text) return [];

    // Split by letters, numbers, apostrophes, and hyphens to preserve words like don't or state-of-the-art
    const rawWords = text.match(/[A-Za-z0-9'-]+/g) || [];
    const seen = new Set<string>();
    const result: { original: string; base: string; pos: string; fallback_my: string }[] = [];

    for (const word of rawWords) {
      const cleaned = word.trim()
        .replace(/^[.,\/#!$%\^&\*;:{}=\_`~()?"'’‘“”•*]+|[.,\/#!$%\^&\*;:{}=\_`~()?"'’‘“”•*]+$/g, "")
        .trim();
      
      if (!cleaned) continue;
      
      const lowerCleaned = cleaned.toLowerCase();
      if (FORBIDDEN_WORDS_SET.has(lowerCleaned)) {
        continue;
      }

      if (!seen.has(lowerCleaned)) {
        seen.add(lowerCleaned);
        result.push({
          original: cleaned,
          base: lowerCleaned,
          pos: "",
          fallback_my: "",
        });
      }
    }
    return result;
  };

  // Strips the huge dictionary_definition string from persistent storage to keep payload sizes tiny and avoid localStorage quota limit errors (5MB)
  // Also permanently purges deleted items so that "Clear" / "Delete" actions are final and never backed up/restored to/from Google Drive.
  const sanitizeHistoryItems = (items: HistoryItem[]): HistoryItem[] => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (!item) return null;
        if (item.isDeleted) {
          return {
            id: item.id,
            originalText: item.originalText,
            translation: item.translation,
            isBookmarked: item.isBookmarked ?? false,
            isDeleted: true,
            timestamp: item.timestamp,
            words: []
          };
        }

        // Reconstruct words list if it's missing or empty so that dynamic definitions can be looked up on click
        const finalWords = (item.words && item.words.length > 0)
          ? item.words
          : getWordsFromText(item.originalText);

        return {
          ...item,
          words: finalWords.map((w: any) => {
            const { dictionary_definition, ...rest } = w;
            return rest;
          }),
        };
      })
      .filter((item): item is HistoryItem => item !== null);
  };

  // History / Logs with local persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("em_translator_history");
      return saved ? sanitizeHistoryItems(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  // Vocabulary Bookmarks (Wordbook) state
  const [bookmarkedWords, setBookmarkedWords] = useState<BookmarkedWord[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("em_translator_bookmarked_words");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [bookmarkedTab, setBookmarkedTab] = useState<"words" | "sentences">("sentences");
  const [bookmarkWordsSearch, setBookmarkWordsSearch] = useState<string>("");
  const [expandedBookmarkWordId, setExpandedBookmarkWordId] = useState<string | null>(null);

  const latestHistoryRef = useRef<HistoryItem[]>(history);
  latestHistoryRef.current = history;
  const latestNotebooksRef = useRef<any[]>(customNotebooks);
  latestNotebooksRef.current = customNotebooks;
  const hasDoneInitialSyncRef = useRef<boolean>(false);

  // Collapsed / Hide states for translation translationResult and breakdownResult
  const [isTranslationCollapsed, setIsTranslationCollapsed] = useState(false);
  const [isBreakdownCollapsed, setIsBreakdownCollapsed] = useState(false);

  // Custom words dropdown states and refs
  const [isWordsDropdownOpen, setIsWordsDropdownOpen] = useState(false);
  const wordsDropdownRef = useRef<HTMLDivElement>(null);
  const wordsListContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wordsDropdownRef.current && !wordsDropdownRef.current.contains(event.target as Node)) {
        setIsWordsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isWordsDropdownOpen) {
      const scrollTimer = setTimeout(() => {
        if (wordsListContainerRef.current) {
          const selectedElement = wordsListContainerRef.current.querySelector('[data-selected="true"]') as HTMLElement | null;
          if (selectedElement) {
            // Scroll to selected element's offsetTop minus a safe margin (e.g. 12px)
            // so that it is beautifully visible at the top, colored in red
            wordsListContainerRef.current.scrollTop = Math.max(0, selectedElement.offsetTop - 12);
          }
        }
      }, 50); // Small delay to let absolute dropdown finish rendering and layouting
      return () => clearTimeout(scrollTimer);
    }
  }, [isWordsDropdownOpen, selectedWordIndex]);

  useEffect(() => {
    const sanitized = sanitizeHistoryItems(history);
    latestHistoryRef.current = sanitized;
    try {
      safeLocalStorage.setItem("em_translator_history", JSON.stringify(sanitized));
    } catch (err) {
      console.error("Failed to save history to localStorage:", err);
    }
    // Double-write to IndexedDB for offline durability in partitioned sandboxed frames
    saveHistoryToIndexedDB(sanitized);
  }, [history]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem("em_translator_bookmarked_words", JSON.stringify(bookmarkedWords));
    } catch (err) {
      console.error("Failed to save bookmarked words to localStorage:", err);
    }
  }, [bookmarkedWords]);



  // Load initial history from IndexedDB on startup (bypasses iframe sandbox localStorage wiped on re-load issue)
  useEffect(() => {
    loadHistoryFromIndexedDB()
      .then((idbHistory) => {
        if (idbHistory && idbHistory.length > 0) {
          const sanitizedIdb = sanitizeHistoryItems(idbHistory);
          setHistory((prev) => {
            const existingIds = new Set(prev.map(x => x.id));
            const merged = [...prev];
            let addedCount = 0;
            sanitizedIdb.forEach(item => {
              if (!existingIds.has(item.id)) {
                merged.push(item);
                addedCount++;
              }
            });
            if (addedCount > 0) {
              console.log(`[IndexedDB] Restored ${addedCount} historical/bookmark items into session.`);
              return sanitizeHistoryItems(merged).sort((a, b) => b.timestamp - a.timestamp);
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to execute early IndexedDB history restore:", err);
      });
  }, []);

  useEffect(() => {
    isTranslatingRef.current = isTranslating;
  }, [isTranslating]);

  useEffect(() => {
    isSyncingStateRef.current = isSyncing;
  }, [isSyncing]);

  // UI helper alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Hover original English sentence popup states
  const [activeHoveredSentenceIndex, setActiveHoveredSentenceIndex] = useState<number | null>(null);
  const [hoveredSentencePosition, setHoveredSentencePosition] = useState<{ x: number; y: number } | null>(null);
  const [sentenceCopied, setSentenceCopied] = useState(false);
  const [isHoveringPopup, setIsHoveringPopup] = useState(false);
  const sentenceHoverTimeoutRef = useRef<any>(null);

  // Flashcards state
  const [flashcardModeActive, setFlashcardModeActive] = useState(false);
  const [flashcardsList, setFlashcardsList] = useState<BookmarkedWord[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const startFlashcardsSession = () => {
    if (bookmarkedWords.length === 0) {
      showError("စကားလုံးစာအုပ်ငယ်တွင် စကားလုံးမှတ်သားထားခြင်း မရှိသေးပါ။ ရှေးဦးစွာ စကားလုံးအချို့ကို သတ်မှတ်သိမ်းဆည်းပေးပါ။");
      return;
    }
    const shuffled = [...bookmarkedWords].sort(() => Math.random() - 0.5);
    setFlashcardsList(shuffled);
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
    setFlashcardModeActive(true);
    showSuccess("Flashcard (အလွတ်ကျက်စနစ်) ကို စတင်လိုက်ပါပြီ။ လေ့ကျင့်နိုင်ပါပြီဗျာ။");
  };

  const handleExportWordsCSV = () => {
    if (bookmarkedWords.length === 0) {
      showError("တင်ပို့စရာ ဝေါဟာရစကားလုံး မရှိသေးပါ။");
      return;
    }
    
    const headers = ["Original Word", "Base Dictionary Word", "Part of Speech", "Myanmar Translation-Definition"];
    const csvRows = [headers.join(",")];
    
    bookmarkedWords.forEach(item => {
      const orig = `"${(item.original || "").replace(/"/g, '""')}"`;
      const base = `"${(item.base || "").replace(/"/g, '""')}"`;
      const pos = `"${(item.pos || "").replace(/"/g, '""')}"`;
      const def = `"${(item.definition || "").replace(/"/g, '""')}"`;
      csvRows.push([orig, base, pos, def].join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vocab_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("ဝေါဟာရစကားလုံးမှတ်စုများကို Excel/CSV (UTF-8) ဖိုင်အဖြစ် အောင်မြင်စွာ တင်ပို့သိမ်းဆည်းလိုက်ပါပြီ။");
  };
  const [copiedTranslation, setCopiedTranslation] = useState(false);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Admin upload states for Server dictionary files
  const [passcode, setPasscode] = useState<string>(() => safeLocalStorage.getItem("admin_passcode") || "");
  
  // Persist passcode changes to localStorage
  useEffect(() => {
    safeLocalStorage.setItem("admin_passcode", passcode);
  }, [passcode]);

  const [isUploadingToServer, setIsUploadingToServer] = useState(false);
  const [isDeletingFromServer, setIsDeletingFromServer] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  
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
  
  // Voice input recognition states
  const [isListening, setIsListening] = useState(false);
  const [listeningLang, setListeningLang] = useState<"en-US" | "my-MM">("en-US");
  const recognitionRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Tab State for right-sidebar content
  const [activeRightTab, setActiveRightTab] = useState<"vocab" | "quiz" | "search" | "bookmarks" | "history" | "settings" | "notes">("vocab");

  // Study Notes states
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>(() => {
    try {
      const stored = safeLocalStorage.getItem("em_translator_study_notes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [searchNoteQuery, setSearchNoteQuery] = useState("");
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Floating quick note-pad states
  const [isFloatingNotesOpen, setIsFloatingNotesOpen] = useState(false);
  const [floatingNoteId, setFloatingNoteId] = useState<string>("new");
  const [floatingNoteTitle, setFloatingNoteTitle] = useState("");
  const [floatingNoteContent, setFloatingNoteContent] = useState("");

  useEffect(() => {
    if (floatingNoteId === "new") {
      setFloatingNoteTitle("");
      setFloatingNoteContent("");
    } else {
      const active = studyNotes.find(n => n.id === floatingNoteId);
      if (active) {
        setFloatingNoteTitle(active.title);
        setFloatingNoteContent(active.content);
      }
    }
  }, [floatingNoteId, studyNotes]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem("em_translator_study_notes", JSON.stringify(studyNotes));
    } catch (err) {
      console.error("Failed to save study notes to localStorage:", err);
    }
  }, [studyNotes]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection) return;

      const text = selection.toString().trim();
      if (!text || text.length <= 1) {
        setSelectionCoords(null);
        setSelectedText("");
        return;
      }

      // Check if current focused/active element is input, textarea or contenteditable
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || (activeEl as HTMLElement).isContentEditable)) {
        setSelectionCoords(null);
        setSelectedText("");
        return;
      }

      try {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rects = range.getClientRects();
          if (rects.length > 0) {
            const rect = rects[0];
            setSelectionCoords({
              x: rect.left + rect.width / 2 + window.scrollX,
              y: rect.top - 46 + window.scrollY
            });
            setSelectedText(text);
          }
        }
      } catch (err) {
        console.warn("Selection calculation failed", err);
      }
    };

    const onTrigger = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".selection-copy-btn")) return;
      setTimeout(() => handleSelectionChange(), 10);
    };

    document.addEventListener("mouseup", onTrigger);
    document.addEventListener("touchend", onTrigger);
    return () => {
      document.removeEventListener("mouseup", onTrigger);
      document.removeEventListener("touchend", onTrigger);
    };
  }, [studyNotes, selectedNoteId]);

  // Handle Quick Pad Inserts
  const handleAppendCurrentTranslation = () => {
    if (!inputText || !translationResult) {
      showError("ထည့်သွင်းရန် ဘာသာပြန်ချက် မရှိသေးပါ။");
      return;
    }
    const appendText = `\n\n📌 [ဘာသာပြန်ချက်]\nEn: ${inputText.trim()}\nMy: ${translationResult.translation}`;
    setFloatingNoteContent(prev => prev ? prev + appendText : appendText.trim());
    showSuccess("ဘာသာပြန်ချက်အား မှတ်စုထဲသို့ ထည့်သွင်းပြီးပါပြီ။");
  };

  const handleAppendSelectedVocabulary = () => {
    if (!translationResult || !translationResult.words || translationResult.words.length === 0) {
      showError("ထည့်သွင်းရန် ရွေးချယ်ထားသော စကားလုံး မရှိသေးပါ။");
      return;
    }
    const wordObj = translationResult.words[selectedWordIndex] || translationResult.words[0];
    if (!wordObj) return;
    
    const defClean = wordObj.dictionary_definition || wordObj.fallback_my || "";
    const appendText = `\n\n📖 Vocab: ${wordObj.original} (${wordObj.pos})\nMeaning: ${defClean}`;
    setFloatingNoteContent(prev => prev ? prev + appendText : appendText.trim());
    showSuccess(`စကားလုံး "${wordObj.original}" အား မှတ်စုထဲသို့ ထည့်သွင်းပြီးပါပြီ။`);
  };

  const handleSaveFloatingNote = () => {
    if (floatingNoteId === "new") {
      const title = floatingNoteTitle.trim() || `မှတ်စု - ${new Date().toLocaleDateString("en-US")}`;
      const newNote: StudyNote = {
        id: Date.now().toString(),
        title,
        content: floatingNoteContent,
        timestamp: Date.now()
      };
      setStudyNotes(prev => [newNote, ...prev]);
      setFloatingNoteId(newNote.id);
      showSuccess("မှတ်စုအသစ်ကို သိမ်းဆည်းပြီးပါပြီ။");
    } else {
      setStudyNotes(prev => prev.map(note => note.id === floatingNoteId ? {
        ...note,
        title: floatingNoteTitle.trim() || note.title,
        content: floatingNoteContent,
        timestamp: Date.now()
      } : note));
      showSuccess("မှတ်စု ပြင်ဆင်ချက်ကို သိမ်းဆည်းပြီးပါပြီ။");
    }
  };

  const handleNavigateToWord = (wordIndex: number) => {
    setActiveRightTab("vocab");
    setSelectedWordIndex(wordIndex);
    setIsWordsDropdownOpen(false);
    
    // Smooth scroll the selected vocabulary card directly to bring detailed definition into view
    setTimeout(() => {
      const cardElement = document.getElementById("selected-vocab-card");
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add dual highlight states: pulse outline and soft background color
        cardElement.classList.add("ring-4", "ring-indigo-400/80", "scale-[1.015]", "bg-indigo-50/50", "shadow-md");
        setTimeout(() => {
          cardElement.classList.remove("ring-4", "ring-indigo-400/80", "scale-[1.015]", "bg-indigo-50/50", "shadow-md");
        }, 1200);
      } else {
        // Fallback to select trigger button
        const selectorElement = document.getElementById("traced-words-select-sb");
        if (selectorElement) {
          selectorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          selectorElement.classList.add("ring-2", "ring-indigo-500", "scale-[1.01]");
          setTimeout(() => {
            selectorElement.classList.remove("ring-2", "ring-indigo-500", "scale-[1.01]");
          }, 800);
        }
      }
    }, 120);
  };

  const handleScrollToOriginalEnglish = (wordIndex: number) => {
    setSelectedWordIndex(wordIndex);
    
    // Smooth scroll the original matching English element under the input sentence area
    setTimeout(() => {
      let element = document.getElementById(`original-match-${wordIndex}`);
      
      // FALLBACK 1: If target element is not found, attempt to find a matching button containing original or base phrase
      if (!element && translationResult && translationResult.words[wordIndex]) {
        const targetWordObj = translationResult.words[wordIndex];
        const searchBase = (targetWordObj.base || "").toLowerCase().trim();
        const searchOrig = (targetWordObj.original || "").toLowerCase().trim();
        
        const buttons = document.querySelectorAll('[id^="original-match-"]');
        for (let i = 0; i < buttons.length; i++) {
          const btn = buttons[i] as HTMLElement;
          const btnText = btn.innerText.toLowerCase().trim();
          if (
            (searchBase && btnText.includes(searchBase)) || 
            (searchOrig && btnText.includes(searchOrig)) ||
            (searchBase && searchBase.includes(btnText)) ||
            (searchOrig && searchOrig.includes(btnText))
          ) {
            element = btn;
            break;
          }
        }
      }

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Pulse ring highlight for maximum visibility
        element.classList.add("ring-8", "ring-indigo-500", "scale-110", "bg-indigo-100", "z-20", "transition-all", "duration-300");
        setTimeout(() => {
          element.classList.remove("ring-8", "ring-indigo-500", "scale-110", "bg-indigo-100", "z-20");
        }, 1800);
      } else {
        // FALLBACK 2: Scroll to container
        const inputArea = document.getElementById("original-english-interactive-area");
        if (inputArea) {
          inputArea.scrollIntoView({ behavior: "smooth", block: "center" });
          inputArea.classList.add("bg-indigo-50/50", "ring-4", "ring-indigo-300/50");
          setTimeout(() => {
            inputArea.classList.remove("bg-indigo-50/50", "ring-4", "ring-indigo-300/50");
          }, 1500);
        }
      }
    }, 150);
  };

  const PRESET_READER_TEXTS = [
    {
      title: "The Tortoise and the Hare 🐢 (နှေးသော်လည်း ဇွဲရှိသော လိပ်နှင့် ယုန်ပုံပြင်)",
      text: "A Hare was making fun of the Tortoise one day for being so slow. 'Do you ever get anywhere?' he asked with a mocking laugh. 'Yes,' replied the Tortoise, 'and I get there sooner than you think. Let us run a race and prove it.' The Hare was amused at the idea and agreed to start immediately. In a few minutes, the Hare left the Tortoise far behind. Confident in his speed, the Hare decided to lie down and take a nap. He soon fell fast asleep. Meanwhile, the Tortoise kept walking, step by step, never stopping. After a while, he passed the sleeping Hare. When the restless Hare finally woke up, he saw the Tortoise near the finish line and ran as fast as he could. But it was too late! The Tortoise had already won. Slow and steady wins the race. You should never give up on your goals."
    },
    {
      title: "The Future of Artificial Intelligence 🤖 (အိုင်တီဆောင်းပါး တို)",
      text: "In this digital era, artificial intelligence has taken the world by storm. Developers are working day and night to build systems that can understand human emotions. However, we must keep in mind that technology is a double-edged sword. While it makes our lives convenient, it can also lead to issues if we do not play by the rules. We must not sit on the fence when it comes to regulating these platforms. Instead, we should face the music and deal with challenges head-on. Many startups have jumped on the bandwagon to create innovative chatbots, but only a few will stand the test of time."
    },
    {
      title: "Advice for Hard Times 💡 (အီဒီယမ်နှင့် စကားစုများ လေ့လာရန် စာပိုဒ်)",
      text: "When you face difficult times, you should not lose heart. Instead, you need to bite the bullet and put your best foot forward. It is normal to feel down in the dumps occasionally, but you must look on the bright side. No matter what, you should get in touch with friends who can support you. Do not let opportunities slip through your fingers. Just keep your chin up, work hard, and you will eventually break the ice and achieve success. Let's make it happen!"
    }
  ];

  const handleWordClickInReader = (word: string) => {
    // Clean string from punctuation
    const cleanWord = word.trim()
      .replace(/^[.,\/#!$%\^&\*;:{}=\_`~()?"'’‘“”•*\[\]{}]+|[.,\/#!$%\^&\*;:{}=\_`~()?"'’‘“”•*\[\]{}]+$/g, "")
      .trim();
    if (!cleanWord) return;

    setSearchQuery(cleanWord);
    setActiveRightTab("search");

    // Scroll to search tab for dynamic lookup
    setTimeout(() => {
      const searchBox = document.getElementById("search-input-field");
      if (searchBox) {
        searchBox.focus();
        searchBox.scrollIntoView({ behavior: "smooth", block: "center" });
        searchBox.classList.add("ring-4", "ring-indigo-505/50");
        setTimeout(() => {
          searchBox.classList.remove("ring-4", "ring-indigo-505/50");
        }, 800);
      }
    }, 120);
  };

  const handleScanTranslationIdioms = async (textToScan?: string) => {
    const targetText = textToScan || inputText;
    if (!targetText.trim()) {
      return;
    }
    if (!customApiKey || !customApiKey.trim()) {
      return;
    }

    setIsScanningTranslationIdioms(true);
    setTranslationIdioms([]);

    try {
      const response = await resilientFetch("/api/scan-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: targetText,
          customApiKey: customApiKey.trim()
        })
      });

      if (!response.ok) {
        throw new Error("ဆာဗာမှ စကင်ဖတ်တွေ့ရှိချက်များကို ဆွဲထုတ်၍ မရရှိခဲ့ပါ။");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.idioms && Array.isArray(data.idioms)) {
        setTranslationIdioms(data.idioms);
      }
    } catch (err: any) {
      console.error("Scan translation idioms error:", err);
    } finally {
      setIsScanningTranslationIdioms(false);
    }
  };

  const handleScanIdiomsInReader = async () => {
    if (!readerText.trim()) {
      showError("ကျေးဇူးပြု၍ ရှာဖွေစကင်ဖတ်ရန် အင်္ဂလိပ်စာသား တစ်ခုခု အရင်ထည့်သွင်းပါ!");
      return;
    }
    if (!customApiKey || !customApiKey.trim()) {
      showError("အီဒီယမ်နှင့် စကားစုများ ရှာဖွေစနစ်ကို အသုံးပြုရန်အတွက် ဆက်တင် (Settings) ထဲတွင် သင်၏ ကိုယ်ပိုင် Gemini API Key ကို မဖြစ်မနေ ဦးစွာ ထည့်သွင်းပေးရန် လိုအပ်ပါသည်။");
      return;
    }

    setIsScanningIdioms(true);
    setReaderIdioms([]);

    try {
      const response = await resilientFetch("/api/scan-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: readerText,
          customApiKey: customApiKey.trim()
        })
      });

      if (!response.ok) {
        throw new Error("ဆာဗာမှ စကင်ဖတ်တွေ့ရှိချက်များကို ဆွဲထုတ်၍ မရရှိခဲ့ပါ။");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.idioms && Array.isArray(data.idioms)) {
        setReaderIdioms(data.idioms);
        showSuccess(`အောင်မြင်ပါပြီ။ ဆောင်းပါးထဲမှ အီဒီယမ်နှင့် စကားစု စုစုပေါင်း (${data.idioms.length}) ခုအား AI ဖြင့် ရှာဖွေဖော်ထုတ်နိုင်ခဲ့ပါသည်။ ၎င်းတို့ကို အရောင်ဖြင့် Highlight ပြသပေးထားပါသည်။`);
      } else {
        showSuccess("ဤစာပိုဒ်ထဲတွင် သီးခြား အီဒီယမ် သို့မဟုတ် phrasal verb မတွေ့ရပါ။");
      }
    } catch (err: any) {
      console.error("Scan reader error:", err);
      showError(err.message || "စာလုံးရှာဖွေစဉ် အမှားယွင်းတစ်ခု ဖြစ်ပွားခဲ့သည်။");
    } finally {
      setIsScanningIdioms(false);
    }
  };

  const renderInteractiveReaderText = (pText: string): React.ReactNode => {
    if (!pText) return null;
    
    // We split by alphanumeric chunks to identify words
    const tokens = pText.split(/([a-zA-Z0-9'-]+)/g);
    
    return tokens.map((token, idx) => {
      const isWord = /^[a-zA-Z0-9'-]+$/.test(token) && !/^\d+$/.test(token);
      
      if (isWord) {
        const cleanWord = token.trim().toLowerCase().replace(/[^a-z0-9'-]/g, "");
        
        // Find if this token matches or lies within any element of scanner idioms list
        const matchedIdiom = readerIdioms.find(idm => {
          const idmWords = idm.phrase.toLowerCase().split(/\s+/);
          return idmWords.includes(cleanWord) || idm.phrase.toLowerCase().includes(cleanWord);
        });

        let baseStyle = "hover:bg-indigo-100/80 hover:text-indigo-900 rounded cursor-pointer transition-all duration-100 select-all inline px-0.5 mx-[1px]";
        
        if (matchedIdiom) {
          if (matchedIdiom.type === "IDM") {
            baseStyle += " bg-amber-100 text-amber-950 font-bold border-b-2 border-amber-500 hover:bg-amber-250";
          } else {
            baseStyle += " bg-cyan-100 text-cyan-950 font-bold border-b-2 border-cyan-500 hover:bg-cyan-250";
          }
        } else {
          baseStyle += " text-slate-800 hover:scale-102";
        }

        return (
          <span
            key={`rtok-${idx}`}
            onClick={() => handleWordClickInReader(token)}
            className={baseStyle}
            title={matchedIdiom ? `[${matchedIdiom.type}] Meaning: ${matchedIdiom.meaning}` : "နှိပ်၍ အဓိပ္ပါယ်ရှာဖွေရန်"}
          >
            {token}
          </span>
        );
      } else {
        return <span key={`rnon-${idx}`} className="text-slate-600 font-sans">{token}</span>;
      }
    });
  };

  // Excluded English words from having dynamic tooltips hovering (prepositions, pronouns, articles, auxiliary verbs)
  const WORD_EXCLUSIONS = new Set([
    "a", "an", "the",
    "i", "me", "my", "mine", "myself", "we", "us", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
    "she", "her", "hers", "herself", "they", "them", "their", "theirs", "themselves",
    "it", "its", "itself", "this", "that", "these", "those",
    "of", "to", "in", "for", "on", "with", "at", "by", "from", "up", "about", "into", "over", "after",
    "during", "through", "before", "between", "under", "along", "behind", "down", "off", "out",
    "and", "but", "or", "so", "as", "if", "than", "then",
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing",
    "will", "would", "shall", "should", "can", "could", "may", "might", "must", "ought", "not"
  ]);

  const getShortMeaning = (meaning: string): string => {
    if (!meaning) return "";
    let cleaned = meaning.replace(/\[(IDM|PHRV)\]/gi, "").trim();
    const lines = cleaned.split("\n").map(l => l.trim()).filter(Boolean);
    
    // Find the first line that actually contains Myanmar letters (consonants/vowels) rather than just list digits/punctuation
    let targetLine = lines.find(line => /[\u1000-\u103f]/.test(line));
    
    // If no line has Myanmar letters, or if there's only one line, fallback to the first line
    if (!targetLine && lines.length > 0) {
      targetLine = lines[0];
    }
    
    if (targetLine) {
      cleaned = targetLine;
    }
    const segments = cleaned.split(/;|\(|ဥပမာ/);
    let short = segments[0].trim();
    if (short.length < 2 && segments.length > 1) {
      short = (short + " " + segments[1]).trim();
    }

    // Strip bullet points, list numbers (like ၁။, ၂။, 1., 2., a., -, etc.) at the start of the line
    let cleanedShort = short.replace(/^[\s\d\u1040-\u1049a-zA-Z\.\-။၊\)]+\s*/, "").trim();
    if (cleanedShort.length >= 2) {
      short = cleanedShort;
    }

    if (short.length > 80) {
      short = short.slice(0, 80) + "...";
    }
    return short;
  };

  const findMyanmarMeaning = (word: string, wordsList: any[]): string | null => {
    const lowerWord = word.toLowerCase();
    
    // 1. Search in wordsList
    if (wordsList && wordsList.length > 0) {
      const found = wordsList.find(w => 
        (w.original && w.original.toLowerCase() === lowerWord) || 
        (w.base && w.base.toLowerCase() === lowerWord)
      );
      if (found) {
        return found.dictionary_definition || found.fallback_my || null;
      }
    }

    // 2. Search offline dictionary
    let def = dictionaryMap.get(lowerWord);
    if (def) return def;

    // Plural s/es checks
    if (lowerWord.endsWith("s") && lowerWord.length > 3) {
      let stem = lowerWord.slice(0, -1);
      def = dictionaryMap.get(stem);
      if (def) return def;

      if (lowerWord.endsWith("es") && lowerWord.length > 4) {
        stem = lowerWord.slice(0, -2);
        def = dictionaryMap.get(stem);
        if (def) return def;
      }
    }

    // Past ed checks
    if (lowerWord.endsWith("ed") && lowerWord.length > 4) {
      let stem = lowerWord.slice(0, -2);
      def = dictionaryMap.get(stem);
      if (def) return def;

      stem = lowerWord.slice(0, -1);
      def = dictionaryMap.get(stem);
      if (def) return def;
    }

    // Gerund ing checks
    if (lowerWord.endsWith("ing") && lowerWord.length > 5) {
      let stem = lowerWord.slice(0, -3);
      def = dictionaryMap.get(stem);
      if (def) return def;

      stem = lowerWord.slice(0, -3) + "e";
      def = dictionaryMap.get(stem);
      if (def) return def;
    }

    return null;
  };

  const renderHoverableWords = (textSegment: string, wordsList: any[] = []): React.ReactNode => {
    if (!textSegment) return null;
    
    // Tokenize keeping letters/alphanumerics and non-letters separate
    const tokens = textSegment.split(/(\b[a-zA-Z]+-?[a-zA-Z]*\b)/g);
    
    return tokens.map((token, idx) => {
      const isWord = /^[a-zA-Z]+-?[a-zA-Z]*$/.test(token);
      if (!isWord) {
        return <span key={`plain-${idx}`} className="text-slate-655 font-sans">{token}</span>;
      }

      const lowerWord = token.toLowerCase();
      if (WORD_EXCLUSIONS.has(lowerWord)) {
        return <span key={`plain-ex-${idx}`} className="text-slate-550 font-sans">{token}</span>;
      }

      // Check if this word exists in wordsList from Gemini (highly accurate contextual translations)
      const foundInList = wordsList && wordsList.find(w => 
        (w.original && w.original.toLowerCase() === lowerWord) || 
        (w.base && w.base.toLowerCase() === lowerWord)
      );

      let cleanMeaning = "";
      if (foundInList) {
        const fallbackMyPart = foundInList.fallback_my ? foundInList.fallback_my.replace(/\[(IDM|PHRV)\]/gi, "").trim() : "";
        const dictMeaningPart = foundInList.dictionary_definition ? getShortMeaning(foundInList.dictionary_definition) : "";

        // Prioritize Gemini's contextual translation for safe, clean hover popup without numbering or format clutter
        if (fallbackMyPart) {
          cleanMeaning = fallbackMyPart;
        } else if (dictMeaningPart) {
          cleanMeaning = dictMeaningPart;
        }
      }

      // Fallback: If not found in current sentence wordsList, search general offline dictionary Map
      if (!cleanMeaning) {
        const meaning = findMyanmarMeaning(token, wordsList);
        if (meaning) {
          cleanMeaning = getShortMeaning(meaning);
        }
      }

      if (!cleanMeaning) {
        return (
          <span 
            key={`plain-nm-${idx}`} 
            className="text-slate-800 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200/50 px-0.5 transition-colors cursor-pointer font-sans"
            onClick={() => handleWordClickInReader(token)}
            onDoubleClick={() => handleWordClickInReader(token)}
            title="နှိပ်၍ အဓိပ္ပါယ်ရှာဖွေရန်"
          >
            {token}
          </span>
        );
      }

      return (
        <span className="relative group inline-block mx-0.5" key={`hover-w-${idx}`}>
          <button
            type="button"
            className="inline text-slate-900 border-b-2 border-slate-200 hover:border-indigo-500 font-medium px-0.5 rounded cursor-pointer font-sans"
            onClick={() => handleWordClickInReader(token)}
            onDoubleClick={() => handleWordClickInReader(token)}
          >
            {token}
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 max-w-64 min-w-[140px] text-center whitespace-normal leading-relaxed">
            <span className="text-[10px] text-indigo-300 border-b border-indigo-500/30 pb-0.5 mb-1 block w-full uppercase font-mono tracking-wider">
              {token}
            </span>
            <span className="text-slate-100 font-sans">{cleanMeaning}</span>
            <span className="w-1 h-1 border-4 border-transparent border-t-slate-900/95 absolute top-full left-1/2 -translate-x-1/2" />
          </span>
        </span>
      );
    });
  };

  const renderInteractiveInputText = (): React.ReactNode => {
    const text = inputText || "";
    if (!text) return null;
    if (!translationResult || !translationResult.words || translationResult.words.length === 0) {
      return <div id="original-english-interactive-area" className="leading-relaxed font-sans">{text}</div>;
    }

    // Find all occurrences of each word/idiom from translationResult.words in the text
    const matches: any[] = [];
    translationResult.words.forEach((w, wordIndex) => {
      const phrase = w.original || "";
      if (phrase.length < 2) return;

      const isIdm = (w.pos && (w.pos.toLowerCase().includes("idm") || w.pos.toLowerCase().includes("idiom"))) || (w.fallback_my && w.fallback_my.includes("[IDM]"));
      const isPhrv = (w.pos && (w.pos.toLowerCase().includes("phrv") || w.pos.toLowerCase().includes("phrasal"))) || (w.fallback_my && w.fallback_my.includes("[PHRV]"));

      // Escape regex special chars
      const adventurePhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Look for boundary matching if it's a word-like phrase
      let regexStr = adventurePhrase;
      if (/^[a-zA-Z0-9' ]+$/.test(phrase)) {
        regexStr = `\\b${adventurePhrase}\\b`;
      }
      
      const regex = new RegExp(regexStr, "gi");
      let matchArr;
      while ((matchArr = regex.exec(text)) !== null) {
        matches.push({
          start: matchArr.index,
          end: regex.lastIndex,
          wordIndex,
          phrase,
          isIdm,
          isPhrv,
          wordObj: w
        });
        // Prevent infinite loops with zero-width matches
        if (regex.lastIndex === matchArr.index) {
          regex.lastIndex++;
        }
      }
    });

    // Resolve overlapping matches (favor longer matches, then earlier matches)
    matches.sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return (b.end - b.start) - (a.end - a.start);
    });

    const activeMatches: any[] = [];
    let lastActiveEnd = 0;
    matches.forEach(m => {
      if (m.start >= lastActiveEnd) {
        activeMatches.push(m);
        lastActiveEnd = m.end;
      }
    });

    const resultNodes: React.ReactNode[] = [];
    let lastIndex = 0;

    activeMatches.forEach((m, idx) => {
      // Add preceding non-highlighted text
      if (m.start > lastIndex) {
        resultNodes.push(
          <span key={`text-nonmatch-${idx}`}>
            {renderHoverableWords(text.slice(lastIndex, m.start), translationResult.words)}
          </span>
        );
      }

      const matchedText = text.slice(m.start, m.end);
      let cleanMeaning = "";
      if (m.wordObj) {
        const fallbackMyPart = m.wordObj.fallback_my ? m.wordObj.fallback_my.replace(/\[(IDM|PHRV)\]/gi, "").trim() : "";
        const dictMeaningPart = m.wordObj.dictionary_definition ? getShortMeaning(m.wordObj.dictionary_definition) : "";
        cleanMeaning = fallbackMyPart || dictMeaningPart;
      }

      if (m.isIdm) {
        resultNodes.push(
          <span className="relative group inline-block mx-1 my-0.5" key={`match-wrap-${idx}`}>
            <button
              id={`original-match-${m.wordIndex}`}
              type="button"
              onClick={() => handleNavigateToWord(m.wordIndex)}
              onDoubleClick={() => handleNavigateToWord(m.wordIndex)}
              className="inline-flex items-center bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded-lg cursor-pointer text-sm transition-all duration-155 hover:scale-[1.03] active:scale-95 shadow-3xs"
            >
              <span className="underline decoration-amber-400 decoration-2 underline-offset-2">{matchedText}</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[9px] uppercase font-extrabold ml-1.5 select-none shrink-0 font-sans">
                IDM
              </span>
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 max-w-64 min-w-[140px] text-center whitespace-normal leading-relaxed">
              <span className="text-[10px] text-amber-300 border-b border-amber-500/30 pb-0.5 mb-1 block w-full uppercase font-mono tracking-wider">
                {matchedText} (Idiom)
              </span>
              <span className="text-slate-100 font-sans">{cleanMeaning || "မြန်မာအဓိပ္ပါယ် မရှိပါ"}</span>
              <span className="text-[9px] text-amber-200/90 mt-1">နှစ်ချက်နှိပ်၍ dictionary ဖတ်ရန်</span>
              <span className="w-1 h-1 border-4 border-transparent border-t-slate-900/95 absolute top-full left-1/2 -translate-x-1/2" />
            </span>
          </span>
        );
      } else if (m.isPhrv) {
        resultNodes.push(
          <span className="relative group inline-block mx-1 my-0.5" key={`match-wrap-${idx}`}>
            <button
              id={`original-match-${m.wordIndex}`}
              type="button"
              onClick={() => handleNavigateToWord(m.wordIndex)}
              onDoubleClick={() => handleNavigateToWord(m.wordIndex)}
              className="inline-flex items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold px-1.5 py-0.5 rounded-lg cursor-pointer text-sm transition-all duration-155 hover:scale-[1.03] active:scale-95 shadow-3xs"
            >
              <span className="underline decoration-cyan-400 decoration-2 underline-offset-2">{matchedText}</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-cyan-200 text-cyan-950 text-[9px] uppercase font-extrabold ml-1.5 select-none shrink-0 font-sans">
                PHRV
              </span>
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 max-w-64 min-w-[140px] text-center whitespace-normal leading-relaxed">
              <span className="text-[10px] text-cyan-300 border-b border-cyan-500/30 pb-0.5 mb-1 block w-full uppercase font-mono tracking-wider">
                {matchedText} (Phrasal Verb)
              </span>
              <span className="text-slate-100 font-sans">{cleanMeaning || "မြန်မာအဓိပ္ပါယ် မရှိပါ"}</span>
              <span className="text-[9px] text-cyan-200/90 mt-1">နှစ်ချက်နှိပ်၍ dictionary ဖတ်ရန်</span>
              <span className="w-1 h-1 border-4 border-transparent border-t-slate-900/95 absolute top-full left-1/2 -translate-x-1/2" />
            </span>
          </span>
        );
      } else {
        resultNodes.push(
          <span className="relative group inline-block mx-0.5" key={`match-wrap-${idx}`}>
            <button
              id={`original-match-${m.wordIndex}`}
              type="button"
              onClick={() => handleNavigateToWord(m.wordIndex)}
              onDoubleClick={() => handleNavigateToWord(m.wordIndex)}
              className="inline text-indigo-955 hover:text-indigo-900 border-b-2 border-dashed border-indigo-200 hover:border-indigo-500 font-bold px-1 rounded cursor-pointer text-sm transition-all duration-100 mx-0.5 hover:bg-slate-50/50"
            >
              {matchedText}
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 max-w-64 min-w-[140px] text-center whitespace-normal leading-relaxed">
              <span className="text-[10px] text-indigo-300 border-b border-indigo-500/30 pb-0.5 mb-1 block w-full uppercase font-mono tracking-wider">
                {matchedText} (Vocab)
              </span>
              <span className="text-slate-100 font-sans">{cleanMeaning || "မြန်မာအဓိပ္ပါယ် မရှိပါ"}</span>
              <span className="text-[9px] text-indigo-200/90 mt-1">နှစ်ချက်နှိပ်၍ dictionary ဖတ်ရန်</span>
              <span className="w-1 h-1 border-4 border-transparent border-t-slate-900/95 absolute top-full left-1/2 -translate-x-1/2" />
            </span>
          </span>
        );
      }
      
      lastIndex = m.end;
    });

    if (lastIndex < text.length) {
      resultNodes.push(<span key="text-ending">{renderHoverableWords(text.slice(lastIndex), translationResult.words)}</span>);
    }

    return (
      <div id="original-english-interactive-area" className="leading-relaxed whitespace-pre-wrap transition-all duration-300">
        {resultNodes}
      </div>
    );
  };

  const handleLoadSampleNotes = (notebookId?: string) => {
    const id = notebookId || selectedSampleNotebookId;
    const found = customNotebooks.find(n => n.id === id);
    if (found) {
      setStoryNotes(found.content);
      showSuccess(`"${found.title}" နမူနာမှတ်စုများကို အောင်မြင်စွာ ထည့်သွင်းပေးပြီးပါပြီဗျာ။`);
    } else {
      showError("ရွေးချယ်ထားသော စာအုပ်ကို မတွေ့ရှိပါ။");
    }
  };

  const handleSaveAsCustomNotebook = (title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      showError("စာအုပ်အမည် ဖြည့်သွင်းပေးရန် လိုအပ်ပါသည်ရှင်။");
      return;
    }
    if (!storyNotes.trim()) {
      showError("လက်ရှိမှတ်စုကွက်ထဲတွင် သိမ်းဆည်းရန် စာသားများ မရှိသေးပါ။");
      return;
    }
    const newId = "custom_" + Date.now();
    const newNotebook = {
      id: newId,
      title: cleanTitle,
      content: storyNotes,
      lastUpdated: Date.now(),
      isDeleted: false
    };
    const updated = [...customNotebooks, newNotebook];
    setCustomNotebooks(updated);
    setSelectedSampleNotebookId(newId);
    setNewNotebookTitle("");
    showSuccess(`"${cleanTitle}" ကို နမူနာမှတ်စုအုပ် စာရင်းထဲသို့ ထည့်သွင်းသိမ်းဆည်းလိုက်ပါပြီ။`);
    
    // Trigger direct cloud save or schedule sync
    handleSyncWithCloud(undefined, updated);
  };

  const handleDeleteCustomNotebook = (id: string) => {
    const found = customNotebooks.find(n => n.id === id);
    if (!found) {
      showError("ဖျက်ရန် စာအုပ်ကို မတွေ့ရှိပါ။");
      return;
    }
    const updated = customNotebooks.map(n => 
      n.id === id ? { ...n, isDeleted: true, lastUpdated: Date.now() } : n
    );
    setCustomNotebooks(updated);
    if (selectedSampleNotebookId === id) {
      const activeUpdated = updated.filter(n => !n.isDeleted);
      if (activeUpdated.length > 0) {
        setSelectedSampleNotebookId(activeUpdated[0].id);
        const nextNb = updated.find(n => n.id === activeUpdated[0].id);
        setStoryNotes(nextNb ? nextNb.content : "");
      } else {
        setSelectedSampleNotebookId("");
        setStoryNotes("");
      }
    }
    showSuccess(`"${found.title}" ကို စာရင်းထဲမှ အောင်မြင်စွာ ဖျက်ဆီးပြီးပါပြီ။`);
    
    // Trigger direct cloud save or schedule sync
    handleSyncWithCloud(undefined, updated);
  };

  const renderReaderPanel = () => {

    const handleGenerateStory = async () => {
      if (!storyNotes.trim()) {
        showError("ပုံပြင်ဇာတ်လမ်းဆင်ရန် သင်၏ English မှတ်စုများကို ဖြည့်သွင်းပေးပါ။");
        return;
      }

      setIsGeneratingStory(true);
      setGeneratedStory(null);

      try {
        const apiKey = customApiKey || "";
        const response = await resilientFetch("/api/generate-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: storyNotes,
            theme: storyTheme,
            customApiKey: apiKey
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "ပုံပြင်ဇာတ်လမ်းဆင်ရန် တောင်းဆိုမှု မအောင်မြင်ပါ။");
        }

        const data = await response.json();
        setGeneratedStory(data);
        showSuccess(`"${data.storyTitle || "ပုံပြင်အသစ်"}" ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။`);
      } catch (err: any) {
        console.error("Story generation error:", err);
        showError(err.message || "ပုံပြင်ဇာတ်လမ်းဆင်နိုင်ခြင်းမရှိပါ။ သင်၏ API Key ကို ပြန်လည်စစ်ဆေးပါ။");
      } finally {
        setIsGeneratingStory(false);
      }
    };

    const handleSendCoachMessage = async (customMessage: string) => {
      if (!customMessage || !customMessage.trim()) return;

      const userMsg = customMessage.trim();
      setCoachInput("");

      // Update history with user's message
      const updatedHistory = [...coachHistory, { role: "user" as const, text: userMsg }];
      setCoachHistory(updatedHistory);
      setIsCoachThinking(true);

      try {
        const apiKey = customApiKey || "";
        const response = await resilientFetch("/api/coach-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: updatedHistory.slice(-10), // Keep last 10 messages for context, preventing overhead
            message: userMsg,
            notes: storyNotes,
            customApiKey: apiKey
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "ဆရာမ AI နှင့် ချိတ်ဆက်မှု မအောင်မြင်ပါ။");
        }

        const data = await response.json();
        setCoachHistory(prev => [...prev, { role: "model" as const, text: data.text }]);
      } catch (err: any) {
        console.error("Coach AI error:", err);
        showError(err.message || "ဆရာမ AI ထံမှ တုံ့ပြန်မှု မရရှိပါ။ API Key အမှန်တကယ် ထည့်သွင်းထားကြောင်း သေချာပါစေ။");
      } finally {
        setIsCoachThinking(false);
      }
    };

    const parseStoryParagraph = (paraText: string) => {
      const regex = /(\*\*\[.*?\]\*\*|\[.*?\])/g;
      const parts = paraText.split(regex);
      
      if (parts.length <= 1) {
        return <span>{paraText}</span>;
      }
      
      return (
        <>
          {parts.map((part, index) => {
            const isMatched = (part.startsWith("**[") && part.endsWith("]**")) || (part.startsWith("[") && part.endsWith("]"));
            if (isMatched) {
              const cleanContent = part.replace(/^\*\*\[|\]\*\*$/g, "").replace(/^\[|\]$/g, "");
              const colonIdx = cleanContent.indexOf(":");
              let termPart = cleanContent;
              let meaningPart = "";
              if (colonIdx !== -1) {
                termPart = cleanContent.slice(0, colonIdx).trim();
                meaningPart = cleanContent.slice(colonIdx + 1).trim();
              }
              
              const typeMatch = termPart.match(/\(([^)]+)\)$/);
              let termText = termPart;
              let typeText = "VOCAB";
              if (typeMatch) {
                typeText = typeMatch[1];
                termText = termPart.replace(/\([^)]+\)$/, "").trim();
              }
              
              const badgeThemeClasses = typeText === "IDM"
                ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                : typeText === "PHRV"
                ? "bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200"
                : "bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200";

              return (
                <span 
                  key={`story-badge-${index}`}
                  className="inline-flex flex-wrap items-center gap-1.5 mx-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all duration-150 cursor-pointer shadow-4xs text-slate-900 group"
                  onClick={() => {
                    speakText(termText, "en-US");
                    showSuccess(`နားဆင်ရန်: "${termText}"`);
                  }}
                  title="ကလစ်နှိပ်၍ အသံထွက်နားထောင်ပါ"
                >
                  <span className={`text-[10px] font-black uppercase font-mono px-1.5 py-0.2 rounded border ${badgeThemeClasses}`}>
                    {typeText}
                  </span>
                  <span className="font-extrabold text-indigo-950 group-hover:text-indigo-650 font-serif">
                    {termText}
                  </span>
                  {meaningPart && (
                    <span className="text-[11px] font-bold text-slate-500 border-l border-slate-200 pl-1.5 leading-relaxed">
                      {meaningPart}
                    </span>
                  )}
                </span>
              );
            } else {
              return <span key={`story-text-${index}`}>{part}</span>;
            }
          })}
        </>
      );
    };

    const handlePasteNotes = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          throw new Error("Clipboard API not supported");
        }
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          updateStoryNotes(text);
          showSuccess("ကူးယူထားသော အမှတ်အသားများကို ထည့်သွင်းပြီးပါပြီဗျာ။");
        } else {
          showError("ကူးယူထားသော မှတ်စုစာသားမရှိပါ။ ရှေးဦးစွာ Copy ကူးယူထားပေးပါ။");
        }
      } catch (err: any) {
        showError("Clipboard ဖတ်ခွင့်ကို iFrame ကြောင့် ကန့်သတ်ထားပါသည်။ keyboard မှ Ctrl+V ကို နှိပ်၍၎င်း၊ ဖုန်းမှ Paste ဖြင့်၎င်း ထည့်သွင်းနိုင်ပါသည်။");
      }
    };

    return (
      <div id="study-room-layout-container" className="space-y-6">
        {/* Study Room Tab Switcher */}
        <div className="flex border-b border-slate-150 pb-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveStudyTab("fairytale");
              setIsFlashcardFlipped(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeStudyTab === "fairytale"
                ? "bg-amber-500 text-white shadow-xs shadow-amber-500/10"
                : "bg-slate-100/70 hover:bg-slate-100 text-slate-700 border border-slate-205"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>🔮 Storyteller AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStudyTab("flashcard");
              setIsFlashcardFlipped(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeStudyTab === "flashcard"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-500/10"
                : "bg-slate-100/70 hover:bg-slate-100 text-slate-700 border border-slate-205"
            }`}
          >
            <BookMarked className="w-4 h-4 text-emerald-300" />
            <span>🗂️ Flashcard Arena</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStudyTab("quiz");
              setIsFlashcardFlipped(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeStudyTab === "quiz"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/10"
                : "bg-slate-100/70 hover:bg-slate-100 text-slate-700 border border-slate-205"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>🏆 Vocab Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveStudyTab("coach");
              setIsFlashcardFlipped(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeStudyTab === "coach"
                ? "bg-rose-600 text-white shadow-xs shadow-rose-500/10"
                : "bg-slate-100/70 hover:bg-slate-100 text-slate-700 border border-slate-205"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-rose-300" />
            <span>👩‍🏫 Coach AI (မေးမြန်း/ရှင်းပြ)</span>
          </button>
        </div>
        {activeStudyTab === "fairytale" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-black text-indigo-700 uppercase tracking-wide block bg-indigo-10/50 border border-indigo-100 px-3.5 py-2 rounded-xl shadow-4xs">
                  ၁။ ပုံပြင် ဇာတ်လမ်းနောက်ခံ စာရင်းရွေးချယ်ရန် (Story Backdrop Selection)
                </label>
                <div className="relative">
                  <select
                    value={storyTheme}
                    onChange={(e) => setStoryTheme(e.target.value)}
                    className="w-full text-xs font-black p-3.5 pl-10 pr-10 rounded-xl border border-slate-200 text-slate-800 bg-slate-50/40 hover:bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-505 cursor-pointer appearance-none shadow-3xs transition-all"
                  >
                    {FAIR_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.icon} {theme.name} — {theme.desc}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">
                    {FAIR_THEMES.find(t => t.id === storyTheme)?.icon || "✨"}
                  </div>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[12px] font-black text-rose-700 uppercase tracking-wide block bg-rose-10/50 border border-rose-100 px-3.5 py-2 rounded-xl shadow-4xs">
                      ၂။ သင်၏ English မှတ်စုများကို ဖြည့်သွင်းပါ
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteNotes}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-250 rounded-lg transition-colors text-[10px] font-black flex items-center gap-1 cursor-pointer"
                      title="ကလစ်ဘုတ်မှ Paste လုပ်မည်"
                    >
                      <Clipboard className="w-3 h-3" />
                      <span>Paste လုပ်ရန်</span>
                    </button>

                    <span className="text-slate-300 text-xs hidden lg:inline">|</span>
                    <span className="text-[10px] text-slate-500 font-extrabold hidden lg:inline" title="မှတ်စုအုပ်ကို ကလစ်နှိပ်လိုက်သည်နှင့် အလိုအလျောက် ပွင့်လာပါမည်။">📂 ဖွင့်ရန်စာအုပ်:</span>
                    <select
                      value={selectedSampleNotebookId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedSampleNotebookId(val);
                        // Convert to immediate loading on selection
                        const found = customNotebooks.find(n => n.id === val);
                        if (found) {
                          setStoryNotes(found.content);
                        } else {
                          setStoryNotes("");
                        }
                      }}
                      className="text-[10px] font-black bg-white border border-slate-250 rounded-lg py-1 px-2 text-slate-700 cursor-pointer shadow-4xs focus:outline-hidden max-w-[150px] sm:max-w-xs truncate"
                      title="မှတ်စုအုပ်တစ်ခု ရွေးချယ်လိုက်သည်နှင့် တိုက်ရိုက်အလိုအလျောက်ပွင့်လာပါမည်။"
                    >
                      <option value="">📂 စာအုပ် ရွေးချယ်ရန်...</option>
                      {customNotebooks.filter(nb => !nb.isDeleted).map((nb) => (
                        <option key={nb.id} value={nb.id}>
                          {nb.title}
                        </option>
                      ))}
                    </select>

                    {selectedSampleNotebookId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomNotebook(selectedSampleNotebookId)}
                        className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 rounded-lg transition-all text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-4xs"
                        title="ဤစာအုပ်ကို လုံးဝဖျက်ပစ်ပါမည်"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden xs:inline">ဖျက်မည်</span>
                      </button>
                    )}

                    <span className="text-slate-305 text-xs hidden sm:inline">|</span>
                    
                    {/* Create / Save As Section */}
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-lg shadow-4xs" title="လက်ရှိ အင်္ဂလိပ်စာသားများကို စာအုပ်အသစ်အမည်အသစ်သတ်မှတ်ပြီး သိမ်းဆည်းရန်">
                      <input
                        type="text"
                        placeholder="စာအုပ်အသစ်အမည်..."
                        value={newNotebookTitle}
                        onChange={(e) => setNewNotebookTitle(e.target.value)}
                        className="text-[10px] font-black bg-white border border-slate-205 rounded-md px-1.5 py-0.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 max-w-[120px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveAsCustomNotebook(newNotebookTitle)}
                        className="py-0.5 px-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-md transition-all text-[10px] font-black flex items-center gap-0.5 cursor-pointer shadow-4xs"
                        title="လက်ရှိစာထည့်စရာ ဘောက်စ်ထဲရှိ စာသားများကို အထက်ပါခေါင်းစဉ်ဖြင့် စာအုပ်အသစ်အဖြစ် သိမ်းဆည်းရန်"
                      >
                        <Save className="w-3 h-3 text-emerald-100" />
                        <span>သိမ်းမည်</span>
                      </button>
                    </div>
                  </div>
                  {storyNotes.trim() && (
                    <button
                      type="button"
                      onClick={() => updateStoryNotes("")}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      မှတ်စုအားလုံးရှင်းမည်
                    </button>
                  )}
                </div>
                
                <textarea
                  value={storyNotes}
                  onChange={(e) => updateStoryNotes(e.target.value)}
                  placeholder="လေ့လာလိုသည့် စကားစုများကို ဤကဲ့သို့ ဖြည့်သွင်းပါ-&#10;started off&#10;PHRV&#10;စတင်ဖြစ်ပေါ်ခဲ့သည်...&#10;&#10;absence makes the heart grow fonder&#10;IDM&#10;ဝေးကွာနေရခြင်းက..."
                  className="w-full text-xs p-4 rounded-2xl border border-slate-200 text-slate-800 bg-slate-50/20 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 min-h-60 max-h-96 leading-relaxed font-mono font-medium"
                />
              </div>

              {!customApiKey?.trim() ? (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-left space-y-1">
                  <p className="text-xs text-rose-800 font-bold">API Key လိုအပ်ပါသည်</p>
                  <p className="text-[11px] text-rose-600 font-semibold leading-relaxed">
                    ပုံပြင်ဇာတ်လမ်းဆင်စနစ်ကို အသုံးပြုရန် ညာဘက်ခြမ်းရှိ <strong>&quot;Settings&quot;</strong> တက်ဘ်တွင် သင်၏ ကိုယ်ပိုင် <strong>Gemini API Key</strong> ကို ဦးစွာ ထည့်သွင်းပေးရန် လိုအပ်ပါသည်။
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
                >
                  {isGeneratingStory ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini က ဇာတ်လမ်းဆင်နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-bounce" />
                      <span>🔮 ပုံပြင်ဇာတ်လမ်းလှလှလေး ဖန်တီးမည်</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col justify-start">
              {isGeneratingStory && (
                <div className="p-12 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-6 flex flex-col items-center justify-center min-h-[400px] animate-pulse">
                  <div className="p-4 bg-orange-100 text-orange-600 rounded-full animate-spin">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h4 className="font-extrabold text-slate-800 text-sm">ပုံပြင်လှလှလေး ဖန်တီးနေပါသည်...</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      ထည့်သွင်းထားသော English မှတ်စုတစ်ခုချင်းစီကို {storyTheme} ပုံပြင်ဇာတ်မြှုပ်ထဲတွင် မမေ့နိုင်အောင် မြန်မာစကားပြေနှင့် အင်္ဂလိပ်ဗားရှင်းဖန်တီးပေးနေပြီး စာလုံးများကို Highlight ပြုလုပ်ပေးပါမည်။
                    </p>
                  </div>
                </div>
              )}

              {!isGeneratingStory && !generatedStory && (
                <div className="p-12 bg-slate-50 border border-slate-200/50 rounded-3xl text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <p className="font-extrabold text-slate-850 text-sm">ဇာတ်လမ်းဆင် ဖတ်ရှုရန်အဆင်သင့်ဖြစ်ပါသည်</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      ဘယ်ဘက်တွင် မှတ်မိလိုသော ဝေါဟာရစုများနှင့် IDM များကို ဖြည့်သွင်းကာ &quot;ပုံပြင်ဇာတ်လမ်းလှလှလေး ဖန်တီးမည်&quot; ကို နှိပ်လိုက်ပါက ဤနေရာတွင် စပါယ်ရှယ် မြန်မာ + အင်္ဂလိပ် ပုံပြင်ထွက်ပေါ်လာမည် ဖြစ်သည်။
                    </p>
                  </div>
                </div>
              )}

              {!isGeneratingStory && generatedStory && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-amber-50/40 to-amber-100/10 border border-amber-200/70 p-6 md:p-8 rounded-3xl relative overflow-hidden text-left shadow-2xs">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/30 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="border-b border-amber-200/50 pb-4 mb-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-850 px-2.5 py-0.5 rounded-md border border-orange-200 font-sans">
                          Fairytale: {generatedStory.fairytaleTheme}
                        </span>

                        {/* Font size adjustment tools */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-3xs">
                          <span className="text-[10px] font-extrabold text-slate-500 pl-1">စာလုံးအရွယ်အစား:</span>
                          <button
                            type="button"
                            onClick={() => setStoryFontSize(prev => Math.max(12, prev - 1))}
                            className="w-6 h-6 rounded-md bg-slate-50 text-slate-705 border border-slate-200 hover:bg-slate-100 text-xs font-black shadow-4xs active:scale-95 cursor-pointer flex items-center justify-center"
                            title="စာဖတ်လုံးသေးရန်"
                          >
                            A⁻
                          </button>
                          <span className="text-[10px] font-extrabold text-slate-800 font-mono w-5 text-center">
                            {storyFontSize}
                          </span>
                          <button
                            type="button"
                            onClick={() => setStoryFontSize(prev => Math.min(24, prev + 1))}
                            className="w-6 h-6 rounded-md bg-slate-50 text-slate-705 border border-slate-200 hover:bg-slate-100 text-xs font-black shadow-4xs active:scale-95 cursor-pointer flex items-center justify-center"
                            title="စာဖတ်လုံးကြီးရန်"
                          >
                            A⁺
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                        <h3 className="text-base md:text-lg font-black text-rose-955 leading-snug">
                          👑 {generatedStory.storyTitle} (Myan Version)
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const fullText = (generatedStory.storyParagraphs || []).join("\n\n");
                            navigator.clipboard.writeText(fullText)
                              .then(() => {
                                setCopiedMyanmarStory(true);
                                showSuccess("မြန်မာပုံပြင်စာသားများကို Clipboard ထဲသို့ ကူးယူပြီးပါပြီ။");
                                setTimeout(() => setCopiedMyanmarStory(false), 2000);
                              })
                              .catch(() => {
                                showSuccess("စာသားကူးယူပြီးပါပြီ။");
                              });
                          }}
                          className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-black rounded-xl active:scale-95 transition-all shadow-3xs flex items-center gap-1 cursor-pointer"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                          <span>{copiedMyanmarStory ? "✓ ကူးယူပြီးပါပြီ" : "စာသားယူရန် (Copy)"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic pr-2">
                        💡 {generatedStory.storyIntroduction}
                      </p>
                    </div>

                    <div 
                      className="space-y-5 text-slate-808 leading-loose font-medium pr-1 max-h-[350px] overflow-y-auto"
                      style={{ fontSize: `${storyFontSize}px` }}
                    >
                      {generatedStory.storyParagraphs.map((para, pIdx) => (
                        <p key={`spara-${pIdx}`} className="indent-6 md:indent-8">
                          {parseStoryParagraph(para)}
                        </p>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-200/40 text-[10px] text-amber-805 flex items-center gap-1 font-bold">
                      <span>💡 စာသားထဲရှိ </span>
                      <span className="bg-indigo-50 border border-slate-200 px-1 py-0.2 rounded text-indigo-700 font-black">English Terms</span>
                      <span> များကို နှိပ်၍ အသံထွက်ကို လေ့လာနားဆင်နိုင်ပါသည်။</span>
                    </div>
                  </div>

                  {/* 🇬🇧 English Story Card (Added as requested!) */}
                  {generatedStory.englishStoryParagraphs && generatedStory.englishStoryParagraphs.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50/20 to-indigo-100/10 border border-indigo-200 p-6 md:p-8 rounded-3xl relative overflow-hidden text-left shadow-2xs">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="border-b border-indigo-200/50 pb-3 mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base md:text-lg font-black text-indigo-950 font-sans tracking-tight">
                            🇬🇧 English Version
                          </h3>
                          <p className="text-[11px] text-slate-550 font-bold leading-normal">
                            Corresponding story in English for contextual reading
                          </p>
                        </div>

                        {/* Copy / Get Text Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const fullText = (generatedStory.englishStoryParagraphs || []).join("\n\n");
                            navigator.clipboard.writeText(fullText)
                              .then(() => {
                                setCopiedEnglishStory(true);
                                showSuccess("အင်္ဂလိပ်ပုံပြင်စာသားများကို Clipboard ထဲသို့ ကူးယူပြီးပါပြီ။");
                                setTimeout(() => setCopiedEnglishStory(false), 2000);
                              })
                              .catch(() => {
                                showSuccess("စာသားကူးယူပြီးပါပြီ။");
                              });
                          }}
                          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-black rounded-xl active:scale-95 transition-all shadow-3xs flex items-center gap-1 cursor-pointer"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                          <span>{copiedEnglishStory ? "✓ ကူးယူပြီးပါပြီ" : "စာသားယူရန် (Copy)"}</span>
                        </button>
                      </div>

                      {/* English Text paragraphs */}
                      <div 
                        className="space-y-4 text-slate-800 leading-relaxed font-sans pr-1 max-h-[350px] overflow-y-auto"
                        style={{ fontSize: `${storyFontSize}px` }}
                      >
                        {generatedStory.englishStoryParagraphs.map((para, epIdx) => {
                          return (
                            <p key={`epara-${epIdx}`} className="indent-6 md:indent-8">
                              {para}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="text-[11px] font-mono font-black uppercase tracking-wider">
                        Fairytale Memory Anchor (မှတ်သားမှု အထောက်အကူများ)
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      {generatedStory.vocabularyInsights.map((ins, idx) => {
                        const isPhrv = ins.type === "PHRV";
                        const colorClass = isPhrv 
                          ? "bg-cyan-50/50 border-cyan-150 hover:bg-cyan-100/20" 
                          : "bg-amber-50/50 border-amber-150 hover:bg-amber-100/20";
                        
                        return (
                          <div 
                            key={`insight-${idx}`}
                            className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${colorClass}`}
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-1">
                              <span 
                                className="font-black text-indigo-950 text-xs hover:underline cursor-pointer flex items-center gap-1"
                                onClick={() => speakText(ins.term, "en-US")}
                              >
                                🚀 {ins.term}
                              </span>
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border font-sans ${isPhrv ? "bg-cyan-100 text-cyan-900 border-cyan-200" : "bg-amber-100 text-amber-900 border-amber-200"}`}>
                                {ins.type}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-slate-800 font-extrabold font-sans">အဓိပ္ပာယ်: {ins.meaning}</p>
                              <p className="text-[10.5px] text-indigo-900 font-semibold leading-relaxed">
                                🎯 <span className="text-indigo-950">{ins.contextualUse}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Flashcards */}
        {activeStudyTab === "flashcard" && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
            {parsedCards.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center max-w-md space-y-3">
                <BookMarked className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-black text-slate-800">လေ့ကျင့်ရန် စာလုံးများ မရှိသေးပါ</p>
                <p className="text-[11px] text-slate-500 font-medium font-black">
                  နမူနာ မှတ်စုများ ထည့်ပါ သို့မဟုတ် ကိုယ်ပိုင် English မှတ်စုများ ဖြည့်ပေးပါ။
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-5">
                
                {/* Mode Selector for Flashcard Views */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 w-full max-w-xs justify-center shrink-0 border border-slate-200 select-none">
                  <button
                    type="button"
                    onClick={() => setFlashcardViewMode("standard")}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      flashcardViewMode === "standard"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    💾 Standard Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlashcardViewMode("immersive")}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      flashcardViewMode === "immersive"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ✨ Immersive Focus
                  </button>
                </div>

                {/* Starting Language / Flip Side Selector */}
                <div className="flex items-center gap-2 justify-center text-xs pb-1 select-none">
                  <span className="text-slate-500 font-extrabold text-[11px]">မေးခွန်းပုံစံ:</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setFlashcardStartSide("en");
                        setIsFlashcardFlipped(false);
                      }}
                      className={`py-1 px-3 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        flashcardStartSide === "en"
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      🇬🇧 English First
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFlashcardStartSide("my");
                        setIsFlashcardFlipped(false);
                      }}
                      className={`py-1 px-3 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        flashcardStartSide === "my"
                          ? "bg-white text-emerald-700 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      🇲🇲 Myanmar First
                    </button>
                  </div>
                </div>

                {/* MODE 1: STANDARD VIEW (Original layout, pristine, untouched) */}
                {flashcardViewMode === "standard" ? (
                  <div className="w-full max-w-md flex flex-col items-center space-y-5">
                    {/* 3D Flip Card Container */}
                    <div 
                      className="w-full aspect-[16/10] sm:aspect-[16/9] cursor-pointer group select-none"
                      style={{ perspective: "1000px" }}
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                    >
                      <div 
                        className="relative w-full h-full duration-500 transform-style-3d transition-transform"
                        style={{ 
                          transform: isFlashcardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                          transformStyle: "preserve-3d" 
                        }}
                      >
                        {/* FIRST SIDE (renders Front English when starting side is 'en', otherwise Myanmar's card on 0deg) */}
                        {flashcardStartSide === "en" ? (
                          /* English on Front (0deg) */
                          <div 
                            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-50/40 to-white border border-indigo-150 shadow-2xs backface-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <div className="text-left flex justify-between items-center w-full">
                              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-650 bg-indigo-100/50 px-2.5 py-0.5 rounded-full select-none">🇬🇧 English Term</span>
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded border uppercase font-sans bg-indigo-100 text-indigo-900 border-indigo-200">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <h3 className="text-2xl font-black text-indigo-955 font-sans tracking-tight text-center">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.term}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(parsedCards[currentFlashcardIdx % parsedCards.length]?.term, "en-US");
                                }}
                                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>

                            <span className="text-[9px] font-black text-slate-400">ကတ်ကိုလှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                          </div>
                        ) : (
                          /* Myanmar on Front (0deg) */
                          <div 
                            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-150 shadow-2xs backface-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <div className="text-left flex justify-between items-center w-full">
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/50 px-2.5 py-0.5 rounded-full select-none">🇲🇲 Myanmar Meaning</span>
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded border uppercase font-sans bg-emerald-100 text-emerald-955 border-emerald-200">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <p className="text-base md:text-lg font-black text-emerald-950 text-center leading-relaxed px-2">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.meaning}
                              </p>
                            </div>

                            <span className="text-[9px] font-black text-slate-400">ကတ်ကိုလှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                          </div>
                        )}

                        {/* SECOND SIDE (renders Back Myanmar when starting side is 'en', otherwise English on Back with 180deg transform) */}
                        {flashcardStartSide === "en" ? (
                          /* Myanmar on Back (180deg) */
                          <div 
                            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-150 shadow-2xs backface-hidden"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <div className="text-left flex justify-between items-center w-full">
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/50 px-2.5 py-0.5 rounded-full select-none">🇲🇲 Myanmar Meaning</span>
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded border uppercase font-sans bg-emerald-100 text-emerald-955 border-emerald-200">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <p className="text-base md:text-lg font-black text-emerald-955 text-center leading-relaxed px-2">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.meaning}
                              </p>
                            </div>

                            <span className="text-[9px] font-black text-slate-400">ကတ်ကိုပြန်လှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                          </div>
                        ) : (
                          /* English on Back (180deg) */
                          <div 
                            className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-50/40 to-white border border-indigo-150 shadow-2xs backface-hidden"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <div className="text-left flex justify-between items-center w-full">
                              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-650 bg-indigo-100/50 px-2.5 py-0.5 rounded-full select-none">🇬🇧 English Term</span>
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded border uppercase font-sans bg-indigo-100 text-indigo-900 border-indigo-200">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <h3 className="text-2xl font-black text-indigo-955 font-sans tracking-tight text-center">
                                {parsedCards[currentFlashcardIdx % parsedCards.length]?.term}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(parsedCards[currentFlashcardIdx % parsedCards.length]?.term, "en-US");
                                }}
                                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>

                            <span className="text-[9px] font-black text-slate-400">ကတ်ကိုပြန်လှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navigation and Slider Controls */}
                    <div className="flex items-center gap-4 w-full justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFlashcardFlipped(false);
                          setCurrentFlashcardIdx((prev) => (prev - 1 + parsedCards.length) % parsedCards.length);
                        }}
                        className="p-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl active:scale-95 transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5"
                      >
                        ← ယခင်ကတ်
                      </button>
                      <span className="text-xs font-black text-slate-600 font-mono">
                        {currentFlashcardIdx + 1} / {parsedCards.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFlashcardFlipped(false);
                          setCurrentFlashcardIdx((prev) => (prev + 1) % parsedCards.length);
                        }}
                        className="p-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl active:scale-95 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                      >
                        နောက်ကတ် →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MODE 2: IMMERSIVE FULLSCREEN OVERLAY (Distraction-free) */
                  <div className="fixed inset-0 bg-[#070b13] text-white z-50 flex flex-col justify-between items-center p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 select-none">
                    
                    {/* Top Action Row - Exit, Start Side, and Orientation selection */}
                    <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 pb-4 border-b border-[#1d273d]/40">
                      <button
                        type="button"
                        onClick={() => setFlashcardViewMode("standard")}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      >
                        ✕ ပြန်ထွက်ရန် (Exit Focus)
                      </button>

                      {/* Starting side toggles */}
                      <div className="flex bg-[#121a2d] p-1 rounded-xl border border-[#233150] gap-1 shrink-0 items-center">
                        <span className="text-[10px] text-slate-400 font-extrabold px-1.5">မေးခွန်းပုံစံ:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardStartSide("en");
                            setIsFlashcardFlipped(false);
                          }}
                          className={`py-1 px-3 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            flashcardStartSide === "en"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          🇬🇧 English First
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardStartSide("my");
                            setIsFlashcardFlipped(false);
                          }}
                          className={`py-1 px-3 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            flashcardStartSide === "my"
                              ? "bg-[#205141] text-emerald-100 shadow-xs"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          🇲🇲 Myanmar First
                        </button>
                      </div>
                      
                      {/* Orientation toggles (ဒေါင်လိုက် V.S. ရေပြင်ညီ) */}
                      <div className="flex bg-[#121a2d] p-1 rounded-xl border border-[#233150] gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFlashcardOrientation("portrait")}
                          className={`py-1 px-3 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            flashcardOrientation === "portrait"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          📱 Portrait (ဒေါင်လိုက်)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlashcardOrientation("landscape")}
                          className={`py-1 px-3 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            flashcardOrientation === "landscape"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          📟 Landscape (ရေပြင်ညီ)
                        </button>
                      </div>
                    </div>

                    {/* Centered Area: The Single Immersive Card */}
                    <div className="flex-1 w-full flex items-center justify-center p-4">
                      <div 
                        className={`cursor-pointer max-w-full duration-500 transform-style-3d transition-all ${
                          flashcardOrientation === "portrait"
                            ? "w-[330px] aspect-[3/4.2] sm:h-[450px]"
                            : "w-[560px] aspect-[16/10] sm:h-[310px]"
                        }`}
                        style={{ perspective: "1200px" }}
                        onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      >
                        <div 
                          className="relative w-full h-full duration-500 rounded-3xl"
                          style={{ 
                            transform: isFlashcardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            transformStyle: "preserve-3d" 
                          }}
                        >
                          {/* FIRST SIDE OF IMMERSIVE CARD */}
                          {flashcardStartSide === "en" ? (
                            /* Card Front (English Term) */
                            <div 
                              className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#162035] to-[#1a253d] border border-[#2d3f66] shadow-xl backface-hidden"
                              style={{ backfaceVisibility: "hidden" }}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-900/40 px-3 py-1 rounded-full">🇬🇧 English Term</span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded border uppercase font-sans bg-indigo-950 text-indigo-300 border-indigo-900/60">
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center space-y-4 my-auto">
                                <h2 className={`font-black text-center text-indigo-100 font-sans tracking-tight leading-snug break-words px-2 ${
                                  flashcardOrientation === "portrait" ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
                                }`}>
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.term}
                                </h2>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(parsedCards[currentFlashcardIdx % parsedCards.length]?.term, "en-US");
                                  }}
                                  className="p-2.5 bg-[#253251] hover:bg-[#32456f] text-indigo-300 hover:text-white rounded-full transition-colors cursor-pointer"
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                              </div>

                              <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-wider">🔄 ကတ်ကိုလှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                            </div>
                          ) : (
                            /* Card Front (Myanmar Meaning) */
                            <div 
                              className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#112720] to-[#15342a] border border-[#205141] shadow-xl backface-hidden"
                              style={{ backfaceVisibility: "hidden" }}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-[#0d1f19] border border-emerald-900/40 px-3 py-1 rounded-full">🇲🇲 Meaning</span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded border uppercase font-sans bg-[#0d1f19] text-emerald-300 border-emerald-900/60 font-black">
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center space-y-4 my-auto">
                                <p className={`font-extrabold text-emerald-100 text-center leading-relaxed break-words px-3 ${
                                  flashcardOrientation === "portrait" ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
                                }`}>
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.meaning}
                                </p>
                              </div>

                              <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-wider">🔄 ကတ်ကိုလှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                            </div>
                          )}

                          {/* SECOND SIDE OF IMMERSIVE CARD */}
                          {flashcardStartSide === "en" ? (
                            /* Card Back (Myanmar Meaning) */
                            <div 
                              className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#112720] to-[#15342a] border border-[#205141] shadow-xl backface-hidden"
                              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-900/40 px-3 py-1 rounded-full">🇲🇲 Meaning</span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded border uppercase font-sans bg-emerald-950 text-emerald-300 border-emerald-900/60">
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center space-y-4 my-auto">
                                <p className={`font-extrabold text-emerald-100 text-center leading-relaxed break-words px-3 ${
                                  flashcardOrientation === "portrait" ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
                                }`}>
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.meaning}
                                </p>
                              </div>

                              <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-wider">🔄 ကတ်ကိုလှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                            </div>
                          ) : (
                            /* Card Back (English Term) */
                            <div 
                              className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#162035] to-[#1a253d] border border-[#2d3f66] shadow-xl backface-hidden"
                              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-900/40 px-3 py-1 rounded-full">🇬🇧 English Term</span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded border uppercase font-sans bg-indigo-950 text-indigo-300 border-indigo-900/60">
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.type}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-center justify-center space-y-4 my-auto">
                                <h2 className={`font-black text-center text-indigo-100 font-sans tracking-tight leading-snug break-words px-2 ${
                                  flashcardOrientation === "portrait" ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
                                }`}>
                                  {parsedCards[currentFlashcardIdx % parsedCards.length]?.term}
                                </h2>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(parsedCards[currentFlashcardIdx % parsedCards.length]?.term, "en-US");
                                  }}
                                  className="p-2.5 bg-[#253251] hover:bg-[#32456f] text-indigo-300 hover:text-white rounded-full transition-colors cursor-pointer"
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                              </div>

                              <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-wider">🔄 ကတ်ကိုလှန်ရန် နှိပ်ပါ (Tap to Flip)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row - Navigation & Progress only! */}
                    <div className="w-full max-w-4xl flex items-center justify-between gap-4 shrink-0 pt-4 border-t border-[#1d273d]/40 select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFlashcardFlipped(false);
                          setCurrentFlashcardIdx((prev) => (prev - 1 + parsedCards.length) % parsedCards.length);
                        }}
                        className="py-3 px-6 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-black rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        ◀ ယခင်ကတ် (Prev)
                      </button>
                      
                      <div className="text-center font-mono">
                        <span className="text-sm font-black text-slate-300">
                          {currentFlashcardIdx + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-bold mx-1.5">/</span>
                        <span className="text-xs font-extrabold text-slate-400">
                          {parsedCards.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsFlashcardFlipped(false);
                          setCurrentFlashcardIdx((prev) => (prev + 1) % parsedCards.length);
                        }}
                        className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-650/25"
                      >
                        နောက်ကတ် ▶ (Next)
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* Tab 3: Vocab Quiz */}
        {activeStudyTab === "quiz" && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
            {parsedCards.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center max-w-md space-y-3">
                <Trophy className="w-10 h-10 text-orange-500 mx-auto" />
                <p className="text-xs font-black text-slate-800">ဉာဏ်စမ်းကစားရန် စာလုံးများ မရှိသေးပါ</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  နမူနာ စာအုပ်ကို ထည့်သွင်းပြီးမှ ဤဉာဏ်စမ်းမေးခွန်းများကို ဖြေဆိုနိုင်မည် ဖြစ်သည်။
                </p>
              </div>
            ) : (
              <div className="w-full max-w-md flex flex-col items-center space-y-5">
                <div className="flex items-center justify-between w-full border-b border-slate-101 pb-2">
                  <span className="text-xs font-black text-indigo-750 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    ရမှတ်: {storyQuizScore} မှတ်
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    မေးခွန်း {currentFlashcardIdx + 1}
                  </span>
                </div>

                <div className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-5 text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Quiz Question:</span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-sans tracking-tight text-indigo-955">
                      {activeQuizCard?.term}
                    </h3>
                    <button
                      type="button"
                      onClick={() => speakText(activeQuizCard?.term, "en-US")}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-101"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Multiple Choice Options */}
                  <div className="space-y-2 pt-2">
                    {quizOptions.map((opt, idx) => {
                      const isSelected = quizSelectedAnswer === opt;
                      const isCorrect = opt === activeQuizCard?.meaning;
                      
                      let btnStyle = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";
                      
                      if (quizChecked) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-50/60 text-emerald-950";
                        } else if (isSelected) {
                          btnStyle = "border-rose-300 bg-rose-50 text-rose-950";
                        } else {
                          btnStyle = "border-slate-100 bg-white text-slate-400 opacity-60";
                        }
                      } else if (isSelected) {
                        btnStyle = "border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-600";
                      }
                      
                      return (
                        <button
                          key={`quiz-opt-${idx}`}
                          type="button"
                          onClick={() => {
                            if (quizChecked) return;
                            setQuizSelectedAnswer(opt);
                          }}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizChecked && isCorrect && <span className="text-emerald-700 font-black">✓ မှန်ကန်သည်</span>}
                          {quizChecked && isSelected && !isCorrect && <span className="text-rose-700 font-black">✗ မှားယွင်းသည်</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center w-full pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">
                    {quizChecked ? "နောက်တစ်ပုဒ်သို့ သွားရန် 'နောက်မေးခွန်းသို့' ကို နှိပ်ပါ" : "အဖြေတစ်ခုရွေးချယ်ပြီးပါက 'စစ်ဆေးမည်' ကို နှိပ်ပါ"}
                  </p>

                  <div className="flex gap-2">
                    {!quizChecked ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!quizSelectedAnswer) {
                            showError("ကျေးဇူးပြု၍ အဖြေတစ်ခုကို အရင်ရွေးချယ်ပေးပါဗျာ။");
                            return;
                          }
                          setQuizChecked(true);
                          if (quizSelectedAnswer === activeQuizCard?.meaning) {
                            setStoryQuizScore(s => s + 1);
                            showSuccess("မှန်ကန်ပါတယ်ဗျာ။ တော်လိုက်တာ! 🎉");
                          } else {
                            showError(`မှားယွင်းနေပါတယ်ဗျာ။ အဖြေမှန်မှာ "${activeQuizCard?.meaning}" ဖြစ်ပါတယ်ဗျာ။ ❌`);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-3xs"
                      >
                        အဖြေစစ်ဆေးမည်
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setQuizChecked(false);
                          setQuizSelectedAnswer(null);
                          setQuizSelectionSeed(s => s + 1);
                          setCurrentFlashcardIdx(p => (p + 1) % parsedCards.length);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-3xs"
                      >
                        နောက်မေးခွန်းသို့ →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Coach AI Tab */}
        {activeStudyTab === "coach" && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative overflow-hidden transition-all shadow-md space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 to-pink-500" />
            
            {/* Coach AI Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold border border-rose-200">
                  👩‍🏫
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-955 flex items-center gap-1.5">
                    Sayarma AI (ဆရာမ AI) — Coach
                    <span className="text-[9px] bg-rose-100 text-rose-805 font-black px-1.5 py-0.5 rounded-full uppercase">ONLINE</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold font-sans">
                    ဆရာမလေးလို စာမေးလို့ရ၊ ရှင်းပြပေးနိုင်တဲ့ သင့်ရဲ့ ကိုယ်ပိုင် အင်္ဂလိပ်စာ ကူညီပံ့ပိုးပေးသူ
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm("စကားပြောဆိုမှုများကို အစမှ ပြန်လည်စတင်လိုပါသလားရှင်?")) {
                    setCoachHistory([
                      {
                        role: "model",
                        text: "မင်္ဂလာပါရှင်! ဆရာမ AI (Sayarma AI) ဖြစ်ပါတယ်ရှင်။ 💖\n\nဒီနေရာမှာ ဆရာမကို အင်္ဂလိပ်စာနဲ့ ပတ်သက်ပြီး စာမေးလို့ရသလို၊ သိချင်တာတွေ ရှင်းပြခိုင်းလို့လည်း ရပါတယ်ရှင်။\n\n📌 **ဘာတွေလုပ်လို့ရလဲဆိုရင် -**\n၁။ ဆရာမကို ဉာဏ်စမ်းမေးခွန်း မေးခိုင်းပြီး ဖြေဆိုလေ့ကျင့်နိုင်ပါတယ်။\n၂။ မိမိလေ့လာနေတဲ့ Vocabulary မှတ်စုတွေထဲက စကားလုံးတွေကို ဥပမာဝါကျနဲ့တကွ ရှင်းပြခိုင်းနိုင်ပါတယ်။\n\nဘယ်အရာကို အတူတူ လေ့လာကြမလဲရှင်?"
                      }
                    ]);
                  }
                }}
                className="text-[10px] text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded-lg font-black transition-colors cursor-pointer"
              >
                Clear History (ပြန်စမည်)
              </button>
            </div>

            {/* Chat message logs */}
            <div className="min-h-[320px] max-h-96 overflow-y-auto space-y-3 p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-150/80">
              {coachHistory.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div key={`coach-msg-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-xs shrink-0 shadow-4xs mt-0.5">
                        👩‍🏫
                      </div>
                    )}
                    <div className={`max-w-[85%] text-xs rounded-2xl px-4 py-3 shadow-4xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-slate-800 text-white rounded-tr-none font-bold"
                        : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-semibold"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              
              {isCoachThinking && (
                <div className="flex justify-start items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-xs shrink-0 animate-bounce">
                    👩‍🏫
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 text-rose-800 text-[11px] font-black rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    <span>ဆရာမ စဉ်းစားနေပါသည်... ကျေးဇူးပြု၍ ခဏစောင့်ပေးပါရှင်။</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-black text-slate-400 self-center uppercase tracking-wider">အမြန်မေးရန်:</span>
              <button
                type="button"
                onClick={() => handleSendCoachMessage("ဉာဏ်စမ်း မေးခွန်းတစ်ခု မေးပေးပါရှင်။")}
                disabled={isCoachThinking}
                className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl text-[10.5px] font-bold text-indigo-750 active:scale-95 transition-all text-left flex items-center gap-1 cursor-pointer"
              >
                ❓ English ဉာဏ်စမ်းမေးပါ
              </button>
              <button
                type="button"
                onClick={() => handleSendCoachMessage("ငါ့ရဲ့ Vocabulary မှတ်စုတွေကို အကျဉ်းချုပ် ရှင်းပြပေးပါရှင်။")}
                disabled={isCoachThinking}
                className="py-1 px-3 bg-violet-50 hover:bg-violet-100 border border-violet-200/60 rounded-xl text-[10.5px] font-bold text-violet-750 active:scale-95 transition-all text-left flex items-center gap-1 cursor-pointer"
              >
                📚 ငါ့မှတ်စုကို ရှင်းပြပါ
              </button>
              <button
                type="button"
                onClick={() => handleSendCoachMessage("Idioms နဲ့ Phrasal Verbs အသုံးဝင်ပုံ ရှင်းပြပေးပါဦးရှင်။")}
                disabled={isCoachThinking}
                className="py-1 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-xl text-[10.5px] font-bold text-amber-750 active:scale-95 transition-all text-left flex items-center gap-1 cursor-pointer"
              >
                🗣️ Idiom & Phrasal Verb လေ့လာရန်
              </button>
            </div>

            {/* Send input container */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!coachInput.trim()) return;
                handleSendCoachMessage(coachInput);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="ဆရာမဆီသို့ မေးခွန်း သို့မဟုတ် အဖြေတစ်ခုခု ရိုက်ပြီး ပို့လိုက်ပါ..."
                disabled={isCoachThinking}
                className="flex-1 text-xs px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500 bg-white placeholder-slate-400 font-bold font-sans"
              />
              <button
                type="submit"
                disabled={isCoachThinking || !coachInput.trim()}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl active:scale-95 transition-all shadow-3xs flex items-center gap-1 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <span>စာပို့မည်</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };


const getLongestCommonSubstringLength = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    let maxLen = 0;
    const num = Array(str1.length).fill(0).map(() => Array(str2.length).fill(0));
    
    for (let i = 0; i < str1.length; i++) {
      for (let j = 0; j < str2.length; j++) {
        if (str1[i] === str2[j]) {
          num[i][j] = (i === 0 || j === 0) ? 1 : num[i-1][j-1] + 1;
          if (num[i][j] > maxLen) {
            maxLen = num[i][j];
          }
        }
      }
    }
    return maxLen;
  };

  const findVocabularyMatchForBadge = (
    precedingText: string,
    badgeType: "IDM" | "PHRV",
    words: any[]
  ): { wordIndex: number; wordObj: any } | null => {
    if (!words || !precedingText) return null;
    
    const cleanPreceding = precedingText.trim();
    if (!cleanPreceding) return null;

    const searchSpace = cleanPreceding.replace(/[\(\)\[\]{}.,\-\s]/g, "");
    if (!searchSpace) return null;

    // Focus on the last 25 characters from the end of the preceding text (exactly where the highlighted phrase lives)
    const suffix = searchSpace.slice(-25);

    let bestMatch: { index: number; word: any; score: number } | null = null;
    
    words.forEach((w, idx) => {
      const isIdm = (w.pos && (w.pos.toLowerCase().includes("idm") || w.pos.toLowerCase().includes("idiom"))) || (w.fallback_my && w.fallback_my.includes("[IDM]"));
      const isPhrv = (w.pos && (w.pos.toLowerCase().includes("phrv") || w.pos.toLowerCase().includes("phrasal"))) || (w.fallback_my && w.fallback_my.includes("[PHRV]"));
      
      const matchesType = (badgeType === "IDM" && isIdm) || (badgeType === "PHRV" && isPhrv);
      
      const candidatesToMatch: string[] = [];
      if (w.fallback_my) {
        candidatesToMatch.push(w.fallback_my.replace(/\[(IDM|PHRV)\]/gi, "").trim());
      }
      if (w.dictionary_definition) {
        // split by lines to isolate distinct definition clauses
        const definitionLines = w.dictionary_definition.split('\n');
        definitionLines.forEach((l: string) => {
          const cleanedL = l.replace(/\[(IDM|PHRV)\]/gi, "").trim();
          if (cleanedL) candidatesToMatch.push(cleanedL);
        });
      }
      
      candidatesToMatch.forEach(rawText => {
        const lines = rawText.split(/[\n;(),ဥပမာ]/);
        lines.forEach(lineSegment => {
          const cleanCandidate = lineSegment.replace(/[\(\)\[\]{}.,\-\s]/g, "").trim();
          if (!cleanCandidate || cleanCandidate.length < 2) return;
          
          // Calculate the Longest Common Substring length between candidate dictionary text and preceding suffix
          const lcsLength = getLongestCommonSubstringLength(cleanCandidate, suffix);
          
          if (lcsLength >= 2) {
            let score = lcsLength * 12;
            
            // If the suffix has a complete or very close exact match of the candidate, award a massive bonus
            if (suffix.includes(cleanCandidate) || cleanCandidate.includes(suffix)) {
              score += 150;
            }
            
            // Type match is extremely important so that IDMs/PHRVs bind to their correct badges
            if (matchesType) {
              score += 100;
            }
            
            // Proximity bonus: check position inside the suffix to favor matches occurring closer to the right end
            const lcsStartInSuffix = suffix.lastIndexOf(cleanCandidate.substring(0, Math.min(3, cleanCandidate.length)));
            if (lcsStartInSuffix !== -1) {
              const distFromEnd = suffix.length - lcsStartInSuffix;
              score += Math.max(0, 60 - distFromEnd * 3);
            }
            
            if (!bestMatch || score > bestMatch.score) {
              bestMatch = { index: idx, word: w, score };
            }
          }
        });
      });
    });
    
    if (bestMatch && bestMatch.score > 20) {
      return { wordIndex: (bestMatch as any).index, wordObj: (bestMatch as any).word };
    }
    return null;
  };

  const splitMyanmarSentences = (text: string): string[] => {
    if (!text) return [];
    const parts = text.split("။");
    const sentences: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i].trim();
      if (p) {
        if (i < parts.length - 1) {
          p += "။";
        }
        sentences.push(p);
      }
    }
    return sentences;
  };

  const splitEnglishSentences = (text: string): string[] => {
    if (!text) return [];
    const parts = text.split(/([.!?])/);
    const sentences: string[] = [];
    let current = "";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p) continue;
      if (p === "." || p === "!" || p === "?") {
        current += p;
        if (current.trim()) {
          sentences.push(current.trim());
        }
        current = "";
      } else {
        if (current.trim()) {
          sentences.push(current.trim());
        }
        current = p;
      }
    }
    if (current.trim()) {
      sentences.push(current.trim());
    }
    return sentences;
  };

  const getAllBurmeseSentencesFlat = (text: string): string[] => {
    if (!text) return [];
    const paras = text.split(/\r?\n/);
    const flat: string[] = [];
    for (const para of paras) {
      if (!para.trim()) continue;
      const sents = splitMyanmarSentences(para);
      flat.push(...sents);
    }
    return flat;
  };

  const getAllEnglishSentencesFlat = (text: string): string[] => {
    if (!text) return [];
    const paras = text.split(/\r?\n/);
    const flat: string[] = [];
    for (const para of paras) {
      if (!para.trim()) continue;
      const sents = splitEnglishSentences(para);
      flat.push(...sents);
    }
    return flat;
  };

  const getPairedEnglishSentence = (targetGlobalIndex: number): string => {
    if (targetGlobalIndex === null || targetGlobalIndex === undefined) return "";
    
    const bParas = (translationResult?.translation || "").split(/\r?\n/);
    const eParas = (inputText || "").split(/\r?\n/);
    
    let globalSentenceIndexCounter = 0;
    
    // First, let's find the active paragraph and sentence in the Burmese list
    let foundBParaIdx = -1;
    let foundBSentIdx = -1;
    let totalBSentsInPara = 0;
    
    for (let pIdx = 0; pIdx < bParas.length; pIdx++) {
      const bPara = bParas[pIdx];
      if (!bPara.trim()) continue;
      
      const bSents = splitMyanmarSentences(bPara);
      for (let sIdx = 0; sIdx < bSents.length; sIdx++) {
        if (globalSentenceIndexCounter === targetGlobalIndex) {
          foundBParaIdx = pIdx;
          foundBSentIdx = sIdx;
          totalBSentsInPara = bSents.length;
          break;
        }
        globalSentenceIndexCounter++;
      }
      if (foundBParaIdx !== -1) break;
    }
    
    if (foundBParaIdx === -1) return "";
    
    // Now, we align this to the English paragraphs.
    // Let's filter out empty paragraphs in both English and Burmese to find the real matching paragraph.
    const nonEmptysB = bParas.map((p, idx) => ({ text: p, originalIdx: idx })).filter(item => item.text.trim());
    const nonEmptysE = eParas.map((p, idx) => ({ text: p, originalIdx: idx })).filter(item => item.text.trim());
    
    if (nonEmptysB.length === 0 || nonEmptysE.length === 0) return "";
    
    // Find the relative index of our Burmese paragraph in the non-empty list
    const relBIndex = nonEmptysB.findIndex(item => item.originalIdx === foundBParaIdx);
    if (relBIndex === -1) return "";
    
    // Map relBIndex to the English list
    let relEIndex = relBIndex;
    if (nonEmptysB.length !== nonEmptysE.length) {
      relEIndex = Math.min(
        nonEmptysE.length - 1,
        Math.floor((relBIndex / nonEmptysB.length) * nonEmptysE.length)
      );
    }
    
    const matchedEPara = nonEmptysE[relEIndex];
    if (!matchedEPara) return "";
    
    const eSents = splitEnglishSentences(matchedEPara.text);
    if (eSents.length === 0) return "";
    
    // Map sIdx of Burmese to English sentences
    if (eSents.length === totalBSentsInPara) {
      return eSents[foundBSentIdx] || "";
    }
    
    const engIdx = Math.min(
      eSents.length - 1,
      Math.floor((foundBSentIdx / totalBSentsInPara) * eSents.length)
    );
    return eSents[engIdx] || "";
  };

  const renderSegmentedBurmeseTranslation = (
    burmeseText: string | null,
    wordsList: any[] = []
  ): React.ReactNode => {
    if (!burmeseText) return null;
    
    const bParas = burmeseText.split(/\r?\n/);
    const eParas = (inputText || "").split(/\r?\n/);
    
    let globalSentenceIndexCounter = 0;
    
    return (
      <div className="space-y-4">
        {bParas.map((bPara, pIdx) => {
          if (!bPara.trim()) {
            return <div key={`para-space-${pIdx}`} className="h-2" />;
          }
          
          const ePara = eParas[pIdx] || "";
          const bSents = splitMyanmarSentences(bPara);
          const eSents = splitEnglishSentences(ePara);
          
          return (
            <p key={`para-${pIdx}`} className="text-lg text-slate-805 leading-relaxed font-semibold">
              {bSents.map((mySent, sIdx) => {
                const currentGlobalIdx = globalSentenceIndexCounter;
                globalSentenceIndexCounter++;
                
                const isHovered = activeHoveredSentenceIndex === currentGlobalIdx;
                
                return (
                  <span
                    key={`my-sent-${currentGlobalIdx}`}
                    className={`inline cursor-help transition-all duration-150 rounded px-0.5 ${
                      isHovered ? "bg-amber-100/50 text-indigo-950 font-bold" : "hover:bg-slate-100"
                    }`}
                    onMouseEnter={(e) => {
                      if (sentenceHoverTimeoutRef.current) {
                        clearTimeout(sentenceHoverTimeoutRef.current);
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const container = document.getElementById("myanmar-translation-container");
                      if (container) {
                        const containerRect = container.getBoundingClientRect();
                        setHoveredSentencePosition({
                          x: Math.max(10, Math.min(containerRect.width - 240, rect.left - containerRect.left + (rect.width / 2) - 120)),
                          y: rect.bottom - containerRect.top + 8
                        });
                      }
                      setActiveHoveredSentenceIndex(currentGlobalIdx);
                      setSentenceCopied(false);
                    }}
                    onMouseLeave={() => {
                      sentenceHoverTimeoutRef.current = setTimeout(() => {
                        if (!isHoveringPopup) {
                          setActiveHoveredSentenceIndex(null);
                        }
                      }, 380);
                    }}
                  >
                    {renderTextWithLineBadgesAndLinks(mySent, wordsList)}
                    {" "}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const renderTextWithLineBadgesAndLinks = (
    text: string | null,
    wordsList: any[] = []
  ): React.ReactNode => {
    if (!text) return null;
    
    const parts = text.split(/(\[IDM\]|\[PHRV\])/g);
    const nodes: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === "[IDM]" || part === "[PHRV]") {
        continue;
      }
      
      const nextPart = parts[i + 1];
      if (nextPart === "[IDM]" || nextPart === "[PHRV]") {
        const badgeType = nextPart === "[IDM]" ? "IDM" : "PHRV";
        const match = findVocabularyMatchForBadge(part, badgeType, wordsList);
        
        if (match) {
          const candidates: string[] = [];
          if (match.wordObj.fallback_my) {
            candidates.push(match.wordObj.fallback_my.replace(/\[(IDM|PHRV)\]/gi, "").trim());
          }
          if (match.wordObj.dictionary_definition) {
            const definitionLines = match.wordObj.dictionary_definition.split('\n');
            definitionLines.forEach((l: string) => {
              const cleanedL = l.replace(/\[(IDM|PHRV)\]/gi, "").trim();
              if (cleanedL) candidates.push(cleanedL);
            });
          }
          
          let foundPhrase = "";
          for (const cand of candidates) {
            const cleanCand = cand.replace(/[\(\)\[\]{}.,\-\s]/g, "").trim();
            if (!cleanCand || cleanCand.length < 2) continue;
            
            const indexInPart = part.toLowerCase().indexOf(cand.toLowerCase());
            if (indexInPart !== -1) {
              foundPhrase = part.substr(indexInPart, cand.length);
              break;
            }
            
            const cleanPart = part.replace(/\s+/g, "");
            const indexInPartNoSpaces = cleanPart.indexOf(cleanCand);
            if (indexInPartNoSpaces !== -1) {
              const matchTextSeq = part.match(/[\u1000-\u109f]+/g);
              if (matchTextSeq) {
                for (const seq of matchTextSeq) {
                  if (seq.includes(cleanCand) || cleanCand.includes(seq)) {
                    foundPhrase = seq;
                    break;
                  }
                }
              }
              if (foundPhrase) break;
            }
          }
          
          if (foundPhrase && part.indexOf(foundPhrase) !== -1) {
            const phraseIdx = part.indexOf(foundPhrase);
            const textBefore = part.substring(0, phraseIdx);
            const textAfter = part.substring(phraseIdx + foundPhrase.length);
            
            if (textBefore) {
              nodes.push(<span key={`before-${i}`}>{renderHoverableText(textBefore, `before-hover-${i}`)}</span>);
            }
            
            const badgeColorClass = badgeType === "IDM"
              ? "bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200"
              : "bg-cyan-100 text-cyan-950 border-cyan-300 hover:bg-cyan-200";
              
            nodes.push(
              <span className="relative group inline-block" key={`badge-wrap-${i}`}>
                <button
                  id={`myanmar-badge-${match.wordIndex}`}
                  type="button"
                  onClick={() => handleNavigateToWord(match.wordIndex)}
                  onDoubleClick={() => handleScrollToOriginalEnglish(match.wordIndex)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-bold text-sm mx-1 my-0.5 transition-all duration-155 cursor-pointer hover:scale-[1.03] active:scale-95 shadow-3xs ${
                    badgeType === "IDM" 
                      ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100" 
                      : "bg-cyan-50 text-cyan-900 border-cyan-200 hover:bg-cyan-100"
                  }`}
                >
                  <span className="underline decoration-indigo-400 decoration-1.5 underline-offset-2">{foundPhrase}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] uppercase font-extrabold select-none ${badgeColorClass}`}>
                    {badgeType}
                  </span>
                </button>
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 max-w-64 min-w-[140px] text-center whitespace-normal leading-relaxed">
                  <span className="text-[10px] text-indigo-300 border-b border-indigo-500/30 pb-0.5 mb-1.5 block w-full uppercase font-mono tracking-wider">
                    {badgeType === "IDM" ? "Idiom" : "Phrasal Verb"} (မူရင်းအင်္ဂလိပ်)
                  </span>
                  <span className="text-amber-300 text-sm font-black font-sans">{match.wordObj.original || match.wordObj.base}</span>
                  <span className="text-[9px] text-slate-355 font-medium mt-1">နှစ်ချက်နှိပ် (Double-Click) မူရင်းစာသားသို့သွားရန်</span>
                  <span className="w-1 h-1 border-4 border-transparent border-t-slate-900/95 absolute top-full left-1/2 -translate-x-1/2" />
                </span>
              </span>
            );
            
            if (textAfter) {
              nodes.push(<span key={`after-${i}`}>{renderHoverableText(textAfter, `after-hover-${i}`)}</span>);
            }
          } else {
            nodes.push(<span key={`fallback-part-${i}`}>{renderHoverableText(part, `fallback-hover-${i}`)}</span>);
            const badgeColorClass = badgeType === "IDM"
              ? "bg-amber-100 hover:bg-amber-200 text-amber-850 border-amber-200"
              : "bg-cyan-100 hover:bg-cyan-200 text-cyan-850 border-cyan-200";
              
            nodes.push(
              <span className="relative group inline-block" key={`badge-wrap-standalone-${i}`}>
                <button
                  type="button"
                  onClick={() => handleNavigateToWord(match.wordIndex)}
                  onDoubleClick={() => handleScrollToOriginalEnglish(match.wordIndex)}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] uppercase font-extrabold mx-1 align-middle transition-all duration-150 cursor-pointer hover:scale-[1.05] active:scale-95 shadow-3xs ${badgeColorClass}`}
                >
                  [{badgeType}]
                </button>
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 max-w-64 min-w-[140px] text-center whitespace-normal leading-relaxed">
                  <span className="text-[10px] text-indigo-300 border-b border-indigo-500/30 pb-0.5 mb-1.5 block w-full uppercase font-mono tracking-wider">
                    {badgeType === "IDM" ? "Idiom" : "Phrasal Verb"} (မူရင်းအင်္ဂလိပ်)
                  </span>
                  <span className="text-amber-300 text-sm font-black font-sans">{match.wordObj.original || match.wordObj.base}</span>
                  <span className="text-[9px] text-slate-355 font-medium mt-1">နှစ်ချက်နှိပ် (Double-Click) မူရင်းသို့သွားရန်</span>
                  <span className="w-1 h-1 border-4 border-transparent border-t-slate-900/95 absolute top-full left-1/2 -translate-x-1/2" />
                </span>
              </span>
            );
          }
        } else {
          nodes.push(<span key={`no-match-part-${i}`}>{renderHoverableText(part, `no-match-hover-${i}`)}</span>);
          if (badgeType === "IDM") {
            nodes.push(
              <span
                key={`static-idm-${i}`}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] uppercase font-extrabold mx-1 align-middle select-all"
                title="Idiomic Expression"
              >
                [IDM]
              </span>
            );
          } else {
            nodes.push(
              <span
                key={`static-phrv-${i}`}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] uppercase font-extrabold mx-1 align-middle select-all"
                title="Phrasal Verb"
              >
                [PHRV]
              </span>
            );
          }
        }
      } else {
        nodes.push(<span key={`plain-part-${i}`}>{renderHoverableText(part, `plain-hover-${i}`)}</span>);
      }
    }
    
    return <>{nodes}</>;
  };


  // TTS configurations
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechAccent, setSpeechAccent] = useState<string>("en-US");
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  // Vocabulary Quiz state
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    word: string;
    pos: string;
    correctMy: string;
    choices: string[];
    answerIdx: number;
  }>>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [quizSource, setQuizSource] = useState<"all" | "bookmarks" | "current">("current");

  // Custom API key states
  const [customApiKey, setCustomApiKey] = useState<string>(() => safeLocalStorage.getItem("gemini_api_key") || "");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // Cloud Sync Key states with backward compatibility
  const [cloudSyncKey, setCloudSyncKey] = useState<string>(() => {
    const existingSyncKey = safeLocalStorage.getItem("cloud_sync_key");
    if (existingSyncKey) return existingSyncKey;
    // Backward compatibility: if they had a gemini_api_key, copy it as cloud_sync_key so they don't lose sync
    const existingApiKey = safeLocalStorage.getItem("gemini_api_key");
    if (existingApiKey) {
      safeLocalStorage.setItem("cloud_sync_key", existingApiKey);
      return existingApiKey;
    }
    return "";
  });
  const [showSyncKey, setShowSyncKey] = useState<boolean>(false);

  // Firebase Authentication UI State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [googleDriveToken, setGoogleDriveToken] = useState<string | null>(() => {
    try {
      const stored = safeLocalStorage.getItem("google_drive_token_info");
      if (stored) {
        const { token } = JSON.parse(stored);
        if (token) {
          console.log("[Auth] Restoring Google Drive token from persistent storage...");
          return token;
        }
      }
    } catch (e) {
      console.warn("Failed to read google_drive_token_info from localStorage:", e);
    }
    return null;
  });

  const [googleDriveAuthorized, setGoogleDriveAuthorized] = useState<boolean>(() => {
    return safeLocalStorage.getItem("google_drive_authorized") === "true";
  });

  const updateGoogleDriveToken = (token: string | null, clearAuthCompletely = false) => {
    setGoogleDriveToken(token);
    if (token) {
      const tokenData = {
        token: token,
        acquiredAt: Date.now(),
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000 // Persistent fallback
      };
      safeLocalStorage.setItem("google_drive_token_info", JSON.stringify(tokenData));
      safeLocalStorage.setItem("google_drive_authorized", "true");
      setGoogleDriveAuthorized(true);
    } else {
      safeLocalStorage.removeItem("google_drive_token_info");
      if (clearAuthCompletely) {
        safeLocalStorage.removeItem("google_drive_authorized");
        setGoogleDriveAuthorized(false);
      }
    }
  };

  const ensureValidDriveToken = async (isBackgroundCall = false): Promise<string | null> => {
    if (!googleDriveAuthorized || !auth.currentUser) return googleDriveToken;

    let currentToken = googleDriveToken;
    let acquiredAt = 0;

    try {
      const stored = safeLocalStorage.getItem("google_drive_token_info");
      if (stored) {
        const parsed = JSON.parse(stored);
        currentToken = parsed.token || currentToken;
        acquiredAt = parsed.acquiredAt || 0;
      }
    } catch (e) {
      console.warn("Error parsing token info:", e);
    }

    // Google access tokens expire after 1 hour (3600 seconds).
    // Let's trigger a refresh if the token was acquired more than 50 minutes (3000 seconds) ago.
    const ageMs = Date.now() - acquiredAt;
    const needsRefresh = !currentToken || ageMs > 50 * 60 * 1000;

    if (needsRefresh) {
      if (isBackgroundCall) {
        console.log("[Sync] Google Drive token is close to expiry, but bypassing automatic re-auth in background to prevent popup block.");
        return currentToken;
      }

      console.log("[Sync] Google Drive token is expired or close to expiring, automatically re-authorizing...");
      try {
        const res = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(res);
        if (credential?.accessToken) {
          updateGoogleDriveToken(credential.accessToken);
          console.log("[Sync] Google Drive token automatically refreshed successfully!");
          return credential.accessToken;
        }
      } catch (err: any) {
        console.warn("[Sync] Implicit background token refresh failed (may be blocked by browser or closed):", err);
      }
    }

    return currentToken;
  };

  // Monitor Google Authentication status to dynamically switch to secure Google Firestore Sync / Google Drive Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        // User logged in! Set their unique stable Google UID as the cloud sync key
        setCloudSyncKey(currentUser.uid);
      } else {
        // Logged out: restore cloud sync key to the custom API key if present
        const currentApiKey = safeLocalStorage.getItem("gemini_api_key") || "";
        setCloudSyncKey(currentApiKey);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save API key to localStorage when changed, and keep cloudSyncKey aligned when not authenticated
  useEffect(() => {
    safeLocalStorage.setItem("gemini_api_key", customApiKey);
    if (!user) {
      setCloudSyncKey(customApiKey);
    }
  }, [customApiKey, user]);

  // Save cloud sync key to localStorage when changed
  useEffect(() => {
    safeLocalStorage.setItem("cloud_sync_key", cloudSyncKey);
  }, [cloudSyncKey]);

  // Native SHA-256 helper for API key hashing
  const computeApiKeyHash = async (key: string): Promise<string | null> => {
    if (!key || !key.trim()) return null;
    try {
      const msgBuffer = new TextEncoder().encode(key.trim());
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error("SHA256 computation failed", e);
      return null;
    }
  };

  const areNotebooksEqual = (a: any[], b: any[]): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const sortedB = [...b].sort((x, y) => x.id.localeCompare(y.id));
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i].id !== sortedB[i].id) return false;
      if (sortedA[i].title !== sortedB[i].title) return false;
      if (sortedA[i].content !== sortedB[i].content) return false;
      if ((sortedA[i].lastUpdated || 0) !== (sortedB[i].lastUpdated || 0)) return false;
      if (!!sortedA[i].isDeleted !== !!sortedB[i].isDeleted) return false;
    }
    return true;
  };

  const mergeNotebooks = (local: any[], remote: any[]): any[] => {
    const map = new Map<string, any>();
    
    // Process remote notebooks first
    (remote || []).forEach(nb => {
      if (!nb || !nb.id) return;
      map.set(nb.id, { ...nb, lastUpdated: nb.lastUpdated || 0, isDeleted: !!nb.isDeleted });
    });

    // Process local notebooks, prioritizing local if newer or equal or if remote is missing
    (local || []).forEach(nb => {
      if (!nb || !nb.id) return;
      if (map.has(nb.id)) {
        const existing = map.get(nb.id);
        const localTime = nb.lastUpdated || 0;
        const remoteTime = existing.lastUpdated || 0;
        if (localTime >= remoteTime) {
          map.set(nb.id, { ...nb, lastUpdated: localTime, isDeleted: !!nb.isDeleted });
        }
      } else {
        map.set(nb.id, { ...nb, lastUpdated: nb.lastUpdated || 0, isDeleted: !!nb.isDeleted });
      }
    });

    return Array.from(map.values());
  };

  const areHistoryArraysEqual = (a: HistoryItem[], b: HistoryItem[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const itemA = a[i];
      const itemB = b[i];
      if (!itemA || !itemB) return false;
      if (itemA.originalText !== itemB.originalText) return false;
      if (itemA.translation !== itemB.translation) return false;
      if (!!itemA.isBookmarked !== !!itemB.isBookmarked) return false;
      if (!!itemA.isDeleted !== !!itemB.isDeleted) return false;
      if (itemA.timestamp !== itemB.timestamp) return false;
    }
    return true;
  };

  // Rebuild mergeHistory: originalText-based Conflict-Free LWW-Element-Set (using tombstones)
  const mergeHistory = (local: HistoryItem[], remote: HistoryItem[]): HistoryItem[] => {
    const sanitizedLocal = sanitizeHistoryItems(local);
    const sanitizedRemote = sanitizeHistoryItems(remote);
    const map = new Map<string, HistoryItem>();
    
    // 1. Process remote items first (including soft-delete tombstones so we can sync deletions correctly)
    sanitizedRemote.forEach(item => {
      if (!item || !item.originalText) return;
      const key = item.originalText.toLowerCase().trim();
      map.set(key, item);
    });

    // 2. Process local items, keeping whichever item has the newer timestamp
    sanitizedLocal.forEach(item => {
      if (!item || !item.originalText) return;
      const key = item.originalText.toLowerCase().trim();
      if (map.has(key)) {
        const existing = map.get(key)!;
        if (item.timestamp >= existing.timestamp) {
          map.set(key, item);
        }
      } else {
        map.set(key, item);
      }
    });

    // 3. Keep standard capped capacity, but make sure bookmarks aren't pruned
    const combined = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    if (combined.length > 500) {
      const bookmarked = combined.filter(item => item.isBookmarked);
      const nonBookmarked = combined.filter(item => !item.isBookmarked);
      return sanitizeHistoryItems([...bookmarked, ...nonBookmarked.slice(0, 200)]).sort((a, b) => b.timestamp - a.timestamp);
    }

    return sanitizeHistoryItems(combined);
  };

  // Saves updated history array directly to the cloud, doing a safe merge before saving to never lose or overwrite other device's bookmarks
  const handleSaveToCloudDirectly = async (updatedHistory: HistoryItem[]) => {
    // Synchronously check and refresh Google Drive token under the active user gesture
    if (googleDriveAuthorized && auth.currentUser) {
      await ensureValidDriveToken(false);
    }

    const sanitized = sanitizeHistoryItems(updatedHistory);
    isSyncingRef.current = true;
    setHistory(sanitized);

    if (!cloudSyncKey || !cloudSyncKey.trim()) {
      return;
    }

    // Mark that initial sync is ready
    hasDoneInitialSyncRef.current = true;

    // Run safe, non-race sync immediately to sync state to server cleanly
    handleSyncWithCloud(sanitized);
  };

  // Helper to ensure Google Drive folder exists and return its ID
  const ensureDriveFolder = async (token: string): Promise<string> => {
    try {
      const folderName = "Myanmar Smart Translator Backup (မြန်မာစမတ်ဘာသာပြန်မှတ်စုများ)";
      const q = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      const searchRes = await resilientFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          return data.files[0].id;
        }
      }
      
      // Create folder if missing
      const createRes = await resilientFetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder"
        })
      });
      if (createRes.ok) {
        const created = await createRes.json();
        return created.id;
      }
    } catch (e) {
      console.warn("ensureDriveFolder failed, falling back to root:", e);
    }
    return "";
  };

  // Helper to fetch/create a file inside a specific folder
  const findOrCreateFileInFolder = async (
    token: string, 
    name: string, 
    mimeType: string, 
    folderId: string,
    rootSearchFallback = false
  ): Promise<string> => {
    try {
      // 1. Search inside the specific folder first if folderId is provided
      let q = `name = '${name.replace(/'/g, "\\'")}' and trashed = false`;
      if (folderId) {
        q += ` and '${folderId}' in parents`;
      }
      const searchRes = await resilientFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          return data.files[0].id;
        }
      }

      // 2. Optional fallback to root search to migrate existing backup files seamlessly
      if (rootSearchFallback) {
        const qRoot = `name = '${name.replace(/'/g, "\\'")}' and trashed = false`;
        const searchRootRes = await resilientFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(qRoot)}&fields=files(id)`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (searchRootRes.ok) {
          const dataRoot = await searchRootRes.json();
          if (dataRoot.files && dataRoot.files.length > 0) {
            const rootFileId = dataRoot.files[0].id;
            // Move the root file into our brand new folder so we keep user's active data!
            if (folderId) {
              await resilientFetch(`https://www.googleapis.com/drive/v3/files/${rootFileId}?addParents=${folderId}&removeParents=root`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
              });
              console.log(`[Google Drive Sync] Successfully moved existing root file '${name}' into folder '${folderId}'`);
            }
            return rootFileId;
          }
        }
      }

      // 3. Create the file metadata inside the target folder
      const metaBody: any = {
        name: name,
        mimeType: mimeType
      };
      if (folderId) {
        metaBody.parents = [folderId];
      }
      const createRes = await resilientFetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(metaBody)
      });
      if (createRes.ok) {
        const created = await createRes.json();
        return created.id;
      }
    } catch (e) {
      console.warn(`findOrCreateFileInFolder failed for '${name}':`, e);
    }
    return "";
  };

  // Human readable TXT content generators
  const generateHumanReadableHistoryTxt = (historyItems: HistoryItem[]): string => {
    const activeItems = (historyItems || []).filter(item => !item.isDeleted);
    const bookmarks = activeItems.filter(item => item.isBookmarked);
    const regularHistory = activeItems.filter(item => !item.isBookmarked);

    let output = "";
    output += "=========================================================\n";
    output += "       MYANMAR SMART TRANSLATOR - HISTORY & BOOKMARKS    \n";
    output += "       ရှာဖွေမှုမှတ်တမ်းနှင့် စာမှတ်ပြုလုပ်ထားသော စကားစုများ     \n";
    output += "=========================================================\n\n";
    output += `နောက်ဆုံးအပ်ဒိတ်လုပ်ချိန်: ${new Date().toLocaleString()}\n`;
    output += `စုစုပေါင်းမှတ်တမ်းအရေအတွက်: ${activeItems.length} (စာမှတ်ပြုလုပ်ထားသည်: ${bookmarks.length} | သာမန်မှတ်တမ်း: ${regularHistory.length})\n\n`;

    output += "---------------------------------------------------------\n";
    output += "⭐ ၁။ စာမှတ်ပြုလုပ်ထားသော စကားလုံး/စကားစုများ (BOOKMARKS)\n";
    output += "---------------------------------------------------------\n";
    if (bookmarks.length === 0) {
      output += "(စာမှတ်ပြုလုပ်ထားသော စကားစုများ မရှိသေးပါ။)\n";
    } else {
      bookmarks.forEach((item, idx) => {
        const dateStr = new Date(item.timestamp).toLocaleString();
        output += `[စဥ်: ${idx + 1}]  [သမိုင်းချိန်: ${dateStr}]\n`;
        output += `👉 ENGLISH : ${item.originalText}\n`;
        output += `👉 မြန်မာဘာသာ: ${item.translation}\n`;
        output += `---------------------------------------------------------\n`;
      });
    }

    output += "\n\n";
    output += "---------------------------------------------------------\n";
    output += "⏱️ ၂။ ရှာဖွေမှုမှတ်တမ်းများ (SEARCH TRANSLATION HISTORY)\n";
    output += "---------------------------------------------------------\n";
    if (regularHistory.length === 0) {
      output += "(ရှာဖွေမှုမှတ်တမ်း မရှိသေးပါ။)\n";
    } else {
      regularHistory.forEach((item, idx) => {
        const dateStr = new Date(item.timestamp).toLocaleString();
        output += `[စဥ်: ${idx + 1}]  [သမိုင်းချိန်: ${dateStr}]\n`;
        output += `👉 ENGLISH : ${item.originalText}\n`;
        output += `👉 မြန်မာဘာသာ: ${item.translation}\n`;
        output += `---------------------------------------------------------\n`;
      });
    }

    output += "\n\n(မှတ်ချက်: အက်ပ် (App) ထဲတွင် ဖျက်လိုက်သည့် မှတ်တမ်းများသည် ဤနေရာမှလည်း လုံးဝပျက်ပြယ်သွားပါမည်။)\n";
    return output;
  };

  const generateHumanReadableNotebooksTxt = (notebookList: any[]): string => {
    const activeNotebooks = (notebookList || []).filter(nb => !nb.isDeleted);

    let output = "";
    output += "=========================================================\n";
    output += "       MYANMAR SMART TRANSLATOR - STUDY NOTEBOOKS        \n";
    output += "                 ဖွင့်ရန်နမူနာမှတ်စုအုပ် စာရင်းများ                \n";
    output += "=========================================================\n\n";
    output += `နောက်ဆုံးအပ်ဒိတ်လုပ်ချိန်: ${new Date().toLocaleString()}\n`;
    output += `စုစုပေါင်းမှတ်စုအုပ်အရေအတွက်: ${activeNotebooks.length}\n\n`;

    if (activeNotebooks.length === 0) {
      output += "(ပြင်ဆင်ထားသော မှတ်စုအုပ်များ မရှိသေးပါ။)\n";
    } else {
      activeNotebooks.forEach((nb, idx) => {
        const dateStr = nb.lastUpdated ? new Date(nb.lastUpdated).toLocaleString() : "မသိရှိပါ";
        output += `=========================================================\n`;
        output += `📖 စာအုပ်နံပါတ် [${idx + 1}]: ${nb.title}\n`;
        output += `⏱️ နောက်ဆုံးပြင်ဆင်ချိန်: ${dateStr}\n`;
        output += `=========================================================\n\n`;
        output += `${nb.content}\n\n`;
      });
    }

    output += "\n(မှတ်ချက်: အက်ပ် (App) ထဲတွင် ဖျက်လိုက်သည့် မှတ်စုအုပ်များသည် ဤနေရာမှလည်း လုံးဝပျက်ပြယ်သွားပါမည်။)\n";
    return output;
  };

  // Synchronizes history with Google Drive using the private and secure backup JSON file
  const handleGoogleDriveSync = async (
    token: string, 
    currentLocal: HistoryItem[], 
    currentLocalNotebooks?: any[]
  ): Promise<{ merged: HistoryItem[], remoteHistory: HistoryItem[], mergedNotebooks: any[], remoteNotebooks: any[] }> => {
    
    // Step 1: Obtain or ensure the dedicated folder ID
    const folderId = await ensureDriveFolder(token);
    
    // Step 2: Retrieve the main programmatic backup file ID
    const fileId = await findOrCreateFileInFolder(token, "dictionary_sync_backup.json", "application/json", folderId, true);

    let remoteHistory: HistoryItem[] = [];
    let remoteNotebooks: any[] = [];

    // Step 3: Load remote content if the backup file was retrieved/created successfully
    if (fileId) {
      const getContentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const contentRes = await resilientFetch(getContentUrl, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (contentRes.ok) {
        const text = await contentRes.text();
        if (text && text.trim()) {
          try {
            const remoteData = JSON.parse(text);
            remoteHistory = remoteData.history || [];
            remoteNotebooks = remoteData.customNotebooks || [];
            console.log(`[Google Drive Sync] Successfully read backup file with ${remoteHistory.length} items and ${remoteNotebooks.length} notebooks from folder.`);
          } catch (jsonErr) {
            console.warn("[Google Drive Sync] Invalid or empty JSON content encountered.", jsonErr);
          }
        }
      }
    }

    // Step 4: Perform a Conflict-Free LWW merge representing the true multi-device sync
    const merged = mergeHistory(currentLocal, remoteHistory);
    const mergedNbs = mergeNotebooks(currentLocalNotebooks || [], remoteNotebooks);

    // Filter out deleted items completely before sending to Google Drive!
    // This removes the traces of deleted things from the backup files completely.
    const cleanHistoryForDrive = merged.filter(item => !item.isDeleted);
    const cleanNotebooksForDrive = mergedNbs.filter(nb => !nb.isDeleted);

    // Let's check if there is actual value changes to perform the write
    const driveNeedsUpdate = !areHistoryArraysEqual(merged, remoteHistory) || !areNotebooksEqual(mergedNbs, remoteNotebooks);

    if (driveNeedsUpdate && fileId) {
      // Step 5: Overwrite the programmatic JSON configuration with the clean datasets (deleted items stripped!)
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      const saveRes = await resilientFetch(updateUrl, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ history: cleanHistoryForDrive, customNotebooks: cleanNotebooksForDrive })
      });
      if (!saveRes.ok) {
        throw new Error(`Failed to update JSON sync payload in Drive: ${saveRes.statusText}`);
      }
      
      // Step 6: Overwrite/Update the human-readable Category/Section Text files inside the folder!
      try {
        // Write the beautifully formatted history & bookmarks txt file
        const historyTxtFileId = await findOrCreateFileInFolder(token, "၁။ ရှာဖွေမှုမှတ်တမ်းနှင့်စာမှတ်များ (History_and_Bookmarks).txt", "text/plain", folderId, false);
        if (historyTxtFileId) {
          const historyTxtContent = generateHumanReadableHistoryTxt(cleanHistoryForDrive);
          await resilientFetch(`https://www.googleapis.com/upload/drive/v3/files/${historyTxtFileId}?uploadType=media`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "text/plain; charset=UTF-8"
            },
            body: historyTxtContent
          });
        }

        // Write the beautifully formatted custom notebooks list txt file
        const notebooksTxtFileId = await findOrCreateFileInFolder(token, "၂။ နမူနာမှတ်စုအုပ်များ (Custom_Notebooks).txt", "text/plain", folderId, false);
        if (notebooksTxtFileId) {
          const notebooksTxtContent = generateHumanReadableNotebooksTxt(cleanNotebooksForDrive);
          await resilientFetch(`https://www.googleapis.com/upload/drive/v3/files/${notebooksTxtFileId}?uploadType=media`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "text/plain; charset=UTF-8"
            },
            body: notebooksTxtContent
          });
        }
        console.log("[Google Drive Sync] Successfully double-wrote clean, human-readable sections inside Drive folder.");
      } catch (subErr) {
        console.warn("[Google Drive Sync] Best-effort TXT generation or folder upload met transient issues:", subErr);
      }
    }

    return { merged, remoteHistory, mergedNotebooks: mergedNbs, remoteNotebooks };
  };

  // Fetches cloud data and merges it with local storage on startup or key setup
  const handleSyncWithCloud = async (overrideHistory?: HistoryItem[], overrideNotebooks?: any[]) => {
    if (isWipingRef.current) {
      console.log("[Sync] Bypassing cloud sync because system is performing a full wipe & clean reset.");
      return;
    }

    if (!cloudSyncKey || !cloudSyncKey.trim()) {
      setSyncStatus("not_configured");
      return;
    }

    // Limit concurrency to avoid state/race corruption on slow connections.
    // If sync is already active, save latest desired history into the pending ref and return.
    // When the current active sync finishes in the finally block, it will auto-run the next sync sequentially!
    if (isSyncingStateRef.current) {
      if (overrideHistory) {
        pendingSyncHistoryRef.current = overrideHistory;
      } else {
        pendingSyncHistoryRef.current = latestHistoryRef.current;
      }
      if (overrideNotebooks) {
        pendingSyncNotebooksRef.current = overrideNotebooks;
      } else {
        pendingSyncNotebooksRef.current = latestNotebooksRef.current;
      }
      return;
    }

    isSyncingStateRef.current = true;
    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      let remoteHistory: HistoryItem[] = [];
      let remoteNotebooks: any[] = [];
      let merged: HistoryItem[] = [];
      let mergedNbs: any[] = [];
      const currentLocal = overrideHistory || latestHistoryRef.current;
      const currentLocalNotebooks = overrideNotebooks || latestNotebooksRef.current;

      let hasSyncedGdrive = false;
      if (user && googleDriveAuthorized) {
        console.log("[Sync] Syncing through Google Drive...");
        try {
          const activeToken = await ensureValidDriveToken(true);
          if (activeToken) {
            const gdResult = await handleGoogleDriveSync(activeToken, currentLocal, currentLocalNotebooks);
            merged = gdResult.merged;
            remoteHistory = gdResult.remoteHistory;
            mergedNbs = gdResult.mergedNotebooks;
            remoteNotebooks = gdResult.remoteNotebooks;
            hasSyncedGdrive = true;
          }
        } catch (gdError: any) {
          console.warn("[Sync] Google Drive sync failed or expired, falling back to server database sync:", gdError);
        }
      }

      if (!hasSyncedGdrive) {
        console.log("[Sync] Syncing through secure unified server API route...");
        const lagRes = await resilientFetch("/api/sync/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: cloudSyncKey.trim() })
        });

        if (lagRes.ok) {
          const data = await lagRes.json();
          remoteHistory = data.history || [];
          remoteNotebooks = data.customNotebooks || [];
        } else {
          throw new Error("Sync server returned error response.");
        }

        // Intelligently merge remote history with current history
        merged = mergeHistory(currentLocal, remoteHistory);
        mergedNbs = mergeNotebooks(currentLocalNotebooks, remoteNotebooks);

        // Save only if there's an actual state mutation to avoid loops or redundant I/O
        const serverNeedsUpdate = !areHistoryArraysEqual(merged, remoteHistory) || !areNotebooksEqual(mergedNbs, remoteNotebooks);
        if (serverNeedsUpdate) {
          const saveRes = await resilientFetch("/api/sync/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey: cloudSyncKey.trim(),
              history: merged,
              customNotebooks: mergedNbs
            })
          });
          if (!saveRes.ok) {
            throw new Error("Failed to save merged sync data via server API.");
          }
        }
      }

      const localNeedsUpdate = !areHistoryArraysEqual(merged, currentLocal);
      if (localNeedsUpdate) {
        isSyncingRef.current = true;
        setHistory(merged);
      }

      const localNotebooksNeedsUpdate = !areNotebooksEqual(mergedNbs, currentLocalNotebooks);
      if (localNotebooksNeedsUpdate) {
        setCustomNotebooks(mergedNbs);
      }

      // Confirm that the initial sync is complete
      hasDoneInitialSyncRef.current = true;

      setSyncStatus("synced");
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus("error");
    } finally {
      isSyncingStateRef.current = false;
      setIsSyncing(false);

      // If a pending sync was queued during execution, consume it now sequentially
      if (pendingSyncHistoryRef.current !== null || pendingSyncNotebooksRef.current !== null) {
        const nextLocalHistory = pendingSyncHistoryRef.current || latestHistoryRef.current;
        const nextLocalNotebooks = pendingSyncNotebooksRef.current || latestNotebooksRef.current;
        pendingSyncHistoryRef.current = null;
        pendingSyncNotebooksRef.current = null;
        setTimeout(() => {
          handleSyncWithCloud(nextLocalHistory, nextLocalNotebooks);
        }, 50);
      }
    }
  };

  // Automatically sync local changes to cloud safely
  useEffect(() => {
    if (isWipingRef.current) {
      return;
    }

    if (!googleDriveToken && (!cloudSyncKey || !cloudSyncKey.trim())) {
      setSyncStatus("not_configured");
      return;
    }

    // Critical: only auto-save AFTER the initial sync has loaded the user's bookmarks from the server!
    // This absolutely prevents empty local arrays from overwriting remote bookmarks on refresh.
    if (!hasDoneInitialSyncRef.current) {
      return;
    }

    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      // Perform a safe, bidirectional fetch-merge-save sync on local updates
      handleSyncWithCloud(latestHistoryRef.current, latestNotebooksRef.current);
    }, 1000); // 1.0s debounce to group operations together cleanly

    return () => clearTimeout(timer);
  }, [history, customNotebooks, cloudSyncKey, googleDriveToken]);

  // Real-time bidirectional background polling (visibility-aware and extremely battery-safe)
  useEffect(() => {
    if (!googleDriveToken && (!cloudSyncKey || !cloudSyncKey.trim())) return;

    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (
            document.visibilityState === "visible" && 
            !isTranslatingRef.current && 
            !isSyncingStateRef.current && 
            hasDoneInitialSyncRef.current
          ) {
            console.log("[Sync] Performing real-time sync poll.");
            handleSyncWithCloud();
          }
        }, 30000); // Throttled to 30 seconds for optimal battery/network safety, avoiding constant spins
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Immediate action trigger: when tab gets focus or comes online
    const triggerSyncOnInteraction = () => {
      if (document.visibilityState === "visible") {
        handleSyncWithCloud();
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }

    window.addEventListener("focus", triggerSyncOnInteraction);
    document.addEventListener("visibilitychange", triggerSyncOnInteraction);
    window.addEventListener("online", triggerSyncOnInteraction);

    return () => {
      stopPolling();
      window.removeEventListener("focus", triggerSyncOnInteraction);
      document.removeEventListener("visibilitychange", triggerSyncOnInteraction);
      window.removeEventListener("online", triggerSyncOnInteraction);
    };
  }, [cloudSyncKey, googleDriveToken]);

  // Trigger immediate sync update when user tab switches to history or bookmarks so they see computer's data instantly
  useEffect(() => {
    if (activeRightTab === "history" || activeRightTab === "bookmarks") {
      if ((googleDriveToken || (cloudSyncKey && cloudSyncKey.trim())) && !isTranslatingRef.current && !isSyncingStateRef.current) {
        handleSyncWithCloud();
      }
    }
  }, [activeRightTab, cloudSyncKey, googleDriveToken]);

  // Sync automatically upon initial load or when cloudSyncKey or googleDriveToken changes
  useEffect(() => {
    if (googleDriveToken || (cloudSyncKey && cloudSyncKey.trim())) {
      handleSyncWithCloud();
    } else {
      setSyncStatus("not_configured");
    }
  }, [cloudSyncKey, googleDriveToken]);

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
          // Just scan the files
          scanServerFiles();
        } else {
          // Initialize with Sample Dictionary
          const initialMap = new Map<string, string>();
          Object.entries(SAMPLE_DICTIONARY).forEach(([word, def]) => {
            initialMap.set(word, def);
          });
          setDictionaryMap(initialMap);
          setDictionarySource("sample");
          
          // Since cache is empty, scan files and auto-trigger load for eng-myan.txt if found
          scanServerFiles().then((files) => {
            const hasEngMyan = files.find((f) => f.filename === "eng-myan.txt");
            if (hasEngMyan) {
              handleLoadServerFile("eng-myan.txt");
            }
          });
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
        scanServerFiles().then((files) => {
          const hasEngMyan = files.find((f) => f.filename === "eng-myan.txt");
          if (hasEngMyan) {
            handleLoadServerFile("eng-myan.txt");
          }
        });
      });
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
  const scanServerFiles = async (): Promise<WorkspaceFile[]> => {
    setIsScanningServer(true);
    try {
      const res = await resilientFetch("/api/dictionary-files");
      if (!res.ok) throw new Error("Could not list server files.");
      const data = await res.json();
      const files = data.files || [];
      setServerFiles(files);
      return files;
    } catch (err: any) {
      console.error(err);
      return [];
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
      const response = await resilientFetch(`/api/dictionary-file?filename=${encodeURIComponent(filename)}`);
      
      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON Server File Response:", textResponse);
        throw new Error(`Server response is HTML/Text instead of JSON (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "ဖိုင်ကို ဖတ်၍မရပါ။");
      }
      processDictionaryText(data.content, filename);
    } catch (err: any) {
      showError(`ဆာဗာဖိုင်ဖတ်ရန် မအောင်မြင်ပါ: ${err.message}`);
    } finally {
      setIsLoadingServerFile(null);
    }
  };

  // Export History / Bookmarks & Study Room Notebooks to a local JSON file
  const handleExportDataFile = () => {
    try {
      if (history.length === 0 && customNotebooks.length === 0) {
        showError("တင်ပို့ရန် မှတ်တမ်း သို့မဟုတ် စာမှတ်ဒေတာများ မရှိသေးပါ။ (No data to export.)");
        return;
      }
      const dataObj = {
        history: history,
        customNotebooks: customNotebooks
      };
      const dataStr = JSON.stringify(dataObj, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `dictionary_translator_backup_${new Date().toISOString().slice(0,10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      const numBookmarks = history.filter(item => item.isBookmarked && !item.isDeleted).length;
      const numHistory = history.filter(item => !item.isBookmarked && !item.isDeleted).length;
      const numNotebooks = customNotebooks.length;
      showSuccess(`စာမှတ် (Bookmark) ${numBookmarks} ခု၊ သမိုင်းမှတ်တမ်း (History) ${numHistory} ခုနှင့် စာအုပ်ငယ် ${numNotebooks} အုပ်ကို Backup ဖိုင် (.json) အဖြစ် အောင်မြင်စွာ ထုတ်ယူသိမ်းဆည်းပြီးပါပြီ။`);
    } catch (err: any) {
      showError("Backup ထုတ်ယူရန် မအောင်မြင်ပါ: " + err.message);
    }
  };

  // Import History / Bookmarks / Notebooks from a local JSON file
  const handleImportDataFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      showError("ကျေးဇူးပြု၍ .json backup file အမျိုးအစားကိုသာ ရွေးချယ်တင်သွင်းပါ။");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") {
          throw new Error("ဖိုင်ဖတ်ရန် မအောင်မြင်ပါ။");
        }

        const parsedData = JSON.parse(text);
        let parsedRaw: HistoryItem[] = [];
        let parsedNotebooks: any[] = [];

        if (Array.isArray(parsedData)) {
          parsedRaw = parsedData;
        } else if (parsedData && typeof parsedData === "object") {
          parsedRaw = parsedData.history || [];
          parsedNotebooks = parsedData.customNotebooks || [];
        }

        const parsed = sanitizeHistoryItems(parsedRaw);
        if (!Array.isArray(parsed)) {
          throw new Error("Backup ဖိုင် ပြည့်စုံမှုမရှိပါ။ သတ်မှတ်ထားသော စာရင်းပုံစံမဟုတ်ပါ။");
        }

        // Simple validation to check if items look like HistoryItem
        const isValid = parsed.every(item => item && typeof item === "object" && 'originalText' in item && 'translation' in item);
        if (!isValid && parsed.length > 0) {
          throw new Error("Backup ဖိုင်အတွင်းရှိ ဒေတာပုံစံ မမှန်ကန်ပါ။");
        }

        // Intelligent merge for history
        const existingMap = new Map<string, HistoryItem>(history.map(item => [item.id, item]));
        let newItemsAdded = 0;
        let restoredDeleted = 0;
        let bookmarksSynced = 0;
        let totalProcessed = 0;

        parsed.forEach((item: HistoryItem) => {
          totalProcessed++;
          const existing = existingMap.get(item.id);
          if (!existing) {
            // If item exists in the backup, treat it as active by default unless explicitly deleted in backup
            existingMap.set(item.id, {
              ...item,
              isDeleted: item.isDeleted ?? false,
              isBookmarked: item.isBookmarked ?? false
            });
            newItemsAdded++;
          } else {
            let itemChanged = false;
            let finalIsBookmarked = existing.isBookmarked || item.isBookmarked || false;
            let finalIsDeleted = existing.isDeleted;

            // If it was deleted locally but active/present in backup, restore it!
            if (existing.isDeleted && !item.isDeleted) {
              finalIsDeleted = false;
              restoredDeleted++;
              itemChanged = true;
            }

            if (!existing.isBookmarked && item.isBookmarked) {
              bookmarksSynced++;
              itemChanged = true;
            }

            const latestTimestamp = Math.max(existing.timestamp, item.timestamp);
            if (latestTimestamp !== existing.timestamp) {
              itemChanged = true;
            }

            if (itemChanged || finalIsBookmarked !== existing.isBookmarked || finalIsDeleted !== existing.isDeleted) {
              existingMap.set(item.id, {
                ...existing,
                ...item,
                isBookmarked: finalIsBookmarked,
                isDeleted: finalIsDeleted,
                timestamp: latestTimestamp
              });
            }
          }
        });

        // Intelligent merge for custom study notebooks
        const mergedNbs = mergeNotebooks(customNotebooks, parsedNotebooks);
        setCustomNotebooks(mergedNbs);

        const merged = Array.from(existingMap.values()).sort((a, b) => b.timestamp - a.timestamp);
        const sanitizedMerged = sanitizeHistoryItems(merged);
        
        // Update local memory and double write to IndexedDB immediately for sandbox durability
        setHistory(sanitizedMerged);
        saveHistoryToIndexedDB(sanitizedMerged);
        handleSaveToCloudDirectly(sanitizedMerged);

        // Detailed success report indicating what was actually imported/restored
        const parsedBookmarks = parsed.filter(item => item.isBookmarked && !item.isDeleted).length;
        const parsedHistory = parsed.filter(item => !item.isBookmarked && !item.isDeleted).length;
        let feedbackMessage = `Backup ဖိုင်ထဲမှ စာမှတ် (Bookmark) ${parsedBookmarks} ခု၊ သမိုင်းမှတ်တမ်း ${parsedHistory} ခု နှင့် စာအုပ်ငယ် ${parsedNotebooks.length} အုပ်ကို တင်သွင်းပြီးပါပြီ။ `;
        
        const details: string[] = [];
        if (newItemsAdded > 0) {
          details.push(`ဝေါဟာရအသစ် ${newItemsAdded} ခု နောက်ဆုံးမှတ်တမ်းထဲ ထပ်တိုးလိုက်သည်`);
        }
        if (restoredDeleted > 0) {
          details.push(`ဖျက်ထားမိသော မှတ်တမ်းဟောင်း ${restoredDeleted} ခုကို ပြန်လည် ဆယ်ယူလိုက်သည်`);
        }
        if (bookmarksSynced > 0) {
          details.push(`စာမှတ်အသစ် ${bookmarksSynced} ခု ပေါင်းစည်းလိုက်သည်`);
        }
        if (parsedNotebooks.length > 0) {
          details.push(`စာအုပ်ငယ် ${parsedNotebooks.length} အုပ် ပေါင်းစည်းလိုက်သည်`);
        }
        
        if (details.length > 0) {
          feedbackMessage += `(` + details.join("၊ ") + `) ဒေတာများ ချက်ချင်း ဝင်ရောက် အလုပ်လုပ်သွားပါပြီ။`;
        } else {
          feedbackMessage += `(စီစစ်မှုအရ ဒေတာအသစ်မရှိပါ၊ သင့်စက်ရှိ လက်ရှိမှတ်တမ်းများနှင့် အကုန်လုံး ကိုက်ညီနေပြီး ဖြစ်ပါသည်)`;
        }

        showSuccess(feedbackMessage);
      } catch (err: any) {
        showError("ဒေတာ ပြန်သွင်းရန် မအောင်မြင်ပါ: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Completely wipe all data: local memory, localStorage, IndexedDB, Google Drive backup file, and Server cloud sync db
  const handleWipeAllDataAndCloud = async () => {
    const confirmWipe = window.confirm(
      "🚨 သတိပေးချက်။ သင်၏ စာမှတ်များနှင့် ရှာဖွေမှုမှတ်တမ်းအားလုံးကို ဤစက်နှင့်အတူ Google Drive Backup ဖိုင်၊ ဆာဗာဒေတာဘေ့စ်တို့မှပါ လုံးဝအပြီးအပိုင် (လုံးဝအပြောင်) ရှင်းလင်းဖျက်ဆီးပစ်ပါမည်။ ဤလုပ်ငန်းစဉ်ကို ရှင်းလင်းပြီးနောက် ပြန်လည်ရယူ၍ မရနိုင်ပါ။ ဆက်လက်လုပ်ဆောင်လိုပါသလား?"
    );
    if (!confirmWipe) return;

    try {
      setIsWiping(true);
      isWipingRef.current = true;

      // 1. Clear local memory state
      setHistory([]);

      // 2. Clear LocalStorage
      safeLocalStorage.removeItem("em_translator_history");

      // 3. Clear IndexedDB history fallback cache
      await saveHistoryToIndexedDB([]);

      let feedback = "သင်၏ လက်ရှိ စာမှတ်နှင့် ရှာဖွေမှုမှတ်တမ်းအားလုံးကို လုံးဝရှင်းလင်းပြီးပါပြီ။";

      // 4. Overwrite Google Drive backup file if authorized
      if (googleDriveToken) {
        console.log("[Wipe] Overwriting Google Drive sync backup...");
        try {
          const q = "name = 'dictionary_sync_backup.json' and trashed = false";
          const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent("files(id, name)")}`;
          const searchRes = await resilientFetch(searchUrl, {
            headers: { "Authorization": `Bearer ${googleDriveToken}` }
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const files = searchData.files || [];
            if (files.length > 0) {
              const fileId = files[0].id;
              const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
              const saveRes = await resilientFetch(updateUrl, {
                method: "PATCH",
                headers: {
                  "Authorization": `Bearer ${googleDriveToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ history: [] })
              });
              if (saveRes.ok) {
                feedback += " Google Drive Backup ဖိုင်ကိုလည်း အပြောင်ရှင်းလင်းပြီးပါပြီ။";
              }
            }
          }
        } catch (gdErr: any) {
          console.warn("Wiping Google Drive backup file failed:", gdErr);
        }
      }

      // 5. Overwrite server unified sync database history
      if (cloudSyncKey && cloudSyncKey.trim()) {
        console.log("[Wipe] Overwriting server cloud sync DB history...");
        try {
          const saveRes = await resilientFetch("/api/sync/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              apiKey: cloudSyncKey.trim(),
              history: []
            })
          });
          if (saveRes.ok) {
            feedback += " Server Cloud Sync ဒေတာများကိုလည်း ရှင်းလင်းပြီးပါပြီ။";
          }
        } catch (serverErr: any) {
          console.warn("Wiping server sync data failed:", serverErr);
        }
      }

      showSuccess(feedback);
    } catch (err: any) {
      showError("ဒေတာအားလုံး ရှင်းလင်းရန် ကြိုးစားမှု မအောင်မြင်ပါ: " + err.message);
    } finally {
      setIsWiping(false);
      // Wait to ensure all background debounce runs are fully bypassed/cancelled
      setTimeout(() => {
        isWipingRef.current = false;
        console.log("[Wipe] System reset lock released.");
      }, 1500);
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
          const res = await resilientFetch("/api/upload-dictionary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              content: text,
              passcode: passcode.trim(),
            }),
          });
          
          let data: any;
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const textResponse = await res.text();
            throw new Error(`Server response is not JSON (HTTP ${res.status}): ${textResponse.slice(0, 50)}`);
          }

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
      const res = await resilientFetch("/api/delete-dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          passcode: passcode.trim(),
        }),
      });
      
      let data: any;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const textResponse = await res.text();
        throw new Error(`Server response is not JSON (HTTP ${res.status}): ${textResponse.slice(0, 50)}`);
      }

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
    if (docInputRef.current) {
      docInputRef.current.value = "";
    }
  };

  const handleDocChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name;
    const fileExt = fileName.split(".").pop()?.toLowerCase();

    if (fileExt === "txt" || fileType === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (text && text.trim()) {
          setInputText(text);
          showSuccess(`"${fileName}" ဖိုင်မှ စာသားများကို ဖတ်ရှုထည့်သွင်းပြီးပါပြီ။`);
        } else {
          showError("ရွေးချယ်ထားသော TXT ဖိုင်မှာ ဗလာဖြစ်နေပါသည်။");
        }
      };
      reader.readAsText(file);
    } else if (fileExt === "pdf" || fileType === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setSelectedImageName(fileName);
        setSelectedImageMime("application/pdf");
        showSuccess(`"${fileName}" PDF ဖိုင်ကို ဘာသာပြန်ရန် သိမ်းဆည်းပြီးပါပြီ။ "ဘာသာပြန်ရန်" ခလုတ်ကို နှိပ်၍ ဘာသာပြန်နိုင်ပါသည်။`);
      };
      reader.readAsDataURL(file);
    } else {
      showError("ကျေးဇူးပြု၍ .pdf သို့မဟုတ် .txt ဖိုင်များကိုသာ ရွေးချယ်ပေးပါ!");
    }
  };

  const speakText = (text: string, lang = "en-US") => {
    if (!window.speechSynthesis) {
      showError("သင်၏ browser သည် အသံထွက်ဖတ်ကြားခြင်းစနစ် (Speech Synthesis) ကို မထောက်ပံ့ပါ။");
      return;
    }
    window.speechSynthesis.cancel(); // Stop playing previous sound
    
    // Clean string from formatting or brackets before speaking
    let cleanText = text;
    if (lang === "my-MM") {
      // Clean up bracket annotations, English grammatical abbreviations e.g. [noun], (adj), v - , prep.
      let temp = text
        .replace(/\[[^\]]+\]/g, "")
        .replace(/\([^\)]+\)/g, "")
        .replace(/\b(adj|noun|verb|adv|idm|phrv|prep|conj|pron|int|n|v)\s*[:\-\s\.]*/gi, "");

      // Replace digit indices with phonetic Myanmar spelled-out words so fallback English TTS voices don't read them out loud in English (like "one", "two")
      const myanmarDigitSpelling: { [key: string]: string } = {
        "၀": "သုည", "၁": "တစ်", "၂": "နှစ်", "၃": "သုံး", "၄": "လေး", "၅": "ငါး", "၆": "ခြောက်", "၇": "ခုနစ်", "၈": "ရှစ်", "၉": "ကိုး",
        "0": "သုည", "1": "တစ်", "2": "နှစ်", "3": "သုံး", "4": "လေး", "5": "ငါး", "6": "ခြောက်", "7": "ခုနစ်", "8": "ရှစ်", "9": "ကိုး"
      };

      let spelledTemp = "";
      for (const char of temp) {
        if (myanmarDigitSpelling[char] !== undefined) {
          spelledTemp += myanmarDigitSpelling[char];
        } else {
          spelledTemp += char;
        }
      }
      temp = spelledTemp;

      temp = temp
        .replace(/[a-zA-Z]/g, "") // Remove all English letters (since numerals are already mapped above)
        .replace(/[▪️▪•*\-➔*+=:|~]/g, "") // Remove lists and decorative punctuations
        .replace(/\s+/g, " ")
        .trim();
      
      // Fallback if cleaning completely emptied the text
      if (temp.length > 0) {
        cleanText = temp;
      } else {
        cleanText = text
          .replace(/\[[^\]]+\]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }
    } else {
      cleanText = text
        .replace(/\[[^\]]+\]/g, "")
        .replace(/\([^\)]+\)/g, "")
        .replace(/[▪️▪•*➔\d\.\-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Handle Myanmar voice explicitly, assigning proper voice object if found in system
    if (lang === "my-MM") {
      utterance.lang = "my-MM";
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        const myMyanmarVoice = voices.find(v => {
          const lowerLang = v.lang.toLowerCase();
          const lowerName = v.name.toLowerCase();
          return (
            lowerLang.startsWith("my") || 
            lowerLang.includes("my-") || 
            lowerName.includes("myanmar") || 
            lowerName.includes("burmese") ||
            lowerName.includes("မြန်မာ")
          );
        });
        if (myMyanmarVoice) {
          utterance.voice = myMyanmarVoice;
        } else {
          console.warn("Myanmar TTS voice not found on this device.");
          showError("⚠️ သင့်စက်/Browser တွင် မြန်မာ Text-to-Speech (my-MM) အသံစနစ် မတွေ့ရှိပါ။ ထို့ကြောင့် ပုံမှန်ဘာသာစကားဖြင့်သာ ဖတ်ကြားပေးနိုင်ပါမည်။ (အသံမှန်စွာ နားထောင်ရန် Google Speech Services/TTS ကို ဆက်တင်တွင် ဖွင့်ပေးရန် လိုအပ်သည်)");
        }
      }
    } else {
      utterance.lang = speechAccent || lang || "en-US";
    }
    
    utterance.rate = speechRate || 1.0;

    utterance.onstart = () => {
      setSpeakingWord(text);
    };
    utterance.onend = () => {
      setSpeakingWord(null);
    };
    utterance.onerror = (e) => {
      console.warn("TTS error:", e);
      setSpeakingWord(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleBookmarkWord = (wordObj: { original: string; base: string; pos: string; definition: string }) => {
    const wordKey = wordObj.base.toLowerCase().trim();
    const existing = bookmarkedWords.find((w) => w.base.toLowerCase().trim() === wordKey);
    
    if (existing) {
      setBookmarkedWords(prev => prev.filter((w) => w.base.toLowerCase().trim() !== wordKey));
      showSuccess(`"${wordObj.base}" ကို ဝေါဟာရမှတ်စုတိုမှ ဖယ်ရှားပြီးပါပြီ။`);
    } else {
      const newBookmark: BookmarkedWord = {
        id: `${wordKey}_${Date.now()}`,
        original: wordObj.original,
        base: wordObj.base,
        pos: wordObj.pos,
        definition: wordObj.definition,
        timestamp: Date.now(),
      };
      setBookmarkedWords(prev => [newBookmark, ...prev]);
      showSuccess(`"${wordObj.base}" ကို ဝေါဟာရမှတ်စုတိုထဲသို့ ထည့်သွင်းပြီးပါပြီ။`);
    }
  };

  const isWordBookmarked = (baseWord: string) => {
    return bookmarkedWords.some((w) => w.base.toLowerCase().trim() === baseWord.toLowerCase().trim());
  };

  const generateQuiz = (sourceType: "all" | "bookmarks" | "current") => {
    let pool: Array<{ word: string; pos: string; my: string }> = [];

    if (sourceType === "current" && translationResult?.words?.length) {
      pool = translationResult.words.map((w) => ({
        word: w.original || w.base,
        pos: w.pos || "",
        my: w.dictionary_definition || w.fallback_my,
      }));
    } else if (sourceType === "bookmarks") {
      const bookmarkedItems = history.filter((h) => h.isBookmarked && !h.isDeleted);
      bookmarkedItems.forEach((item) => {
        item.words.forEach((w) => {
          pool.push({
            word: w.original || w.base,
            pos: w.pos || "",
            my: w.dictionary_definition || w.fallback_my,
          });
        });
      });
    }

    // Default lookup backup if we don't have enough entries or selecting "all" dictionary (all is synonymous with taking from loaded keys)
    if (pool.length < 4 || sourceType === "all") {
      const activeDict = Array.from(dictionaryMap.entries());
      if (activeDict.length > 0) {
        activeDict.forEach(([w, def]) => {
          pool.push({ word: w, pos: "WORD", my: def });
        });
      } else {
        Object.entries(SAMPLE_DICTIONARY).forEach(([w, def]) => {
          pool.push({ word: w, pos: "WORD", my: def });
        });
      }
    }

    // Filter unique
    const uniqueMap = new Map<string, { word: string; pos: string; my: string }>();
    pool.forEach((p) => {
      if (p.word && p.my) {
        uniqueMap.set(p.word.toLowerCase().trim(), p);
      }
    });
    const finalPool = Array.from(uniqueMap.values());

    if (finalPool.length < 4) {
      showError("မေးခွန်းများထုတ်ရန် အနည်းဆုံး ဝေါဟာရ ၄ လုံး ရှိရန် လိုအပ်ပါသည်။ စကားလုံးများစွာ အရင်ရှာဖွေပေးပါ။");
      return;
    }

    // Shuffle and pick up to 10 questions
    const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(10, shuffled.length));

    const generated = selectedQuestions.map((q) => {
      // Find clean definition text
      const cleanTextForDef = cleanDictionaryText(q.my);
      const cleanMy = cleanTextForDef.replace(/^▪️\s*/, "").split("\n")[0] || cleanTextForDef;

      // Filter and pick wrong choices
      const wrongCandidates = finalPool
        .filter((item) => item.word.toLowerCase().trim() !== q.word.toLowerCase().trim())
        .map((item) => {
          const raw = cleanDictionaryText(item.my);
          return raw.replace(/^▪️\s*/, "").split("\n")[0] || raw;
        });

      const uniqueWrongs = Array.from(new Set(wrongCandidates)).filter(c => c !== cleanMy);
      const chosenWrong = uniqueWrongs.sort(() => 0.5 - Math.random()).slice(0, 3);

      // Make sure we have 4 choices total
      while (chosenWrong.length < 3) {
        chosenWrong.push("အဓိပ္ပါယ်ဖွင့်ဆိုချက် မရှိပါ (" + Math.floor(Math.random() * 1000) + ")");
      }

      const draftChoices = [cleanMy, ...chosenWrong];
      const quizChoices = draftChoices.sort(() => 0.5 - Math.random());
      const answerIdx = quizChoices.indexOf(cleanMy);

      return {
        word: q.word,
        pos: q.pos,
        correctMy: cleanMy,
        choices: quizChoices,
        answerIdx,
      };
    });

    setQuizQuestions(generated);
    setCurrentQuizIdx(0);
    setQuizScore(0);
    setSelectedQuizAnswer(null);
    setIsQuizSubmitted(false);
    showSuccess("ဉာဏ်စမ်းမေးခွန်းအသစ်များ အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။ ဖြေဆိုကြည့်ပါ။");
  };

  const copyText = (text: string, isTranslation = false) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        if (isTranslation) {
          setCopiedTranslation(true);
          setTimeout(() => setCopiedTranslation(false), 2000);
        }
        showSuccess("အောင်မြင်စွာ ကူးယူပြီးပါပြီ။");
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        showError("ကူးယူရန် အဆင်မပြေဖြစ်သွားပါသည်။");
      });
  };

  const handleAddInputTextToNotes = () => {
    if (!inputText.trim()) {
      showError("မှတ်စုထဲထည့်ရန် ဦးစွာ စာသားရိုက်ထည့်ပေးပါ။");
      return;
    }
    const title = `လေ့လာကျင့် - ${inputText.trim().slice(0, 30)}${inputText.trim().length > 30 ? "..." : ""}`;
    const content = `အင်္ဂလိပ်ဝါကျ / စာသား:\n${inputText.trim()}`;
    
    const newNote: StudyNote = {
      id: "note_" + Date.now().toString(36),
      title: title || `လေ့လာမှုမှတ်စု (${new Date().toLocaleDateString()})`,
      content,
      timestamp: Date.now()
    };
    
    setStudyNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setActiveRightTab("notes");
    setShowAddNoteForm(false);
    showSuccess("စာသားကို ကိုယ်ပိုင်မှတ်စုထဲသို့ ထည့်သွင်းသိမ်းဆည်းလိုက်ပါပြီ။");
  };

  const handleAddTranslationToNotes = () => {
    if (!translationResult) return;
    const title = `လေ့လာမှု - ${inputText.trim().slice(0, 30)}${inputText.trim().length > 30 ? "..." : ""}`;
    const keyWords = translationResult.words.map(w => `- ${w.original} (${w.pos}) -> ${w.fallback_my}`).join("\n");
    const content = `English စာသား:\n${inputText.trim()}\n\nဘာသာပြန်ချက်:\n${translationResult.translation}\n\nသင်ယူခဲ့သော ဝေါဟာရများ:\n${keyWords || "(မရှိပါ)"}`;
    
    const newNote: StudyNote = {
      id: "note_" + Date.now().toString(36),
      title: title || `လေ့လာမှုမှတ်စု (${new Date().toLocaleDateString()})`,
      content,
      timestamp: Date.now()
    };
    
    setStudyNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setActiveRightTab("notes");
    setShowAddNoteForm(false);
    showSuccess("ဘာသာပြန်ချက်နှင့် စာလုံးများကို ကိုယ်ပိုင်မှတ်စုထဲသို့ ထည့်သွင်းသိမ်းဆည်းလိုက်ပါပြီ။");
  };

  const handleAddBreakdownToNotes = (segment?: string, meaning?: string, explanation?: string) => {
    let title = "";
    let content = "";
    
    if (segment && meaning && explanation) {
      title = `သရုပ်ခွဲ - ${segment.trim().slice(0, 30)}${segment.trim().length > 30 ? "..." : ""}`;
      content = `ဝါကျ/အခန်း:\n${segment.trim()}\n\nဘာသာပြန်:\n${meaning.trim()}\n\nရှင်းလင်းချက်:\n${explanation.trim()}`;
    } else if (breakdownResult) {
      title = `အကျယ်ခွဲခြမ်းမှု - ${inputText.trim().slice(0, 30)}${inputText.trim().length > 30 ? "..." : ""}`;
      const breakdowns = breakdownResult.lineBreakdowns.map((b, idx) => `Unit ${idx+1}:\n[Eng]: ${b.segment}\n[Mya]: ${b.meaning}\n[Explain]: ${b.explanation}\n`).join("\n---\n\n");
      content = `ခြုံငုံသုံးသပ်ချက်:\n${breakdownResult.overallContext}\n\nအသေးစိတ်အချက်များ:\n${breakdowns}`;
    } else {
      return;
    }
    
    const newNote: StudyNote = {
      id: "note_" + Date.now().toString(36),
      title: title || `လေ့လာမှုမှတ်စု (${new Date().toLocaleDateString()})`,
      content,
      timestamp: Date.now()
    };
    
    setStudyNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setActiveRightTab("notes");
    setShowAddNoteForm(false);
    showSuccess("သရုပ်ခွဲရှင်းလင်းချက် အချက်အလက်များအား ကိုယ်ပိုင်မှတ်စုထဲသို့ ထည့်သွင်းသိမ်းဆည်းလိုက်ပါပြီ။");
  };



  const handleExplainBreakdown = async () => {
    if (!inputText.trim()) {
      showError("ကျေးဇူးပြု၍ ရှင်းလင်းချက်ထုတ်ရန် အင်္ဂလိပ်စာသား တစ်ခုခုထည့်ပေးပါ!");
      return;
    }

    if (!customApiKey || !customApiKey.trim()) {
      showError("အကျယ်ဖွင့်ရှင်းလင်းချက် လုပ်ဆောင်ချက်ကို အသုံးပြုရန်အတွက် ဆက်တင် (Settings) ထဲတွင် သင်၏ ကိုယ်ပိုင် Gemini API Key ကို မဖြစ်မနေ ဦးစွာ ထည့်သွင်းပေးရန် လိုအပ်ပါသည်။");
      return;
    }

    setIsAnalyzingBreakdown(true);
    setBreakdownResult(null);
    setIsBreakdownCollapsed(false);

    const sanitizedText = inputText
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2026/g, "...");

    if (sanitizedText !== inputText) {
      setInputText(sanitizedText);
    }

    try {
      const response = await resilientFetch("/api/explain-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sanitizedText,
          customApiKey: customApiKey.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "ဆာဗာမှ ရှင်းလင်းချက်ထုတ်ယူရန် တောင်းဆိုမှု မအောင်မြင်ပါ။");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setBreakdownResult(data);
      showSuccess("စာပိုဒ် အကျယ်ဖွင့် ရှင်းလင်းချက်များကို အောင်မြင်စွာ ဆွဲထုတ်ပြီးပါပြီ။");
    } catch (err: any) {
      console.error("Explain Breakdown error:", err);
      let errMsg = err.message || "ရှင်းလင်းချက်ထုတ်ယူစဉ် အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။";
      if (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID")) {
        errMsg = "ထည့်သွင်းထားသော Gemini API Key မမှန်ကန်ပါ။ ကျေးဇူးပြု၍ 'ဆက်တင် (Settings)' တက်ဘ်တွင် သင်၏ API Key ကို ပြန်လည်စစ်ဆေးပေးပါ။";
      }
      showError(errMsg);
    } finally {
      setIsAnalyzingBreakdown(false);
    }
  };

  // Main Action: Translate Sentence and Match Dictionary
  const handleTranslateAndProcess = async () => {
    if (!inputText.trim() && !selectedImage) {
      showError("ကျေးဇူးပြု၍ ဘာသာပြန်ရန် အင်္ဂလိပ်စာသား တစ်ခုခုထည့်ပါ သို့မဟုတ် ပုံတစ်ပုံ တင်ပေးပါ!");
      return;
    }

    if (!customApiKey || !customApiKey.trim()) {
      showError("ဘာသာပြန်စနစ်ကို အသုံးပြုရန်အတွက် ဆက်တင် (Settings) ထဲတွင် သင်၏ ကိုယ်ပိုင် Gemini API Key ကို မဖြစ်မနေ ဦးစွာ ထည့်သွင်းပေးရန် လိုအပ်ပါသည်။");
      return;
    }

    setIsTranslating(true);
    setTranslationResult(null);
    setIsTranslationCollapsed(false);
    setTranslationIdioms([]);

    let imageBase64 = null;
    if (selectedImage) {
      const commaIndex = selectedImage.indexOf(",");
      if (commaIndex !== -1) {
        imageBase64 = selectedImage.slice(commaIndex + 1);
      }
    }

    const sanitizedText = inputText
      .replace(/[\u2018\u2019]/g, "'") // Left and right curly single quotes -> straight single quote
      .replace(/[\u201C\u201D]/g, '"') // Left and right curly double quotes -> straight double quote
      .replace(/\u2026/g, "...");     // Ellipsis (...) -> three dots

    // Keep the on-screen input text synchronized with the sanitized text
    if (sanitizedText !== inputText) {
      setInputText(sanitizedText);
    }

    try {
      // Connect to server api with automatic retry to handle gateway cold starts and temporary proxy errors
      let data: any;
      let response: Response | null = null;
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;

      while (attempts < maxAttempts && !success) {
        attempts++;
        try {
          response = await resilientFetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              text: sanitizedText, 
              image: imageBase64,
              mimeType: selectedImageMime,
              customApiKey: customApiKey.trim() || undefined,
              passcode: passcode.trim() || undefined
            }),
          });

          const contentType = response?.headers?.get("content-type");
          const responseText = await response.text().catch(() => "");

          if (contentType && contentType.includes("application/json")) {
            let isParsingSuccess = false;
            try {
              data = JSON.parse(responseText.trim());
              isParsingSuccess = true;
            } catch (jsonErr: any) {
              console.warn(`Attempt ${attempts} failed to parse JSON from body:`, jsonErr);
              if (attempts >= maxAttempts) {
                if (response.status === 403) {
                  throw new Error("ဆာဗာရှိ ပင်မ API Key ကို အသုံးပြုခွင့် ကန့်သတ်ထားပါသည်။ ဆက်လက်အသုံးပြုရန် 'ဆက်တင် (Settings)' တက်ဘ်တွင် သင်၏ကိုယ်ပိုင် Gemini API Key ကို ထည့်သွင်းပေးပါ။ အကယ်၍ သင်သည် ပိုင်ရှင်ဖြစ်ပါက 'Dictionary' တက်ဘ်တွင် လျှို့ဝှက်နံပါတ် (Passcode) ကို အရင်ဆုံး ဖြည့်စွက် အတည်ပြုပေးပါ။");
                }
                if (response.status === 404) {
                  throw new Error(`ဘာသာပြန် စနစ် (API Route) ကို ဆာဗာပေါ်တွင် ရှာမတွေ့ပါ။ ဆာဗာတွင် ပြဿနာ ရှိနေပါသဖြင့် ခေတ္တစောင့်ပြီးမှ ထပ်စမ်းကြည့်ပါ။ (HTTP 404)`);
                } else {
                  throw new Error(`ဆာဗာမှ ပြန်လည်ဖြေကြားချက်သည် JSON ပုံစံမဟုတ်ဘဲ လွဲမှားနေပါသည် (HTTP ${response.status})။`);
                }
              }
              // Wait slightly before retrying (1000ms)
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            if (isParsingSuccess) {
              if (data && data.error) {
                let errMsg = data.error;
                if (typeof errMsg === "string") {
                  if (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID")) {
                    errMsg = "ထည့်သွင်းထားသော Gemini API Key မမှန်ကန်ပါ။ ကျေးဇူးပြု၍ 'ဆက်တင် (Settings)' တက်ဘ်တွင် သင်၏ API Key ကို ပြန်လည်စစ်ဆေးပေးပါ။";
                  } else if (errMsg.includes("quota") || errMsg.includes("QUOTA_EXCEEDED")) {
                    errMsg = "Gemini API အသုံးပြုခွင့် Quota ကုန်ဆုံးသွားပါပြီ။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ထပ်စမ်းကြည့်ပါ သို့မဟုတ် အခြား API Key တစ်ခု ပြောင်းသုံးပေးပါ။";
                  }
                }
                throw new Error(errMsg);
              }
              success = true;
            }
          } else {
            console.warn(`Attempt ${attempts} returned non-JSON response:`, responseText.slice(0, 150));
            
            if (response.status === 403) {
              throw new Error("ဆာဗာရှိ ပင်မ API Key ကို အသုံးပြုခွင့် ကန့်သတ်ထားပါသည်။ ဆက်လက်အသုံးပြုရန် 'ဆက်တင် (Settings)' တက်ဘ်တွင် သင်၏ကိုယ်ပိုင် Gemini API Key ကို ထည့်သွင်းပေးပါ။ အကယ်၍ သင်သည် ပိုင်ရှင်ဖြစ်ပါက 'Dictionary' တက်ဘ်တွင် လျှို့ဝှက်နံပါတ် (Passcode) ကို အရင်ဆုံး ဖြည့်စွက် အတည်ပြုပေးပါ။");
            }

            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }

            if (response.status === 404) {
              throw new Error(`ဘာသာပြန် စနစ် (API Route) ကို ဆာဗာပေါ်တွင် ရှာမတွေ့ပါ။ ဆာဗာတွင် ပြဿနာ ရှိနေပါသဖြင့် ခေတ္တစောင့်ပြီးမှ ထပ်စမ်းကြည့်ပါ။ (HTTP 404)`);
            } else {
              throw new Error(`ဆာဗာမှ ပြန်လည်ဖြေကြားချက်သည် JSON ပုံစံမဟုတ်ဘဲ လွဲမှားနေပါသည် (HTTP ${response.status})။`);
            }
          }
        } catch (fetchErr: any) {
          console.error(`Attempt ${attempts} failed with error:`, fetchErr);
          if (attempts >= maxAttempts) {
            throw fetchErr;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!response || !response.ok) {
        throw new Error(data?.error || "ဘာသာပြန်ယူရန် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။");
      }
      
      // If extractedText is returned and we used an image, update input text so they can see/edit it
      if (data.extractedText && selectedImage) {
        setInputText(data.extractedText);
      }

      // Match words in the response with our dictionary map, filtering out pronouns, prepositions, articles, modal/auxiliary verbs
      const analyzedWordsWithLookups = (data.words || [])
        .filter((aw: AnalyzedWord) => {
          if (!aw) return false;
          const baseKey = (aw.base || "").toLowerCase().trim();
          const origKey = (aw.original || "").toLowerCase().trim();
          const posKey = (aw.pos || "").toUpperCase().trim();
          
          if (FORBIDDEN_WORDS_SET.has(baseKey) || FORBIDDEN_WORDS_SET.has(origKey)) {
            return false;
          }
          if (FORBIDDEN_POS_SET.has(posKey)) {
            return false;
          }
          return true;
        })
        .map((aw: AnalyzedWord) => {
          // Match base word first
          const baseKey = aw.base.toLowerCase().trim().replace(/\d+$/, "");
          let definition = dictionaryMap.get(baseKey);
          
          // If not found, match original word directly as fallback
          if (!definition && aw.original) {
            const originalKey = aw.original.toLowerCase().trim().replace(/\d+$/, "");
            definition = dictionaryMap.get(originalKey);
          }

          if (definition) {
            const hasIdm = aw.fallback_my && aw.fallback_my.includes("[IDM]");
            const hasPhrv = aw.fallback_my && aw.fallback_my.includes("[PHRV]");
            if (hasIdm && !definition.includes("[IDM]")) {
              definition = definition.trim() + " [IDM]";
            }
            if (hasPhrv && !definition.includes("[PHRV]")) {
              definition = definition.trim() + " [PHRV]";
            }
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
      const strippedWords = analyzedWordsWithLookups.map((w: any) => ({
        original: w.original,
        base: w.base,
        pos: w.pos,
        fallback_my: w.fallback_my,
      }));

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        originalText: (data.extractedText || inputText).trim(),
        translation: data.translation,
        timestamp: Date.now(),
        isBookmarked: false,
        words: strippedWords,
      };

      const existing = history.find(
        (item) => item.originalText.toLowerCase() === newItem.originalText.toLowerCase()
      );
      const filtered = history.filter(
        (item) => item.originalText.toLowerCase() !== newItem.originalText.toLowerCase()
      );
      
      const itemToInsert: HistoryItem = existing 
        ? { ...newItem, isBookmarked: existing.isBookmarked, isDeleted: false } 
        : { ...newItem, isDeleted: false };

      let merged = [itemToInsert, ...filtered];
      
      // If history list becomes very large (e.g. > 50), prune excess items that are NOT bookmarked
      if (merged.length > 50) {
        const bookmarkedList = merged.filter((item) => item.isBookmarked);
        const nonBookmarkedList = merged.filter((item) => !item.isBookmarked);
        merged = [...bookmarkedList, ...nonBookmarkedList.slice(0, 30)];
      }

      handleSaveToCloudDirectly(merged);
      showSuccess("ဘာသာပြန်ဆိုပြီး ဝါစင်္ဂများကို တိုက်ဆိုင်ရှာဖွေပြီးပါပြီ။");
      
      // Concurrently scan all idioms & phrasal verbs
      handleScanTranslationIdioms(data.extractedText || sanitizedText);
    } catch (err: any) {
      console.error(err);
      let friendlyError = err.message || "";
      if (typeof friendlyError === "object") {
        friendlyError = JSON.stringify(friendlyError);
      }
      
      const upperError = friendlyError.toUpperCase();
      if (
        friendlyError.includes("429") || 
        upperError.includes("QUOTA") || 
        upperError.includes("RESOURCE_EXHAUSTED") || 
        upperError.includes("RATE_LIMIT") || 
        upperError.includes("RATE LIMIT") ||
        upperError.includes("RESOURCE EXHAUSTED")
      ) {
        friendlyError = "Gemini API ၏ တစ်မိနစ်အတွင်း အသုံးပြုမှုအကြိမ်ရေ (Rate Limit / Quota) ကန့်သတ်ချက် ပြည့်သွားသောကြောင့် ဖြစ်ပါသည်။ Google ၏ အခမဲ့ Free Tier စနစ်တွင် တစ်မိနစ်လျှင် အကြိမ်ရေ ၂၀ သာ ခွင့်ပြုထားခြင်းကြောင့် ဖြစ်ပြီး၊ ခေတ္တစက္ကန့် ၃၀ ခန့် စောင့်ဆိုင်းပြီးမှ ပြန်လည်စမ်းသပ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။";
      } else if (
        friendlyError.toUpperCase().includes("API KEY") || 
        friendlyError.toUpperCase().includes("API_KEY") || 
        friendlyError.toLowerCase().includes("key not found")
      ) {
        friendlyError = "Gemini API Key မတွေ့ရှိပါ သို့မဟုတ် လွဲမှားနေပါသည်။ ကျေးဇူးပြု၍ .env သို့မဟုတ် Settings တွင် API Key ထည့်ထားမှု ပြန်လည်စစ်ဆေးပေးပါ။";
      }
      
      showError(`ဘာသာပြန်ဆိုမှု မအောင်မြင်ပါ။ ဘာသာပြန်စနစ်ချိတ်ဆက်ရန် ပြဿနာတစ်ခုရှိနေပါသည်။ (Error: ${friendlyError})`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors animate-fade-in animate-duration-300">
      {/* Premium Elegant Header Banner */}
      <header className="bg-indigo-900 text-white shadow-md border-b border-indigo-950 py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-full mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl border border-white/15 backdrop-blur-xs">
              <Languages className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                Myanmar Smart Translator
                <span className="text-[10px] font-sans font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Premium
                </span>
              </h1>
            </div>
          </div>

          {/* Cloud Sync State Header Panel */}
          <div className="flex flex-wrap items-center gap-2.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === "synced" ? "bg-emerald-400 animate-pulse" :
                syncStatus === "syncing" ? "bg-amber-400 animate-spin" :
                syncStatus === "error" ? "bg-rose-400" : "bg-slate-400"
              }`} />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-200">
                {syncStatus === "synced" ? "CLOUD SYNCED" :
                 syncStatus === "syncing" ? "SYNCING..." :
                 syncStatus === "error" ? "SYNC ERROR" : "LOCAL MODE"}
              </span>
            </div>
            {lastSyncedTime && (
              <span className="text-[10px] font-mono text-indigo-200 border-l border-white/15 pl-2">
                Last: {lastSyncedTime}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="flex-1 max-w-full mx-auto w-full px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Translator Pane: 7 columns on desktop */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Advanced Premium Mode Switcher */}
            <div className="bg-slate-50/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200/90 grid grid-cols-2 gap-3.5 shadow-md relative overflow-hidden">
              {/* Decorative accent divider in background */}
              <div className="absolute inset-0 bg-radial-gradient from-indigo-50/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              
              <button
                type="button"
                onClick={() => setActiveMainMode("translator")}
                className={`group relative p-3 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 border ${
                  activeMainMode === "translator"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 border-emerald-700/50 scale-[1.02]"
                    : "bg-white border-slate-205 text-slate-700 hover:border-slate-300 hover:bg-slate-100 shadow-3xs"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Languages className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${activeMainMode === "translator" ? "text-emerald-200" : "text-emerald-600"}`} />
                  <span className="text-xs font-black tracking-wide uppercase font-sans">Smart Translator</span>
                </div>
                <span className={`text-[10px] font-bold ${activeMainMode === "translator" ? "text-emerald-50" : "text-slate-500"}`}>
                  ဘာသာပြန်နှင့် ဝေါဟာရစနစ်
                </span>
                {activeMainMode === "translator" && (
                  <span className="absolute bottom-1 w-8 h-0.5 bg-white/70 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMainMode("reader")}
                className={`group relative p-3 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 border border-slate-200 ${
                  activeMainMode === "reader"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 border-amber-600/50 scale-[1.02]"
                    : "bg-white border-slate-205 text-slate-700 hover:border-slate-300 hover:bg-slate-100 shadow-3xs"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${activeMainMode === "reader" ? "text-amber-200" : "text-amber-600"}`} />
                  <span className="text-xs font-black tracking-wide uppercase font-sans">Study Room</span>
                </div>
                <span className={`text-[10px] font-bold ${activeMainMode === "reader" ? "text-amber-50" : "text-slate-500"}`}>
                  စာလေ့လာကြမယ်
                </span>
                {activeMainMode === "reader" && (
                  <span className="absolute bottom-1 w-8 h-0.5 bg-white/70 rounded-full" />
                )}
              </button>
            </div>

            {activeMainMode === "translator" ? (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                {/* Left Side: Speech & Note controls */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => speakText(inputText, "en-US")}
                    className={`text-xs transition-colors py-1 px-2.5 rounded font-bold cursor-pointer flex items-center gap-1 border ${
                      speakingWord === inputText
                        ? "bg-red-50 text-red-655 border-red-250 animate-pulse"
                        : "text-slate-550 hover:text-indigo-650 bg-slate-50 border-slate-200"
                    }`}
                    disabled={isTranslating || !inputText.trim()}
                    title="အင်္ဂလိပ်ဝါကျ အသံထွက် နားထောင်ရန်"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-550" />
                    အသံထွက်ဖတ်ရန် (English)
                  </button>

                  <button
                    type="button"
                    onClick={handleAddInputTextToNotes}
                    className="text-xs text-emerald-600 hover:text-emerald-850 hover:bg-emerald-50 transition-colors py-1 px-2.5 rounded font-semibold cursor-pointer flex items-center gap-1 border border-emerald-250 bg-emerald-50/30"
                    disabled={isTranslating || !inputText.trim()}
                    title="ဤစာရိုက်ကွက်တွင်းရှိ စာသားကို မှတ်စုထဲသိမ်းဆည်းရန်"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    မှတ်စုထဲထည့်ရန်
                  </button>
                </div>

                {/* Right Side: Keyboard/Paste & Clear controls */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (!navigator.clipboard || !navigator.clipboard.readText) {
                          throw new Error("Clipboard API not supported");
                        }
                        const text = await navigator.clipboard.readText();
                        if (text && text.trim()) {
                          setInputText(text);
                          showSuccess("ကူးယူထားသော စာသားကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။");
                        } else {
                          showError("ကူးယူထားသော စာသား မရှိပါ။ ရှေးဦးစွာ စာသားတစ်ခုခုကို Copy ကူးယူထားပေးပါ။");
                        }
                      } catch (err: any) {
                        showError("Clipboard ဖတ်ခွင့်ကို iFrame ကြောင့် ကန့်သတ်ထားပါသည်။ စာရိုက်ကွက်ထဲတွင် Keyboard မှ Ctrl+V သုံး၍လည်းကောင်း၊ ဖုန်းမှ Paste ကို ကိုယ်တိုင် နှိပ်ပြီးလည်းကောင်း ထည့်သွင်းနိုင်ပါသည်။");
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors py-1 px-2.5 rounded font-semibold cursor-pointer flex items-center gap-1 border border-slate-100 bg-slate-50/50"
                    disabled={isTranslating}
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    စာသားကူးထည့်ရန် (Paste)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInputText("");
                      handleRemoveImage();
                    }}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors py-1 px-2.5 rounded hover:bg-rose-50 font-medium cursor-pointer"
                    disabled={isTranslating}
                  >
                    ရှိပြီးစာဖျက်ရန်
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ဘာသာပြန်လိုသော အင်္ဂလိပ် (သို့) မြန်မာစာသားကို ထည့်ပါ။"
                rows={5}
                className="w-full text-base p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-y transition-all font-sans leading-relaxed text-slate-900"
                disabled={isTranslating}
              />

              {/* Image and Document attachment / input control */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-2">
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

                  <input
                    type="file"
                    ref={docInputRef}
                    accept=".pdf,.txt,text/plain,application/pdf"
                    onChange={handleDocChange}
                    className="hidden"
                    disabled={isTranslating}
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    disabled={isTranslating}
                    className="text-xs font-semibold px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    📄 PDF / TXT တင်သွင်းရန်
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleListening("en-US")}
                    disabled={isTranslating}
                    className={`text-xs font-semibold px-3 py-1.5 border rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95 ${
                      isListening && listeningLang === "en-US"
                        ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse font-bold hover:bg-rose-100"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                    }`}
                    title="Speak in English"
                  >
                    {isListening && listeningLang === "en-US" ? (
                      <MicOff className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Mic className="w-4 h-4 text-indigo-505" />
                    )}
                    🎙️ English ဖြင့်ပြောရန်
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleListening("my-MM")}
                    disabled={isTranslating}
                    className={`text-xs font-semibold px-3 py-1.5 border rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95 ${
                      isListening && listeningLang === "my-MM"
                        ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse font-bold hover:bg-rose-100"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                    }`}
                    title="Speak in Myanmar"
                  >
                    {isListening && listeningLang === "my-MM" ? (
                      <MicOff className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Mic className="w-4 h-4 text-amber-500" />
                    )}
                    🎙️ မြန်မာလိုပြောရန်
                  </button>
                </div>
              </div>

              {selectedImage && (
                <div className="mt-4 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 flex items-center justify-between gap-3 animate-fade-in animate-duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedImageMime === "application/pdf" ? (
                      <div className="w-12 h-12 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-3xs shrink-0">
                        <FileText className="w-6 h-6 animate-pulse" />
                      </div>
                    ) : (
                      <img 
                        src={selectedImage} 
                        alt="Selected upload" 
                        className="w-12 h-12 object-cover rounded-md border border-indigo-100 shadow-3xs shrink-0"
                      />
                    )}
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
                    title="Remove attached file"
                    disabled={isTranslating}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Perform translator CTA */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleTranslateAndProcess}
                  disabled={isTranslating || isAnalyzingBreakdown}
                  className="w-full sm:w-auto px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium tracking-wide shadow-md shadow-indigo-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gemini ဘာသာပြန်ဆိုနေပါသည်...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4" />
                      ဘာသာပြန်၍ E-M dictionary မှ ဝေါဟာရ ရှာမည်။
                    </>
                  )}
                </button>

                <button
                  onClick={handleExplainBreakdown}
                  disabled={isTranslating || isAnalyzingBreakdown || !inputText.trim()}
                  className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium tracking-wide shadow-md shadow-emerald-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  title="English စာသားများ၏ အဓိပ္ပာယ် နှင့် အသေးစိတ်ရှင်းလင်းချက် ထုတ်ယူရန်"
                >
                  {isAnalyzingBreakdown ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      သရုပ်ခွဲ ရှင်းလင်းချက် ထုတ်ယူနေပါသည်...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      စာပိုဒ် အကျယ်ဖွင့် ရှင်းလင်းချက် ရယူရန်
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
                        {translationResult && !/[\u1000-\u109f]/.test(translationResult.translation) ? "အင်္ဂလိပ်ဘာသာပြန်ချက်" : "မြန်မာဘာသာပြန်ချက်"}
                      </h3>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Audio speaker button for Burmese translation translationResult.translation */}
                        <button
                          type="button"
                          onClick={() => speakText(translationResult.translation, "my-MM")}
                          className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-all font-medium border cursor-pointer ${
                            speakingWord === translationResult.translation
                              ? "bg-red-50 text-red-655 border-red-250 animate-pulse"
                              : "text-slate-500 hover:text-indigo-650 bg-slate-50/80 hover:bg-slate-100 border-slate-200"
                          }`}
                          title="မြန်မာဘာသာပြန် အသံထွက် နားထောင်ရန်"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-550" />
                          အသံထွက်ဖတ်ရန် (Myanmar)
                        </button>

                        <button
                          type="button"
                          onClick={() => copyText(translationResult.translation, true)}
                          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 transition-all font-medium border border-slate-200 cursor-pointer"
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

                        <button
                          type="button"
                          onClick={handleAddTranslationToNotes}
                          className="text-xs text-emerald-600 hover:text-emerald-850 flex items-center gap-1.5 px-2 py-1 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded transition-all font-medium cursor-pointer"
                          title="ဤဘာသာပြန်ချက်နှင့် ဝေါဟာရများအား ကိုယ်ပိုင်မှတ်စုထဲသို့ သိမ်းဆည်းမည်"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          မှတ်စုထဲထည့်ရန်
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsTranslationCollapsed(!isTranslationCollapsed)}
                          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded transition-all font-medium cursor-pointer"
                          title={isTranslationCollapsed ? "ပြန်ဖွင့်ရန် (Show)" : "ခေတ္တသိမ်းထားရန် (Hide)"}
                        >
                          {isTranslationCollapsed ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-605" />
                              ပြန်ပြရန် (Unhide)
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              ခေတ္တဖျောက်ရန် (Hide)
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isTranslationCollapsed ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs font-semibold text-slate-400">
                        🙈 ဘာသာပြန်ချက်ကို ခေတ္တဖျောက်ထားပါသည် (Translation Content is Hidden)
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Original English sentence with interactive highlighted idioms/verbs/phrases */}
                        {inputText && !/[\u1000-\u109f]/.test(inputText) && (
                          <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-xl">
                            <div className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase flex items-center gap-1.5 mb-2.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              မူရင်း အင်္ဂလိပ်ဝါကျ (နှိပ်၍ ဝေါဟာရနှင့် အီဒီယမ်များ လေ့လာရန်)
                            </div>
                            <div className="text-slate-800 leading-relaxed font-sans whitespace-pre-wrap text-base">
                              {renderInteractiveInputText()}
                            </div>
                          </div>
                        )}

                        {/* Burmese Translation */}
                        <div id="myanmar-translation-container" className="relative p-4 bg-emerald-50/50 border border-emerald-100/55 rounded-xl">
                          <div className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase flex items-center gap-1.5 mb-2.5 select-none">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            {translationResult && !/[\u1000-\u109f]/.test(translationResult.translation) ? "English ဘာသာပြန်ချက်" : "မြန်မာဘာသာပြန်ချက်"}
                          </div>
                          <div className="text-lg text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap">
                            {renderSegmentedBurmeseTranslation(translationResult.translation, translationResult.words)}
                          </div>

                          {/* English Original Hover Popup Tooltip */}
                          {activeHoveredSentenceIndex !== null && hoveredSentencePosition && (
                            (() => {
                              const pairedEng = getPairedEnglishSentence(activeHoveredSentenceIndex);
                              if (!pairedEng) return null;
                              
                              return (
                                <div
                                  style={{
                                    left: `${hoveredSentencePosition.x}px`,
                                    top: `${hoveredSentencePosition.y}px`,
                                  }}
                                  onMouseEnter={() => {
                                    if (sentenceHoverTimeoutRef.current) {
                                      clearTimeout(sentenceHoverTimeoutRef.current);
                                    }
                                    setIsHoveringPopup(true);
                                  }}
                                  onMouseLeave={() => {
                                    setIsHoveringPopup(false);
                                    sentenceHoverTimeoutRef.current = setTimeout(() => {
                                      setActiveHoveredSentenceIndex(null);
                                    }, 200);
                                  }}
                                  className="absolute bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl p-3.5 z-40 w-72 md:w-80 space-y-2.5 select-none animate-in fade-in zoom-in-95 duration-150 transform -translate-x-0 cursor-default"
                                >
                                  {/* Header info */}
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wide border-b border-white/10 pb-1.5">
                                    <span>မူရင်း အင်္ဂလိပ်ဝါကျ 🇬🇧</span>
                                    <span className="text-yellow-400 font-bold">နှိပ်၍ ကူးယူရန် 📋</span>
                                  </div>

                                  {/* Sentence content */}
                                  <p className="text-[12px] font-sans font-semibold leading-relaxed text-slate-200 bg-white/5 p-2 rounded-lg border border-white/5 select-text break-words">
                                    {pairedEng}
                                  </p>

                                  {/* Buttons & Actions */}
                                  <div className="flex items-center justify-between pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(pairedEng);
                                        setSentenceCopied(true);
                                        showSuccess("English ဝါကျကို clipboard ထဲသို့ ကူးယူပြီးပါပြီ။");
                                        setTimeout(() => setSentenceCopied(false), 2000);
                                      }}
                                      className={`text-[10px] flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all active:scale-95 cursor-pointer ${
                                        sentenceCopied
                                          ? "bg-emerald-600 text-white"
                                          : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                      }`}
                                    >
                                      {sentenceCopied ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" />
                                          ကူးယူပြီး (Copied!)
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          ဝါကျကူးယူမည် (Copy)
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => speakText(pairedEng, "en-US")}
                                      className="text-[10px] text-indigo-300 hover:text-indigo-200 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 font-extrabold flex items-center gap-1 cursor-pointer"
                                      title="အသံထွက်ဖတ်ရန်"
                                    >
                                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                      အသံထွက် (Speak)
                                    </button>
                                  </div>
                                </div>
                              );
                            })()
                          )}
                        </div>

                        {/* AI Idiom Recognition Scan section for Translation */}
                        <div className="p-4 bg-slate-50 border border-slate-250/85 rounded-xl space-y-4 animate-in fade-in duration-200">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                              <div className="text-left">
                                <span className="text-[11px] font-bold text-indigo-950 block">ဆောင်းပါးထဲရှိ အီဒီယမ်နှင့် Phrasal Verb အားလုံးကို AI ဖြင့် ရှာဖွေမည်</span>
                                <span className="text-[10px] text-slate-500 font-medium block">ရှာဖွေတွေ့ရှိသည့် စကားစုများကို Highlight တွဲ၍ ပြသပေးပါမည်။</span>
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleScanTranslationIdioms(inputText)}
                              disabled={isScanningTranslationIdioms}
                              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all duration-150 cursor-pointer ${
                                isScanningTranslationIdioms 
                                  ? "bg-indigo-400 cursor-not-allowed" 
                                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-97 hover:shadow-md"
                              }`}
                            >
                              {isScanningTranslationIdioms ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ရှာဖွေနေဆဲ...
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  AI စကားစုစကင်ဖတ်မည်
                                </>
                              )}
                            </button>
                          </div>

                          {/* Scanned Idioms under translation output */}
                          {isScanningTranslationIdioms ? (
                            <div className="flex flex-col items-center justify-center py-6 space-y-2 text-slate-400">
                              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                              <span className="text-xs font-medium">စကားစုများနှင့် အီဒီယမ်များကို AI ဖြင့် ရှာဖွေဆန်းစစ်နေပါသည်။ ကျေးဇူးပြု၍ ခေတ္တစောင့်ဆိုင်းပေးပါ...</span>
                            </div>
                          ) : translationIdioms.length > 0 ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <h3 className="text-xs font-mono font-black text-indigo-950 uppercase tracking-wider animate-pulse">
                                  DETECTED PHRASES & EXPRESSIONS ({translationIdioms.length})
                                </h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {translationIdioms.map((idm, idx) => {
                                  const colorClass = idm.type === "IDM" 
                                    ? "bg-amber-50 border-amber-200 hover:bg-amber-150/40" 
                                    : "bg-cyan-50 border-cyan-200 hover:bg-cyan-155/40";
                                  const textBadge = idm.type === "IDM"
                                    ? "bg-amber-200 text-amber-950 text-[9px] uppercase font-bold text-center px-1.5 py-0.5 rounded"
                                    : "bg-cyan-200 text-cyan-950 text-[9px] uppercase font-bold text-center px-1.5 py-0.5 rounded";

                                  return (
                                    <div
                                      key={`scanned-trans-item-${idx}`}
                                      className={`p-3.5 rounded-xl border transition-all text-left space-y-2 bg-white ${colorClass}`}
                                    >
                                      <div className="flex items-center justify-between gap-2 border-b border-indigo-200/20 pb-1.5">
                                        <span className="font-extrabold text-slate-900 text-xs">{idm.phrase}</span>
                                        <span className={textBadge}>{idm.type}</span>
                                      </div>
                                      <div>
                                        <p className="text-xs text-indigo-950 font-bold leading-relaxed">{idm.meaning}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 text-[11px] text-slate-400 font-medium bg-white/50 rounded-xl border border-dashed border-slate-200">
                              {translationResult ? "ဤစာသားထဲမှ အီဒီယမ်နှင့် စကားစုများကို အပေါ်မှ ခလုတ်နှိပ်၍သော်လည်းကောင်း၊ ဘာသာပြန်ခြင်းနှင့်အတူ တွဲဖက်၍သော်လည်းကောင်း ရှာဖွေနိုင်ပါသည်ဗျာ။" : ""}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center pt-3 border-t border-slate-100 mt-4">
                          <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-lg transition-all font-bold cursor-pointer animate-pulse"
                          >
                            <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
                            အပေါ်သို့ ပြန်တက်ရန် (Scroll Up)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Breakdown result */}
            <AnimatePresence mode="wait">
              {breakdownResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-6 mt-6"
                >
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
                    
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-bold tracking-wider text-emerald-800 uppercase flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                        စာပိုဒ် အကျယ်ဖွင့် ရှင်းလင်းချက် (Paragraph Breakdown)
                      </h3>
                      <div className="flex items-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => handleAddBreakdownToNotes()}
                          className="text-[10.5px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 hover:border-emerald-350 rounded-lg transition-all font-semibold cursor-pointer"
                          title="ဤအသေးစိတ်သရုပ်ခွဲရှင်းလင်းချက်တစ်ခုလုံးအား ကိုယ်ပိုင်မှတ်စုထဲသို့ သိမ်းဆည်းမည်"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          တစ်ခုလုံးအား မှတ်စုထဲသိမ်းရန်
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsBreakdownCollapsed(!isBreakdownCollapsed)}
                          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded transition-all font-medium cursor-pointer"
                          title={isBreakdownCollapsed ? "ပြန်ဖွင့်ရန် (Show)" : "ခေတ္တသိမ်းထားရန် (Hide)"}
                        >
                          {isBreakdownCollapsed ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              ပြန်ပြရန် (Unhide)
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              ခေတ္တဖျောက်ရန် (Hide)
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setBreakdownResult(null)}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isBreakdownCollapsed ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs font-semibold text-slate-400">
                        🙈 ရှင်းလင်းချက်များကို ခေတ္တဖျောက်ထားပါသည် (Explanation Content is Hidden)
                      </div>
                    ) : (
                      <>
                        {/* Overall Context box */}
                        {breakdownResult.overallContext && (
                          <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-xl">
                            <h4 className="text-xs font-bold text-emerald-700 tracking-wide uppercase mb-2 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              တစ်ခွန်းတည်း ခြုံငုံသုံးသပ်ချက် (Overall Sum-up)
                            </h4>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                              {breakdownResult.overallContext}
                            </p>
                          </div>
                        )}

                        {/* Line Breakdown units */}
                        <div className="space-y-4">
                          {breakdownResult.lineBreakdowns.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-200"
                            >
                              {/* Top: English segment */}
                              <div className="flex justify-between items-start gap-4 mb-3">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] font-mono font-bold text-slate-600 shrink-0">
                                  {idx + 1}
                                </span>
                                <p className="text-sm font-semibold text-slate-800 font-sans tracking-wide leading-relaxed grow">
                                  {item.segment}
                                </p>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => speakText(item.segment, "en-US")}
                                    className={`text-xs p-1 rounded-lg transition-all cursor-pointer ${
                                      speakingWord === item.segment
                                        ? "bg-red-50 text-red-650"
                                        : "text-slate-400 hover:text-indigo-650 hover:bg-slate-100"
                                    }`}
                                    title="အင်္ဂလိပ်အသံထွက် နားထောင်ရန်"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddBreakdownToNotes(item.segment, item.meaning, item.explanation)}
                                    className="text-xs p-1 rounded-lg transition-all text-slate-400 hover:text-emerald-600 hover:bg-slate-100 cursor-pointer"
                                    title="ဤဝါကျသရုပ်ခွဲချက်အား ကိုယ်ပိုင်မှတ်စုထဲသို့ သိမ်းဆည်းရန်"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Middle: meaning */}
                              <div className="mt-2.5 pl-9">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wide">
                                    အဓိပ္ပာယ်
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => speakText(item.meaning, "my-MM")}
                                    className={`text-[10px] p-0.5 rounded transition-all cursor-pointer ${
                                      speakingWord === item.meaning
                                        ? "bg-red-50 text-red-600"
                                        : "text-slate-400 hover:text-indigo-650"
                                    }`}
                                    title="မြန်မာအသံထွက် နားထောင်ရန်"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                                  {item.meaning}
                                </p>
                              </div>

                              {/* Bottom: explanation */}
                              <div className="mt-2.5 pl-9 pt-2 border-t border-slate-200/20">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 tracking-wide">
                                    ရှင်းလင်းချက်
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => speakText(item.explanation, "my-MM")}
                                    className={`text-[10px] p-0.5 rounded transition-all cursor-pointer ${
                                      speakingWord === item.explanation
                                        ? "bg-red-50 text-red-655"
                                        : "text-slate-400 hover:text-indigo-655"
                                    }`}
                                    title="ရှင်းလင်းချက်အား အသံထွက်ဖတ်ရန်"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                                  {item.explanation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Scroll Up button inside Paragraph Breakdown */}
                        <div className="flex justify-center pt-3 border-t border-slate-100 mt-6 select-none">
                          <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-lg transition-all font-bold cursor-pointer animate-pulse"
                          >
                            <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
                            အပေါ်သို့ ပြန်တက်ရန် (Scroll Up)
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
              </>
            ) : (
              renderReaderPanel()
            )}

          </section>

          {/* Sidebar Area: 5 columns on large desktop. Holds Dictionary Loader & Tools in a Tabbed Interface */}
          <section className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col relative">
              {/* Tab Navigation Menu Bar */}
              <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5 gap-1 overflow-x-auto scroller-hide">
                <button
                  type="button"
                  onClick={() => setActiveRightTab("vocab")}
                  className={`flex items-center gap-1 px-2 py-2 text-[10.5px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "vocab"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  ဝေါဟာရများ {translationResult ? `(${translationResult.words.length})` : ""}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab("settings")}
                  className={`flex items-center gap-1 px-2 py-2 text-[10.5px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "settings"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                  title="အသုံးပြုနည်း လမ်းညွှန်ချက်များ"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  အသုံးပြုနည်း
                </button>
                <button
                  onClick={() => setActiveRightTab("search")}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "search"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  စာရှာရန်
                </button>
                <button
                  onClick={() => setActiveRightTab("bookmarks")}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "bookmarks"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  စာမှတ် {history.filter(item => item.isBookmarked && !item.isDeleted).length > 0 ? `(${history.filter(item => item.isBookmarked && !item.isDeleted).length})` : ""}
                </button>
                <button
                  onClick={() => setActiveRightTab("history")}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "history"
                      ? "bg-white text-indigo-600 shadow-2xs border border-indigo-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  မှတ်တမ်း {history.filter(item => !item.isDeleted && !item.isBookmarked).length > 0 ? `(${history.filter(item => !item.isDeleted && !item.isBookmarked).length})` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab("notes")}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    activeRightTab === "notes"
                      ? "bg-white text-emerald-600 shadow-2xs border border-emerald-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
                  title="ကိုယ်ပိုင်မှတ်စု ရေးသားရန်"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  ကိုယ်ပိုင်မှတ်စု {studyNotes.length > 0 ? `(${studyNotes.length})` : ""}
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
                              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                                <BookMarked className="w-4 h-4 text-indigo-500" />
                                ဝေါဟာရနှင့် ဖွင့်ဆိုချက်များ
                              </h3>
                              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                ဝိဘတ်၊ နာမ်စား၊ အာတီကယ်များ ချန်လှပ်၍ တိုက်ဆိုင်ရှာဖွေမှု
                              </p>
                            </div>
                            <span className="text-[10px] font-sans px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-full font-extrabold">
                              {translationResult.words.length} Words Traced
                            </span>
                          </div>

                          {/* Selection Dropdown Form */}
                          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 flex flex-col gap-1.5 shadow-3xs relative z-30" ref={wordsDropdownRef}>
                            <label className="text-xs font-bold text-indigo-950 flex items-center gap-1" htmlFor="traced-words-select-sb">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                              စကားလုံး ရွေးချယ်ရန်:
                            </label>
                            
                            {/* Custom Select Trigger Button */}
                            <button
                              id="traced-words-select-sb"
                              type="button"
                              onClick={() => setIsWordsDropdownOpen(!isWordsDropdownOpen)}
                              className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-3xs cursor-pointer flex items-center justify-between transition-colors hover:bg-slate-50/80"
                            >
                              <span className="truncate">
                                {selectedWordIndex + 1}. {translationResult.words[selectedWordIndex]?.original || (translationResult.words[0]?.original ?? "")}
                              </span>
                              {isWordsDropdownOpen ? (
                                <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                            </button>

                            {/* Dropdown Menu List with absolute positioning */}
                            <AnimatePresence>
                              {isWordsDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.1 }}
                                  ref={wordsListContainerRef}
                                  className="absolute top-full left-3 right-3 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl py-1 scroll-smooth flex flex-col"
                                >
                                  {/* Active Selected Word at the absolute top of the dropdown list */}
                                  {(() => {
                                    const activeWord = translationResult.words[selectedWordIndex];
                                    if (!activeWord) return null;
                                    return (
                                      <div className="border-b border-rose-150 bg-rose-50/70 sticky top-0 z-10">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setIsWordsDropdownOpen(false);
                                          }}
                                          className="w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between font-black text-red-600 bg-rose-50 hover:bg-rose-100 select-none cursor-pointer"
                                          title="လက်ရှိရွေးချယ်ထားသော စာလုံးဖြစ်ပါသည်။"
                                        >
                                          <span className="truncate flex items-center gap-1.5 text-red-600">
                                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                                            ⭐ {selectedWordIndex + 1}. {activeWord.original}
                                          </span>
                                          <span className="text-[9px] font-black uppercase text-red-650 bg-red-100/90 px-1.5 py-0.5 rounded border border-red-200 tracking-wide shrink-0">
                                            ရွေးချယ်ထားဆဲ
                                          </span>
                                        </button>
                                      </div>
                                    );
                                  })()}

                                  {translationResult.words.map((word, idx) => {
                                    const isSelected = idx === selectedWordIndex;
                                    return (
                                      <button
                                        key={idx}
                                        id={`traced-words-dropdown-item-${idx}`}
                                        type="button"
                                        data-selected={isSelected ? "true" : "false"}
                                        onClick={() => {
                                          setSelectedWordIndex(idx);
                                          setIsWordsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center transition-colors font-semibold select-none cursor-pointer ${
                                          isSelected
                                            ? "bg-red-650 text-white font-extrabold hover:bg-red-700 hover:text-white"
                                            : "text-slate-700 hover:bg-red-500 hover:text-white"
                                        }`}
                                      >
                                        <span className="truncate">
                                          {idx + 1}. {word.original}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Display active word card */}
                          {translationResult.words.length > 0 ? (
                            (() => {
                              const word = translationResult.words[selectedWordIndex] || translationResult.words[0];
                              const index = translationResult.words[selectedWordIndex] ? selectedWordIndex : 0;

                              return (
                                <motion.div
                                  key={index}
                                  id="selected-vocab-card"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-slate-50/50 rounded-xl border border-slate-150 p-4 space-y-3 transition-all duration-300"
                                >
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

                                      {/* Speak English Audio */}
                                      <button
                                        type="button"
                                        onClick={() => speakText(word.base, "en-US")}
                                        className={`p-1 rounded bg-white border border-slate-200 transition-all cursor-pointer ${
                                          speakingWord === word.base
                                            ? "bg-red-50 text-red-650 border-red-200 animate-pulse"
                                            : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                                        }`}
                                        title="အင်္ဂလိပ် အသံထွက် နားထောင်ရန်"
                                      >
                                        <Volume2 className="w-3 h-3" />
                                      </button>

                                      {/* Toggle Bookmark Star */}
                                      <button
                                        type="button"
                                        onClick={() => toggleBookmarkWord({
                                          original: word.original,
                                          base: word.base,
                                          pos: word.pos,
                                          definition: word.dictionary_definition || word.fallback_my
                                        })}
                                        className={`p-1 rounded bg-white border border-slate-200 transition-all cursor-pointer ${
                                          isWordBookmarked(word.base)
                                            ? "bg-amber-50 border-amber-305 text-amber-600"
                                            : "text-slate-400 hover:text-amber-500 hover:bg-amber-50/20"
                                        }`}
                                        title={isWordBookmarked(word.base) ? "စကားလုံးမှတ်စုတို သီးသန့်စာအုပ်ငယ်မှ ဖယ်ထုတ်ရန်" : "စကားလုံးမှတ်စုတို သီးသန့်စာအုပ်ငယ်သို့ သိမ်းဆည်းရန် (Wordbook)"}
                                      >
                                        <Star className={`w-3.5 h-3.5 ${isWordBookmarked(word.base) ? "fill-current" : ""}`} />
                                      </button>
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
                                          {renderTextWithBadges(word.dictionary_definition, true)}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold tracking-wider text-amber-600 uppercase flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-amber-500" />
                                          Gemini ရှင်းလင်းချက် (Fallback)
                                        </div>
                                        <div className="text-xs text-slate-600 italic whitespace-pre-line leading-relaxed border-l-3 border-amber-300 pl-2.5 bg-amber-50/25 py-2 rounded-r pr-2">
                                          {renderTextWithBadges(word.fallback_my, true)}
                                        </div>
                                        <p className="text-[9px] text-amber-500/80 pl-2.5 leading-normal">
                                          * ဤစကားလုံးကို loaded dictionary ထဲတွင်မတွေ့ရသဖြင့် ဝါကျအလိုက် Gemini က တိုက်ရိုက်အဓိပ္ပါယ် ဖွင့်ပေးထားသည်။
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Scroll up button at the bottom of the card */}
                                  <div className="flex justify-center pt-3 border-t border-slate-200/60 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                        const element = document.getElementById("traced-words-select-sb");
                                        if (element) {
                                          element.scrollIntoView({ behavior: "smooth", block: "center" });
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-indigo-150/50 shadow-3xs"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5 text-indigo-500" />
                                      အပေါ်ဆုံးသို့ ပြန်သွားရန် (Scroll Up)
                                    </button>
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
                      <div className="relative">
                        <input
                          id="search-input-field"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="အဘိဓာန်မှာ စာလုံးရှာမည်။"
                          className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 font-medium animate-none"
                        />
                        <div className="absolute left-3.5 top-2.5 text-slate-400">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {searchQuery.trim() && (
                        <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 transition-all">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 animate-none">
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

                  {activeRightTab === "bookmarks" && (
                    <motion.div
                      key="bookmarks-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5"
                    >
                      {/* Sub-tab selection row */}
                      <div className="flex border-b border-slate-200">
                        <button
                          type="button"
                          onClick={() => setBookmarkedTab("words")}
                          className={`flex-1 py-2 text-xs font-bold border-b-2 text-center cursor-pointer transition-all ${
                            bookmarkedTab === "words"
                              ? "border-amber-500 text-amber-600 font-extrabold"
                              : "border-transparent text-slate-500 hover:text-slate-705"
                          }`}
                        >
                          စကားလုံးစာအုပ်ငယ် ({bookmarkedWords.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookmarkedTab("sentences")}
                          className={`flex-1 py-2 text-xs font-bold border-b-2 text-center cursor-pointer transition-all ${
                            bookmarkedTab === "sentences"
                              ? "border-amber-500 text-amber-600 font-extrabold"
                              : "border-transparent text-slate-500 hover:text-slate-705"
                          }`}
                        >
                          ဝါကျမှတ်စုများ ({history.filter(item => item.isBookmarked && !item.isDeleted).length})
                        </button>
                      </div>

                      {/* Content of Sub-Tab 1: Wordbook */}
                      {bookmarkedTab === "words" && (
                        <div className="space-y-3.5 animate-none">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              ဝေါဟာရမှတ်စုတို သီးသန့်စာအုပ်ငယ် (Wordbook)
                            </span>
                            {bookmarkedWords.length > 0 && (
                              <button
                                onClick={() => {
                                  if (confirm("ဝေါဟာရမှတ်စုတိုအားလုံးကို ဖျက်သိမ်းမည် ဖြစ်ပါသလား။")) {
                                    setBookmarkedWords([]);
                                    setFlashcardModeActive(false);
                                    showSuccess("ဝေါဟာရမှတ်စုတိုအားလုံးကို ဖျက်သိမ်းလိုက်ပါပြီ။");
                                  }
                                }}
                                className="text-[9px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-all font-bold cursor-pointer shrink-0"
                              >
                                အားလုံးဖျက်ရန်
                              </button>
                            )}
                          </div>

                          {/* Interactive Tooling Action Row */}
                          {bookmarkedWords.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-100 shrink-0">
                              <button
                                type="button"
                                onClick={startFlashcardsSession}
                                className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                  flashcardModeActive
                                    ? "bg-indigo-650 text-white border-indigo-700 hover:bg-indigo-700"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                }`}
                                title="အလွတ်ကျက်ကတ်ပြားငယ်များဖြင့် လေ့ကျင့်မည်"
                              >
                                🎴 Flashcards လေ့ကျင့်ရန်
                              </button>
                              
                              <button
                                type="button"
                                onClick={handleExportWordsCSV}
                                className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-all font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95"
                                title="Excel / CSV ဖိုင်ထုပ်အဖြစ် သိမ်းဆည်းရန်"
                              >
                                📥 Excel/CSV တင်ပို့ရန်
                              </button>
                            </div>
                          )}

                          {flashcardModeActive ? (
                            /* Modern Flashcard mode panel replacement */
                            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-4 animate-in fade-in duration-200">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                  🎴 Flashcard ({flashcardIndex + 1} / {flashcardsList.length})
                                </span>
                                <button
                                  onClick={() => setFlashcardModeActive(false)}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded-md transition-all font-extrabold cursor-pointer"
                                >
                                  ထွက်ရန် (Close)
                                </button>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full transition-all duration-300"
                                  style={{ width: `${((flashcardIndex + 1) / flashcardsList.length) * 100}%` }}
                                />
                              </div>

                              {/* Starting Language Toggle for Bookmarked words */}
                              <div className="flex items-center gap-2 justify-center text-xs select-none bg-white p-1.5 rounded-lg border border-slate-200/60 max-w-xs mx-auto">
                                <span className="text-slate-500 font-extrabold text-[10px]">မေးခွန်းပုံစံ:</span>
                                <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5 border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFlashcardStartSide("en");
                                      setFlashcardFlipped(false);
                                    }}
                                    className={`py-0.5 px-2 rounded text-[9px] font-black transition-all cursor-pointer ${
                                      flashcardStartSide === "en"
                                        ? "bg-white text-indigo-700 shadow-xs"
                                        : "text-slate-500 hover:text-slate-800"
                                    }`}
                                  >
                                    🇬🇧 English First
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFlashcardStartSide("my");
                                      setFlashcardFlipped(false);
                                    }}
                                    className={`py-0.5 px-2 rounded text-[9px] font-black transition-all cursor-pointer ${
                                      flashcardStartSide === "my"
                                        ? "bg-white text-emerald-700 shadow-xs"
                                        : "text-slate-500 hover:text-slate-800"
                                    }`}
                                  >
                                    🇲🇲 Myanmar First
                                  </button>
                                </div>
                              </div>

                              {/* The Interactive Flashcard Component with click-to-flip motion */}
                              {flashcardsList[flashcardIndex] && (
                                <div 
                                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                                  className={`relative min-h-[160px] bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl p-5 flex flex-col justify-between cursor-pointer shadow-3xs transition-all duration-300 active:scale-[0.98] select-none ${
                                    flashcardFlipped 
                                      ? (flashcardStartSide === "en" ? "bg-emerald-50/10 border-emerald-200 shadow-xs" : "bg-indigo-50/10 border-indigo-200 shadow-xs") 
                                      : (flashcardStartSide === "en" ? "bg-white border-slate-200 shadow-3xs" : "bg-white border-emerald-100 shadow-3xs")
                                  }`}
                                >
                                  {/* Top header within card */}
                                  <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-wider font-extrabold pb-1">
                                    <span>
                                      {flashcardStartSide === "en"
                                        ? (flashcardFlipped ? "🇲🇲 Myanmar Translation" : "🇬🇧 English Word")
                                        : (flashcardFlipped ? "🇬🇧 English Word" : "🇲🇲 Myanmar Translation")}
                                    </span>
                                    <span className="text-indigo-500 font-bold">လှန်ရန်နှိပ်ပါ 💡</span>
                                  </div>

                                  {/* Card main text */}
                                  <div className="py-4 text-center">
                                    {((flashcardStartSide === "en" && !flashcardFlipped) || (flashcardStartSide === "my" && flashcardFlipped)) ? (
                                      /* English Word */
                                      <div className="space-y-1">
                                        <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                                          {flashcardsList[flashcardIndex].original?.replace(/🚀/g, "").trim()}
                                        </h3>
                                        {flashcardsList[flashcardIndex].base && flashcardsList[flashcardIndex].base.toLowerCase() !== flashcardsList[flashcardIndex].original.toLowerCase() && (
                                          <p className="text-[11px] text-slate-500 font-bold bg-slate-100 rounded px-1.5 py-0.5 inline-block">
                                            base: {flashcardsList[flashcardIndex].base}
                                          </p>
                                        )}
                                        {flashcardsList[flashcardIndex].pos && (
                                          <p className="text-[10px] text-indigo-650 font-mono font-bold uppercase tracking-wide block">
                                            {flashcardsList[flashcardIndex].pos}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      /* Myanmar Meaning */
                                      <div className="space-y-2">
                                        <div className="text-sm text-slate-850 font-bold leading-relaxed whitespace-pre-wrap bg-emerald-50/20 p-2.5 rounded-lg border border-emerald-100 inline-block text-left">
                                          {renderTextWithBadges(flashcardsList[flashcardIndex].definition, true)}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Micro controls inside cards */}
                                  <div className="flex justify-between items-center pt-2 border-t border-slate-100/60" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                      {/* Speak English Button */}
                                      {((flashcardStartSide === "en" && !flashcardFlipped) || (flashcardStartSide === "my" && flashcardFlipped)) ? (
                                        <button
                                          type="button"
                                          onClick={() => speakText(flashcardsList[flashcardIndex].original, "en-US")}
                                          className="p-1 px-1.5 rounded border border-slate-205 text-slate-550 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer text-[10px] font-bold flex items-center gap-1"
                                          title="English အသံထွက်ဖတ်ရန်"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 text-indigo-650" />
                                        </button>
                                      ) : (
                                        /* Speak Myanmar Button */
                                        <button
                                          type="button"
                                          onClick={() => speakText(flashcardsList[flashcardIndex].definition, "my-MM")}
                                          className="p-1 px-1.5 rounded border border-slate-205 text-emerald-600 hover:text-emerald-700 hover:bg-slate-50 cursor-pointer text-[10px] font-bold flex items-center gap-1"
                                          title="မြန်မာအသံထွက်ဖတ်ရန်"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                                        </button>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                                      className="text-[9px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 px-2 py-0.5 rounded transition-all cursor-pointer"
                                    >
                                      🔄 လှန်မည် (Flip)
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Navigation buttons */}
                              <div className="flex items-center gap-2 pt-1.5 shrink-0 select-none">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFlashcardFlipped(false);
                                    setFlashcardIndex(prev => (prev > 0 ? prev - 1 : flashcardsList.length - 1));
                                  }}
                                  className="flex-1 py-1.5 px-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                                >
                                  ◀ ယခင်ကတ်
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFlashcardFlipped(false);
                                    setFlashcardIndex(prev => (prev < flashcardsList.length - 1 ? prev + 1 : 0));
                                  }}
                                  className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-3xs"
                                >
                                  နောက်တစ်ခု ▶
                                </button>
                              </div>

                              {/* Study tips */}
                              <div className="bg-amber-50/75 border border-amber-100 rounded-xl p-2.5 text-[10px] leading-relaxed text-amber-900">
                                <p className="font-extrabold flex items-center gap-1 mb-0.5">💡 အလွတ်ကျက်မှတ်ရန် ကူညီချက်:</p>
                                <p>
                                  {flashcardStartSide === "en" 
                                    ? "အင်္ဂလိပ်စကားလုံးကို ကြည့်၍ မြန်မာအဓိပ္ပာယ်ကို စဥ်းစားပါ။ ပြီးလျှင် ကတ်ကိုအသာအယာနှိပ်၍ အဖြေတိုက်စစ်ပါရန်။"
                                    : "မြန်မာအဓိပ္ပာယ်ကို ကြည့်၍ အင်္ဂလိပ်စကားလုံးကို စဥ်းစားပါ။ ပြီးလျှင် ကတ်ကိုအသာအယာနှိပ်၍ အဖြေတိုက်စစ်ပါရန်။"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Dynamic Search Box for Wordbook */}
                              <div className="relative">
                                <input
                                  type="text"
                                  value={bookmarkWordsSearch}
                                  onChange={(e) => setBookmarkWordsSearch(e.target.value)}
                                  placeholder="မှတ်စုငယ်ထဲမှ စကားလုံးရှာမည်..."
                                  className="w-full text-xs pl-8 pr-4 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 font-medium"
                                />
                                <div className="absolute left-2.5 top-2.5 text-slate-400">
                                  <Search className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {(() => {
                                const filtered = bookmarkedWords.filter(
                                  (w) =>
                                    w.base.toLowerCase().includes(bookmarkWordsSearch.toLowerCase()) ||
                                    w.original.toLowerCase().includes(bookmarkWordsSearch.toLowerCase()) ||
                                    w.definition.toLowerCase().includes(bookmarkWordsSearch.toLowerCase())
                                );

                            if (filtered.length > 0) {
                              return (
                                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                  {filtered.map((item) => {
                                    const isExpanded = expandedBookmarkWordId === item.id;
                                    return (
                                      <div
                                        key={item.id}
                                        className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all shadow-3xs"
                                        id={`bookmark_word_${item.id}`}
                                      >
                                        {/* Dropdown Header: Click to expand / collapse */}
                                        <div
                                          onClick={() => setExpandedBookmarkWordId(isExpanded ? null : item.id)}
                                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-xs font-extrabold text-slate-900 border-b border-indigo-100 truncate">
                                              {item.original}
                                            </span>
                                            {item.base && item.base.toLowerCase() !== item.original.toLowerCase() && (
                                              <span className="text-[10px] text-indigo-550 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                                                {item.base}
                                              </span>
                                            )}
                                            {item.pos && (
                                              <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-100 text-slate-500 rounded uppercase font-bold shrink-0">
                                                {item.pos}
                                              </span>
                                            )}
                                          </div>
                                          
                                          {/* Chevron Indicator */}
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            {isExpanded ? (
                                              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform" />
                                            ) : (
                                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform" />
                                            )}
                                          </div>
                                        </div>

                                        {/* Dropdown Expanded Details using motion height transition */}
                                        <AnimatePresence initial={false}>
                                          {isExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.18 }}
                                              className="overflow-hidden border-t border-slate-100 bg-slate-50/20"
                                            >
                                              <div className="p-3 space-y-2.5">
                                                {/* Definition */}
                                                <div className="text-xs text-slate-705 font-medium pl-2.5 border-l-2 border-indigo-500 bg-indigo-50/15 py-1.5 rounded-r leading-relaxed">
                                                  {renderTextWithBadges(item.definition, true)}
                                                </div>

                                                {/* Playback & Action Controls */}
                                                <div className="flex items-center justify-between gap-2 border-t border-slate-100/60 pt-2 shrink-0">
                                                  <div className="flex items-center gap-1">
                                                    {/* Speak English */}
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        speakText(item.base, "en-US");
                                                      }}
                                                      className={`p-1.5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                                                        speakingWord === item.base
                                                          ? "bg-red-50 text-red-650 border-red-200 animate-pulse"
                                                          : "text-slate-450 border-slate-205 bg-white hover:bg-slate-50"
                                                      }`}
                                                      title="English အသံထွက်ဖတ်ရန်"
                                                    >
                                                      <Volume2 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Speak Burmese */}
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        speakText(item.definition, "my-MM");
                                                      }}
                                                      className={`p-1.5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                                                        speakingWord === item.definition
                                                          ? "bg-red-50 text-red-650 border-red-200 animate-pulse"
                                                          : "text-emerald-555 border-slate-205 bg-white hover:bg-slate-50"
                                                      }`}
                                                      title="မြန်မာအသံထွက်ဖတ်ရန်"
                                                    >
                                                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    </button>
                                                  </div>

                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleBookmarkWord(item);
                                                    }}
                                                    className="p-1 px-2 rounded-md bg-white border border-slate-200 hover:bg-amber-50 text-amber-500 hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                                                    title="စကားလုံးစာအုပ်ငယ်မှ ဖယ်ထုတ်ရန်"
                                                  >
                                                    <Star className="w-3.5 h-3.5 fill-current text-amber-550" />
                                                    ဖျက်မည်
                                                  </button>
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            return (
                              <div className="text-center py-8 text-slate-400">
                                <BookOpen className="w-8 h-8 mx-auto stroke-1 mb-1 text-slate-350" />
                                <p className="text-xs font-bold text-slate-550">မှတ်စုစကားလုံးသီးသန့် မရှိသေးပါ။</p>
                                <p className="text-[10px] text-slate-400 mt-1 md:px-6 leading-relaxed">
                                  ဝေါဟာရ (Vocab) tab ရှိ စကားလုံးကတ်ပြားပေါ်ရှိ ကြယ်ပွင့်ပုံစံကို နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်။
                                </p>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}

                      {/* Content of Sub-Tab 2: Sentence Bookmarks */}
                      {bookmarkedTab === "sentences" && (
                        <div className="space-y-3.5 animate-none">
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              မှတ်သားထားသော ဝါကျများ (Sentences)
                            </span>
                            {history.filter(item => item.isBookmarked && !item.isDeleted).length > 0 && (
                              <button
                                onClick={() => {
                                  const unbookmarkedAll = history.map(item => ({ ...item, isBookmarked: false, timestamp: Date.now() }));
                                  handleSaveToCloudDirectly(unbookmarkedAll);
                                  showSuccess("ဝါကျစာမှတ်အားလုံးကို ဖျက်သိမ်းလိုက်ပါပြီ။");
                                }}
                                className="text-[9px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition-all font-bold cursor-pointer"
                                title="စာမှတ်အားလုံးကို ဖျက်သိမ်းပါမည်"
                              >
                                အားလုံးဖျက်ရန်
                              </button>
                            )}
                          </div>

                          {history.filter(item => item.isBookmarked && !item.isDeleted).length > 0 ? (
                            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                              {history.filter(item => item.isBookmarked && !item.isDeleted).map((hist) => (
                                <div 
                                  key={hist.id} 
                                  className="pt-2.5 first:pt-0 pb-1.5 flex items-start justify-between gap-2 border-b border-dashed border-slate-100 last:border-0 group cursor-pointer"
                                  onClick={() => {
                                    setInputText(hist.originalText);
                                    const wordsWithDefinitions = hist.words.map((w) => {
                                      if (w.dictionary_definition) {
                                        let definition = w.dictionary_definition;
                                        const hasIdm = w.fallback_my && w.fallback_my.includes("[IDM]");
                                        const hasPhrv = w.fallback_my && w.fallback_my.includes("[PHRV]");
                                        if (hasIdm && !definition.includes("[IDM]")) {
                                          definition = definition.trim() + " [IDM]";
                                        }
                                        if (hasPhrv && !definition.includes("[PHRV]")) {
                                          definition = definition.trim() + " [PHRV]";
                                        }
                                        return { ...w, dictionary_definition: definition };
                                      }
                                      const baseKey = w.base.toLowerCase().trim().replace(/d+$/, "");
                                      let definition = dictionaryMap.get(baseKey);
                                      if (!definition && w.original) {
                                        const originalKey = w.original.toLowerCase().trim().replace(/d+$/, "");
                                        definition = dictionaryMap.get(originalKey);
                                      }
                                      if (definition) {
                                        const hasIdm = w.fallback_my && w.fallback_my.includes("[IDM]");
                                        const hasPhrv = w.fallback_my && w.fallback_my.includes("[PHRV]");
                                        if (hasIdm && !definition.includes("[IDM]")) {
                                          definition = definition.trim() + " [IDM]";
                                        }
                                        if (hasPhrv && !definition.includes("[PHRV]")) {
                                          definition = definition.trim() + " [PHRV]";
                                        }
                                      }
                                      return {
                                        ...w,
                                        dictionary_definition: definition || null,
                                      };
                                    });
                                    setTranslationResult({
                                      translation: hist.translation,
                                      words: wordsWithDefinitions,
                                    });
                                    setSelectedWordIndex(0);
                                    setActiveRightTab("vocab");
                                  }}
                                >
                                  <div className="min-w-0 flex-1 space-y-0.5 font-sans">
                                    <div className="flex items-center gap-1.5 min-w-0 font-sans">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 shrink-0" />
                                      <p className="text-xs font-semibold text-slate-755 group-hover:text-indigo-600 truncate font-sans">
                                        {hist.originalText}
                                      </p>
                                    </div>
                                    <p className="text-xs text-emerald-600 truncate font-medium font-sans">
                                      {hist.translation}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1.5 font-sans">
                                      <span>{new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity font-sans">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updated = history.map((item) =>
                                          item.id === hist.id 
                                            ? { ...item, isBookmarked: false, isDeleted: true, timestamp: Date.now() } 
                                            : item
                                        );
                                        handleSaveToCloudDirectly(updated);
                                        showSuccess("ဤစာမှတ်ကို အပြီးတိုင် ဖျက်ပြီးပါပြီ။");
                                      }}
                                      className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition-colors"
                                      title="ဤစာမှတ်ကို အပြီးတိုင်ဖျက်ရန်"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updated = history.map((item) =>
                                          item.id === hist.id 
                                            ? { ...item, isDeleted: true, timestamp: Date.now() } 
                                            : item
                                        );
                                        handleSaveToCloudDirectly(updated);
                                        showSuccess("ဤစာမှတ်ကို အပြီးတိုင် ဖျက်လိုက်ပါပြီ။");
                                      }}
                                      className="p-1 rounded-md text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition-colors font-sans"
                                      title="ဤစာမှတ်ကို အပြီးတိုင်ဖျက်ရန်"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-slate-400">
                              <Star className="w-8 h-8 mx-auto stroke-1 mb-1 text-slate-350" />
                              <p className="text-xs font-bold text-slate-550 mr-1.5 font-sans">စာမှတ်ပြုလုပ်ထားသည်များ မရှိသေးပါ။</p>
                              <p className="text-[10.5px] text-slate-400 mt-1 md:px-6 leading-relaxed font-sans">မှတ်တမ်း (History) tab မှ ဝါကျများကို ကြယ်ပွင့်ပုံစံနှိပ်၍ စာမှတ်အဖြစ် သိမ်းဆည်းရန် ဖြစ်ပါသည်။</p>
                            </div>
                          )}
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
                        {history.filter(item => !item.isDeleted && !item.isBookmarked).length > 0 && (
                          <button
                            onClick={() => {
                              const activeNonBookmarked = history.filter(item => !item.isDeleted && !item.isBookmarked);
                              if (activeNonBookmarked.length > 0) {
                                const cleared = history.map(item => {
                                  if (!item.isBookmarked) {
                                    return { ...item, isDeleted: true, timestamp: Date.now() };
                                  }
                                  return item;
                                });
                                handleSaveToCloudDirectly(cleared);
                                showSuccess("သမိုင်းမှတ်တမ်းကို ရှင်းလင်းလိုက်ပါပြီ။ Bookmark ပြုလုပ်ထားသော အရာများသာ ချန်လှပ်ထားပါသည်။");
                              } else {
                                showSuccess("ဖျက်ရန် သမိုင်းမှတ်တမ်းအသစ် မရှိသေးပါ။");
                              }
                            }}
                            className="text-[9px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-all font-bold cursor-pointer font-sans"
                            title="Bookmark ပြုလုပ်ထားသော အရာများကို ချန်လှပ်၍ ကျန်ရှိသမျှကို ရှင်းလင်းပါမည်"
                          >
                            ရှင်းလင်းရန်
                          </button>
                        )}
                      </div>

                      {history.filter(item => !item.isDeleted && !item.isBookmarked).length > 0 ? (
                        <div className="space-y-2.5 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                          {history.filter(item => !item.isDeleted && !item.isBookmarked).map((hist) => (
                            <div 
                              key={hist.id} 
                              className="pt-2.5 first:pt-0 pb-1.5 flex items-start justify-between gap-2 border-b border-dashed border-slate-100 last:border-0 group cursor-pointer"
                              onClick={() => {
                                setInputText(hist.originalText);
                                const wordsWithDefinitions = hist.words.map((w) => {
                                  if (w.dictionary_definition) {
                                    let definition = w.dictionary_definition;
                                    const hasIdm = w.fallback_my && w.fallback_my.includes("[IDM]");
                                    const hasPhrv = w.fallback_my && w.fallback_my.includes("[PHRV]");
                                    if (hasIdm && !definition.includes("[IDM]")) {
                                      definition = definition.trim() + " [IDM]";
                                    }
                                    if (hasPhrv && !definition.includes("[PHRV]")) {
                                      definition = definition.trim() + " [PHRV]";
                                    }
                                    return { ...w, dictionary_definition: definition };
                                  }
                                  const baseKey = w.base.toLowerCase().trim().replace(/\d+$/, "");
                                  let definition = dictionaryMap.get(baseKey);
                                  if (!definition && w.original) {
                                    const originalKey = w.original.toLowerCase().trim().replace(/\d+$/, "");
                                    definition = dictionaryMap.get(originalKey);
                                  }
                                  if (definition) {
                                    const hasIdm = w.fallback_my && w.fallback_my.includes("[IDM]");
                                    const hasPhrv = w.fallback_my && w.fallback_my.includes("[PHRV]");
                                    if (hasIdm && !definition.includes("[IDM]")) {
                                      definition = definition.trim() + " [IDM]";
                                    }
                                    if (hasPhrv && !definition.includes("[PHRV]")) {
                                      definition = definition.trim() + " [PHRV]";
                                    }
                                  }
                                  return {
                                    ...w,
                                    dictionary_definition: definition || null,
                                  };
                                });
                                setTranslationResult({
                                  translation: hist.translation,
                                  words: wordsWithDefinitions,
                                });
                                setSelectedWordIndex(0);
                                setActiveRightTab("vocab");
                              }}
                            >
                              <div className="min-w-0 flex-1 space-y-0.5 font-sans">
                                <div className="flex items-center gap-1.5 min-w-0 font-sans">
                                  {hist.isBookmarked && (
                                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 shrink-0" />
                                  )}
                                  <p className="text-xs font-semibold text-slate-755 group-hover:text-indigo-600 truncate font-sans">
                                    {hist.originalText}
                                  </p>
                                </div>
                                <p className="text-xs text-emerald-600 truncate font-medium font-sans">
                                  {hist.translation}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1.5 font-sans">
                                  <span>{new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  {hist.isBookmarked && (
                                    <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-1 py-0.2 rounded border border-amber-100 uppercase tracking-wide font-sans">
                                      Saved
                                    </span>
                                  )}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity font-sans">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updated = history.map((item) =>
                                      item.id === hist.id 
                                        ? { ...item, isBookmarked: !item.isBookmarked, timestamp: Date.now() } 
                                        : item
                                    );
                                    handleSaveToCloudDirectly(updated);
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
                                    const updated = history.map((item) =>
                                      item.id === hist.id 
                                        ? { ...item, isDeleted: true, timestamp: Date.now() } 
                                        : item
                                    );
                                    handleSaveToCloudDirectly(updated);
                                    showSuccess("ဤမှတ်တမ်းကိုဖျက်လိုက်ပါပြီ။");
                                  }}
                                  className="p-1 rounded-md text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition-colors font-sans"
                                  title="ဤမှတ်တမ်းကိုဖျက်ရန်"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-slate-400 font-sans">
                          <History className="w-8 h-8 mx-auto stroke-1 mb-1 text-slate-350" />
                          <p className="text-xs text-slate-500 font-sans">သမိုင်းမှတ်တမ်း မရှိသေးပါ။</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeRightTab === "settings" && (
                    <motion.div
                      key="settings-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-5"
                    >
                      <div className="border-b border-slate-100 pb-2.5 font-sans">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-755 flex items-center gap-1.5 font-sans">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          အသုံးပြုနည်း လမ်းညွှန်များ
                        </h3>
                      </div>

                      <div className="space-y-4 bg-slate-50 border border-slate-150 p-4 rounded-xl text-slate-705 text-xs inline-block w-full font-sans">
                        <div className="space-y-2.5 font-sans">
                          <p className="font-semibold text-slate-800 leading-relaxed font-sans">
                            ၁။ မိမိကိုယ်ပိုင် Gemini API key ကို အောက်ပါကွက်လပ်၌ ဖြည့်ပါ။ မရှိပါက vpn ဖွင့်၍ အောက်ပါအတိုင်း Key ကို သွားယူပါ။
                          </p>
                          
                          <div className="pl-4 space-y-1.5 text-[11px] text-slate-655 font-sans">
                            <p className="flex items-center gap-1.5 font-sans">
                              <span>၂။</span>
                              <a
                                href="https://aistudio.google.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2"
                              >
                                https://aistudio.google.com/
                              </a>
                            </p>
                            <p>၃။ မိမိ၏ (Gmail) ဖြင့် Login ဝင်ပေးပါ။</p>
                            <p>၄။ Get API key ကို နှိပ်ပါ။</p>
                            <p>၅။ Create API key ကို ထပ်နှိပ်ပါ။</p>
                            <p>၆။ Create API key in new project နှိပ်ပါ။</p>
                            <p>၇။ API Key ကို Copy ယူပါ။</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 font-sans">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                            မိမိကိုယ်ပိုင် Gemini API Key ဖြည့်သွင်းရန်
                          </label>
                          {customApiKey.trim() && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              ✓ Auto-Saved (စနစ်တကျသိမ်းပြီး)
                            </span>
                          )}
                        </div>
                        <div className="relative rounded-md shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Key className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          </div>
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all outline-hidden"
                            placeholder="AIzaSy..."
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showApiKey ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 font-sans">
                        {customApiKey.trim() ? (
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 p-2.5 rounded-lg text-[10px] font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>အသုံးပြုနေသောစနစ်: <b>ကိုယ်ပိုင် API Key (Custom User Key)</b> ကို အသုံးပြုထားပါသည်။</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-100 p-2.5 rounded-lg text-[10px] font-medium font-sans">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                            <span>အသုံးပြုနေသောစနစ်: <b>ကိုယ်ပိုင် Gemini API Key ထည့်သွင်းပေးရန် လိုအပ်ပါသည်</b></span>
                          </div>
                        )}
                      </div>

                      {customApiKey.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomApiKey("");
                            showSuccess("ကိုယ်ပိုင် API Key ကို စနစ်အတွင်းမှ ရှင်းလင်းလိုက်ပါပြီ။");
                          }}
                          className="w-full text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/60 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          Clear Custom API Key
                        </button>
                      )}

                      {/* Audio Text-To-Speech Settings */}
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-2xs">
                        <h4 className="text-xs font-bold text-slate-805 flex items-center gap-1.5 uppercase tracking-wide">
                          <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                          အသံထွက်ဖတ်ကြားခြင်း ဆက်တင်များ (Pronunciation Settings)
                        </h4>

                        <div className="space-y-3 font-sans">
                          {/* Accent selector */}
                          <div className="space-y-1.5">
                            <label className="text-[10.5px] font-bold text-slate-650 block">
                              မူရင်းအသံထွက်ပုံစံ (Select Accent Voice)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSpeechAccent("en-US");
                                  showSuccess("US (အမေရိကန်) အသံထွက်ပုံစံကို ရွေးချယ်ပြီးပါပြီ။");
                                }}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                                  speechAccent === "en-US"
                                    ? "bg-indigo-50 border-indigo-400 text-indigo-750 font-bold"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50"
                                }`}
                              >
                                US Standard (အမေရိကန်)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSpeechAccent("en-GB");
                                  showSuccess("UK (ဗြိတိသျှ) အသံထွက်ပုံစံကို ရွေးချယ်ပြီးပါပြီ။");
                                }}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                                  speechAccent === "en-GB"
                                    ? "bg-indigo-50 border-indigo-400 text-indigo-750 font-bold"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50"
                                }`}
                              >
                                UK Standard (ဗြိတိသျှ)
                              </button>
                            </div>
                          </div>

                          {/* Sound Speed slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="font-bold text-slate-650">ဖတ်ကြားရန်အရှိန် (Speech Speed):</span>
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">{speechRate}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="1.5"
                              step="0.1"
                              value={speechRate}
                              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                              className="w-full accent-indigo-650 cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase font-sans">
                              <span>နှေးကွေးစွာ (0.5x)</span>
                              <span>ပုံမှန် (1.0x)</span>
                              <span>လျင်မြန်စွာ (1.5x)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cloud Sync Dashboard widget */}
                      <div className="bg-gradient-to-br from-indigo-50/40 to-violet-50/40 border border-indigo-100 p-4 rounded-xl space-y-3 shadow-2xs mt-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <CloudLightning className="w-4 h-4 text-indigo-600" />
                            ကွန်ပျူတာ နှင့် ဖုန်း Sync လုပ်ဆောင်ချက် (Cloud Synchronization)
                          </h4>
                        </div>

                        <p className="text-[10.5px] text-slate-600 leading-relaxed md:text-[11px] font-sans">
                          {user ? (
                            googleDriveAuthorized ? (
                              "Google Drive & Cloud Sync စနစ် အမြဲတမ်းအွန်လိုင်း (Always On) ချိတ်ဆက်ထားပြီး ဖြစ်ပါသည်။ သင်၏ စာမှတ်များနှင့် ဘာသာပြန်မှတ်တမ်းများကို ခြေရာခံသိမ်းဆည်းပေးနေပါပြီ။ သင့်ကိုယ်ပိုင် Google Drive နှင့် အကျုံးဝင်သော တိမ်တိုက်ဒေတာစင်တာသို့ အလိုအလျောက် နောက်ကွယ်မှ အမြဲတမ်း မပြတ်စင့်ခ်လုပ် စာရင်းသွင်းပေးနေပါမည်။"
                            ) : (
                              "Google အကောင့်ဖြင့် ချိတ်ဆက်ထားသော်လည်း Google Drive Sync လုပ်နိုင်ရန် ခွင့်ပြုချက် (Authorize) ပြန်လုပ်ပေးရန် လိုအပ်ပါသည်။ အောက်ပါ 'Google Drive နှင့် ချိတ်ဆက်မည်' ခလုတ်ကို နှိပ်ပေးပါ။"
                            )
                          ) : !customApiKey.trim() ? (
                            "ဒေတာများကို ဖုန်းနှင့် ကွန်ပျူတာ အချင်းချင်း စင့်ခ်လုပ်ရန်အတွက် အောက်ပါအတိုင်း Google အကောင့်ဖြင့် Sign In ဝင်ပြီး ၁၀၀% အခမဲ့ဖြစ်သော Google Drive ပေါ်၌ လုံခြုံစိတ်ချစွာ သိမ်းဆည်းနိုင်ပါသည် (သို့မဟုတ်) အပေါ်ရှိ မိမိကိုယ်ပိုင် Gemini API Key ကို ဖြည့်သွင်း၍လည်း စင့်ခ်လုပ်နိုင်ပါသည်။"
                          ) : (
                            "ကိုယ်ပိုင် API Key အခြေပြု တိမ်တိုက်စင့်ခ်လှုပ်ရှားမှုမှာ အောင်မြင်စွာ အလုပ်လုပ်နေပါသည်။ သင်၏ ဘာသာပြန်ရလဒ်များ၊ စာမှတ် (Bookmarks) သမိုင်းများကို ဆာဗာသို့ အလိုအလျောက် လုံခြုံစွာ သိမ်းဆည်းလင့်ခ်ပေးနေပါပြီ။"
                          )}
                        </p>

                        {/* Google Authentication Sync Option */}
                        <div className="border-t border-slate-100 pt-3 mt-2 space-y-2.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            Google Cloud Account ဖြင့် ချိတ်ဆက်ခြင်း (ရွေးချယ်ရန်)
                          </label>
                          {isAuthLoading ? (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 py-1">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-550" /> Load လုပ်နေသည်...
                            </div>
                          ) : user ? (
                            <div className="space-y-2">
                              <div className="bg-white border border-slate-150 p-2.5 rounded-lg flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-6.5 h-6.5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
                                    {user.email ? user.email.charAt(0).toUpperCase() : "G"}
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[11px] font-semibold text-slate-800 leading-tight">{user.displayName || "Google User"}</p>
                                    <p className="text-[9.5px] text-slate-400 font-mono leading-tight">{user.email}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await signOut(auth);
                                      updateGoogleDriveToken(null, true);
                                      showSuccess("Google Account မှ ထွက်လိုက်ပါပြီ။");
                                    } catch (err: any) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/60 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                                >
                                  Sign Out
                                </button>
                              </div>

                              {!googleDriveAuthorized ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await signInWithPopup(auth, googleProvider);
                                      const credential = GoogleAuthProvider.credentialFromResult(res);
                                      if (credential?.accessToken) {
                                        updateGoogleDriveToken(credential.accessToken);
                                        showSuccess("Google Drive ချိတ်ဆက်မှု အောင်မြင်ပါသည်။");
                                      } else {
                                        throw new Error("Failed to get token.");
                                      }
                                    } catch (err: any) {
                                      console.error(err);
                                      alert("Google Drive သို့ ချိတ်ဆက်ခွင့်ပြုရန် ပျက်ကွက်ခဲ့ပါသည်။");
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] text-white font-bold py-2.5 px-3 rounded-lg text-[11px] shadow-xs cursor-pointer active:scale-[0.98] transition-all"
                                >
                                  <CloudLightning className="w-4 h-4" />
                                  Google Drive ခွင့်ပြုချက် ပေးမည် (Authorize Google Drive)
                                </button>
                              ) : !googleDriveToken ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await signInWithPopup(auth, googleProvider);
                                      const credential = GoogleAuthProvider.credentialFromResult(res);
                                      if (credential?.accessToken) {
                                        updateGoogleDriveToken(credential.accessToken);
                                        showSuccess("Google Drive ချိတ်ဆက်မှု အောင်မြင်စွာ အသစ်ပြန်ညှိပြီးပါပြီ။");
                                      } else {
                                        throw new Error("Failed to get token.");
                                      }
                                    } catch (err: any) {
                                      console.error(err);
                                      alert("ချိတ်ဆက်ခွင့်ဇယားကို ပြန်ညှိရန် ပျက်ကွက်ခဲ့ပါသည်။");
                                    }
                                  }}
                                  className="w-full py-1.5 px-3 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[9.5px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Google Drive ချိတ်ဆက်ခွင့်သက်တမ်း ပြန်လည်အသစ်ပြုပြင်မည် (Refresh Connection)
                                </button>
                              ) : null}

                              {googleDriveToken && (
                                <div className="space-y-2 pt-2.5 border-t border-dashed border-indigo-100">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        setIsSyncing(true);
                                        const q = "name = 'dictionary_sync_backup.json' and trashed = false";
                                        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent("files(id, name)")}`;
                                        const searchRes = await resilientFetch(searchUrl, {
                                          headers: { "Authorization": `Bearer ${googleDriveToken}` }
                                        });
                                        if (!searchRes.ok) {
                                          if (searchRes.status === 401) {
                                            updateGoogleDriveToken(null);
                                            throw new Error("Google Drive application session expired. Please re-authorize.");
                                          }
                                          throw new Error("Google Drive search failed");
                                        }
                                        const searchData = await searchRes.json();
                                        const files = searchData.files || [];
                                        if (files.length === 0) {
                                          alert("Google Drive ပေါ်တွင် Backup ဖိုင် မတွေ့သေးပါ။ စာလုံးတစ်လုံးအား Bookmark (သို့) Translate အရင်ပြုလုပ်ပေးပါ။ ဖိုင်သည် အလိုအလျောက် ရောက်ရှိသွားမည် ဖြစ်ပါသည်။");
                                          return;
                                        }
                                        const fileId = files[0].id;
                                        const getContentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
                                        const contentRes = await resilientFetch(getContentUrl, {
                                          headers: { "Authorization": `Bearer ${googleDriveToken}` }
                                        });
                                        if (!contentRes.ok) throw new Error("Download failed");
                                        const text = await contentRes.text();
                                        if (text && text.trim()) {
                                          const remoteData = JSON.parse(text);
                                          const remoteHistory = remoteData.history || [];
                                          if (remoteHistory.length === 0) {
                                            alert("Backup ဖိုင်တွင် သိမ်းဆည်းထားသော အချက်အလက်မရှိသေးပါ။");
                                            return;
                                          }
                                          // Force restore: Mark all items as active (isDeleted: false) and set fresh high timestamp so they win the conflict-free lww merge
                                          const restored = remoteHistory.map((item: any) => ({
                                            ...item,
                                            isDeleted: false,
                                            timestamp: Date.now()
                                          }));
                                          
                                          const merged = mergeHistory(history, restored);
                                          setHistory(merged);
                                          await saveHistoryToIndexedDB(merged);
                                          const numRestoredBk = restored.filter((i: any) => i.isBookmarked).length;
                                          const numRestoredHist = restored.filter((i: any) => !i.isBookmarked).length;
                                          showSuccess(`Google Drive Backup မှ စာမှတ် (Bookmark) ${numRestoredBk} ခုနှင့် သမိုင်းရှာဖွေမှုမှတ်တမ်း (History) ${numRestoredHist} ခုကို အောင်မြင်စွာ ပြန်လည် ဆွဲယူတင်သွင်းပြီးပါပြီ။`);
                                          
                                          // Push restored/resurrected state back to Google Drive right away
                                          await handleSaveToCloudDirectly(merged);
                                        } else {
                                          alert("Google Drive Backup ဖိုင်မှာ ဗလာဖြစ်နေပါသည်။");
                                        }
                                      } catch (err: any) {
                                        console.error(err);
                                        alert("Backup ဒေတာ ပြန်ဆွဲရန် ကြိုးစားမှု မအောင်မြင်ပါ။ အင်တာနက် ကွန်နက်ရှင် ပြန်စစ်ဆေးပေးပါ။");
                                      } finally {
                                        setIsSyncing(false);
                                      }
                                    }}
                                    disabled={isSyncing}
                                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-[1.01] text-white font-bold py-2 px-3 rounded-lg text-[10px] shadow-xs cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
                                  >
                                    <DownloadCloud className="w-3.5 h-3.5" />
                                    Drive Backup မှ ရှာဖွေမှုမှတ်တမ်းအားလုံး ပြန်ယူရန် (Restore from Backup)
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 py-1">
                              <p className="text-[10.5px] text-slate-555 leading-relaxed font-normal">
                                Google အကောင့်ဖြင့် Sign In တစ်ကြိမ်ဝင်ကာ 'drive.file' စင့်ခ်အား ခွင့်ပြုလိုက်ပါက သင့်ကိုယ်ပိုင် Google Drive ပေါ်၌ ၁၀၀% လုံခြုံစိတ်ချစွာ အခမဲ့ သိမ်းဆည်းပေးသွားမည် ဖြစ်ပါသည်။
                              </p>
                              <button
                                type="button"
                                onClick={async () => {
                                    try {
                                      const res = await signInWithPopup(auth, googleProvider);
                                      if (res.user) {
                                        const credential = GoogleAuthProvider.credentialFromResult(res);
                                        if (credential?.accessToken) {
                                          updateGoogleDriveToken(credential.accessToken);
                                        }
                                        showSuccess(`မင်္ဂလာပါ ${res.user.displayName || "လူကြီးမင်း"}။ Google နှင့် Google Drive ချိတ်ဆက်မှု အောင်မြင်စွာ ပြုလုပ်ပြီးပါပြီ။`);
                                      }
                                    } catch (err: any) {
                                      console.error(err);
                                      if (err.code !== "auth/popup-closed-by-user") {
                                        alert("Login ဝင်ရောက်ရန် မအောင်မြင်ပါ။ ဘရောက်ဆာ popup ပိတ်ထားခြင်း ရှိမရှိ စစ်ဆေးပေးပါ။");
                                      }
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-3 rounded-lg text-[11px] shadow-xs cursor-pointer active:scale-[0.98] transition-all"
                              >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
                                </svg>
                                Google Account ဖြင့် Sign In ဝင်မည်
                              </button>
                            </div>
                          )}
                        </div>

                        {(customApiKey.trim() || user) && (
                          <div className="space-y-2.5 border-t border-slate-100 pt-3 text-sans">
                            <div className="flex items-center justify-between text-[11px] text-slate-550">
                              <span className="flex items-center gap-1.5 font-medium">
                                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? "animate-spin" : ""}`} />
                                Sync အခြေအနေ:
                              </span>
                              <span className="font-semibold text-indigo-700">
                                {syncStatus === "syncing" && "စင့်ခ်လုပ်နေပါသည်..."}
                                {syncStatus === "synced" && "Cloud ပေါ်ရှိ ဒေတာများနှင့် တိုက်ဆိုင်ပြီးစီးပါပြီ"}
                                {syncStatus === "unauthorized" && "Google Drive သို့ ခွင့်ပြုချက် (Authorize) လိုအပ်ပါသည်။"}
                                {syncStatus === "error" && "ဒေတာချိတ်ဆက်ရန် အခက်အခဲရှိနေပါသည်"}
                                {syncStatus === "not_configured" && "မစတင်ရသေးပါ"}
                              </span>
                            </div>

                            {lastSyncedTime && (
                              <div className="flex items-center justify-between text-[11px] text-slate-555 font-sans">
                                <span className="font-medium">နောက်ဆုံးစင့်ခ်လုပ်ချိန်:</span>
                                <span className="font-mono font-semibold text-slate-700">{lastSyncedTime}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={isSyncing}
                              onClick={async () => {
                                if (googleDriveAuthorized && auth.currentUser) {
                                  await ensureValidDriveToken(false);
                                }
                                handleSyncWithCloud();
                              }}
                              className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] font-sans text-center"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                              {isSyncing ? "ဒေတာများ ဆွဲယူနေပါသည်..." : "ဒေတာကို ချက်ချင်း စင့်ခ်လုပ်ရန် (Pull & Sync Now)"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Local File Backup & Restore (User Request) */}
                      <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl space-y-3 shadow-3xs mt-4">
                        <div className="flex items-center justify-between animate-fade-in font-sans">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            ဒေတာများ ဖိုင်အဖြစ် ထုတ်ယူခြင်းနှင့် ပြန်သွင်းခြင်း (Local Backup & Restore)
                          </h4>
                        </div>

                        <p className="text-[10.5px] text-slate-555 leading-relaxed font-sans">
                          သင့်ရဲ့ စာမှတ်များ (Bookmarks) နှင့် ရှာဖွေမှုမှတ်တမ်း (History) များ စက်ထဲမှ အကြောင်းအမျိုးမျိုးကြောင့် ပျောက်ပျက်သွားပါက ပြန်လည်အသုံးပြုနိုင်ရန် ဖုန်း သို့မဟုတ် ကွန်ပျူတာ၏ File Manager ထဲသို့ <b>ဒေတာ backup ဖိုင် (.json)</b> ထုတ်ယူသိမ်းဆည်းထားနိုင်ပြီး လိုအပ်လျှင် ပြန်တင်သွင်းယူနိုင်ပါသည်။
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-1 font-sans">
                          <button
                            type="button"
                            onClick={handleExportDataFile}
                            className="flex items-center justify-center gap-1.5 text-[11px] font-bold bg-white text-indigo-700 border border-slate-200 py-2.5 px-3 rounded-lg shadow-3xs hover:bg-slate-50/50 cursor-pointer active:scale-95 transition-all text-center font-sans"
                            title="စာမှတ်နှင့် မှတ်တမ်းများကို ဖိုင်အဖြစ် ဒေါင်းလုဒ်ဆွဲပါမည်"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Backup ဖိုင် သိမ်းရန် (Export)</span>
                          </button>

                          <input
                            type="file"
                            ref={backupInputRef}
                            accept=".json"
                            onChange={handleImportDataFile}
                            className="hidden font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => backupInputRef.current?.click()}
                            className="flex items-center justify-center gap-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-lg shadow-3xs cursor-pointer active:scale-95 transition-all text-center font-sans"
                            title="သိမ်းဆည်းထားသော ဖိုင်မှ စာမှတ်များနှင့် မှတ်တမ်းများကို ပြန်လည် ဖတ်သွင်းပါမည်"
                          >
                            <Upload className="w-3.5 h-3.5 text-white shrink-0" />
                            <span>Backup ပြန်သွင်းရန် (Import)</span>
                          </button>
                        </div>
                      </div>

                      {/* Full Wipe & Reset System (User Request) */}
                      <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl space-y-3 shadow-3xs mt-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-rose-850 flex items-center gap-1.5 uppercase tracking-wide">
                            <Trash2 className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                            ဒေတာအားလုံးနှင့် Cloud Backups များကို အပြီးတိုင်ဖျက်သိမ်းခြင်း (Full System Clean Reset)
                          </h4>
                        </div>
                        <p className="text-[10.5px] text-slate-555 leading-relaxed font-sans">
                          သင့်စက်ရှိ မှတ်တမ်း၊ စာမှတ် (Bookmarks) အားလုံးအပြင် <b>Google Drive backup ဖိုင်နှင့် ဆာဗာ Cloud Sync ဒေတာ</b> များအားလုံးကို လုံးဝအပြီးအပိုင် (၁၀၀% အပြောင်) တိုက်ဖျက်ရှင်းလင်းပစ်ပြီး အက်ပ်ကို အသစ်စက်စက်အနေအထားအတိုင်း ပြန်လည်စတင်အသုံးပြုနိုင်ရန် ဖန်တီးပေးပါမည်။ <span className="text-rose-600 font-bold">(သတိပြုရန်: ပြန်လည်ရယူ၍ မရနိုင်တော့ပါ။)</span>
                        </p>
                        <button
                          type="button"
                          disabled={isWiping}
                          onClick={handleWipeAllDataAndCloud}
                          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-2.5 px-3 rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all text-center font-sans"
                          title="ဤစက်တွင်းဒေတာများနှင့် Cloud ပေါ်ရှိ Backup များကိုပါ တစ်ပါတည်း ရှင်းလင်းဖျက်ဆီးပါမည်"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white shrink-0" />
                          <span>{isWiping ? "ရှင်းလင်းနေပါသည်..." : "ဒေတာအားလုံး အပြီးအပိုင် ရှင်းလင်းမည် (Full Wipe & Fresh Start)"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeRightTab === "notes" && (
                    <motion.div
                      key="notes-tab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 font-sans animate-fade-in"
                    >
                      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-755 flex items-center gap-1.5 font-sans">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          ကိုယ်ပိုင်လေ့လာမှု မှတ်စုများ (Personal Study Notes)
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNote(null);
                            setNewNoteTitle("");
                            setNewNoteContent("");
                            setShowAddNoteForm(!showAddNoteForm);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          {showAddNoteForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {showAddNoteForm ? "ပိတ်ရန်" : "မှတ်စုအသစ် ရေးရန်"}
                        </button>
                      </div>

                      {/* Add/Edit Note Form */}
                      {showAddNoteForm && (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-3xs animate-fade-in">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            {editingNote ? "မှတ်စုပြင်ဆင်ရန်" : "မှတ်စုအသစ် ထည့်သွင်းရန်"}
                          </h4>
                          <div>
                            <input
                              type="text"
                              value={newNoteTitle}
                              onChange={(e) => setNewNoteTitle(e.target.value)}
                              placeholder="မှတ်စုခေါင်းစဉ် ရေးရန် (ဥပမာ- Unit 1 Words)"
                              className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                          </div>
                          <div>
                            <textarea
                              rows={5}
                              value={newNoteContent}
                              onChange={(e) => setNewNoteContent(e.target.value)}
                              placeholder="မှတ်စု အသေးစိတ် အချက်အလက်များ သို့မဟုတ် သင်ခန်းစာများ ရေးသားရန်..."
                              className="w-full text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white resize-y"
                            />
                          </div>
                          <div className="flex gap-2 justify-end font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddNoteForm(false);
                                setEditingNote(null);
                                setNewNoteTitle("");
                                setNewNoteContent("");
                              }}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer transition-all"
                            >
                              မလုပ်တော့ပါ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!newNoteContent.trim()) {
                                  showError("ကျေးဇူးပြု၍ မှတ်စုအကြောင်းအရာ ဖြည့်ပါဦး!");
                                  return;
                                }
                                if (editingNote) {
                                  // Update
                                  setStudyNotes(prev => prev.map(note => note.id === editingNote.id ? {
                                    ...note,
                                    title: newNoteTitle.trim() || `Untitled Note`,
                                    content: newNoteContent,
                                    timestamp: Date.now()
                                  } : note));
                                  showSuccess("မှတ်စုကို ပြင်ဆင်သိမ်းဆည်းလိုက်ပါပြီ။");
                                } else {
                                  // Add new
                                  const newNote: StudyNote = {
                                    id: "note_" + Date.now().toString(36),
                                    title: newNoteTitle.trim() || `လေ့လာမှု မှတ်စု (${new Date().toLocaleDateString()})`,
                                    content: newNoteContent,
                                    timestamp: Date.now()
                                  };
                                  setStudyNotes(prev => [newNote, ...prev]);
                                  showSuccess("မှတ်စုအသစ်ကို အောင်မြင်စွာ သိမ်းဆည်းလိုက်ပါပြီ။");
                                }
                                setShowAddNoteForm(false);
                                setEditingNote(null);
                                setNewNoteTitle("");
                                setNewNoteContent("");
                              }}
                              className="px-3 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-all"
                            >
                              သိမ်းဆည်းမည်
                            </button>
                          </div>
                        </div>
                      )}
























                      {/* Notes Filter Search or Dropdown Selector */}
                      {!showAddNoteForm && studyNotes.length > 0 && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider block">
                              ဖတ်ရှုပြင်ဆင်ရန် မှတ်စုကို ရွေးပါ (Choose Study Note)
                            </label>
                            <select
                              value={selectedNoteId || (studyNotes.length > 0 ? studyNotes[0].id : "")}
                              onChange={(e) => setSelectedNoteId(e.target.value)}
                              className="w-full text-xs font-bold px-3 py-2.5 bg-white border border-slate-205 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-3xs cursor-pointer text-slate-705"
                            >
                              {studyNotes.map((note) => (
                                <option key={note.id} value={note.id}>
                                  📝 {note.title.slice(0, 45)}{note.title.length > 45 ? "..." : ""} ({new Date(note.timestamp).toLocaleDateString()})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Selected Note Display details card */}
                      {!showAddNoteForm && (
                        <div className="space-y-3">
                          {(() => {
                            const activeNote = studyNotes.find(n => n.id === (selectedNoteId || (studyNotes.length > 0 ? studyNotes[0].id : "")));
                            if (activeNote) {
                              return (
                                <div className="p-4 bg-white border border-slate-250 rounded-xl hover:border-emerald-100 hover:shadow-2xs transition-all space-y-3 relative overflow-hidden">
                                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-2">
                                    <div className="space-y-0.5">
                                      <h4 className="text-xs font-extrabold text-slate-800 leading-snug">
                                        {activeNote.title}
                                      </h4>
                                      <p className="text-[9px] font-mono text-slate-400">
                                        {new Date(activeNote.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingNote(activeNote);
                                          setNewNoteTitle(activeNote.title);
                                          setNewNoteContent(activeNote.content);
                                          setShowAddNoteForm(true);
                                        }}
                                        className="text-slate-400 hover:text-indigo-650 p-1.5 rounded-md hover:bg-slate-50 cursor-pointer transition-all"
                                        title="မှတ်စုပြင်ရန်"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm("ဤမှတ်စုကို ဖျက်ပစ်ရန် သေချာပါသလား?")) {
                                            const updated = studyNotes.filter(x => x.id !== activeNote.id);
                                            setStudyNotes(updated);
                                            setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
                                            showSuccess("မှတ်စုကို ဖျက်လိုက်ပါပြီ။");
                                          }
                                        }}
                                        className="text-slate-400 hover:text-rose-650 p-1.5 rounded-md hover:bg-slate-50 cursor-pointer transition-all"
                                        title="မှတ်စုဖျက်ရန်"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-655 leading-relaxed whitespace-pre-wrap font-sans break-words bg-slate-50 p-3 rounded-lg border border-slate-100/80 max-h-[400px] overflow-y-auto">
                                    {activeNote.content}
                                  </p>
                                </div>
                              );
                            } else {
                              return (
                                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                  <FileText className="w-8 h-8 mx-auto stroke-1 text-slate-350 mb-1" />
                                  <p className="text-xs font-semibold text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                                    ကိုယ်ပိုင်မှတ်စုများ မရှိသေးပါ။ ဘာသာပြန်ချက်များ (သို့) အင်္ဂလိပ်စာလုံးများကို မှတ်စုအဖြစ် အလွယ်တကူ သိမ်းဆည်းနိုင်ပါသည်ဗျာ။
                                  </p>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </motion.div>
                  )}</AnimatePresence>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Dynamic Floating Quick Note-Pad */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        <AnimatePresence>
          {isFloatingNotesOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-250 rounded-2xl shadow-2xl w-80 sm:w-96 p-4 mb-3 overflow-hidden text-left relative flex flex-col gap-3"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-sm font-extrabold text-slate-850 uppercase tracking-wide">
                    Quick Study Pad (မှတ်စုစာအုပ်)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsFloatingNotesOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selector / Creator dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Choose or Create Note (မှတ်စု ရွေးရန်/အသစ်လုပ်ရန်)</label>
                <select
                  value={floatingNoteId}
                  onChange={(e) => setFloatingNoteId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="new">🆕 [+ Create New Note / မှတ်စုအသစ်ပြုလုပ်ရန်]</option>
                  {studyNotes.map(n => (
                    <option key={n.id} value={n.id}>
                      📝 {n.title.length > 28 ? n.title.slice(0, 28) + "..." : n.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input if new */}
              {floatingNoteId === "new" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Title (ခေါင်းစဉ်)</label>
                  <input
                    type="text"
                    value={floatingNoteTitle}
                    onChange={(e) => setFloatingNoteTitle(e.target.value)}
                    placeholder="မှတ်စုခေါင်းစဉ် ရေးပါ (ဥပမာ- Unit 2 Phrasal Verbs)"
                    className="w-full text-xs font-bold border border-slate-205 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 bg-white focus:outline-hidden"
                  />
                </div>
              )}

              {/* Text Area Content */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Note Content (မှတ်ချက် အဖုံးစာသား)</label>
                <textarea
                  rows={6}
                  value={floatingNoteContent}
                  onChange={(e) => {
                    setFloatingNoteContent(e.target.value);
                    if (floatingNoteId !== "new") {
                      setStudyNotes(prev => prev.map(note => note.id === floatingNoteId ? {
                        ...note,
                        content: e.target.value,
                        timestamp: Date.now()
                      } : note));
                    }
                  }}
                  placeholder="စာဖတ်နေရင်း သင်ယူရရှိသော စာလုံးနှင့် စကားစုများကို တခါတည်း ဤနေရာတွင် ရိုက်မှတ်နိုင်ပါသည်ဗျာ..."
                  className="w-full text-xs font-medium border border-slate-205 rounded-lg p-2.5 bg-slate-50/15 focus:bg-white transition-colors focus:ring-1 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Smart Insert Action Handles */}
              <div className="flex gap-1.5 items-center justify-between border-t border-slate-100 pt-2.5 font-sans">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleAppendCurrentTranslation}
                    className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg py-1 px-2.5 transition-all cursor-pointer flex items-center gap-1"
                    title="ယခုဘာသာပြန်ချက်အား မှတ်စုထဲသို့ တခါတည်းပေါင်းထည့်မည်"
                  >
                    <Plus className="w-3 h-3 text-indigo-600" />
                    ဆေးချက်ထည့်မည်
                  </button>
                  <button
                    type="button"
                    onClick={handleAppendSelectedVocabulary}
                    className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg py-1 px-2.5 transition-all cursor-pointer flex items-center gap-1"
                    title="ဝေါဟာရ tab တွင် ရွေးချယ်ထားသော စကားလုံးနှင့် အဓိပ္ပါယ်ကို ပေါင်းထည့်မည်"
                  >
                    <Plus className="w-3 h-3 text-sky-600" />
                    စကားလုံးထည့်မည်
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveFloatingNote}
                  className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow-xs rounded-lg py-1.5 px-3 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  {floatingNoteId === "new" ? "မှတ်စုသိမ်းမည်" : "ပြင်ဆင်ချက်သိမ်းမည်"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger button with animation and label */}
        <button
          type="button"
          onClick={() => setIsFloatingNotesOpen(!isFloatingNotesOpen)}
          className="bg-emerald-600 text-white rounded-full p-4 hover:bg-emerald-700 hover:scale-105 shadow-2xl relative cursor-pointer group transition-all duration-300 flex items-center justify-center border-2 border-white/20 select-none"
          title="ကိုယ်ပိုင်မှတ်စုစာအုပ် ဖွင့်ရန်"
        >
          {isFloatingNotesOpen ? <X className="w-6 h-6 rotate-180 transition-transform duration-300" /> : <Edit3 className="w-6 h-6 transition-transform duration-300 text-white" />}
          
          <span className="absolute right-full mr-3.5 bg-slate-900/95 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 border border-white/5 font-sans">
             စခရင်ပေါ်တွင် မှတ်စုရေးရန် Click နှိပ်ပါ
          </span>
          
          {/* Notification blue pulse light */}
          {!isFloatingNotesOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 border-2 border-white"></span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Global Text Selection Add-to-Notebook copy button */}
      <AnimatePresence>
        {selectionCoords && selectedText && (
          <div
            className="selection-copy-btn absolute z-[100] pointer-events-auto shadow-2xl transition-all"
            style={{
              left: `${selectionCoords.x}px`,
              top: `${selectionCoords.y}px`,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAutoCollectSelectedText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-black shadow-2xl border border-indigo-400/40 whitespace-nowrap cursor-pointer select-none transition-all"
              title="ရွေးချယ်ထားသော စာသားကို Copy ကူးပြီး သင်၏ကိုယ်ပိုင်မှတ်စုထဲသို့ အလိုအလျောက် ပေါင်းထည့်မည်"
            >
              <Copy className="w-4 h-4 text-indigo-200" />
              <span>Copy (မှတ်စုသို့လွှဲမည်)</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20 py-10 transition-colors">
        <div className="max-w-full mx-auto px-4 md:px-8 text-center">
          <p className="text-base md:text-lg font-semibold leading-relaxed text-slate-100">
            အင်္ဂလိပ် (သို့) မြန်မာစာကြောင်းတွေကို ဘာသာပြန်ပြီး စာပိုဒ်ထဲမှ ဝါစင်္ဂတွေကို Eng-Mya dictionary မှ Auto ရှာဖွေ၍ ဖော်ပြပေးပါသည်။
          </p>
          <p className="text-sm text-slate-400 mt-3 font-medium">
            Created by Ko Soe (Dawei)
          </p>
        </div>
      </footer>
    </div>
  );
}
