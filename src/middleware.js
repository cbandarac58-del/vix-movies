import { defineMiddleware } from 'astro:middleware';
import { getSiteAdsScript } from './utils/site-ads.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  const type = response.headers.get('content-type') || '';

  // HTML pages only
  if (!type.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  /*
   * Favicon
   */
  if (!html.includes('rel="icon"')) {
    html = html.replace(
      '</head>',
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" /></head>'
    );
  }

  /*
   * Global Vix Movies Ads
   *
   * This is injected into every HTML page automatically.
   * New .astro pages will also receive ads.
   */
  if (!html.includes('__VIX_GLOBAL_ADS_LOADED')) {
    html = html.replace(
      '</body>',
      getSiteAdsScript() + '</body>'
    );
  }

  const headers = new Headers(response.headers);

  // Body size changed after HTML injection
  headers.delete('content-length');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
