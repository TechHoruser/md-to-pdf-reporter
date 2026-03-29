'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { ImageUploader } from '@/components/ImageUploader';
import { COMPANY_COLOR_FIELDS } from '@/types/config';

type ConfigPanelProps = {
  open: boolean;
  onClose: () => void;
  initialTarget?: 'author' | 'company';
};

type EditTarget = 'author' | 'company' | null;

export function ConfigPanel({ open, onClose, initialTarget = 'author' }: ConfigPanelProps) {
  const {
    config,
    activeAuthor,
    activeCompany,
    updateActiveAuthor,
    updateActiveCompany,
    deleteActiveAuthor,
    deleteActiveCompany,
    importCompany
  } = useConfig();
  const [editTarget, setEditTarget] = useState<EditTarget>('author');
  const [authorDeleteArmed, setAuthorDeleteArmed] = useState(false);
  const [companyDeleteArmed, setCompanyDeleteArmed] = useState(false);
  const [companyFeedback, setCompanyFeedback] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAuthorDeleteArmed(false);
    setCompanyDeleteArmed(false);
  }, [activeAuthor.id, activeCompany.id, editTarget]);

  useEffect(() => {
    if (open) {
      setEditTarget(initialTarget);
    }
  }, [initialTarget, open]);

  if (!open) {
    return null;
  }

  const exportCompany = () => {
    const payload = {
      name: activeCompany.name,
      images: activeCompany.images,
      colors: activeCompany.colors
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const fileName = `${activeCompany.name || 'company'}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName || 'company'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setCompanyFeedback('Company exportada correctamente.');
  };

  const importCompanyFromFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        name?: string;
        images?: { cover?: string; header?: string };
        colors?: {
          mainColor?: string;
          secondaryColor?: string;
          bgDarkObsidian?: string;
          bgDarkGray?: string;
          bgMediumGray?: string;
          bgLightGray?: string;
        };
      };

      if (!parsed || typeof parsed !== 'object' || typeof parsed.name !== 'string') {
        throw new Error('JSON de company invalido.');
      }

      const imported = importCompany(parsed);
      if (!imported) {
        throw new Error('No se pudo importar la company.');
      }
      setCompanyFeedback(`Company importada: ${parsed.name}`);
      setEditTarget('company');
    } catch (error) {
      setCompanyFeedback(error instanceof Error ? error.message : 'Error al importar JSON.');
    } finally {
      event.target.value = '';
    }
  };

  const onDeleteActiveAuthor = () => {
    if (!authorDeleteArmed) {
      setAuthorDeleteArmed(true);
      return;
    }

    const deleted = deleteActiveAuthor();
    setAuthorDeleteArmed(false);
    if (!deleted) {
      setCompanyFeedback('Debe existir al menos un author.');
    }
  };

  const onDeleteActiveCompany = () => {
    if (!companyDeleteArmed) {
      setCompanyDeleteArmed(true);
      return;
    }

    const deleted = deleteActiveCompany();
    setCompanyDeleteArmed(false);
    if (!deleted) {
      setCompanyFeedback('Debe existir al menos una company.');
      return;
    }
    setCompanyFeedback('Company eliminada.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="w-[92vw] max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">Project Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() => setEditTarget('author')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              editTarget === 'author'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Author
          </button>
          <button
            type="button"
            onClick={() => setEditTarget('company')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              editTarget === 'company'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Company
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {editTarget === 'author' ? (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Edit Author</h3>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Name</span>
                <input
                  type="text"
                  value={activeAuthor.name}
                  onChange={(event) =>
                    updateActiveAuthor({
                      name: event.target.value
                    })
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Email</span>
                <input
                  type="email"
                  value={activeAuthor.email}
                  onChange={(event) =>
                    updateActiveAuthor({
                      email: event.target.value
                    })
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Role</span>
                <input
                  type="text"
                  value={activeAuthor.role}
                  onChange={(event) =>
                    updateActiveAuthor({
                      role: event.target.value
                    })
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>

              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-700">Delete author</p>
                <p className="mt-1 text-xs text-rose-600">
                  {authorDeleteArmed
                    ? 'Click de nuevo para confirmar eliminacion.'
                    : 'Se requiere doble click para eliminar.'}
                </p>
                <button
                  type="button"
                  onClick={onDeleteActiveAuthor}
                  className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={config.authors.length <= 1}
                >
                  {authorDeleteArmed ? 'Confirm delete' : 'Delete'}
                </button>
              </div>
            </div>
          ) : editTarget === 'company' ? (
            <div className="grid gap-5">
              <h3 className="text-lg font-semibold text-slate-900">Edit Company</h3>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Company Name</span>
                <input
                  type="text"
                  value={activeCompany.name}
                  onChange={(event) =>
                    updateActiveCompany({
                      name: event.target.value
                    })
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {COMPANY_COLOR_FIELDS.map((field) => (
                  <label key={field.key} className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-800">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={activeCompany.colors[field.key]}
                        onChange={(event) =>
                          updateActiveCompany({
                            colors: {
                              ...activeCompany.colors,
                              [field.key]: event.target.value
                            }
                          })
                        }
                        className="h-10 w-16 rounded-md border border-slate-300"
                      />
                      <input
                        type="text"
                        value={activeCompany.colors[field.key]}
                        onChange={(event) =>
                          updateActiveCompany({
                            colors: {
                              ...activeCompany.colors,
                              [field.key]: event.target.value
                            }
                          })
                        }
                        className="h-10 flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-900"
                      />
                    </div>
                  </label>
                ))}
              </div>

              <ImageUploader
                label="Cover Image"
                value={activeCompany.images.cover}
                onChange={(base64) =>
                  updateActiveCompany({
                    images: {
                      ...activeCompany.images,
                      cover: base64
                    }
                  })
                }
              />

              <ImageUploader
                label="Header Image"
                value={activeCompany.images.header}
                onChange={(base64) =>
                  updateActiveCompany({
                    images: {
                      ...activeCompany.images,
                      header: base64
                    }
                  })
                }
              />

              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={exportCompany}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Export company
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Import company
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  onChange={importCompanyFromFile}
                  className="hidden"
                />
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-700">Delete company</p>
                <p className="mt-1 text-xs text-rose-600">
                  {companyDeleteArmed
                    ? 'Click de nuevo para confirmar eliminacion.'
                    : 'Se requiere doble click para eliminar.'}
                </p>
                <button
                  type="button"
                  onClick={onDeleteActiveCompany}
                  className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={config.companies.length <= 1}
                >
                  {companyDeleteArmed ? 'Confirm delete' : 'Delete'}
                </button>
              </div>

              {companyFeedback ? <p className="text-sm text-slate-700">{companyFeedback}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Selecciona Author o Company para editar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
