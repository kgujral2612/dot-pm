'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard, KanbanStatus } from '@/types';
import { Card } from './card';
import { AddCard } from './add-card';

const COLUMN_LABELS: Record<KanbanStatus, string> = {
  todo: 'todo',
  'in-progress': 'in progress',
  complete: 'done',
};

export function Column({
  status,
  cards,
}: {
  status: KanbanStatus;
  cards: KanbanCard[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 px-2">
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted">
          {COLUMN_LABELS[status]}
        </span>
        <span className="text-[10px] text-muted">{cards.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-sm p-2 pt-0 transition-colors duration-150 ${
          isOver ? 'bg-accent-dim' : ''
        }`}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <span className="py-8 text-center text-[11px] text-muted">no tasks yet</span>
        )}
        {status === 'todo' && <AddCard />}
      </div>
    </div>
  );
}
