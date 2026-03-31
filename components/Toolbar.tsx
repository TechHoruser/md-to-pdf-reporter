'use client';

import { ChangeEvent } from 'react';

type Option = {
  id: string;
  label: string;
};

const ADD_AUTHOR_VALUE = '__add-author__';
const ADD_COMPANY_VALUE = '__add-company__';
const EDIT_AUTHOR_VALUE = '__edit-author__';
const EDIT_COMPANY_VALUE = '__edit-company__';

type ToolbarProps = {
  onGenerate: () => void;
  onShare: () => void;
  autoGenerate: boolean;
  setAutoGenerate: (value: boolean) => void;
  previewActive: boolean;
  setPreviewActive: (value: boolean) => void;
  authors: Option[];
  companies: Option[];
  activeAuthorId: string;
  activeCompanyId: string;
  onSelectAuthor: (authorId: string) => void;
  onSelectCompany: (companyId: string) => void;
  onAddAuthor: () => void;
  onAddCompany: () => void;
  onEditAuthor: () => void;
  onEditCompany: () => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

export function Toolbar({
  onGenerate,
  onShare,
  autoGenerate,
  setAutoGenerate,
  previewActive,
  setPreviewActive,
  authors,
  companies,
  activeAuthorId,
  activeCompanyId,
  onSelectAuthor,
  onSelectCompany,
  onAddAuthor,
  onAddCompany,
  onEditAuthor,
  onEditCompany,
  status,
  message
}: ToolbarProps) {
  const handleAuthorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === EDIT_AUTHOR_VALUE) {
      onEditAuthor();
      return;
    }
    if (value === ADD_AUTHOR_VALUE) {
      onAddAuthor();
      return;
    }
    onSelectAuthor(value);
  };

  const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === EDIT_COMPANY_VALUE) {
      onEditCompany();
      return;
    }
    if (value === ADD_COMPANY_VALUE) {
      onAddCompany();
      return;
    }
    onSelectCompany(value);
  };

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

        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M7.78 1.97a.75.75 0 0 0-1.06 0L4.47 4.22a.75.75 0 0 0 1.06 1.06l1.22-1.22v6.44a.75.75 0 0 0 1.5 0V4.06l1.22 1.22a.75.75 0 1 0 1.06-1.06L7.78 1.97ZM3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
          </svg>
          Compartir
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Author</span>
          <select
            value={activeAuthorId}
            onChange={handleAuthorChange}
            className="h-9 min-w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.label}
              </option>
            ))}
            <option value={EDIT_AUTHOR_VALUE}>✏ Edit current author</option>
            <option value={ADD_AUTHOR_VALUE}>+ Add author</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</span>
          <select
            value={activeCompanyId}
            onChange={handleCompanyChange}
            className="h-9 min-w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.label}
              </option>
            ))}
            <option value={EDIT_COMPANY_VALUE}>✏ Edit current company</option>
            <option value={ADD_COMPANY_VALUE}>+ Add company</option>
          </select>
        </div>

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
