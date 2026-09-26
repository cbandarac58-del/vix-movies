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
     * ================================
     * FAVICON
     * ================================
     */

    if (!html.includes('rel="icon"')) {

      html = html.replace(
        '</head>',
        '<link rel="icon" type="image/svg+xml" href="/favicon.svg" /></head>'
      );

    }

    /*
     * ================================
     * ADSTERRA SOCIAL BAR
     * ================================
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
     * ================================
     * RETURN HTML
     * ================================
     */

    const headers =
      new Headers(response.headers);

    headers.delete('content-length');

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
