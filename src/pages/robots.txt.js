export const GET = () =>
  new Response(
    'User-agent: *\nAllow: /\n\nSitemap: https://movies.vixtube.net/sitemap.xml\n',
    { headers: { 'Content-Type': 'text/plain' } }
  );
