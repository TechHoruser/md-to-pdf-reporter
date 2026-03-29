import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true
  },
  outputFileTracingRoot: path.join(__dirname, '..'),
  serverExternalPackages: ['puppeteer']
};

export default nextConfig;
