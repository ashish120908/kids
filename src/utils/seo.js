/**
 * Per-route metadata.
 *
 * KidLearn is a single-page app, so without this every one of its 24 routes
 * served the exact same <title>, description and canonical — all pointing at
 * the homepage. Search engines render the JS and index the routes, then see 24
 * near-duplicate pages and pick one. Giving each route its own title,
 * description and self-referencing canonical is the single biggest SEO win
 * available here, and it costs nothing at runtime.
 */

export const SITE_URL = 'https://kidlearn.in';
export const SITE_NAME = 'KidLearn';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

const t = (title) => `${title} | KidLearn`;

export const ROUTE_META = {
  '/': {
    title: 'KidLearn 🎓 | Free Learning Games for Kids',
    description:
      'Free learning games for children aged 4–10: times tables, addition, counting, telling the time, spelling, rhyming, shapes, colours and memory. No sign-up needed.',
  },

  /* ── Maths ─────────────────────────────────────────────── */
  '/times-tables': {
    title: t('Times Tables Practice Game'),
    description:
      'Practise multiplication tables from 1 to 12 with instant feedback and ten difficulty levels. A free times tables game for children learning to multiply.',
  },
  '/addition': {
    title: t('Addition Game for Kids'),
    description:
      'Practise adding numbers from single digits up to 100 across ten levels. A free addition game that adapts as your child improves.',
  },
  '/subtraction': {
    title: t('Subtraction Game for Kids'),
    description:
      'Practise taking away with answers that never go below zero, across ten levels. A free subtraction game for early primary maths.',
  },
  '/division': {
    title: t('Division Game for Kids'),
    description:
      'Practise dividing with whole-number answers every time, across ten levels. A free division game for children learning to share numbers equally.',
  },
  '/counting': {
    title: t('Counting Game for Preschoolers'),
    description:
      'Count objects on screen and pick the right number, from three items up to thirty. A free counting game for preschool and reception children.',
  },
  '/compare': {
    title: t('Greater Than, Less Than Game'),
    description:
      'Compare two numbers using the >, < and = signs, from single digits to the thousands. A free number comparison game for primary maths.',
  },
  '/clock': {
    title: t('Learn to Tell the Time Game'),
    description:
      'Read an analogue clock and pick the matching time, starting at o’clock and working down to single minutes. A free clock reading game for kids.',
  },

  /* ── Reading & English ─────────────────────────────────── */
  '/alphabet': {
    title: t('Alphabet Order Game'),
    description:
      'Tap the letters in A–Z order, starting with short runs and building to scattered letters from across the alphabet. A free alphabet game for early readers.',
  },
  '/spelling': {
    title: t('Spelling Bee Game for Kids'),
    description:
      'Spell words from a picture, a hint and the spoken word, from three letters up to seven. A free spelling game for children learning to write.',
  },
  '/rhyming': {
    title: t('Rhyming Words Game'),
    description:
      'Hear a word and pick the one that rhymes with it. Builds the phonological awareness that early reading depends on. Free rhyming game for kids.',
  },
  '/english-speaking': {
    title: t('English Speaking Practice for Kids'),
    description:
      'Say words, phrases and full sentences out loud and get instant feedback from speech recognition. Free English speaking practice for children.',
  },

  /* ── Logic & Fun ───────────────────────────────────────── */
  '/color-match': {
    title: t('Colour Matching Game'),
    description:
      'Match colour names to colours, from four primaries up to fourteen shades including the tricky ones. A free colour recognition game for young children.',
  },
  '/shape-match': {
    title: t('Shape Recognition Game'),
    description:
      'Name circles, triangles, pentagons, hexagons and more, drawn as clean vector shapes. A free shape matching game for preschool and primary children.',
  },
  '/memory': {
    title: t('Memory Match Card Game'),
    description:
      'Flip cards to find matching pairs, from four pairs up to twelve. Scored on how few moves you take. A free memory game for kids.',
  },
  '/pattern': {
    title: t('Pattern Sequence Game'),
    description:
      'Work out what comes next, from repeating picture patterns to number sequences and Fibonacci. A free pattern recognition game for children.',
  },

  /* ── Content pages ─────────────────────────────────────── */
  '/articles': {
    title: t('Learning Corner — Guides for Parents'),
    description:
      'Practical guides for parents on early maths, reading, spelling, screen time and making learning at home enjoyable.',
  },
  '/about': {
    title: t('About KidLearn'),
    description:
      'KidLearn is a free, ad-supported collection of learning games for children aged 4–10, built to be safe, simple and playable offline.',
  },
  '/contact': {
    title: t('Contact Us'),
    description: 'Get in touch with the KidLearn team with questions, feedback or bug reports.',
  },
  '/privacy': {
    title: t('Privacy Policy'),
    description:
      'How KidLearn handles data. Progress is stored only on your own device and no personal information is collected from children.',
  },
  '/terms': {
    title: t('Terms of Use'),
    description:
      'The terms that apply when you use KidLearn, including acceptable use, the absence of any warranty, and how the free service may change over time.',
  },

  /* ── Personal screens: real pages, but nothing to index ── */
  '/progress': {
    title: t('My Progress'),
    description: 'Your stars, levels and daily streak across every KidLearn game.',
    noindex: true,
  },
  '/profile': {
    title: t('My Profile'),
    description: 'Set your name and avatar in KidLearn.',
    noindex: true,
  },
};

/** Routes worth putting in the sitemap, with a sensible crawl priority. */
export const INDEXABLE_ROUTES = Object.entries(ROUTE_META)
  .filter(([, meta]) => !meta.noindex)
  .map(([path]) => path);

export function metaForPath(pathname, articles = []) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  const match = /^\/articles\/(.+)$/.exec(pathname);
  if (match) {
    const article = articles.find((a) => a.slug === match[1]);
    if (article) {
      return {
        title: t(article.title),
        description: article.excerpt || article.summary || ROUTE_META['/articles'].description,
        type: 'article',
      };
    }
  }

  // Unknown path: describe the site rather than claiming to be the homepage,
  // and keep it out of the index.
  return { ...ROUTE_META['/'], noindex: true };
}
