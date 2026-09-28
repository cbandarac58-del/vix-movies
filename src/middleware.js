import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(
  async (context, next) => {

    const response = await next();

    const type =
      response.headers.get('content-type') || '';

    if (!type.includes('text/html')) {
      return response;
    }

    let html = await response.text();

    /*
     * =====================================
     * FAVICON
     * =====================================
     */

    if (!html.includes('rel="icon"')) {

      html = html.replace(
        '</head>',
        '<link rel="icon" type="image/svg+xml" href="/favicon.svg" /></head>'
      );

    }

    /*
     * =====================================
     * SOCIAL BAR
     * =====================================
     */

    const socialBar =
      `<script src="https://toleranceteaminadequate.com/6a/9c/5a/6a9c5ac03c309d25864dd0e4fb44207f.js"></script>`;

    if (
      !html.includes(
        '6a9c5ac03c309d25864dd0e4fb44207f.js'
      )
    ) {

      html = html.replace(
        '</body>',
        `${socialBar}</body>`
      );

    }

    /*
     * =====================================
     * RESPONSE & CLOUDFLARE EDGE CACHE HEADERS
     * =====================================
     */

    const headers =
      new Headers(response.headers);

    headers.delete('content-length');

    // Automatically set Cloudflare Edge Cache headers for movie/tv/listing pages
    if (response.status === 200) {
      const url = new URL(context.request.url);
      const path = url.pathname;

      if (
        path.startsWith('/movie/') ||
        path.startsWith('/tv/') ||
        path.startsWith('/person/') ||
        path.startsWith('/genre/') ||
        path.startsWith('/lists') ||
        path.startsWith('/sports') ||
        path === '/' ||
        path === '/hollywood' ||
        path === '/bollywood' ||
        path === '/trending'
      ) {
        // Cache on Cloudflare Edge for 7 days (604800s), Browser for 4 hours (14400s), SWR 1 day
        headers.set('Cache-Control', 'public, max-age=14400, s-maxage=604800, stale-while-revalidate=86400');
        headers.set('Cloudflare-CDN-Cache-Control', 'max-age=604800');
        headers.set('CDN-Cache-Control', 'max-age=604800');
      }
    }

    return new Response(
      html,
      {
        status: response.status,
        statusText: response.statusText,
        headers
      }
    );

  }
);