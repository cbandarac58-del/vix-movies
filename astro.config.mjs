import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://movies.vixtube.net', // ඔයාගේ සයිට් එකේ ඇතුළත් කරලා තියෙන ඩොමේන් නේම් එක මෙතැනට දෙන්න
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    sitemap({
      // Dynamic [id] හෝ වෙනත් pages sitemap එකේදී build error එකක් නොඑන්න filter කිරීම
      filter: (page) => !page.includes('/movie/') && !page.includes('/tv/'),
    }),
  ],
});
