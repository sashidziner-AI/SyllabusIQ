import type { GeneratedMCQ } from './questionGenService';

export interface HistoryEntry {
  id: string;
  projectId?: number;
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

function generateDocLabel(docNames: string[], projectId?: number): string {
  const all = getAll().filter((e) => e.projectId === projectId);
  const baseName = docNames[0]?.replace(/\.[^/.]+$/, '') || 'Document';

  let maxNum = 0;
  for (const entry of all) {
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
  getAll(projectId?: number): HistoryEntry[] {
    const entries = getAll();
    const filtered = projectId !== undefined
      ? entries.filter((e) => e.projectId === projectId)
      : entries;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  save(docNames: string[], questions: GeneratedMCQ[], hasNos: boolean, projectId?: number): HistoryEntry {
    const entries = getAll();
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      projectId,
      documentName: generateDocLabel(docNames, projectId),
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
