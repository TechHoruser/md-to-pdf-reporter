'use client';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="panel h-full min-h-0 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Markdown</h3>
        <span className="text-xs text-slate-500">Left panel</span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="editor-textarea h-[calc(100%-2.2rem)] w-full resize-none rounded-xl border border-slate-300 bg-white/80 p-4 text-sm leading-6 text-slate-900 outline-none focus:border-slate-900"
        spellCheck={false}
      />
    </div>
  );
}
