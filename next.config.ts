import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true
  },
  outputFileTracingRoot: path.resolve(__dirname),
  outputFileTracingIncludes: {
    '/api/generate': ['./base_report/**/*', './public/base_report/**/*']
  },
  serverExternalPackages: ['puppeteer']
};

export default nextConfig;
