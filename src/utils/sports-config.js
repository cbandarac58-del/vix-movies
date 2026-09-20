// Add or remove sports and channels here. Use the YouTube @handle (with the @).
export const SPORTS = [
  {
    slug: 'cricket',
    name: 'Cricket',
    emoji: '🏏',
    intro: 'Official cricket highlights, match previews and live streams from the biggest cricket channels.',
    channels: ['@icc', '@IPL'],
  },
  {
    slug: 'football',
    name: 'Football',
    emoji: '⚽',
    intro: 'Official football highlights, goals and match previews from the top leagues and competitions.',
    channels: ['@premierleague', '@UEFA', '@LaLiga'],
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    intro: 'Official NBA highlights, top plays and game recaps.',
    channels: ['@NBA'],
  },
  {
    slug: 'formula-1',
    name: 'Formula 1',
    emoji: '🏎️',
    intro: 'Official Formula 1 race highlights, qualifying recaps and press conferences.',
    channels: ['@F1'],
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    emoji: '🎾',
    intro: 'Official tennis match highlights and tournament coverage from the ATP and WTA tours.',
    channels: ['@ATPTour', '@WTA'],
  },
];

export const getSport = (slug) => SPORTS.find((s) => s.slug === slug);
