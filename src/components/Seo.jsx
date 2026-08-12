import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { articles } from '../data/articles'
import { metaForPath, SITE_URL, SITE_NAME, OG_IMAGE } from '../utils/seo'

/**
 * Applies per-route <title>, description, canonical and social tags.
 *
 * React 18 has no built-in metadata hoisting, so this writes to the document
 * head directly. It runs on every navigation, which is what makes each route
 * look like its own page to a crawler instead of a copy of the homepage.
 */

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => k !== 'content' && el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('content', attrs.content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaForPath(pathname, articles);
    // Trailing slash only on the root, so /addition and /addition/ don't become
    // two URLs competing with each other.
    const url = pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname.replace(/\/$/, '')}`;

    document.title = meta.title;

    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: meta.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large',
    });
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: meta.type || 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: OG_IMAGE });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_IN' });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: OG_IMAGE });
  }, [pathname]);

  return null;
}
