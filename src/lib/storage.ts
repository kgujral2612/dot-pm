import { AppState } from '@/types';

const STORAGE_KEY = 'dotpm-state';

export function getDefaultState(): AppState {
  return {
    cards: [],
    todos: [],
    note: {
      id: 'scratchpad',
      content: '',
      updatedAt: Date.now(),
    },
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return JSON.parse(raw) as AppState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}
