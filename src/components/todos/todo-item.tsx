'use client';

import { useCallback } from 'react';
import { TodoItem as TodoItemType } from '@/types';
import { useAppDispatch } from '@/hooks/use-app-state';

export function TodoItem({ todo }: { todo: TodoItemType }) {
  const { toggleTodo, deleteTodo } = useAppDispatch();

  const handleToggle = useCallback(() => toggleTodo(todo.id), [todo.id, toggleTodo]);
  const handleDelete = useCallback(() => deleteTodo(todo.id), [todo.id, deleteTodo]);

  return (
    <div className="group flex items-start gap-2 rounded border border-transparent px-1 py-1 transition-colors duration-150 hover:border-border">
      <button
        onClick={handleToggle}
        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ${
          todo.done
            ? 'border-accent bg-accent'
            : 'border-border-hover bg-transparent hover:border-accent'
        }`}
      >
        {todo.done && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3.5 6L6.5 2" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 leading-snug ${
          todo.done ? 'text-muted line-through' : 'text-primary'
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={handleDelete}
        className="shrink-0 text-transparent transition-colors duration-150 group-hover:text-muted hover:!text-primary"
      >
        ×
      </button>
    </div>
  );
}
