import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://movies.vixtube.net',
  output: 'server',
  adapter: cloudflare(),
  image: {
    domains: ['image.tmdb.org'],
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org' }],
  },
});