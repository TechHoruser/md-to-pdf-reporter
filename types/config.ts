export type Author = {
  name: string;
  email?: string;
  role?: string;
};

export type CompanyColors = {
  mainColor: string;
  secondaryColor: string;
  bgDarkObsidian: string;
  bgDarkGray: string;
  bgMediumGray: string;
  bgLightGray: string;
};

export const COMPANY_COLOR_DEFAULTS: CompanyColors = {
  mainColor: '#5F6B7A',
  secondaryColor: '#64748B',
  bgDarkObsidian: '#111827',
  bgDarkGray: '#374151',
  bgMediumGray: '#6B7280',
  bgLightGray: '#E5E7EB'
};

export const COMPANY_COLOR_FIELDS: Array<{
  key: keyof CompanyColors;
  label: string;
}> = [
  { key: 'mainColor', label: 'Main Color' },
  { key: 'secondaryColor', label: 'Secondary Color' },
  { key: 'bgDarkObsidian', label: 'Background Dark Obsidian' },
  { key: 'bgDarkGray', label: 'Background Dark Gray' },
  { key: 'bgMediumGray', label: 'Background Medium Gray' },
  { key: 'bgLightGray', label: 'Background Light Gray' }
];

export type Company = {
  name: string;
  images: {
    cover: string;
    header: string;
  };
  colors: CompanyColors;
};

export type AppConfig = {
  author: Author;
  company: Company;
};
