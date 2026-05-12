// Gamification: XP, tiers, achievements, streak, daily quest, capstone.
// Ported from M5. Source of truth: GAMIFICATION.md.

import { CONCEPTS, MODULES } from './data.js';
import { XP_VALUES, TIERS, ACHIEVEMENTS_REGISTRY, CAPSTONES } from './gam-data.js';
export { XP_VALUES, TIERS, ACHIEVEMENTS_REGISTRY, CAPSTONES };
import { lsGet, lsSet, lsDel, lsKeys, getSettings, setSettings, announce, toast, tierUpToast, logActivity } from './runtime.js';
import { conceptBySlug, moduleByN, conceptsForModule } from './crossref.js';

export function computeTier(xp) {
  let t = TIERS[0];
  for (const tier of TIERS) {
    if (xp >= tier.threshold) t = tier;
    else break;
  }
  return t;
}
export function nextTier(xp) {
  const cur = computeTier(xp);
  const idx = TIERS.findIndex(t => t.n === cur.n);
  return TIERS[idx + 1] || null;
}

export function awardXP(amount, action, target) {
  const key = 'xp_awarded:' + action + ':' + target;
  if (lsGet(key, false)) return 0;
  lsSet(key, true);
  const prevTotal = lsGet('xp', 0);
  const total = prevTotal + amount;
  lsSet('xp', total);
  logActivity();    // populate heatmap data
  // Update top-bar pill (legacy id retained where rendered)
  const xpEl = document.getElementById('xp-count');
  if (xpEl) xpEl.textContent = total + ' XP';
  const tn = document.getElementById('tier-name');
  if (tn) tn.textContent = computeTier(total).name;
  announce('Plus ' + amount + ' XP. Total ' + total + '.');
  document.dispatchEvent(new CustomEvent('aise26:xp-awarded', {
    detail: { amount, action, target, total, prevTotal }
  }));
  return amount;
}

// ---- Concept state helpers ----
export function getConceptState(slug) {
  return lsGet('concept:' + slug, { complete: false, completed_at: null, quiz_score: null, notes: '' });
}
export function setConceptState(slug, patch) {
  const cur = getConceptState(slug);
  const next = { ...cur, ...patch };
  lsSet('concept:' + slug, next);
  return next;
}

// ---- Save-for-later ----
export function getSaved() { return lsGet('saved', []); }
export function isSaved(slug) { return getSaved().indexOf(slug) >= 0; }
export function toggleSaved(slug) {
  const cur = getSaved();
  const i = cur.indexOf(slug);
  if (i >= 0) cur.splice(i, 1);
  else cur.push(slug);
  lsSet('saved', cur);
  return i < 0;
}

// ---- Achievements ----
export function getAchievements() { return lsGet('achievements', {}); }

export function buildAchievementState() {
  const settings = getSettings();
  const saved = getSaved();
  let completedCount = 0;
  let notesCount = 0;
  const moduleCompleteByCount = {};
  for (const m of MODULES) moduleCompleteByCount[m.n] = 0;
  let flashcardsMastered = 0, quizzesPassed = 0;
  for (const c of CONCEPTS) {
    const s = getConceptState(c.slug);
    if (s.complete) {
      completedCount++;
      if (moduleCompleteByCount[c.module] !== undefined) moduleCompleteByCount[c.module]++;
    }
    if (s.notes && s.notes.trim()) notesCount++;
    if (s.flashcard_mastered) flashcardsMastered++;
    if (s.quiz_passed) quizzesPassed++;
  }
  const modulesComplete = {};
  for (const m of MODULES) modulesComplete[m.n] = (moduleCompleteByCount[m.n] === m.conceptCount);
  let capstonesPassed = 0, capstonesFirstTry = 0;
  for (const m of MODULES) {
    const ms = lsGet('module:' + m.n, { complete: false, capstone_passed: false, capstone_score: null, capstone_attempts: 0 });
    if (ms.capstone_passed) capstonesPassed++;
    if (ms.capstone_passed && ms.capstone_attempts === 1) capstonesFirstTry++;
  }
  // Module-quiz pass count (pass-once-per-day persisted via xp_awarded keys)
  let moduleQuizzesPassed = 0;
  for (const m of MODULES) {
    const moduleQuizKeys = lsKeys('xp_awarded:module_quiz_pass:m' + m.n + '-');
    if (moduleQuizKeys.length > 0) moduleQuizzesPassed++;
  }
  // Profile-derived flags
  const profile = settings.profile || {};
  const profileGoalSet = !!(profile.goal && profile.goal.trim());
  const apiKeySet = lsGet('api_key.anthropic', null) !== null || lsGet('api_key.openai', null) !== null;
  const eggsUnlocked = lsGet('easter_eggs.unlocked', []);
  const konamiUnlocked = eggsUnlocked.includes('konami');
  const voiceUsed = lsGet('voice_used', false);
  const readerOpened = lsGet('reader_opened', false);
  return {
    completedCount,
    totalConcepts: CONCEPTS.length,
    notesCount,
    savedCount: saved.length,
    modulesComplete,
    streakCount: getStreak().count,
    xrefClicks: lsGet('xref_clicks', 0),
    region: settings.region || 'US',
    flashcardsMastered,
    quizzesPassed,
    moduleQuizzesPassed,
    ragQuizzesPassed: false,
    speedrunCompleted: lsGet('speedrun_done', false),
    capstonesPassed,
    capstonesFirstTry,
    selfTaughtPlaybookComplete: lsGet('playbook:set-up-claude-code:complete', false),
    totalXP: lsGet('xp', 0),
    profileGoalSet,
    apiKeySet,
    konamiUnlocked,
    voiceUsed,
    readerOpened
  };
}

/**
 * Compute progress toward each locked achievement. Returns an array of
 * { id, name, desc, bonusXP, progress 0..1, remaining }, sorted by closeness
 * (highest progress first; ties broken by smallest remaining XP/effort).
 */
export function getNearestAchievements(limit = 3) {
  const state = buildAchievementState();
  const cur = getAchievements();
  const out = [];
  for (const a of ACHIEVEMENTS_REGISTRY) {
    if (cur[a.id] && cur[a.id].unlocked_at) continue;
    if (a.cond(state)) continue;     // already qualifies but not unlocked; skip (will fire on next check)
    // Heuristic progress from declared bounds. Pattern-match the cond function.
    let progress = 0;
    const condStr = String(a.cond);
    const m1 = condStr.match(/s\.(\w+)\s*>=\s*(\d+)/);
    if (m1) {
      const key = m1[1];
      const target = parseInt(m1[2], 10);
      const have = Number(state[key] || 0);
      progress = Math.min(1, have / target);
    } else if (/s\.modulesComplete\[(\d+)\]\s*===\s*true/.test(condStr)) {
      const mm = condStr.match(/s\.modulesComplete\[(\d+)\]/);
      const modN = parseInt(mm[1], 10);
      const concepts = CONCEPTS.filter(c => c.module === modN);
      const done = concepts.filter(c => getConceptState(c.slug).complete).length;
      progress = concepts.length ? done / concepts.length : 0;
    } else if (/=== true/.test(condStr)) {
      progress = 0.5;       // boolean flag we can't easily quantify; show as "halfway"
    } else {
      progress = 0.2;
    }
    out.push({
      id: a.id,
      name: a.name,
      desc: a.desc,
      bonusXP: a.bonusXP,
      progress
    });
  }
  out.sort((x, y) => y.progress - x.progress);
  return out.slice(0, limit);
}

export function checkAchievements() {
  const state = buildAchievementState();
  const cur = getAchievements();
  let changed = false;
  for (const a of ACHIEVEMENTS_REGISTRY) {
    if (cur[a.id] && cur[a.id].unlocked_at) continue;
    if (!a.cond(state)) continue;
    cur[a.id] = { unlocked_at: new Date().toISOString() };
    changed = true;
    awardXP(a.bonusXP, 'achievement', a.id);
    toast(a.name + ' unlocked. +' + a.bonusXP + ' XP.', 'achievement');
    announce('Achievement unlocked: ' + a.name + '. Plus ' + a.bonusXP + ' XP.', 'assertive');
  }
  if (changed) lsSet('achievements', cur);
  return cur;
}

// ---- Tier-up + cascade listener ----
document.addEventListener('aise26:xp-awarded', (e) => {
  const { total, prevTotal } = e.detail;
  const prevT = computeTier(prevTotal);
  const newT = computeTier(total);
  if (newT.n > prevT.n) {
    tierUpToast(newT.n, newT.name);
    announce('Tier up. ' + newT.name + '.', 'assertive');
  }
  Promise.resolve().then(checkAchievements);
});

// ---- Streak ----
export function todayKey() {
  const now = new Date();
  return now.getUTCFullYear() + '-' + String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + String(now.getUTCDate()).padStart(2, '0');
}

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return d.getUTCFullYear() + '-W' + String(weekNo).padStart(2, '0');
}

function daysBetweenUTC(aIso, bIso) {
  if (!aIso || !bIso) return null;
  const a = new Date(aIso + 'T00:00:00Z');
  const b = new Date(bIso + 'T00:00:00Z');
  return Math.round((b - a) / 86400000);
}

export function getStreak() {
  return lsGet('streak', { count: 0, last_active_utc_date: null, skip_used_week: null });
}

export function bumpStreakToday() {
  const today = todayKey();
  const s = getStreak();
  if (s.last_active_utc_date === today) return s;
  const thisWeek = isoWeekKey(new Date());
  let newCount;
  const delta = daysBetweenUTC(s.last_active_utc_date, today);
  if (delta === null) newCount = 1;
  else if (delta === 1) newCount = (s.count || 0) + 1;
  else if (delta === 2) {
    const skipUsed = s.skip_used_week === thisWeek;
    if (!skipUsed) {
      newCount = (s.count || 0) + 1;
      s.skip_used_week = thisWeek;
    } else newCount = 1;
  } else newCount = 1;
  const next = {
    count: newCount,
    last_active_utc_date: today,
    skip_used_week: s.skip_used_week === thisWeek ? thisWeek : null
  };
  lsSet('streak', next);
  if (newCount === 7) awardXP(XP_VALUES.STREAK_7DAY_MILESTONE, 'streak_7', 'milestone');
  if (newCount === 30) awardXP(XP_VALUES.STREAK_30DAY_MILESTONE, 'streak_30', 'milestone');
  announce('Streak: ' + newCount + ' day' + (newCount === 1 ? '' : 's') + '.');
  return next;
}

// Streak triggers wired to xp-awarded events
document.addEventListener('aise26:xp-awarded', (e) => {
  if (e.detail.action === 'concept_complete' || e.detail.action === 'note_first') {
    bumpStreakToday();
  }
});

// ---- Module complete check ----
export function checkModuleComplete(moduleN) {
  const concepts = conceptsForModule(moduleN);
  if (!concepts.length) return;
  const allComplete = concepts.every(c => getConceptState(c.slug).complete);
  const ms = lsGet('module:' + moduleN, { complete: false, capstone_passed: false, capstone_score: null, capstone_attempts: 0 });
  if (allComplete && !ms.complete) {
    ms.complete = true;
    lsSet('module:' + moduleN, ms);
    awardXP(XP_VALUES.MODULE_COMPLETE, 'module_complete', String(moduleN));
    announce('Module ' + moduleN + ' complete.', 'assertive');
    const sessionId = lsGet('session_id', null);
    const moduleSessionStart = lsGet('module_started_in_session:' + moduleN, null);
    if (sessionId && moduleSessionStart === sessionId) lsSet('speedrun_done', true);
    const next = MODULES.find(m => m.n > moduleN && !lsGet('module:' + m.n, {}).complete);
    if (next) setSettings({ current_module: next.n });
  }
}

document.addEventListener('aise26:xp-awarded', (e) => {
  if (e.detail.action === 'concept_complete') {
    const c = conceptBySlug(e.detail.target);
    if (c) checkModuleComplete(c.module);
  }
});

// ---- Cross-ref click counter ----
document.addEventListener('click', (e) => {
  const target = e.target.closest && e.target.closest('a.xref');
  if (!target) return;
  const cur = lsGet('xref_clicks', 0);
  lsSet('xref_clicks', cur + 1);
  Promise.resolve().then(checkAchievements);
});

// ---- Region ----
export function toggleRegion() {
  const cur = getSettings();
  const next = cur.region === 'INTL' ? 'US' : 'INTL';
  setSettings({ region: next });
  announce('Region set to ' + next + '.');
  checkAchievements();
}

// ---- Daily Quest ----
export function pickDailyQuest() {
  const key = 'daily_quest:' + todayKey();
  const stored = lsGet(key, null);
  if (stored && stored.concept_slug && (stored.concept_slug === '__all_done__' || conceptBySlug(stored.concept_slug))) return stored;

  const settings = getSettings();
  const preferredModule = settings.current_module || 1;
  const incomplete = CONCEPTS.filter(c => !getConceptState(c.slug).complete);
  if (!incomplete.length) {
    const sentinel = { concept_slug: '__all_done__', completed: true };
    lsSet(key, sentinel);
    return sentinel;
  }
  const inModule = incomplete.filter(c => c.module === preferredModule);
  const pool = inModule.length ? inModule : incomplete;
  const choice = pool[Math.floor(Math.random() * pool.length)];
  const next = { concept_slug: choice.slug, completed: false };
  lsSet(key, next);
  return next;
}

document.addEventListener('aise26:xp-awarded', (e) => {
  if (e.detail.action !== 'concept_complete') return;
  const dqKey = 'daily_quest:' + todayKey();
  const dq = lsGet(dqKey, null);
  if (dq && dq.concept_slug === e.detail.target && !dq.completed) {
    lsSet(dqKey, { ...dq, completed: true });
  }
});

// ---- Capstone ----
export function getCapstoneState(n) {
  return lsGet('module:' + n, { complete: false, capstone_passed: false, capstone_score: null, capstone_attempts: 0 });
}
export function passThreshold(total) { return Math.ceil(total * 0.66); }

// ---- Hydrate top-bar XP/tier on load + stamp session id ----
export function hydrateTopBar() {
  const xp = lsGet('xp', 0);
  const xpEl = document.getElementById('xp-count');
  if (xpEl) xpEl.textContent = xp + ' XP';
  const tn = document.getElementById('tier-name');
  if (tn) tn.textContent = computeTier(xp).name;
  const sid = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
  lsSet('session_id', sid);
  lsSet('session_start', new Date().toISOString());
}

window.aise26 = Object.assign(window.aise26 || {}, {
  XP_VALUES, TIERS, ACHIEVEMENTS_REGISTRY, CAPSTONES,
  computeTier, nextTier, awardXP,
  getConceptState, setConceptState,
  getSaved, isSaved, toggleSaved,
  getAchievements, checkAchievements, buildAchievementState,
  todayKey, getStreak, bumpStreakToday, checkModuleComplete,
  toggleRegion, pickDailyQuest,
  getCapstoneState, passThreshold,
  hydrateTopBar
});
