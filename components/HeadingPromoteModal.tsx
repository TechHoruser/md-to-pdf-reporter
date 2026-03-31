'use client';

type HeadingPromoteModalProps = {
  open: boolean;
  h1Count: number;
  h2Count: number;
  onKeep: () => void;
  onPromote: () => void;
};

export function HeadingPromoteModal({
  open,
  h1Count,
  h2Count,
  onKeep,
  onPromote
}: HeadingPromoteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Estructura de títulos</h2>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-sm text-slate-700">
            Se ha detectado{' '}
            <span className="font-semibold text-slate-900">
              {h1Count} título de nivel 1 (<code className="font-mono">#</code>)
            </span>{' '}
            y{' '}
            <span className="font-semibold text-slate-900">
              {h2Count} títulos de nivel 2 (<code className="font-mono">##</code>)
            </span>
            . ¿Deseas continuar con la estructura actual o promover todos los títulos un nivel?
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-medium text-slate-700 mb-1">Si promueves los títulos:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>
                El título <code className="font-mono">#</code> será eliminado
              </li>
              <li>
                Los <code className="font-mono">##</code> pasarán a ser{' '}
                <code className="font-mono">#</code>
              </li>
              <li>
                Los <code className="font-mono">###</code> pasarán a ser{' '}
                <code className="font-mono">##</code>
              </li>
              <li>Y así sucesivamente…</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onKeep}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Dejar como está
          </button>
          <button
            type="button"
            onClick={onPromote}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Promover títulos
          </button>
        </div>
      </div>
    </div>
  );
}
