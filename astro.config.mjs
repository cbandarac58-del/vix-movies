import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vixmovies.com', // ඔයාගේ Domain/Cloudflare URL එක
  output: 'server',
  adapter: cloudflare(),
  integrations: [sitemap()]
});
