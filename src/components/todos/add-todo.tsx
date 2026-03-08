'use client';

import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/hooks/use-app-state';

export function AddTodo() {
  const [text, setText] = useState('');
  const { addTodo } = useAppDispatch();

  const handleSubmit = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && text.trim()) {
        addTodo(text.trim());
        setText('');
      }
    },
    [text, addTodo]
  );

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleSubmit}
      placeholder="add todo..."
      className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-primary placeholder:text-muted"
    />
  );
}
