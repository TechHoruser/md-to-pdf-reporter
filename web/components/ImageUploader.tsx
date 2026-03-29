'use client';

import { ChangeEvent } from 'react';

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (base64: string) => void;
};

export function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm" />
      {value ? (
        <img
          src={value}
          alt={label}
          className="h-24 w-full rounded-lg border border-slate-300 object-cover"
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
          No image uploaded
        </div>
      )}
    </div>
  );
}
