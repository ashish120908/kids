/**
 * Generates public/sitemap.xml from the route metadata, so the sitemap can
 * never drift from the app. Runs automatically before every build.
 *
 * The previous sitemap listed 12 URLs and none of the 15 game pages — which
 * are the pages people actually search for ("times tables game for kids").
 */
import { writeFileSync } from 'node:fs';
import { INDEXABLE_ROUTES, SITE_URL } from '../src/utils/seo.js';
import { articles } from '../src/data/articles.js';

const priorityFor = (path) => {
  if (path === '/') return '1.0';
  if (path === '/articles') return '0.9';
  if (path.startsWith('/articles/')) return '0.8';
  if (['/about', '/contact'].includes(path)) return '0.6';
  if (['/privacy', '/terms'].includes(path)) return '0.4';
  return '0.9';                       // game pages: the reason people arrive
};

const changefreqFor = (path) =>
  path === '/' ? 'weekly' : path.startsWith('/articles') ? 'monthly' : 'monthly';

const paths = [
  ...INDEXABLE_ROUTES,
  ...articles.map((a) => `/articles/${a.slug}`),
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url>
    <loc>${SITE_URL}${p === '/' ? '/' : p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(p)}</changefreq>
    <priority>${priorityFor(p)}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
console.log(`sitemap.xml: ${paths.length} URLs`);
