const API = 'https://www.googleapis.com/youtube/v3';

// Calls the YouTube Data API. Results are cached by Cloudflare to save quota.
async function yt(path, params, key, ttl) {
  const qs = new URLSearchParams({ ...params, key });
  try {
    const r = await fetch(`${API}/${path}?${qs}`, {
      cf: { cacheTtl: ttl, cacheEverything: true },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// Turn an @handle into channel info (cached for a day)
async function getChannel(handle, key) {
  const d = await yt('channels', { part: 'snippet,contentDetails', forHandle: handle }, key, 86400);
  const c = d?.items?.[0];
  if (!c) return null;
  return {
    id: c.id,
    title: c.snippet?.title || handle,
    uploads: c.contentDetails?.relatedPlaylists?.uploads,
  };
}

const mapVideo = (v, handle) => ({
  id: v.id,
  title: v.snippet?.title || '',
  description: v.snippet?.description || '',
  published: v.snippet?.publishedAt,
  channelTitle: v.snippet?.channelTitle || '',
  channelHandle: handle || '',
  live: v.snippet?.liveBroadcastContent || 'none', // live | upcoming | none
  thumb:
    v.snippet?.thumbnails?.high?.url ||
    v.snippet?.thumbnails?.medium?.url ||
    `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
});

// Latest embeddable public videos of one channel
async function getChannelVideos(handle, key, max = 15) {
  const ch = await getChannel(handle, key);
  if (!ch?.uploads) return [];

  const list = await yt(
    'playlistItems',
    { part: 'contentDetails', playlistId: ch.uploads, maxResults: String(max) },
    key,
    600
  );
  const ids = (list?.items || []).map((i) => i.contentDetails?.videoId).filter(Boolean);
  if (!ids.length) return [];

  const vids = await yt('videos', { part: 'snippet,status', id: ids.join(',') }, key, 600);
  return (vids?.items || [])
    .filter((v) => v.status?.embeddable && v.status?.privacyStatus === 'public')
    .map((v) => mapVideo(v, handle));
}

// Videos from all channels of a sport, newest first
export async function getSportVideos(channels, key) {
  const results = await Promise.all(channels.map((h) => getChannelVideos(h, key)));
  return results
    .flat()
    .sort((a, b) => new Date(b.published) - new Date(a.published));
}

// One video (returns null if it does not exist or cannot be embedded)
export async function getVideo(id, key) {
  const d = await yt('videos', { part: 'snippet,status', id }, key, 600);
  const v = d?.items?.[0];
  if (!v || !v.status?.embeddable || v.status?.privacyStatus !== 'public') return null;
  return mapVideo(v, '');
}
