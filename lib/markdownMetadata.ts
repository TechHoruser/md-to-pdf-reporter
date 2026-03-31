export type MetadataKey = 'author' | 'company' | 'title' | 'version' | 'date' | 'main-color';

type ParsedMetadataEntry = {
  value: string;
  locked: boolean;
};

type ParsedMetadata = {
  hasFrontmatter: boolean;
  metadata: Partial<Record<MetadataKey, ParsedMetadataEntry>>;
  order: MetadataKey[];
  body: string;
};

const METADATA_LINE_REGEX = /^\s*(-\s+)?([a-zA-Z0-9_-]+)\s*:\s*(.*?)\s*$/;
const FRONTMATTER_SEPARATOR = /^---\s*$/;

export const SUPPORTED_METADATA_KEYS: MetadataKey[] = [
  'author',
  'company',
  'title',
  'version',
  'date',
  'main-color'
];

function toMetadataKey(input: string): MetadataKey | null {
  const normalized = input.trim().toLowerCase();
  return SUPPORTED_METADATA_KEYS.find((key) => key === normalized) || null;
}

function buildFrontmatterBlock(metadata: Partial<Record<MetadataKey, ParsedMetadataEntry>>, order: MetadataKey[]): string {
  const lines = order
    .filter((key) => metadata[key])
    .map((key) => {
      const entry = metadata[key];
      if (!entry) {
        return '';
      }
      const prefix = entry.locked ? '- ' : '';
      return `${prefix}${key}: ${entry.value}`;
    })
    .filter(Boolean);

  return ['---', ...lines, '---'].join('\n');
}

export function parseLeadingMetadata(markdown: string): ParsedMetadata {
  const lines = markdown.split('\n');
  const firstLine = lines[0] || '';
  if (!FRONTMATTER_SEPARATOR.test(firstLine.trim())) {
    return {
      hasFrontmatter: false,
      metadata: {},
      order: [],
      body: markdown
    };
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (FRONTMATTER_SEPARATOR.test(lines[i].trim())) {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex < 0) {
    return {
      hasFrontmatter: false,
      metadata: {},
      order: [],
      body: markdown
    };
  }

  const metadata: Partial<Record<MetadataKey, ParsedMetadataEntry>> = {};
  const order: MetadataKey[] = [];
  const metadataLines = lines.slice(1, closingIndex);

  metadataLines.forEach((line) => {
    const match = line.match(METADATA_LINE_REGEX);
    if (!match) {
      return;
    }

    const key = toMetadataKey(match[2]);
    if (!key) {
      return;
    }

    if (!order.includes(key)) {
      order.push(key);
    }

    metadata[key] = {
      value: match[3].trim(),
      locked: Boolean(match[1])
    };
  });

  return {
    hasFrontmatter: true,
    metadata,
    order,
    body: lines.slice(closingIndex + 1).join('\n')
  };
}

export function ensureMetadataFrontmatter(
  markdown: string,
  defaults: Partial<Record<MetadataKey, string>>
): string {
  const parsed = parseLeadingMetadata(markdown);
  if (parsed.hasFrontmatter) {
    return markdown;
  }

  const metadata: Partial<Record<MetadataKey, ParsedMetadataEntry>> = {};
  const order: MetadataKey[] = [];

  SUPPORTED_METADATA_KEYS.forEach((key) => {
    const value = (defaults[key] || '').trim();
    if (!value) {
      return;
    }

    metadata[key] = {
      value,
      locked: false
    };
    order.push(key);
  });

  const block = buildFrontmatterBlock(metadata, order);
  const body = markdown.replace(/^\n+/, '');
  return body ? `${block}\n\n${body}` : `${block}\n`;
}

export type MetadataConflict = {
  key: MetadataKey;
  markdownValue: string;
  configValue: string;
};

export function getMetadataConflicts(
  markdown: string,
  configValues: Partial<Record<MetadataKey, string>>
): MetadataConflict[] {
  const parsed = parseLeadingMetadata(markdown);
  const conflicts: MetadataConflict[] = [];

  SUPPORTED_METADATA_KEYS.forEach((key) => {
    const markdownEntry = parsed.metadata[key];
    const configValue = (configValues[key] || '').trim();

    if (!markdownEntry || markdownEntry.locked || !configValue) {
      return;
    }

    const markdownValue = markdownEntry.value.trim();
    if (!markdownValue || markdownValue === configValue) {
      return;
    }

    conflicts.push({
      key,
      markdownValue,
      configValue
    });
  });

  return conflicts;
}

export function applyResolvedMetadata(
  markdown: string,
  resolvedValues: Partial<Record<MetadataKey, string>>
): string {
  const parsed = parseLeadingMetadata(markdown);
  const metadata: Partial<Record<MetadataKey, ParsedMetadataEntry>> = {
    ...parsed.metadata
  };
  const order = [...parsed.order];

  Object.entries(resolvedValues).forEach(([rawKey, rawValue]) => {
    const key = toMetadataKey(rawKey);
    if (!key) {
      return;
    }

    const value = (rawValue || '').trim();
    if (!value) {
      return;
    }

    metadata[key] = {
      value,
      locked: true
    };

    if (!order.includes(key)) {
      order.push(key);
    }
  });

  const block = buildFrontmatterBlock(metadata, order.length > 0 ? order : SUPPORTED_METADATA_KEYS);
  const body = (parsed.hasFrontmatter ? parsed.body : markdown).replace(/^\n+/, '');
  return body ? `${block}\n\n${body}` : `${block}\n`;
}

export function getEffectiveMetadata(
  markdown: string,
  configValues: Partial<Record<MetadataKey, string>>,
  overrides?: Partial<Record<MetadataKey, string>>
): Partial<Record<MetadataKey, string>> {
  const parsed = parseLeadingMetadata(markdown);
  const effective: Partial<Record<MetadataKey, string>> = {
    ...configValues
  };

  SUPPORTED_METADATA_KEYS.forEach((key) => {
    const markdownValue = parsed.metadata[key]?.value?.trim();
    if (markdownValue) {
      effective[key] = markdownValue;
    }
  });

  Object.entries(overrides || {}).forEach(([rawKey, rawValue]) => {
    const key = toMetadataKey(rawKey);
    if (!key) {
      return;
    }

    const value = (rawValue || '').trim();
    if (value) {
      effective[key] = value;
    }
  });

  return effective;
}

export function normalizeDashedCodeFences(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => line.replace(/^(\s*)-```/, '$1```'))
    .join('\n');
}

export type HeadingAnalysis = {
  h1Count: number;
  h2Count: number;
};

export function analyzeHeadingStructure(markdown: string): HeadingAnalysis {
  const parsed = parseLeadingMetadata(markdown);
  const content = parsed.hasFrontmatter ? parsed.body : markdown;

  let inCodeBlock = false;
  let h1Count = 0;
  let h2Count = 0;

  for (const line of content.split('\n')) {
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (/^# /.test(line)) h1Count++;
    else if (/^## /.test(line)) h2Count++;
  }

  return { h1Count, h2Count };
}

export function promoteHeadings(markdown: string): string {
  const parsed = parseLeadingMetadata(markdown);
  const frontmatter = parsed.hasFrontmatter
    ? markdown.slice(0, markdown.length - parsed.body.length)
    : '';
  const content = parsed.hasFrontmatter ? parsed.body : markdown;

  let inCodeBlock = false;
  const lines = content.split('\n').map((line) => {
    if (/^(`{3,}|~{3,})/.test(line)) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    // Eliminar la línea H1 (el único #)
    if (/^# /.test(line)) return null;
    // Promover los demás títulos un nivel
    if (/^#{2,} /.test(line)) return line.slice(1);
    return line;
  });

  const promoted = lines.filter((l) => l !== null).join('\n');
  return frontmatter + promoted;
}
