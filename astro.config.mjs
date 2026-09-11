import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vixmovies.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    sitemap({
      // SSR ([id]) dynamic routes නිසා එන build error එක වැළැක්වීමට
      filter: (page) => !page.includes('[id]'),
    }),
  ],
});
