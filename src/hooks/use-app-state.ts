'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { AppState, KanbanCard, KanbanStatus, TodoItem } from '@/types';
import { getDefaultState, loadState, saveState } from '@/lib/storage';
import React from 'react';

type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'ADD_CARD'; title: string; description?: string }
  | { type: 'MOVE_CARD'; id: string; status: KanbanStatus }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'REORDER_CARDS'; cards: KanbanCard[] }
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'UPDATE_CARD'; id: string; title: string; description?: string }
  | { type: 'UPDATE_NOTE'; content: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'ADD_CARD': {
      const now = Date.now();
      const card: KanbanCard = {
        id: `card-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: action.title,
        description: action.description,
        status: 'todo',
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, cards: [...state.cards, card] };
    }

    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.id
            ? { ...c, status: action.status, updatedAt: Date.now() }
            : c
        ),
      };

    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.id),
      };

    case 'REORDER_CARDS':
      return { ...state, cards: action.cards };

    case 'ADD_TODO': {
      const todo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.text,
        done: false,
        createdAt: Date.now(),
      };
      return { ...state, todos: [...state.todos, todo] };
    }

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
      };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.id
            ? { ...c, title: action.title, description: action.description, updatedAt: Date.now() }
            : c
        ),
      };

    case 'UPDATE_NOTE':
      return {
        ...state,
        note: { ...state.note, content: action.content, updatedAt: Date.now() },
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  mounted: boolean;
}

const AppContext = createContext<AppContextValue>({
  state: getDefaultState(),
  dispatch: () => {},
  mounted: false,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getDefaultState());
  const [mounted, setMounted] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const saved = loadState();
    dispatch({ type: 'HYDRATE', state: saved });
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveState(state), 300);
    return () => clearTimeout(saveTimeout.current);
  }, [state, mounted]);

  return React.createElement(
    AppContext.Provider,
    { value: { state, dispatch, mounted } },
    children
  );
}

export function useAppState() {
  return useContext(AppContext);
}

export function useAppDispatch() {
  const { dispatch } = useContext(AppContext);

  const addCard = useCallback(
    (title: string, description?: string) =>
      dispatch({ type: 'ADD_CARD', title, description }),
    [dispatch]
  );

  const moveCard = useCallback(
    (id: string, status: KanbanStatus) =>
      dispatch({ type: 'MOVE_CARD', id, status }),
    [dispatch]
  );

  const deleteCard = useCallback(
    (id: string) => dispatch({ type: 'DELETE_CARD', id }),
    [dispatch]
  );

  const reorderCards = useCallback(
    (cards: KanbanCard[]) => dispatch({ type: 'REORDER_CARDS', cards }),
    [dispatch]
  );

  const addTodo = useCallback(
    (text: string) => dispatch({ type: 'ADD_TODO', text }),
    [dispatch]
  );

  const toggleTodo = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_TODO', id }),
    [dispatch]
  );

  const deleteTodo = useCallback(
    (id: string) => dispatch({ type: 'DELETE_TODO', id }),
    [dispatch]
  );

  const updateCard = useCallback(
    (id: string, title: string, description?: string) =>
      dispatch({ type: 'UPDATE_CARD', id, title, description }),
    [dispatch]
  );

  const updateNote = useCallback(
    (content: string) => dispatch({ type: 'UPDATE_NOTE', content }),
    [dispatch]
  );

  return {
    addCard,
    moveCard,
    deleteCard,
    updateCard,
    reorderCards,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateNote,
  };
}
