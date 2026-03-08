'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppState, useAppDispatch } from '@/hooks/use-app-state';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdown(raw: string): string {
  const lines = raw.split('\n');
  const output: string[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  function closeLists() {
    if (inUnorderedList) {
      output.push('</ul>');
      inUnorderedList = false;
    }
    if (inOrderedList) {
      output.push('</ol>');
      inOrderedList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // fenced code blocks
    if (line.trimStart().startsWith('```')) {
      if (!inCodeBlock) {
        closeLists();
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        output.push(
          '<pre class="note-code-block">' +
            escapeHtml(codeBlockContent.join('\n')) +
            '</pre>'
        );
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // blank line
    if (line.trim() === '') {
      closeLists();
      output.push('<br/>');
      continue;
    }

    // unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    if (ulMatch) {
      if (inOrderedList) {
        output.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        output.push('<ul class="note-ul">');
        inUnorderedList = true;
      }
      output.push('<li>' + inlineFormat(ulMatch[2]) + '</li>');
      continue;
    }

    // ordered list
    const olMatch = line.match(/^(\s*)\d+[.)]\s+(.*)/);
    if (olMatch) {
      if (inUnorderedList) {
        output.push('</ul>');
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        output.push('<ol class="note-ol">');
        inOrderedList = true;
      }
      output.push('<li>' + inlineFormat(olMatch[2]) + '</li>');
      continue;
    }

    // regular line
    closeLists();
    output.push('<p class="note-p">' + inlineFormat(line) + '</p>');
  }

  // close any open blocks
  if (inCodeBlock) {
    output.push(
      '<pre class="note-code-block">' +
        escapeHtml(codeBlockContent.join('\n')) +
        '</pre>'
    );
  }
  closeLists();

  return output.join('\n');
}

function inlineFormat(text: string): string {
  let result = escapeHtml(text);
  // inline code (backticks) — do first to avoid processing inside code
  result = result.replace(/`([^`]+)`/g, '<code class="note-code">$1</code>');
  // bold (**text** or __text__)
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic (*text* or _text_)
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');
  return result;
}

export function NotePanel() {
  const { state } = useAppState();
  const { updateNote } = useAppDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (
      mode === 'edit' &&
      textareaRef.current &&
      textareaRef.current.value !== state.note.content
    ) {
      textareaRef.current.value = state.note.content;
    }
  }, [state.note.content, mode]);

  const handleInput = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (textareaRef.current) {
        updateNote(textareaRef.current.value);
      }
    }, 500);
  }, [updateNote]);

  const handleBlur = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (textareaRef.current) {
      updateNote(textareaRef.current.value);
    }
  }, [updateNote]);

  const switchToPreview = useCallback(() => {
    // flush pending changes before switching
    clearTimeout(timeoutRef.current);
    if (textareaRef.current) {
      updateNote(textareaRef.current.value);
    }
    setMode('preview');
  }, [updateNote]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center justify-between px-3">
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted">
          notes
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setMode('edit')}
            className={`rounded-sm px-1.5 py-0.5 text-[10px] transition-colors duration-150 ${
              mode === 'edit'
                ? 'text-accent'
                : 'text-muted hover:text-secondary'
            }`}
          >
            edit
          </button>
          <button
            onClick={switchToPreview}
            className={`rounded-sm px-1.5 py-0.5 text-[10px] transition-colors duration-150 ${
              mode === 'preview'
                ? 'text-accent'
                : 'text-muted hover:text-secondary'
            }`}
          >
            preview
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-2 pt-0">
        {mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            defaultValue={state.note.content}
            onInput={handleInput}
            onBlur={handleBlur}
            placeholder="scratch pad...&#10;&#10;**bold**  *italic*  `code`&#10;- bullets&#10;1. numbered&#10;``` code blocks ```"
            spellCheck={false}
            className="h-full w-full resize-none rounded-sm border border-border bg-card p-3 font-mono text-[12px] leading-relaxed text-primary placeholder:text-muted focus:border-accent"
          />
        ) : (
          <div
            className="note-preview h-full overflow-y-auto rounded-sm border border-border bg-card p-3 text-[12px] leading-relaxed text-primary"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(state.note.content) }}
          />
        )}
      </div>
    </div>
  );
}
