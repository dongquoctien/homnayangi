import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://dongquoctien.github.io',
  base: '/homnayangi',
  output: 'static',
  integrations: [
    react(),
  ],
  vite: {
    ssr: {
      noExternal: ['lucide-react'],
    },
  },
});
