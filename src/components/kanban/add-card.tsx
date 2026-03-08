'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/hooks/use-app-state';

export function AddCard() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { addCard } = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (title.trim()) {
      addCard(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setOpen(false);
    }
  }, [title, description, addCard]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setTitle('');
        setDescription('');
        setOpen(false);
      }
    },
    [handleSubmit]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded border border-dashed border-border px-3 py-1.5 text-left text-muted transition-colors duration-150 hover:border-border-hover hover:text-secondary"
      >
        + add card
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded border border-border bg-card p-2">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="title"
        className="w-full rounded-sm border border-border bg-page px-2 py-1 text-primary placeholder:text-muted"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="description (optional)"
        className="w-full rounded-sm border border-border bg-page px-2 py-1 text-primary placeholder:text-muted"
      />
      <div className="flex gap-1.5">
        <button
          onClick={handleSubmit}
          className="rounded-sm bg-accent px-2.5 py-0.5 text-[11px] font-medium text-page transition-opacity hover:opacity-90"
        >
          add
        </button>
        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setOpen(false);
          }}
          className="rounded-sm px-2.5 py-0.5 text-[11px] text-muted transition-colors hover:text-secondary"
        >
          cancel
        </button>
      </div>
    </div>
  );
}
