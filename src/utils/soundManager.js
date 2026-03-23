let audioCtx = null;
let muted = localStorage.getItem('kidlearn_muted') === 'true';

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, type, duration, gainValue, startTime, ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playCorrect() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(523, 'sine', 0.15, 0.4, now, ctx);
    playTone(659, 'sine', 0.15, 0.4, now + 0.1, ctx);
    playTone(784, 'sine', 0.25, 0.4, now + 0.2, ctx);
  } catch (_) { /* Web Audio API may be unavailable in some environments */ }
}

export function playWrong() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(300, 'sine', 0.12, 0.3, now, ctx);
    playTone(250, 'sine', 0.2, 0.3, now + 0.1, ctx);
  } catch (_) { /* Web Audio API may be unavailable in some environments */ }
}

export function playLevelUp() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    [523, 587, 659, 698, 784].forEach((f, i) => {
      playTone(f, 'sine', 0.15, 0.35, now + i * 0.1, ctx);
    });
  } catch (_) { /* Web Audio API may be unavailable in some environments */ }
}

export function playClick() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    playTone(800, 'square', 0.05, 0.15, now, ctx);
  } catch (_) { /* Web Audio API may be unavailable in some environments */ }
}

export function playGameComplete() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const melody = [523, 659, 784, 1047, 784, 1047];
    melody.forEach((f, i) => {
      playTone(f, 'sine', 0.18, 0.35, now + i * 0.12, ctx);
    });
  } catch (_) { /* Web Audio API may be unavailable in some environments */ }
}

export function isMuted() {
  return muted;
}

export function setMuted(val) {
  muted = val;
  localStorage.setItem('kidlearn_muted', val ? 'true' : 'false');
}

export function toggleMute() {
  setMuted(!muted);
  return muted;
}
