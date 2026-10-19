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
     * TELEGRAM FLOATING BANNER
     * =====================================
     */
    const telegramBanner = `
<div id="vix-tg-banner" class="vix-tg-wrap" style="display:none;">
  <button id="vix-tg-close" class="vix-tg-close" aria-label="Close">&times;</button>
  <a href="https://t.me/free_movies_stream_hd" target="_blank" rel="noopener noreferrer" class="vix-tg-link">
    <div class="vix-tg-icon">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#ffffff">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
      </svg>
    </div>
    <div class="vix-tg-text">
      <div class="vix-tg-title">HD Movies Hub <span class="vix-tg-badge">Telegram</span></div>
      <div class="vix-tg-sub">Daily HD Releases & Updates</div>
    </div>
    <div class="vix-tg-btn">JOIN</div>
  </a>
</div>
<style>
.vix-tg-wrap {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999999;
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(14, 165, 233, 0.2);
  padding: 10px 14px 10px 12px;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: vixSlideUp 0.5s ease-out forwards;
  max-width: 380px;
}
@keyframes vixSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.vix-tg-wrap:hover {
  border-color: #38bdf8;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.35);
  transform: translateY(-2px);
}
.vix-tg-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}
.vix-tg-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2AABEE 0%, #229ED9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(34, 158, 217, 0.4);
}
.vix-tg-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}
.vix-tg-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: system-ui, -apple-system, sans-serif;
}
.vix-tg-badge {
  background: #0284c7;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.vix-tg-sub {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  font-family: system-ui, -apple-system, sans-serif;
}
.vix-tg-btn {
  background: #229ED9;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;
  font-family: system-ui, -apple-system, sans-serif;
}
.vix-tg-wrap:hover .vix-tg-btn {
  background: #38bdf8;
  transform: scale(1.05);
}
.vix-tg-close {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  background: #1e293b;
  border: 1px solid #475569;
  color: #cbd5e1;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  transition: all 0.2s ease;
}
.vix-tg-close:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}
@media (max-width: 640px) {
  .vix-tg-wrap {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
    padding: 8px 12px;
  }
  .vix-tg-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>
<script>
(function() {
  if (sessionStorage.getItem('vix_tg_dismissed')) return;
  setTimeout(function() {
    var b = document.getElementById('vix-tg-banner');
    if (b) b.style.display = 'flex';
  }, 1200);
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'vix-tg-close') {
      var b = document.getElementById('vix-tg-banner');
      if (b) b.style.display = 'none';
      sessionStorage.setItem('vix_tg_dismissed', '1');
    }
  });
})();
</script>`;

    if (!html.includes('vix-tg-banner')) {
      html = html.replace(
        '</body>',
        `${telegramBanner}</body>`
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