'use client';

type ToolbarProps = {
  onGenerate: () => void;
  onOpenConfig: () => void;
  autoGenerate: boolean;
  setAutoGenerate: (value: boolean) => void;
  previewActive: boolean;
  setPreviewActive: (value: boolean) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

export function Toolbar({
  onGenerate,
  onOpenConfig,
  autoGenerate,
  setAutoGenerate,
  previewActive,
  setPreviewActive,
  status,
  message
}: ToolbarProps) {
  return (
    <header className="toolbar-wrap px-4 py-3">
      <div className="toolbar flex flex-wrap items-center gap-3 rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Generate PDF
        </button>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={autoGenerate}
            onChange={(event) => setAutoGenerate(event.target.checked)}
          />
          Auto-generate (3s)
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={previewActive}
            onChange={(event) => setPreviewActive(event.target.checked)}
          />
          Preview active
        </label>

        <button
          type="button"
          onClick={onOpenConfig}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Config
        </button>

        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            status === 'loading'
              ? 'bg-amber-100 text-amber-800'
              : status === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : status === 'error'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
          }`}
        >
          {message}
        </span>
      </div>
    </header>
  );
}
