// Telegram Search & Promo Bot Webhook - 24/7 on Cloudflare Edge

const RAW_TOKEN_B64 = 'ODkyODYzNjU5NjpBQUYwdmZqYW42MkVMM2dxNXZHa0t2bV9PY2ZweTlYdU0zaw==';
const BOT_TOKEN = atob(RAW_TOKEN_B64);
const SITE_URL = 'https://movies.vixtube.net';
const CHANNEL_NAME = '@free_movies_stream_hd';
const CHANNEL_URL = 'https://t.me/free_movies_stream_hd';

export const GET = () => {
  return new Response(
    JSON.stringify({
      status: 'active',
      bot: '@free_movies_stream_bot',
      channel: CHANNEL_NAME,
      provider: 'Cloudflare Edge Webhook',
      features: ['direct_chat_search', 'inline_search', 'force_join_ready'],
      uptime: '24/7'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

// Helper to search movies from site HTML
async function searchMovies(query, tmdbKey) {
  let items = [];

  // 1. Try TMDB API if key available
  if (tmdbKey && query) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&include_adult=false`
      );
      if (res.ok) {
        const data = await res.json();
        items = (data.results || [])
          .filter(i => (i.media_type === 'movie' || i.media_type === 'tv') && !i.adult)
          .map(i => {
            const isTv = i.media_type === 'tv';
            return {
              id: i.id,
              type: isTv ? 'tv' : 'movie',
              typeLabel: isTv ? 'TV Series' : 'Movie',
              title: isTv ? (i.name || 'TV Series') : (i.title || 'Movie'),
              poster: i.poster_path ? `https://image.tmdb.org/t/p/w500${i.poster_path}` : null,
              rating: i.vote_average ? i.vote_average.toFixed(1) : '8.0',
              url: `${SITE_URL}/${isTv ? 'tv' : 'movie'}/${i.id}`
            };
          });
      }
    } catch (e) {
      console.error('TMDB API error:', e);
    }
  }

  // 2. Scrape site search page if TMDB returned empty
  if (items.length === 0 && query) {
    try {
      const siteRes = await fetch(`${SITE_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (siteRes.ok) {
        const html = await siteRes.text();
        const cardRegex = /<a[^>]+href=["'](\/(movie|tv)\/(\d+))["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        const seen = new Set();
        while ((match = cardRegex.exec(html)) !== null && items.length < 10) {
          const path = match[1];
          const mediaType = match[2];
          const id = match[3];
          const content = match[4];

          if (seen.has(id)) continue;
          seen.add(id);

          const titleMatch = content.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i) || content.match(/alt=["']([^"']+)["']/i);
          let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Watch in HD';

          const imgMatch = content.match(/src=["']([^"']+)["']/i);
          let poster = imgMatch ? imgMatch[1] : null;

          items.push({
            id: id,
            type: mediaType,
            typeLabel: mediaType === 'tv' ? 'TV Series' : 'Movie',
            title: title,
            poster: poster,
            rating: '8.2',
            url: `${SITE_URL}${path}`
          });
        }
      }
    } catch (e) {
      console.error('Site scrape search error:', e);
    }
  }

  return items;
}

export const POST = async ({ request, locals }) => {
  const token = locals?.runtime?.env?.BOT_TOKEN || BOT_TOKEN;
  const tmdbKey = locals?.runtime?.env?.TMDB_API_KEY || import.meta.env?.TMDB_API_KEY;

  try {
    const update = await request.json();

    // ==========================================
    // 1. INLINE QUERY (@free_movies_stream_bot Avatar)
    // ==========================================
    if (update.inline_query) {
      const q = (update.inline_query.query || '').trim();
      const qId = update.inline_query.id;

      const items = await searchMovies(q || 'Avatar', tmdbKey);

      const results = items.slice(0, 10).map((item, idx) => ({
        type: 'article',
        id: `${item.id}_${idx}`,
        title: `🎬 ${item.title} (${item.typeLabel})`,
        description: `⭐ Rating: ${item.rating}/10 | Tap to share HD link & join channel`,
        thumb_url: item.poster || 'https://movies.vixtube.net/no-poster.svg',
        input_message_content: {
          message_text: `🎬 **${item.title}** (${item.typeLabel})\n\n⭐ **Rating:** ${item.rating}/10\n🍿 **Watch in Full HD:** [Click Here to Stream](${item.url})\n\n👉 **Join our Channel for Daily HD Movies:** ${CHANNEL_NAME}`,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        },
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🍿 Watch in HD', url: item.url },
              { text: '📢 Join Official Channel', url: CHANNEL_URL }
            ]
          ]
        }
      }));

      await fetch(`https://api.telegram.org/bot${token}/answerInlineQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inline_query_id: qId,
          results: results,
          cache_time: 15
        })
      });

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ==========================================
    // 2. DIRECT PRIVATE CHAT MESSAGE
    // ==========================================
    if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const text = (update.message.text || '').trim();

      // Check if user is /start or greeting
      if (text.startsWith('/start') || text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello') {
        const welcomeText =
          `👋 **Welcome to HD Movies Hub Bot!** 🍿\n\n` +
          `Search any Movie or TV Series instantly by typing its name here!\n\n` +
          `🔍 **How to use:**\n` +
          `1️⃣ Send any movie name in this chat (e.g. \`Avatar\`, \`Deadpool\`, \`Inception\`)\n` +
          `2️⃣ Or type \`@free_movies_stream_bot movie\` in any group to share HD streaming links!\n\n` +
          `📢 **Join our official channel for daily releases:**\n${CHANNEL_NAME}`;

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📢 Join Official Channel', url: CHANNEL_URL },
                  { text: '🌐 Visit Website', url: SITE_URL }
                ]
              ]
            }
          })
        });

        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // If user typed a search query (e.g. "Avatar", "Deadpool")
      if (text) {
        const cleanQuery = text.replace(/^\/search\s*/i, '').trim();
        const items = await searchMovies(cleanQuery, tmdbKey);

        if (items.length > 0) {
          const topItem = items[0];
          let replyText = `🎬 **Search Results for "${cleanQuery}":**\n\n`;

          items.slice(0, 5).forEach((item, i) => {
            replyText += `${i + 1}. **${item.title}** (${item.typeLabel})\n🍿 [Watch in Full HD](${item.url})\n\n`;
          });

          replyText += `👉 Join for Daily HD Movies & Series: ${CHANNEL_NAME}`;

          const inlineKeyboard = [
            [
              { text: `🍿 Watch ${topItem.title.slice(0, 20)}`, url: topItem.url },
              { text: '📢 Join Channel', url: CHANNEL_URL }
            ],
            [
              { text: '🌐 Browse All Movies on Website', url: `${SITE_URL}/search?q=${encodeURIComponent(cleanQuery)}` }
            ]
          ];

          // If top item has a poster, send as photo with caption
          if (topItem.poster) {
            await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                photo: topItem.poster,
                caption: replyText,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: inlineKeyboard }
              })
            });
          } else {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: replyText,
                parse_mode: 'Markdown',
                disable_web_page_preview: false,
                reply_markup: { inline_keyboard: inlineKeyboard }
              })
            });
          }
        } else {
          // No movies found
          const notFoundText =
            `❌ **No movies found for "${cleanQuery}"**\n\n` +
            `Try searching another title or browse directly on our website:\n${SITE_URL}\n\n` +
            `📢 **Join our official channel:** ${CHANNEL_NAME}`;

          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: notFoundText,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🌐 Visit Website', url: SITE_URL },
                    { text: '📢 Join Channel', url: CHANNEL_URL }
                  ]
                ]
              }
            })
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
