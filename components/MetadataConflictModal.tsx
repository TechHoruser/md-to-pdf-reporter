'use client';

import { MetadataConflict, MetadataKey } from '@/lib/markdownMetadata';

type SourceChoice = 'markdown' | 'config';

type MetadataConflictModalProps = {
  open: boolean;
  conflicts: MetadataConflict[];
  selections: Partial<Record<MetadataKey, SourceChoice>>;
  onSelect: (key: MetadataKey, source: SourceChoice) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function MetadataConflictModal({
  open,
  conflicts,
  selections,
  onSelect,
  onCancel,
  onConfirm
}: MetadataConflictModalProps) {
  if (!open) {
    return null;
  }

  const canConfirm = conflicts.every((conflict) => Boolean(selections[conflict.key]));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Conflictos de metadatos</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-6 py-4">
          <p className="mb-4 text-sm text-slate-700">
            Selecciona el valor a usar para generar el PDF. Al confirmar, el valor elegido se guardara como resuelto
            en el markdown con el prefijo <span className="font-mono">-</span>.
          </p>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Propiedad</th>
                <th className="px-3 py-2">Valor MD</th>
                <th className="px-3 py-2">Valor Config</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map((conflict) => {
                const selected = selections[conflict.key];
                return (
                  <tr key={conflict.key} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-3 font-medium text-slate-800">{conflict.key}</td>
                    <td className="px-3 py-3">
                      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                        <input
                          type="radio"
                          name={`conflict-${conflict.key}`}
                          checked={selected === 'markdown'}
                          onChange={() => onSelect(conflict.key, 'markdown')}
                        />
                        <span className="break-all text-slate-700">{conflict.markdownValue}</span>
                      </label>
                    </td>
                    <td className="px-3 py-3">
                      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                        <input
                          type="radio"
                          name={`conflict-${conflict.key}`}
                          checked={selected === 'config'}
                          onChange={() => onSelect(conflict.key, 'config')}
                        />
                        <span className="break-all text-slate-700">{conflict.configValue}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Usar seleccion y generar
          </button>
        </div>
      </div>
    </div>
  );
}
