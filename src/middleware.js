import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  let html = await response.text();
  if (!html.includes('rel="icon"')) {
    html = html.replace(
      '</head>',
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" /></head>'
    );
  }

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
