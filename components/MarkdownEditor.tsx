'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { commandHighlighter, commandAutocompleteExt } from '@/lib/commandsExtension';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  metadataPendingCount?: number;
  metadataResolvedCount?: number;
  onDropMarkdownFile?: (content: string, fileName: string) => void;
};

export function MarkdownEditor({
  value,
  onChange,
  metadataPendingCount = 0,
  metadataResolvedCount = 0,
  onDropMarkdownFile,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

  // Keep onChange handler current without recreating the editor
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Mount editor once
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          EditorView.lineWrapping,
          markdown(),
          oneDark,
          commandHighlighter,
          commandAutocompleteExt,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            '&': { height: '100%', fontSize: '0.875rem' },
            '.cm-scroller': {
              overflow: 'auto',
              fontFamily: 'var(--font-mono), monospace',
            },
            '.cm-content': { padding: '0.75rem 1rem' },
          }),
        ],
      }),
      parent: containerRef.current,
    });

    editorRef.current = view;

    return () => {
      view.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes into the editor (e.g. file drop, conflict resolution)
  useEffect(() => {
    const view = editorRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  const handleFileDrop = async (file: File) => {
    const isMarkdownByType = file.type === 'text/markdown' || file.type === 'text/plain';
    const isMarkdownByName = /\.md$/i.test(file.name);
    if (!isMarkdownByType && !isMarkdownByName) return;

    const content = await file.text();
    if (onDropMarkdownFile) {
      onDropMarkdownFile(content, file.name);
      return;
    }
    onChange(content);
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
    setDragActive(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await handleFileDrop(file);
  };

  return (
    <div
      className="panel relative h-full min-h-0 p-4"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Markdown</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">
            Pendientes: {metadataPendingCount}
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-800">
            Resueltos: {metadataResolvedCount}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100%-2.75rem)] overflow-hidden rounded-xl"
      />

      {dragActive ? (
        <div className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-500 bg-slate-100/95">
          <p className="text-sm font-semibold text-slate-700">Suelta un archivo .md para cargar su contenido</p>
        </div>
      ) : null}
    </div>
  );
}
