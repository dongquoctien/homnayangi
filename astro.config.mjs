import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// Note: @astrojs/sitemap disabled due to bug with hybrid mode + Vercel adapter
// See: https://github.com/withastro/astro/issues/
// Using static sitemap.xml in public/ directory instead

export default defineConfig({
  site: 'https://homnayanggi.vn',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    react(),
  ],
  vite: {
    ssr: {
      noExternal: ['lucide-react'],
    },
  },
});
