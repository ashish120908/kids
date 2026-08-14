/**
 * The child's saved profile (name + avatar).
 *
 * The bug this exists to prevent: the previous version applied its defaults
 * only when localStorage held *nothing*. A profile saved by an earlier build —
 * missing the `avatar` key, or holding an empty string — sailed straight
 * through, and the profile screen rendered an empty div where the avatar should
 * be. A fresh browser looked perfect, so it only showed up for people who had
 * actually used the app before. Every field is now validated on read, not just
 * the whole-object case.
 */

export const AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐸', '🦄', '🐲', '🦋', '🦖',
];

export const DEFAULT_AVATAR = '🦄';
export const PROFILE_KEY = 'kidlearn_profile';

const isUsableAvatar = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Always returns a complete, renderable profile — whatever is in storage.
 * Also migrates the older `{ childName, icon }` shape rather than silently
 * dropping a name the child had already chosen.
 */
export function getProfile() {
  let stored = null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;                       // unparseable JSON — start clean
  }

  if (!stored || typeof stored !== 'object') {
    return { name: '', avatar: DEFAULT_AVATAR };
  }

  const name = typeof stored.name === 'string'
    ? stored.name
    : (typeof stored.childName === 'string' ? stored.childName : '');

  const avatar = [stored.avatar, stored.icon].find(isUsableAvatar) || DEFAULT_AVATAR;

  return { name, avatar };
}

export function saveProfile(profile) {
  const safe = {
    name: typeof profile?.name === 'string' ? profile.name : '',
    avatar: isUsableAvatar(profile?.avatar) ? profile.avatar : DEFAULT_AVATAR,
  };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(safe));
  } catch { /* storage full or blocked — the profile is a nicety, not critical */ }
  return safe;
}
