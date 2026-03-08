export type KanbanStatus = 'todo' | 'in-progress' | 'complete';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  content: string;
  updatedAt: number;
}

export interface AppState {
  cards: KanbanCard[];
  todos: TodoItem[];
  note: Note;
}
