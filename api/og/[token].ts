// api/og/[token].ts - Vercel Serverless Function for Open Graph previews
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Bot user agents that need OG meta tags
const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'Slackbot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
];

function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENTS.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateStaticMapUrl(lat: number | null, lng: number | null): string | null {
  if (!lat || !lng) return null;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=600x400&markers=${lat},${lng},red-pushpin`;
}

interface OgData {
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
}

function generateOgHtml(data: OgData): string {
  const imageMetaTags = data.imageUrl
    ? `
  <meta property="og:image" content="${escapeHtml(data.imageUrl)}">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="400">
  <meta name="twitter:image" content="${escapeHtml(data.imageUrl)}">`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)}</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(data.title)}">
  <meta property="og:description" content="${escapeHtml(data.description)}">
  <meta property="og:url" content="${escapeHtml(data.url)}">${imageMetaTags}
  <meta name="twitter:card" content="${data.imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(data.title)}">
  <meta name="twitter:description" content="${escapeHtml(data.description)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(data.url)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(data.url)}">Where Did I Park?</a></p>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'];
  const token = req.query.token as string;
  const host = req.headers.host || 'wdip.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const originalUrl = `${protocol}://${host}/s/${token}`;

  if (!isBot(userAgent)) {
    return res.redirect(302, originalUrl);
  }

  try {
    const apiUrl = process.env.VITE_API_URL || 'https://first-bmad-api.vercel.app';
    const response = await fetch(`${apiUrl}/v1/share/${token}`);

    let ogData: OgData;

    if (!response.ok) {
      ogData = {
        title: 'Shared Parking Spot',
        description: 'This shared link may have expired',
        imageUrl: null,
        url: originalUrl,
      };
    } else {
      const spot = await response.json();
      const imageUrl = spot.photoUrl || generateStaticMapUrl(spot.lat, spot.lng);
      ogData = {
        title: 'Shared Parking Spot',
        description: spot.address || `Location: ${spot.lat?.toFixed(4)}N, ${spot.lng?.toFixed(4)}E`,
        imageUrl,
        url: originalUrl,
      };
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(generateOgHtml(ogData));
  } catch (error) {
    console.error('OG handler error:', error);
    return res.redirect(302, originalUrl);
  }
}
