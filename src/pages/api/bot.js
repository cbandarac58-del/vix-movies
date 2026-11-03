// Telegram Inline Search & Promo Bot Webhook - 24/7 on Cloudflare Edge

const RAW_TOKEN_B64 = 'ODkyODYzNjU5NjpBQUYwdmZqYW42MkVMM2dxNXZHa0t2bV9PY2ZweTlYdU0zaw==';

const getBotToken = (locals) => {
  return (
    locals?.runtime?.env?.BOT_TOKEN ||
    import.meta.env.BOT_TOKEN ||
    atob(RAW_TOKEN_B64)
  );
};

export const GET = () => {
  return new Response(
    JSON.stringify({
      status: 'active',
      bot: '@free_movies_stream_bot',
      channel: '@free_movies_stream_hd',
      provider: 'Cloudflare Edge Webhook',
      uptime: '24/7'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export const POST = async ({ request, locals }) => {
  const BOT_TOKEN = getBotToken(locals);
  const TMDB_KEY =
    locals?.runtime?.env?.TMDB_API_KEY ||
    import.meta.env.TMDB_API_KEY;

  const SITE_URL = 'https://movies.vixtube.net';
  const CHANNEL_URL = 'https://t.me/free_movies_stream_hd';
  const CHANNEL_NAME = '@free_movies_stream_hd';

  try {
    const update = await request.json();

    // ==========================================
    // 1. INLINE SEARCH QUERY (@free_movies_stream_bot query)
    // ==========================================
    if (update.inline_query) {
      const q = (update.inline_query.query || '').trim();
      const qId = update.inline_query.id;

      let items = [];

      if (q && TMDB_KEY) {
        try {
          const tmdbRes = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&include_adult=false`
          );
          const data = await tmdbRes.json();
          items = (data.results || []).filter(
            (i) =>
              (i.media_type === 'movie' || i.media_type === 'tv') &&
              !i.adult &&
              i.poster_path
          );
        } catch (e) {
          console.error('TMDB Search error:', e);
        }
      }

      // If no query or no search results, show trending items
      if (items.length === 0 && TMDB_KEY) {
        try {
          const trendRes = await fetch(
            `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}`
          );
          const data = await trendRes.json();
          items = (data.results || []).filter((i) => i.poster_path);
        } catch (e) {
          console.error('TMDB Trending error:', e);
        }
      }

      const results = items.slice(0, 10).map((item, idx) => {
        const isTv = item.media_type === 'tv';
        const title = isTv ? (item.name || 'TV Series') : (item.title || 'Movie');
        const typeLabel = isTv ? 'TV Series' : 'Movie';
        const typePath = isTv ? 'tv' : 'movie';
        const url = `${SITE_URL}/${typePath}/${item.id}`;
        const posterUrl = `https://image.tmdb.org/t/p/w200${item.poster_path}`;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.0';

        return {
          type: 'article',
          id: `${item.id}_${idx}`,
          title: `🎬 ${title} (${typeLabel})`,
          description: `⭐ Rating: ${rating}/10 | Tap to share HD link & join channel`,
          thumb_url: posterUrl,
          input_message_content: {
            message_text: `🎬 **${title}** (${typeLabel})\n\n⭐ **Rating:** ${rating}/10\n🍿 **Watch in Full HD:** [Click Here to Stream](${url})\n\n👉 **Join our Channel for Daily HD Movies:** ${CHANNEL_NAME}`,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          },
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🍿 Watch in HD', url: url },
                { text: '📢 Join Official Channel', url: CHANNEL_URL }
              ]
            ]
          }
        };
      });

      // Send answerInlineQuery back to Telegram
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/answerInlineQuery`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inline_query_id: qId,
            results: results,
            cache_time: 15
          })
        }
      );
    }

    // ==========================================
    // 2. DIRECT MESSAGE OR /start COMMAND
    // ==========================================
    if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';

      const welcomeText =
        `👋 **Welcome to HD Movies Hub Bot!**\n\n` +
        `🍿 **Instant Movie & Series Search:**\n` +
        `Type \`@free_movies_stream_bot <movie name>\` in any chat or group to get and share instant HD streaming links!\n\n` +
        `📢 **Join our official channel for daily releases:**\n${CHANNEL_NAME}`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 200, // Return 200 to Telegram so it doesn't repeatedly retry failed requests
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
