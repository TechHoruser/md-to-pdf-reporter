'use client';

import { useMemo, useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { ImageUploader } from '@/components/ImageUploader';
import { COMPANY_COLOR_FIELDS } from '@/types/config';

type ConfigPanelProps = {
  open: boolean;
  onClose: () => void;
};

type Tab = 'author' | 'company';

export function ConfigPanel({ open, onClose }: ConfigPanelProps) {
  const { config, setConfig } = useConfig();
  const [activeTab, setActiveTab] = useState<Tab>('author');

  const tabs = useMemo(
    () => [
      { id: 'author', label: 'Author' },
      { id: 'company', label: 'Company' }
    ] as const,
    []
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="w-[90vw] max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
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

        <div className="flex border-b border-slate-200 px-6 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`mr-2 rounded-t-lg px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {activeTab === 'author' ? (
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Name</span>
                <input
                  type="text"
                  value={config.author.name}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      author: {
                        ...current.author,
                        name: event.target.value
                      }
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Email</span>
                <input
                  type="email"
                  value={config.author.email}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      author: {
                        ...current.author,
                        email: event.target.value
                      }
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Role</span>
                <input
                  type="text"
                  value={config.author.role}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      author: {
                        ...current.author,
                        role: event.target.value
                      }
                    }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-900"
                />
              </label>
            </div>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-800">Company Name</span>
                <input
                  type="text"
                  value={config.company.name}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      company: {
                        ...current.company,
                        name: event.target.value
                      }
                    }))
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
                        value={config.company.colors[field.key]}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            company: {
                              ...current.company,
                              colors: {
                                ...current.company.colors,
                                [field.key]: event.target.value
                              }
                            }
                          }))
                        }
                        className="h-10 w-16 rounded-md border border-slate-300"
                      />
                      <input
                        type="text"
                        value={config.company.colors[field.key]}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            company: {
                              ...current.company,
                              colors: {
                                ...current.company.colors,
                                [field.key]: event.target.value
                              }
                            }
                          }))
                        }
                        className="h-10 flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-900"
                      />
                    </div>
                  </label>
                ))}
              </div>

              <ImageUploader
                label="Cover Image"
                value={config.company.images.cover}
                onChange={(base64) =>
                  setConfig((current) => ({
                    ...current,
                    company: {
                      ...current.company,
                      images: {
                        ...current.company.images,
                        cover: base64
                      }
                    }
                  }))
                }
              />

              <ImageUploader
                label="Header Image"
                value={config.company.images.header}
                onChange={(base64) =>
                  setConfig((current) => ({
                    ...current,
                    company: {
                      ...current.company,
                      images: {
                        ...current.company.images,
                        header: base64
                      }
                    }
                  }))
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
