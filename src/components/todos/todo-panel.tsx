'use client';

import { useAppState } from '@/hooks/use-app-state';
import { AddTodo } from './add-todo';
import { TodoItem } from './todo-item';

export function TodoPanel() {
  const { state } = useAppState();

  const active = state.todos.filter((t) => !t.done);
  const done = state.todos.filter((t) => t.done);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center px-3">
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted">
          todos
        </span>
        {state.todos.length > 0 && (
          <span className="ml-2 text-[10px] text-muted">
            {active.length}/{state.todos.length}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto px-2 pb-2">
        <div className="mb-1">
          <AddTodo />
        </div>
        {active.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
        {done.length > 0 && (
          <>
            {active.length > 0 && <div className="my-1 border-t border-border" />}
            {done.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </>
        )}
        {state.todos.length === 0 && (
          <span className="px-1 py-4 text-center text-[11px] text-muted">
            no todos yet
          </span>
        )}
      </div>
    </div>
  );
}
