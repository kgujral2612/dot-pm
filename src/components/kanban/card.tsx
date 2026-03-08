'use client';

import { useCallback } from 'react';
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
  const { deleteCard } = useAppDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
