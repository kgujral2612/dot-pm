'use client';

import { AppProvider, useAppState } from '@/hooks/use-app-state';
import { KanbanBoard } from '@/components/kanban/board';

import { NotePanel } from '@/components/notes/note-panel';

function Dashboard() {
  const { mounted } = useAppState();

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-page">
        <span className="text-muted text-xs tracking-wide uppercase">loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-page">
      <header className="flex h-10 shrink-0 items-center border-b border-border px-4">
        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-secondary">
          dotpm
        </span>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
        <div className="w-[300px] shrink-0 border-l border-border">
          <NotePanel />
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
