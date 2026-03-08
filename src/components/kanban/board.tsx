'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanStatus, KanbanCard } from '@/types';
import { useAppState, useAppDispatch } from '@/hooks/use-app-state';
import { Column } from './column';
import { CardOverlay } from './card';

const STATUSES: KanbanStatus[] = ['todo', 'in-progress', 'complete'];

export function KanbanBoard() {
  const { state } = useAppState();
  const { moveCard, reorderCards } = useAppDispatch();
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getColumnCards = useCallback(
    (status: KanbanStatus) =>
      state.cards.filter((c) => c.status === status),
    [state.cards]
  );

  const findCardColumn = useCallback(
    (cardId: string): KanbanStatus | null => {
      const card = state.cards.find((c) => c.id === cardId);
      return card ? card.status : null;
    },
    [state.cards]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const card = state.cards.find((c) => c.id === event.active.id);
      if (card) setActiveCard(card);
    },
    [state.cards]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = findCardColumn(activeId);
      // over could be a column id or a card id
      const overColumn = STATUSES.includes(overId as KanbanStatus)
        ? (overId as KanbanStatus)
        : findCardColumn(overId);

      if (activeColumn && overColumn && activeColumn !== overColumn) {
        moveCard(activeId, overColumn);
      }
    },
    [findCardColumn, moveCard]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);

      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = findCardColumn(activeId);
      const overIsColumn = STATUSES.includes(overId as KanbanStatus);

      if (overIsColumn) {
        // dropped on column — already moved in dragOver
        return;
      }

      const overColumn = findCardColumn(overId);
      if (!activeColumn || !overColumn) return;

      if (activeColumn === overColumn) {
        // reorder within same column
        const columnCards = getColumnCards(activeColumn);
        const oldIndex = columnCards.findIndex((c) => c.id === activeId);
        const newIndex = columnCards.findIndex((c) => c.id === overId);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(columnCards, oldIndex, newIndex);
          const otherCards = state.cards.filter((c) => c.status !== activeColumn);
          reorderCards([...otherCards, ...reordered]);
        }
      }
    },
    [findCardColumn, getColumnCards, state.cards, reorderCards]
  );

  return (
    <div className="flex h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {STATUSES.map((status) => (
          <div
            key={status}
            className={`flex-1 ${status !== 'complete' ? 'border-r border-border' : ''}`}
          >
            <Column status={status} cards={getColumnCards(status)} />
          </div>
        ))}
        <DragOverlay>
          {activeCard ? <CardOverlay card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
