'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  AUTHOR_DEFAULTS,
  COMPANY_COLOR_DEFAULTS,
  COMPANY_DEFAULTS,
  type AppConfig,
  type Author,
  type Company
} from '@/types/config';

const defaultConfig: AppConfig = {
  authors: [
    {
      id: createId(),
      ...AUTHOR_DEFAULTS
    }
  ],
  companies: [
    {
      id: createId(),
      ...COMPANY_DEFAULTS,
      colors: COMPANY_COLOR_DEFAULTS
    }
  ],
  activeAuthorId: '',
  activeCompanyId: ''
};

type LegacyAppConfig = {
  author?: {
    name?: string;
    email?: string;
    role?: string;
  };
  company?: {
    name?: string;
    images?: {
      cover?: string;
      header?: string;
    };
    colors?: {
      mainColor?: string;
      secondaryColor?: string;
      bgDarkObsidian?: string;
      bgDarkGray?: string;
      bgMediumGray?: string;
      bgLightGray?: string;
    };
  };
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function mergeAuthor(author?: Partial<Author>): Author {
  return {
    id: author?.id || createId(),
    ...AUTHOR_DEFAULTS,
    ...author
  };
}

type CompanyInput = {
  id?: string;
  name?: string;
  images?: {
    cover?: string;
    header?: string;
  };
  colors?: {
    mainColor?: string;
    secondaryColor?: string;
    bgDarkObsidian?: string;
    bgDarkGray?: string;
    bgMediumGray?: string;
    bgLightGray?: string;
  };
};

function mergeCompany(company?: CompanyInput): Company {
  return {
    id: company?.id || createId(),
    ...COMPANY_DEFAULTS,
    ...company,
    images: {
      ...COMPANY_DEFAULTS.images,
      ...company?.images
    },
    colors: {
      ...COMPANY_COLOR_DEFAULTS,
      ...company?.colors
    }
  };
}

function normalizeConfig(config: AppConfig | LegacyAppConfig | undefined): AppConfig {
  const legacyAuthor = config && 'author' in config ? config.author : undefined;
  const legacyCompany = config && 'company' in config ? config.company : undefined;
  const hasModernShape = Boolean(config && 'authors' in config && 'companies' in config);

  const authors = hasModernShape
    ? ((config as AppConfig).authors || []).map((author) => mergeAuthor(author))
    : [mergeAuthor(legacyAuthor)];

  const companies = hasModernShape
    ? ((config as AppConfig).companies || []).map((company) => mergeCompany(company))
    : [mergeCompany(legacyCompany)];

  const safeAuthors = authors.length > 0 ? authors : [mergeAuthor()];
  const safeCompanies = companies.length > 0 ? companies : [mergeCompany()];

  const modern = hasModernShape ? (config as AppConfig) : undefined;
  const nextActiveAuthorId =
    modern?.activeAuthorId && safeAuthors.some((author) => author.id === modern.activeAuthorId)
      ? modern.activeAuthorId
      : safeAuthors[0].id;
  const nextActiveCompanyId =
    modern?.activeCompanyId && safeCompanies.some((company) => company.id === modern.activeCompanyId)
      ? modern.activeCompanyId
      : safeCompanies[0].id;

  return {
    authors: safeAuthors,
    companies: safeCompanies,
    activeAuthorId: nextActiveAuthorId,
    activeCompanyId: nextActiveCompanyId
  };
}

type ConfigContextValue = {
  config: AppConfig;
  setConfig: Dispatch<SetStateAction<AppConfig>>;
  activeAuthor: Author;
  activeCompany: Company;
  setActiveAuthor: (authorId: string) => void;
  setActiveCompany: (companyId: string) => void;
  addAuthor: () => void;
  addCompany: () => void;
  updateActiveAuthor: (patch: Partial<Author>) => void;
  updateActiveCompany: (patch: CompanyInput) => void;
  deleteActiveAuthor: () => boolean;
  deleteActiveCompany: () => boolean;
  importCompany: (company: CompanyInput) => boolean;
  isReady: boolean;
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig, isReady] = useLocalStorage<AppConfig>('reporter-config', defaultConfig);
  const normalizedConfig = useMemo(() => normalizeConfig(config), [config]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const currentSerialized = JSON.stringify(config);
    const normalizedSerialized = JSON.stringify(normalizedConfig);
    if (currentSerialized !== normalizedSerialized) {
      setConfig(normalizedConfig);
    }
  }, [config, isReady, normalizedConfig, setConfig]);

  const activeAuthor = useMemo(
    () =>
      normalizedConfig.authors.find((author) => author.id === normalizedConfig.activeAuthorId) ||
      normalizedConfig.authors[0],
    [normalizedConfig.activeAuthorId, normalizedConfig.authors]
  );

  const activeCompany = useMemo(
    () =>
      normalizedConfig.companies.find((company) => company.id === normalizedConfig.activeCompanyId) ||
      normalizedConfig.companies[0],
    [normalizedConfig.activeCompanyId, normalizedConfig.companies]
  );

  const setActiveAuthor = (authorId: string) => {
    setConfig((current) => {
      const next = normalizeConfig(current);
      if (!next.authors.some((author) => author.id === authorId)) {
        return next;
      }
      return {
        ...next,
        activeAuthorId: authorId
      };
    });
  };

  const setActiveCompany = (companyId: string) => {
    setConfig((current) => {
      const next = normalizeConfig(current);
      if (!next.companies.some((company) => company.id === companyId)) {
        return next;
      }
      return {
        ...next,
        activeCompanyId: companyId
      };
    });
  };

  const addAuthor = () => {
    setConfig((current) => {
      const next = normalizeConfig(current);
      const newAuthor = mergeAuthor({ name: `Author ${next.authors.length + 1}` });
      return {
        ...next,
        authors: [...next.authors, newAuthor],
        activeAuthorId: newAuthor.id
      };
    });
  };

  const addCompany = () => {
    setConfig((current) => {
      const next = normalizeConfig(current);
      const newCompany = mergeCompany({ name: `Company ${next.companies.length + 1}` });
      return {
        ...next,
        companies: [...next.companies, newCompany],
        activeCompanyId: newCompany.id
      };
    });
  };

  const updateActiveAuthor = (patch: Partial<Author>) => {
    setConfig((current) => {
      const next = normalizeConfig(current);
      return {
        ...next,
        authors: next.authors.map((author) =>
          author.id === next.activeAuthorId ? mergeAuthor({ ...author, ...patch }) : author
        )
      };
    });
  };

  const updateActiveCompany = (patch: CompanyInput) => {
    setConfig((current) => {
      const next = normalizeConfig(current);
      return {
        ...next,
        companies: next.companies.map((company) =>
          company.id === next.activeCompanyId ? mergeCompany({ ...company, ...patch }) : company
        )
      };
    });
  };

  const deleteActiveAuthor = () => {
    let deleted = false;
    setConfig((current) => {
      const next = normalizeConfig(current);
      if (next.authors.length <= 1) {
        return next;
      }

      const remaining = next.authors.filter((author) => author.id !== next.activeAuthorId);
      const nextActive = remaining[0]?.id || next.activeAuthorId;
      deleted = true;

      return {
        ...next,
        authors: remaining,
        activeAuthorId: nextActive
      };
    });
    return deleted;
  };

  const deleteActiveCompany = () => {
    let deleted = false;
    setConfig((current) => {
      const next = normalizeConfig(current);
      if (next.companies.length <= 1) {
        return next;
      }

      const remaining = next.companies.filter((company) => company.id !== next.activeCompanyId);
      const nextActive = remaining[0]?.id || next.activeCompanyId;
      deleted = true;

      return {
        ...next,
        companies: remaining,
        activeCompanyId: nextActive
      };
    });
    return deleted;
  };

  const importCompany = (company: CompanyInput) => {
    const normalizedCompany = mergeCompany(company);
    if (!normalizedCompany.name.trim()) {
      return false;
    }

    setConfig((current) => {
      const next = normalizeConfig(current);
      const nextCompany = {
        ...normalizedCompany,
        id: createId()
      };
      return {
        ...next,
        companies: [...next.companies, nextCompany],
        activeCompanyId: nextCompany.id
      };
    });
    return true;
  };

  return (
    <ConfigContext.Provider
      value={{
        config: normalizedConfig,
        setConfig,
        activeAuthor,
        activeCompany,
        setActiveAuthor,
        setActiveCompany,
        addAuthor,
        addCompany,
        updateActiveAuthor,
        updateActiveCompany,
        deleteActiveAuthor,
        deleteActiveCompany,
        importCompany,
        isReady
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used inside ConfigProvider');
  }

  return context;
}
