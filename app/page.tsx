'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { HeadingPromoteModal } from '@/components/HeadingPromoteModal';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MetadataConflictModal } from '@/components/MetadataConflictModal';
import { MissingTitleModal } from '../components/MissingTitleModal';
import { PDFPreview } from '@/components/PDFPreview';
import { ShareModal } from '@/components/ShareModal';
import { Toolbar } from '@/components/Toolbar';
import { useConfig } from '@/contexts/ConfigContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  analyzeHeadingStructure,
  applyResolvedMetadata,
  ensureMetadataFrontmatter,
  getEffectiveMetadata,
  getMetadataConflicts,
  normalizeDashedCodeFences,
  parseLeadingMetadata,
  promoteHeadings,
  SUPPORTED_METADATA_KEYS,
  type MetadataConflict,
  type MetadataKey
} from '@/lib/markdownMetadata';

const starterMarkdown = `---
title: Report Title
author: Author
company: Company
version: 1.0
date: 2026-01-01
main-color: #5F6B7A
---

# Report Title

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
  const [conflicts, setConflicts] = useState<MetadataConflict[]>([]);
  const [conflictSelections, setConflictSelections] = useState<
    Partial<Record<MetadataKey, 'markdown' | 'config'>>
  >({});
  const [pendingMarkdown, setPendingMarkdown] = useState<string | null>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [headingPromoteModalOpen, setHeadingPromoteModalOpen] = useState(false);
  const [pendingMarkdownForHeadings, setPendingMarkdownForHeadings] = useState<string | null>(null);
  const [missingTitleModalOpen, setMissingTitleModalOpen] = useState(false);
  const [pendingMarkdownForTitle, setPendingMarkdownForTitle] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const debouncedMarkdown = useDebounce(markdown, 3000);
  const canGenerate = useMemo(() => isReady && previewActive, [isReady, previewActive]);

  const getConfigMetadata = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      author: activeAuthor?.name?.trim() || 'Author',
      company: activeCompany?.name?.trim() || 'Company',
      version: '1.0',
      date: today,
      'main-color': activeCompany?.colors?.mainColor || '#5F6B7A'
    };
  }, [activeAuthor?.name, activeCompany?.colors?.mainColor, activeCompany?.name]);

  const requestPdf = useCallback(
    async (sourceMarkdown: string, metadataValues: Partial<Record<MetadataKey, string>>) => {
      setStatus('loading');
      setStatusMessage('Generating PDF...');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          markdown: sourceMarkdown,
          title: metadataValues.title,
          version: metadataValues.version || '1.0',
          date: metadataValues.date,
          mainColor: metadataValues['main-color'],
          author: {
            ...activeAuthor,
            name: metadataValues.author || activeAuthor?.name || 'Author'
          },
          company: {
            ...activeCompany,
            name: metadataValues.company || activeCompany?.name || 'Company',
            colors: {
              ...activeCompany?.colors,
              mainColor: metadataValues['main-color'] || activeCompany?.colors?.mainColor || '#5F6B7A'
            }
          }
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
    },
    [activeAuthor, activeCompany]
  );

  const continueGeneratePdf = useCallback(async (sourceMarkdown: string) => {
    if (!canGenerate) {
      return;
    }

    const configMetadata = getConfigMetadata();
    const nextConflicts = getMetadataConflicts(sourceMarkdown, configMetadata);
    if (nextConflicts.length > 0) {
      setConflicts(nextConflicts);
      setPendingMarkdown(sourceMarkdown);
      setConflictSelections({});
      setConflictModalOpen(true);
      setStatus('idle');
      setStatusMessage('Resolve metadata conflicts');
      return;
    }

    const effectiveMetadata = getEffectiveMetadata(sourceMarkdown, configMetadata);

    try {
      await requestPdf(sourceMarkdown, effectiveMetadata);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unexpected error');
    }
  }, [canGenerate, getConfigMetadata, requestPdf]);

  const generatePdf = useCallback(async (sourceMarkdown: string) => {
    if (!canGenerate) {
      return;
    }

    const configMetadata = getConfigMetadata();
    const normalizedMarkdown = normalizeDashedCodeFences(sourceMarkdown);
    const ensuredMarkdown = ensureMetadataFrontmatter(normalizedMarkdown, configMetadata);
    if (ensuredMarkdown !== sourceMarkdown) {
      setMarkdown(ensuredMarkdown);
    }

    const parsed = parseLeadingMetadata(ensuredMarkdown);
    const titleValue = parsed.metadata.title?.value?.trim();
    if (!titleValue) {
      setPendingMarkdownForTitle(ensuredMarkdown);
      setMissingTitleModalOpen(true);
      setStatus('idle');
      setStatusMessage('Title is required');
      return;
    }

    const { h1Count, h2Count } = analyzeHeadingStructure(ensuredMarkdown);
    if (h1Count === 1 && h2Count >= 2) {
      setPendingMarkdownForHeadings(ensuredMarkdown);
      setHeadingPromoteModalOpen(true);
      return;
    }

    await continueGeneratePdf(ensuredMarkdown);
  }, [canGenerate, continueGeneratePdf, getConfigMetadata, setMarkdown]);

  const metadataStats = useMemo(() => {
    const parsed = parseLeadingMetadata(markdown);
    const total = SUPPORTED_METADATA_KEYS.length;
    const resolved = SUPPORTED_METADATA_KEYS.filter((key) => parsed.metadata[key]?.locked).length;
    const pending = total - resolved;
    return {
      pending,
      resolved
    };
  }, [markdown]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const ensured = ensureMetadataFrontmatter(markdown, getConfigMetadata());
    if (ensured !== markdown) {
      setMarkdown(ensured);
    }
  }, [getConfigMetadata, isReady, markdown, setMarkdown]);

  useEffect(() => {
    if (!autoGenerate || !canGenerate || conflictModalOpen || headingPromoteModalOpen || missingTitleModalOpen) {
      return;
    }

    generatePdf(debouncedMarkdown);
  }, [
    autoGenerate,
    canGenerate,
    conflictModalOpen,
    debouncedMarkdown,
    generatePdf,
    headingPromoteModalOpen,
    missingTitleModalOpen
  ]);

  const handleSelectConflict = (key: MetadataKey, source: 'markdown' | 'config') => {
    setConflictSelections((current) => ({
      ...current,
      [key]: source
    }));
  };

  const handleCancelConflicts = () => {
    setConflictModalOpen(false);
    setPendingMarkdown(null);
    setConflicts([]);
    setConflictSelections({});
    setStatus('idle');
    setStatusMessage('Generation cancelled');
  };

  const handleConfirmConflicts = async () => {
    if (!pendingMarkdown) {
      return;
    }

    const configMetadata = getConfigMetadata();
    const resolvedValues: Partial<Record<MetadataKey, string>> = {};

    conflicts.forEach((conflict) => {
      const selectedSource = conflictSelections[conflict.key];
      if (!selectedSource) {
        return;
      }
      resolvedValues[conflict.key] =
        selectedSource === 'markdown' ? conflict.markdownValue : conflict.configValue;
    });

    const updatedMarkdown = applyResolvedMetadata(pendingMarkdown, resolvedValues);
    const effectiveMetadata = getEffectiveMetadata(updatedMarkdown, configMetadata, resolvedValues);

    setMarkdown(updatedMarkdown);
    setConflictModalOpen(false);
    setPendingMarkdown(null);
    setConflicts([]);
    setConflictSelections({});

    try {
      await requestPdf(updatedMarkdown, effectiveMetadata);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unexpected error');
    }
  };

  const handleKeepHeadings = async () => {
    if (!pendingMarkdownForHeadings) return;
    const md = pendingMarkdownForHeadings;
    setPendingMarkdownForHeadings(null);
    setHeadingPromoteModalOpen(false);
    await continueGeneratePdf(md);
  };

  const handlePromoteHeadings = async () => {
    if (!pendingMarkdownForHeadings) return;
    const promoted = promoteHeadings(pendingMarkdownForHeadings);
    setMarkdown(promoted);
    setPendingMarkdownForHeadings(null);
    setHeadingPromoteModalOpen(false);
    await continueGeneratePdf(promoted);
  };

  const handleCancelMissingTitle = () => {
    setMissingTitleModalOpen(false);
    setPendingMarkdownForTitle(null);
    setStatus('idle');
    setStatusMessage('Generation cancelled: title is required');
  };

  const handleConfirmMissingTitle = async (title: string) => {
    if (!pendingMarkdownForTitle) {
      return;
    }

    const updatedMarkdown = applyResolvedMetadata(pendingMarkdownForTitle, {
      title: title.trim()
    });

    setMarkdown(updatedMarkdown);
    setMissingTitleModalOpen(false);
    setPendingMarkdownForTitle(null);

    await generatePdf(updatedMarkdown);
  };

  const handleDropMarkdownFile = (content: string, fileName: string) => {
    const normalized = normalizeDashedCodeFences(content);
    const ensured = ensureMetadataFrontmatter(normalized, getConfigMetadata());
    setMarkdown(ensured);
    setStatus('idle');
    setStatusMessage(`Archivo cargado: ${fileName}`);
  };

  return (
    <main className="p-4 md:p-6">
      <Toolbar
        onGenerate={() => generatePdf(markdown)}
        onShare={() => setShareModalOpen(true)}
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
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          metadataPendingCount={metadataStats.pending}
          metadataResolvedCount={metadataStats.resolved}
          onDropMarkdownFile={handleDropMarkdownFile}
        />
        <PDFPreview blob={pdfBlob} enabled={previewActive} />
      </section>

      <ConfigPanel
        open={configOpen}
        initialTarget={configEditTarget}
        onClose={() => setConfigOpen(false)}
      />

      <MetadataConflictModal
        open={conflictModalOpen}
        conflicts={conflicts}
        selections={conflictSelections}
        onSelect={handleSelectConflict}
        onCancel={handleCancelConflicts}
        onConfirm={handleConfirmConflicts}
      />

      <HeadingPromoteModal
        open={headingPromoteModalOpen}
        h1Count={1}
        h2Count={pendingMarkdownForHeadings ? analyzeHeadingStructure(pendingMarkdownForHeadings).h2Count : 0}
        onKeep={handleKeepHeadings}
        onPromote={handlePromoteHeadings}
      />

      <MissingTitleModal
        open={missingTitleModalOpen}
        onCancel={handleCancelMissingTitle}
        onConfirm={handleConfirmMissingTitle}
      />

      <ShareModal
        open={shareModalOpen}
        markdown={markdown}
        onClose={() => setShareModalOpen(false)}
      />
    </main>
  );
}
