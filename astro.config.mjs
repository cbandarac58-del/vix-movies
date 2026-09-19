import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://movies.vixtube.net',
  output: 'server',
  adapter: cloudflare(),
});
