'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { PDFPreview } from '@/components/PDFPreview';
import { Toolbar } from '@/components/Toolbar';
import { useConfig } from '@/contexts/ConfigContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const starterMarkdown = `# Report Title

## Executive Summary

Write your content here.

/new-page

## Second Section

- Point one
- Point two
- Point three
`;

export default function Home() {
  const {
    config,
    activeAuthor,
    activeCompany,
    isReady,
    setActiveAuthor,
    setActiveCompany,
    addAuthor,
    addCompany
  } = useConfig();
  const [markdown, setMarkdown] = useLocalStorage<string>('reporter-markdown', starterMarkdown);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [previewActive, setPreviewActive] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [configEditTarget, setConfigEditTarget] = useState<'author' | 'company'>('author');

  const debouncedMarkdown = useDebounce(markdown, 3000);
  const canGenerate = useMemo(() => isReady && previewActive, [isReady, previewActive]);

  const generatePdf = useCallback(async (sourceMarkdown: string) => {
    if (!canGenerate) {
      return;
    }

    setStatus('loading');
    setStatusMessage('Generating PDF...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          markdown: sourceMarkdown,
          author: activeAuthor,
          company: activeCompany,
          title: 'Live Preview'
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || 'PDF generation failed');
      }

      const blob = await response.blob();
      setPdfBlob(blob);
      setStatus('success');
      setStatusMessage('PDF generated');
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unexpected error');
    }
  }, [activeAuthor, activeCompany, canGenerate]);

  useEffect(() => {
    if (!autoGenerate || !canGenerate) {
      return;
    }

    generatePdf(debouncedMarkdown);
  }, [autoGenerate, canGenerate, debouncedMarkdown, generatePdf]);

  return (
    <main className="p-4 md:p-6">
      <Toolbar
        onGenerate={() => generatePdf(markdown)}
        autoGenerate={autoGenerate}
        setAutoGenerate={setAutoGenerate}
        previewActive={previewActive}
        setPreviewActive={setPreviewActive}
        authors={config.authors.map((author) => ({
          id: author.id,
          label: author.name || 'Author'
        }))}
        companies={config.companies.map((company) => ({
          id: company.id,
          label: company.name || 'Company'
        }))}
        activeAuthorId={config.activeAuthorId}
        activeCompanyId={config.activeCompanyId}
        onSelectAuthor={setActiveAuthor}
        onSelectCompany={setActiveCompany}
        onAddAuthor={() => {
          addAuthor();
          setConfigEditTarget('author');
          setConfigOpen(true);
        }}
        onAddCompany={() => {
          addCompany();
          setConfigEditTarget('company');
          setConfigOpen(true);
        }}
        onEditAuthor={() => {
          setConfigEditTarget('author');
          setConfigOpen(true);
        }}
        onEditCompany={() => {
          setConfigEditTarget('company');
          setConfigOpen(true);
        }}
        status={status}
        message={statusMessage}
      />

      <section className="split-grid grid h-[calc(100vh-7rem)] grid-cols-[1fr_1fr] gap-4">
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
        <PDFPreview blob={pdfBlob} enabled={previewActive} />
      </section>

      <ConfigPanel
        open={configOpen}
        initialTarget={configEditTarget}
        onClose={() => setConfigOpen(false)}
      />
    </main>
  );
}
