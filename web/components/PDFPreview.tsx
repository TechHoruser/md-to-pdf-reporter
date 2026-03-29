'use client';

import { useEffect, useMemo } from 'react';

type PDFPreviewProps = {
  blob: Blob | null;
  enabled: boolean;
};

export function PDFPreview({ blob, enabled }: PDFPreviewProps) {
  const fileUrl = useMemo(() => {
    if (!blob) {
      return null;
    }

    return URL.createObjectURL(blob);
  }, [blob]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div className="panel h-full min-h-0 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">PDF Preview</h3>
        <span className="text-xs text-slate-500">Right panel</span>
      </div>

      {!enabled ? (
        <div className="preview-placeholder h-[calc(100%-2.2rem)] rounded-xl">
          Preview is paused. Activate it from toolbar.
        </div>
      ) : fileUrl ? (
        <iframe
          src={fileUrl}
          className="h-[calc(100%-2.2rem)] w-full rounded-xl border border-slate-300 bg-white"
          title="Generated PDF"
        />
      ) : (
        <div className="preview-placeholder h-[calc(100%-2.2rem)] rounded-xl">
          Generate a PDF to see it here.
        </div>
      )}
    </div>
  );
}
