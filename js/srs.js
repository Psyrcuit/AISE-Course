// Spaced repetition (SM-2 variant). Per-card state lives at aise26:srs:{slug}.
// On each review, the user rates the card 0/3/4/5 (Again/Hard/Good/Easy).
// Algorithm: classic SM-2 with a small "interval floor" so brand-new cards
// don't return tomorrow regardless of rating.

import { lsGet, lsSet, lsKeys } from './runtime.js';
import { FLASHCARDS } from './flashcards.js';

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const DAY_MS = 86_400_000;

/** quality: 0 = Again, 3 = Hard, 4 = Good, 5 = Easy */
export function recordReview(slug, quality) {
  const cur = getCardState(slug);
  let interval, ease;
  if (quality < 3) {
    // Failed: reset interval; nudge ease down
    interval = 0;
    ease = Math.max(MIN_EASE, cur.ease - 0.2);
  } else {
    if (cur.reps === 0) interval = 1;
    else if (cur.reps === 1) interval = 6;
    else interval = Math.round(cur.interval * cur.ease);
    // Adjust ease based on quality
    ease = cur.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ease = Math.max(MIN_EASE, ease);
    if (quality === 3) interval = Math.max(1, Math.round(interval * 0.6));
    if (quality === 5) interval = Math.round(interval * 1.3);
  }
  const reps = quality < 3 ? 0 : cur.reps + 1;
  const next = {
    interval,
    ease,
    reps,
    lastReviewedAt: Date.now(),
    nextReviewAt: Date.now() + Math.max(0, interval) * DAY_MS,
    mastered: quality >= 4 && reps >= 3
  };
  lsSet('srs:' + slug, next);
  return next;
}

export function getCardState(slug) {
  return lsGet('srs:' + slug, {
    interval: 0,
    ease: DEFAULT_EASE,
    reps: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    mastered: false
  });
}

/** Cards due today: nextReviewAt <= now OR never reviewed (in seed pool). */
export function dueToday(limit = 30) {
  const now = Date.now();
  // Pull state for all flashcards we have
  const slugs = Object.keys(FLASHCARDS);
  const due = [];
  const seedPool = [];
  for (const slug of slugs) {
    const s = getCardState(slug);
    if (s.nextReviewAt && s.nextReviewAt <= now) due.push({ slug, ...s, urgency: now - s.nextReviewAt });
    else if (!s.lastReviewedAt) seedPool.push(slug);
  }
  // Sort due by most-overdue first
  due.sort((a, b) => b.urgency - a.urgency);
  // If we have headroom, pull a few seed cards too (10 default per session)
  if (due.length < limit) {
    const seedCount = Math.min(limit - due.length, 10);
    // Stable pseudo-random from today's date so the seed pool repeats within a day
    const today = new Date();
    const seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();
    for (let i = 0; i < seedCount && seedPool.length; i++) {
      const idx = (seed * (i + 1) * 9301 + 49297) % seedPool.length;
      const slug = seedPool.splice(idx, 1)[0];
      due.push({ slug, ...getCardState(slug), seed: true });
    }
  }
  return due.slice(0, limit);
}

/** Forecast: how many cards due each of the next N days. */
export function forecast(days = 14) {
  const now = Date.now();
  const out = [];
  const allSlugs = Object.keys(FLASHCARDS);
  const states = allSlugs.map(slug => ({ slug, ...getCardState(slug) }));
  for (let i = 0; i < days; i++) {
    const start = now + i * DAY_MS;
    const end = start + DAY_MS;
    const count = states.filter(s => s.nextReviewAt && s.nextReviewAt >= start && s.nextReviewAt < end).length;
    out.push({ day: i, count });
  }
  return out;
}

/** Stats for profile / practice hub. */
export function srsStats() {
  const allSlugs = Object.keys(FLASHCARDS);
  let seen = 0, mastered = 0, dueNow = 0;
  const now = Date.now();
  for (const slug of allSlugs) {
    const s = getCardState(slug);
    if (s.lastReviewedAt) seen++;
    if (s.mastered) mastered++;
    if (s.nextReviewAt && s.nextReviewAt <= now) dueNow++;
  }
  return { total: allSlugs.length, seen, mastered, dueNow };
}

window.aise26 = Object.assign(window.aise26 || {}, { srs: { recordReview, getCardState, dueToday, forecast, srsStats } });
