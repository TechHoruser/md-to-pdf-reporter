'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { COMPANY_COLOR_DEFAULTS, type AppConfig } from '@/types/config';

const defaultConfig: AppConfig = {
  author: {
    name: 'Author',
    email: '',
    role: ''
  },
  company: {
    name: 'Company',
    images: {
      cover: '',
      header: ''
    },
    colors: COMPANY_COLOR_DEFAULTS
  }
};

function mergeConfig(config: AppConfig): AppConfig {
  return {
    author: {
      ...defaultConfig.author,
      ...config.author
    },
    company: {
      ...defaultConfig.company,
      ...config.company,
      images: {
        ...defaultConfig.company.images,
        ...config.company.images
      },
      colors: {
        ...COMPANY_COLOR_DEFAULTS,
        ...config.company.colors
      }
    }
  };
}

type ConfigContextValue = {
  config: AppConfig;
  setConfig: Dispatch<SetStateAction<AppConfig>>;
  isReady: boolean;
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig, isReady] = useLocalStorage<AppConfig>('reporter-config', defaultConfig);
  const normalizedConfig = useMemo(() => mergeConfig(config), [config]);

  useEffect(() => {
    const currentSerialized = JSON.stringify(config);
    const normalizedSerialized = JSON.stringify(normalizedConfig);
    if (currentSerialized !== normalizedSerialized) {
      setConfig(normalizedConfig);
    }
  }, [config, normalizedConfig, setConfig]);

  return (
    <ConfigContext.Provider
      value={{
        config: normalizedConfig,
        setConfig,
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
