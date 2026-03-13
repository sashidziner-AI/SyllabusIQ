import type { GeneratedMCQ } from './questionGenService';

export interface HistoryEntry {
  id: string;
  documentName: string;
  documentNames: string[];
  questionCount: number;
  hasNos: boolean;
  questions: GeneratedMCQ[];
  createdAt: string;
}

const STORAGE_KEY = 'syllabus-iq-history';

function getAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function generateDocLabel(docNames: string[]): string {
  const entries = getAll();
  // Use the first document name, strip extension
  const baseName = docNames[0]?.replace(/\.[^/.]+$/, '') || 'Document';

  // Find the highest existing number for this base name
  let maxNum = 0;
  for (const entry of entries) {
    const match = entry.documentName.match(new RegExp(`^${escapeRegex(baseName)}_(\\d+)$`));
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
  }

  return `${baseName}_${maxNum + 1}`;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const historyService = {
  getAll(): HistoryEntry[] {
    return getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  save(docNames: string[], questions: GeneratedMCQ[], hasNos: boolean): HistoryEntry {
    const entries = getAll();
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      documentName: generateDocLabel(docNames),
      documentNames: docNames,
      questionCount: questions.length,
      hasNos,
      questions,
      createdAt: new Date().toISOString(),
    };
    entries.push(entry);
    saveAll(entries);
    return entry;
  },

  getById(id: string): HistoryEntry | undefined {
    return getAll().find((e) => e.id === id);
  },

  delete(id: string): void {
    const entries = getAll().filter((e) => e.id !== id);
    saveAll(entries);
  },
};
