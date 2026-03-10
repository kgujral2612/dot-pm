'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard } from '@/types';
import { useAppDispatch } from '@/hooks/use-app-state';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Card({ card, isOverlay }: { card: KanbanCard; isOverlay?: boolean }) {
  const { deleteCard, updateCard } = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const titleRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    rotate: isOverlay ? '2deg' : undefined,
  };

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteCard(card.id);
    },
    [card.id, deleteCard]
  );

  const saveEdit = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      updateCard(card.id, trimmed, editDescription.trim() || undefined);
    }
    setIsEditing(false);
  }, [card.id, editTitle, editDescription, updateCard]);

  const cancelEdit = useCallback(() => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  }, [card.title, card.description]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelEdit();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveEdit();
      }
    },
    [cancelEdit, saveEdit]
  );

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        saveEdit();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, saveEdit]);

  if (isEditing) {
    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        style={style}
        className="rounded border border-accent bg-card p-3 shadow-sm"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          ref={titleRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-none bg-transparent font-medium leading-snug text-primary outline-none placeholder:text-muted"
          placeholder="Title"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="mt-1 w-full resize-none border-none bg-transparent text-[11px] leading-relaxed text-secondary outline-none placeholder:text-muted"
          placeholder="Description (optional)"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={saveEdit}
            className="rounded-sm px-2 py-0.5 text-[10px] text-accent hover:text-primary transition-colors duration-150"
          >
            save
          </button>
          <button
            onClick={cancelEdit}
            className="rounded-sm px-2 py-0.5 text-[10px] text-muted hover:text-primary transition-colors duration-150"
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={handleDoubleClick}
      className="group cursor-grab rounded border border-border bg-card p-3 shadow-sm transition-colors duration-150 hover:border-border-hover active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium leading-snug text-primary">{card.title}</span>
        <button
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0 text-transparent transition-colors duration-150 group-hover:text-muted hover:!text-primary"
        >
          ×
        </button>
      </div>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-secondary">
          {card.description}
        </p>
      )}
      <span className="mt-2 block text-[10px] text-muted">{timeAgo(card.updatedAt)}</span>
    </div>
  );
}

export function CardOverlay({ card }: { card: KanbanCard }) {
  return (
    <div className="cursor-grabbing rounded border border-accent bg-card p-3 shadow-md" style={{ rotate: '2deg' }}>
      <span className="font-medium leading-snug text-primary">{card.title}</span>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-secondary">
          {card.description}
        </p>
      )}
    </div>
  );
}
