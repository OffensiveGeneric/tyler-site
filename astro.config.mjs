// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

import react from '@astrojs/react';
import node from '@astrojs/node';
import responsiveBlogImages from './src/markdown/responsive-blog-images.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://ooknulsus.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  markdown: {
    processor: satteri({
      hastPlugins: [responsiveBlogImages()],
    }),
  },
});
