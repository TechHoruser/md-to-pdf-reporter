'use client';

import { useMemo, useState } from 'react';
import { parseLeadingMetadata } from '@/lib/markdownMetadata';

type ShareModalProps = {
  open: boolean;
  markdown: string;
  onClose: () => void;
};

function processMarkdown(markdown: string, cleanCommands: boolean, cleanMetadata: boolean): string {
  let result = markdown;

  if (cleanMetadata) {
    result = parseLeadingMetadata(result).body;
  }

  if (cleanCommands) {
    result = result
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('/'))
      .join('\n');
  }

  return result;
}

export function ShareModal({ open, markdown, onClose }: ShareModalProps) {
  const [cleanCommands, setCleanCommands] = useState(false);
  const [cleanMetadata, setCleanMetadata] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const processed = useMemo(
    () => processMarkdown(markdown, cleanCommands, cleanMetadata),
    [markdown, cleanCommands, cleanMetadata],
  );

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(processed);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([processed], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Compartir markdown</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-sm text-slate-600">
            Selecciona las opciones de limpieza antes de copiar o descargar el contenido.
          </p>

          <div className="mb-4 flex flex-col gap-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={cleanCommands}
                onChange={(e) => setCleanCommands(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                <span className="font-medium">Limpiar comandos</span>
                <span className="ml-1 text-slate-500">— elimina las líneas que empiezan por{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">/</code>
                  {' '}como{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">/new-page</code>
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={cleanMetadata}
                onChange={(e) => setCleanMetadata(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                <span className="font-medium">Limpiar metadatos</span>
                <span className="ml-1 text-slate-500">— elimina el bloque{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">---</code>
                  {' '}del inicio del documento
                </span>
              </span>
            </label>
          </div>

          <div className="mb-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vista previa
            </p>
            <textarea
              readOnly
              value={processed}
              rows={10}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-800 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Descargar .md
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              {copyStatus === 'copied' ? '✓ Copiado' : 'Copiar al portapapeles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
