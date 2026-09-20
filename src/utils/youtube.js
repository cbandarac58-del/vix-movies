import { SPORTS } from './sports-config.js';

const API = 'https://www.googleapis.com/youtube/v3';

// Calls the YouTube Data API. Errors are never cached, so a quota problem does not stick.
async function yt(path, params, key, ttl) {
  const qs = new URLSearchParams({ ...params, key });
  try {
    const r = await fetch(`${API}/${path}?${qs}`, {
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: { '200-299': ttl, '400-599': -1 },
      },
    });
    let data = null;
    try {
      data = await r.json();
    } catch {
      data = null;
    }
    return { ok: r.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

// Turn an @handle into channel info (cached for a day)
async function getChannel(handle, key) {
  const r = await yt('channels', { part: 'snippet,contentDetails', forHandle: handle }, key, 86400);
  if (!r.ok) return { channel: null, error: true };
  const c = r.data?.items?.[0];
  if (!c) return { channel: null, error: false };
  return {
    channel: {
      id: c.id,
      title: c.snippet?.title || handle,
      uploads: c.contentDetails?.relatedPlaylists?.uploads,
    },
    error: false,
  };
}

const mapVideo = (v) => ({
  id: v.id,
  title: v.snippet?.title || '',
  description: v.snippet?.description || '',
  published: v.snippet?.publishedAt,
  channelId: v.snippet?.channelId || '',
  channelTitle: v.snippet?.channelTitle || '',
  live: v.snippet?.liveBroadcastContent || 'none', // live | upcoming | none
  duration: v.contentDetails?.duration || '',
  liveStart:
    v.liveStreamingDetails?.actualStartTime || v.liveStreamingDetails?.scheduledStartTime || '',
  liveEnd: v.liveStreamingDetails?.actualEndTime || '',
  thumb:
    v.snippet?.thumbnails?.high?.url ||
    v.snippet?.thumbnails?.medium?.url ||
    `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
});

// "PT1H2M3S" -> seconds
export function durationSeconds(iso = '') {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

// "PT1H2M3S" -> "1h 2m"
export function durationText(iso = '') {
  const total = durationSeconds(iso);
  if (!total) return '';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (!h && s) parts.push(`${s}s`);
  return parts.join(' ');
}

// Latest embeddable public videos of one channel
async function getChannelVideos(handle, key, max = 15) {
  const { channel, error } = await getChannel(handle, key);
  if (error) return { videos: [], error: true };
  if (!channel?.uploads) return { videos: [], error: false };

  const list = await yt(
    'playlistItems',
    { part: 'contentDetails', playlistId: channel.uploads, maxResults: String(max) },
    key,
    900
  );
  if (!list.ok) return { videos: [], error: true };

  const ids = (list.data?.items || []).map((i) => i.contentDetails?.videoId).filter(Boolean);
  if (!ids.length) return { videos: [], error: false };

  const vids = await yt(
    'videos',
    { part: 'snippet,status,contentDetails,liveStreamingDetails', id: ids.join(',') },
    key,
    900
  );
  if (!vids.ok) return { videos: [], error: true };

  const videos = (vids.data?.items || [])
    .filter((v) => v.status?.embeddable && v.status?.privacyStatus === 'public')
    .map(mapVideo);
  return { videos, error: false };
}

// Videos from all channels of a sport, newest first.
// error is true only when every channel failed (quota, bad key, network).
export async function getSportVideos(channels, key) {
  const results = await Promise.all(channels.map((h) => getChannelVideos(h, key)));
  const videos = results
    .flatMap((r) => r.videos)
    .sort((a, b) => new Date(b.published) - new Date(a.published));
  const error = results.length > 0 && results.every((r) => r.error);
  return { videos, error };
}

// One video. error = API problem (show 503). video = null with no error = really not found (404).
export async function getVideo(id, key) {
  const r = await yt(
    'videos',
    { part: 'snippet,status,contentDetails,liveStreamingDetails', id },
    key,
    21600
  );
  if (!r.ok) return { video: null, error: true };
  const v = r.data?.items?.[0];
  if (!v || !v.status?.embeddable || v.status?.privacyStatus !== 'public') {
    return { video: null, error: false };
  }
  return { video: mapVideo(v), error: false };
}

// Which sport does a channel belong to? (channel lookups are cached for a day)
export async function findSportForChannel(channelId, key) {
  if (!channelId) return null;
  const pairs = SPORTS.flatMap((s) => s.channels.map((h) => ({ sport: s, handle: h })));
  const found = await Promise.all(pairs.map((p) => getChannel(p.handle, key)));
  const idx = found.findIndex((f) => f.channel?.id === channelId);
  return idx >= 0 ? pairs[idx].sport : null;
}
