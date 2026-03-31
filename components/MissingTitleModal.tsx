'use client';

import { FormEvent, useEffect, useState } from 'react';

type MissingTitleModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (title: string) => void;
};

export function MissingTitleModal({ open, onCancel, onConfirm }: MissingTitleModalProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const canConfirm = Boolean(title.trim());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canConfirm) {
      return;
    }
    onConfirm(title.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Titulo obligatorio</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <p className="mb-4 text-sm text-slate-700">
            No se detecto un <span className="font-mono">title</span> valido en el markdown. Ingresa un titulo
            para continuar con la generacion del PDF.
          </p>

          <label className="mb-4 block text-sm font-medium text-slate-700" htmlFor="missing-title-input">
            Titulo del reporte
          </label>
          <input
            id="missing-title-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ejemplo: Informe de Incidentes"
            className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            autoFocus
          />
          <p className="text-xs text-slate-500">Este valor se guardara en el frontmatter como resuelto.</p>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canConfirm}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar y generar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
