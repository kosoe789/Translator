export interface DictionaryEntry {
  word: string;
  definition: string;
}

export interface WorkspaceFile {
  filename: string;
  size: number;
  mtime: string;
}

export interface AnalyzedWord {
  original: string;
  base: string;
  pos: string;
  fallback_my: string;
}

export interface TranslateResponse {
  translation: string;
  words: AnalyzedWord[];
}

export interface HistoryItem {
  id: string;
  originalText: string;
  translation: string;
  timestamp: number;
  isBookmarked?: boolean;
  isDeleted?: boolean;
  words: {
    original: string;
    base: string;
    pos: string;
    fallback_my: string;
    dictionary_definition?: string | null;
  }[];
}

export interface BookmarkedWord {
  id: string;
  original: string;
  base: string;
  pos: string;
  definition: string;
  timestamp: number;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

