'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppState, useAppDispatch } from '@/hooks/use-app-state';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatLine(text: string): string {
  let s = escapeHtml(text);

  // Protect code spans from bold/italic processing
  const codeSpans: string[] = [];
  s = s.replace(/`([^`]+)`/g, (_, content) => {
    codeSpans.push(content);
    return `\x00${codeSpans.length - 1}\x00`;
  });

  // Bold: **text**
  s = s.replace(
    /\*\*(.+?)\*\*/g,
    '<span class="fmt-syn">**</span><b>$1</b><span class="fmt-syn">**</span>'
  );

  // Italic: *text* (single asterisks only)
  s = s.replace(
    /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
    '<span class="fmt-syn">*</span><i>$1</i><span class="fmt-syn">*</span>'
  );

  // Restore code spans
  s = s.replace(/\x00(\d+)\x00/g, (_, idx) => {
    return (
      '<span class="fmt-syn">`</span><span class="fmt-code">' +
      codeSpans[parseInt(idx)] +
      '</span><span class="fmt-syn">`</span>'
    );
  });

  // Bullet prefix: dim the "- "
  s = s.replace(/^(- )/, '<span class="fmt-syn">$1</span>');

  // Number prefix: dim the "1. "
  s = s.replace(/^(\d+\. )/, '<span class="fmt-syn">$1</span>');

  return s;
}

function renderOverlay(text: string): string {
  if (!text) return '\n';
  return text.split('\n').map(formatLine).join('\n');
}

export function NotePanel() {
  const { state } = useAppState();
  const { updateNote } = useAppDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef(state.note.content);
  const [localContent, setLocalContent] = useState(state.note.content);

  // Sync from external state changes (hydration) only
  useEffect(() => {
    if (state.note.content !== lastSavedRef.current) {
      setLocalContent(state.note.content);
    }
    lastSavedRef.current = state.note.content;
  }, [state.note.content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalContent(value);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastSavedRef.current = value;
        updateNote(value);
      }, 500);
    },
    [updateNote]
  );

  const handleBlur = useCallback(() => {
    clearTimeout(timeoutRef.current);
    lastSavedRef.current = localContent;
    updateNote(localContent);
  }, [updateNote, localContent]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const fmt = useCallback(
    (type: 'bold' | 'italic' | 'bullet' | 'number' | 'code') => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart, selectionEnd } = ta;
      const selected = localContent.slice(selectionStart, selectionEnd);

      let newContent: string;
      let cursorStart: number;
      let cursorEnd: number;

      if (type === 'bullet' || type === 'number') {
        const prefix = type === 'bullet' ? '- ' : '1. ';
        const lineStart =
          localContent.lastIndexOf('\n', selectionStart - 1) + 1;
        newContent =
          localContent.slice(0, lineStart) +
          prefix +
          localContent.slice(lineStart);
        cursorStart = cursorEnd = selectionStart + prefix.length;
      } else {
        const wrap = type === 'bold' ? '**' : type === 'italic' ? '*' : '`';
        newContent =
          localContent.slice(0, selectionStart) +
          wrap +
          selected +
          wrap +
          localContent.slice(selectionEnd);
        if (selectionStart === selectionEnd) {
          cursorStart = cursorEnd = selectionStart + wrap.length;
        } else {
          cursorStart = selectionStart + wrap.length;
          cursorEnd = selectionEnd + wrap.length;
        }
      }

      setLocalContent(newContent);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastSavedRef.current = newContent;
        updateNote(newContent);
      }, 500);

      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = cursorStart;
        ta.selectionEnd = cursorEnd;
      });
    },
    [localContent, updateNote]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between px-3">
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted">
          notes
        </span>
        <div className="flex gap-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fmt('bold')}
            title="Bold"
            className="rounded-sm px-1.5 py-0.5 text-[11px] font-bold text-secondary hover:text-primary transition-colors duration-150"
          >
            B
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fmt('italic')}
            title="Italic"
            className="rounded-sm px-1.5 py-0.5 text-[11px] italic text-secondary hover:text-primary transition-colors duration-150"
          >
            I
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fmt('bullet')}
            title="Bullet list"
            className="rounded-sm px-1.5 py-0.5 text-[11px] text-secondary hover:text-primary transition-colors duration-150"
          >
            &bull;
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fmt('number')}
            title="Numbered list"
            className="rounded-sm px-1.5 py-0.5 text-[11px] text-secondary hover:text-primary transition-colors duration-150"
          >
            1.
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fmt('code')}
            title="Code"
            className="rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-secondary hover:text-primary transition-colors duration-150"
          >
            &lt;/&gt;
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-2 pt-0">
        <div className="relative h-full">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleChange}
            onBlur={handleBlur}
            onScroll={handleScroll}
            spellCheck={false}
            className="relative z-[1] h-full w-full resize-none rounded-sm border border-border bg-card p-3 font-mono text-[12px] leading-relaxed text-muted focus:border-accent"
            style={{ caretColor: 'var(--text-primary)' }}
          />
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-sm border border-transparent p-3 font-mono text-[12px] leading-relaxed text-primary"
            dangerouslySetInnerHTML={{
              __html: renderOverlay(localContent),
            }}
          />
        </div>
      </div>
    </div>
  );
}
