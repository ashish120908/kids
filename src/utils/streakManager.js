// Tracks a daily practice streak. A day "counts" when the child earns at
// least one correct answer (see recordStreakActivity, called from saveScore).
const STREAK_KEY = 'kidlearn_streak';

// Local (not UTC) YYYY-MM-DD, so "today" matches the child's calendar day.
const dateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Whole calendar days from a → b (both YYYY-MM-DD). Round absorbs DST shifts.
const daysBetween = (a, b) =>
  Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);

const read = () => {
  try {
    const p = JSON.parse(localStorage.getItem(STREAK_KEY));
    if (!p) return { current: 0, longest: 0, lastDate: null };
    return { current: p.current || 0, longest: p.longest || 0, lastDate: p.lastDate || null };
  } catch {
    return { current: 0, longest: 0, lastDate: null };
  }
};

const write = (data) => {
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(data)); } catch { /* storage full/blocked */ }
};

// Call when the child earns a star / correct answer. Idempotent per day.
export const recordStreakActivity = () => {
  const today = dateStr();
  const s = read();
  if (s.lastDate === today) return s; // already counted today

  const current = s.lastDate && daysBetween(s.lastDate, today) === 1
    ? s.current + 1   // consecutive day → grow the streak
    : 1;              // first ever, or a day was missed → restart
  const updated = { current, longest: Math.max(s.longest, current), lastDate: today };
  write(updated);
  try { window.dispatchEvent(new Event('kidlearn-streak-updated')); } catch { /* SSR/no window */ }
  return updated;
};

// For display. The streak is only "alive" if the last active day was today or
// yesterday; once a day is fully missed it reads as 0 until the next activity.
export const getStreak = () => {
  const s = read();
  const today = dateStr();
  const diff = s.lastDate ? daysBetween(s.lastDate, today) : null;
  const alive = diff === 0 || diff === 1;
  return {
    current: alive ? s.current : 0,
    longest: s.longest || 0,
    lastDate: s.lastDate,
    playedToday: diff === 0,
    alive,
  };
};
