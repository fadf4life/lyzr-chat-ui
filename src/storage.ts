// localStorage persistence for sessions and settings.

import type { Session, Settings } from './types';

const STORAGE_KEY = 'genai-mentor:data:v1';

export interface PersistedState {
  sessions: Session[];
  settings: Settings;
  firstUsedAt: number; // epoch milliseconds
}

const DEFAULT_SETTINGS: Settings = { theme: 'dark', fontScale: 'comfortable' };

export function defaultState(): PersistedState {
  return {
    sessions: [],
    settings: { ...DEFAULT_SETTINGS },
    firstUsedAt: Date.now(),
  };
}

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      firstUsedAt: typeof parsed.firstUsedAt === 'number' ? parsed.firstUsedAt : Date.now(),
    };
  } catch {
    // Corrupted storage — start fresh rather than crashing.
    return defaultState();
  }
}

export function persist(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — the app keeps working in memory only.
  }
}

export function clearPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
