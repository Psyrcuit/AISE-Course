// Public profile share. Encodes tier + XP + module-completion bitmap +
// achievement-unlock bitmap into a base64 URL fragment. Recipient sees a
// read-only profile card with no PII; nothing is fetched from the network.

import { CONCEPTS, MODULES } from '../data.js';
import { TIERS, ACHIEVEMENTS_REGISTRY } from '../gam-data.js';
import { el, lsGet, announce } from '../runtime.js';
import { computeTier, getAchievements, getConceptState, getStreak } from '../gamification.js';
import { conceptsForModule } from '../crossref.js';

// Compact format:
// v=1 ; xp ; modulesBitmap ; achievementsBitmap ; streak ; tierN
// Encoded as base64url

export function buildShareToken() {
  const xp = lsGet('xp', 0);
  const tier = computeTier(xp);
  const streak = getStreak();
  const ach = getAchievements();

  // Modules complete bitmap: 16 bits, LSB = module 1
  let modMask = 0;
  for (const m of MODULES) {
    const concepts = conceptsForModule(m.n);
    const done = concepts.length > 0 && concepts.every(c => getConceptState(c.slug).complete);
    if (done) modMask |= (1 << (m.n - 1));
  }

  // Achievements bitmap (one bit per registry entry, in registry order)
  let achMask = 0n;
  for (let i = 0; i < ACHIEVEMENTS_REGISTRY.length; i++) {
    const id = ACHIEVEMENTS_REGISTRY[i].id;
    if (ach[id] && ach[id].unlocked_at) achMask |= (1n << BigInt(i));
  }

  const payload = '1|' + xp + '|' + modMask + '|' + achMask.toString(36) + '|' + (streak.count || 0) + '|' + tier.n;
  // Base64-url
  return btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Parse base-36 string into BigInt (precision-safe; native parseInt loses
// precision past Number.MAX_SAFE_INTEGER).
function _base36ToBigInt(s) {
  let v = 0n;
  for (const ch of String(s || '0').toLowerCase()) {
    const d = '0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(ch);
    if (d < 0) continue;
    v = v * 36n + BigInt(d);
  }
  return v;
}

export function parseShareToken(token) {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(b64);
    const parts = payload.split('|');
    if (parts[0] !== '1') return null;
    return {
      version: 1,
      xp: parseInt(parts[1], 10) || 0,
      modules: parseInt(parts[2], 10) || 0,
      achievements: _base36ToBigInt(parts[3]),
      streak: parseInt(parts[4], 10) || 0,
      tierN: parseInt(parts[5], 10) || 1
    };
  } catch { return null; }
}

export function renderShare(token) {
  const data = parseShareToken(token);
  const wrap = el('article', { 'aria-labelledby': 'sh-h1', class: 'fade-up' });

  if (!data) {
    wrap.appendChild(el('h1', { id: 'sh-h1' }, 'Profile share - invalid'));
    wrap.appendChild(el('p', null, 'This share link is malformed. Ask the sender to regenerate from their profile.'));
    return { node: wrap, title: 'Share', crumbs: [{ label: 'Share' }], mainClass: 'no-rail' };
  }

  const tier = TIERS.find(t => t.n === data.tierN) || TIERS[0];
  const completedModules = MODULES.filter(m => (data.modules & (1 << (m.n - 1))) !== 0);
  const unlockedAch = [];
  for (let i = 0; i < ACHIEVEMENTS_REGISTRY.length; i++) {
    if ((data.achievements & (1n << BigInt(i))) !== 0n) {
      unlockedAch.push(ACHIEVEMENTS_REGISTRY[i]);
    }
  }

  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Shared profile'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'sh-h1' }, 'AISE 2026 progress'));

  // Hero
  wrap.appendChild(el('div', { class: 'profile-hero' }, [
    el('div', { class: 'profile-tier-row' }, [
      el('div', { class: 'profile-tier-badge' }, String(tier.n)),
      el('div', { class: 'profile-tier-meta' }, [
        el('div', { class: 'profile-tier-num' }, 'Tier ' + tier.n + ' of 8'),
        el('div', { class: 'profile-tier-name' }, tier.name),
        el('div', { class: 'profile-tier-num' }, data.xp + ' XP · ' + data.streak + '-day streak')
      ])
    ])
  ]));

  // Stats
  wrap.appendChild(el('div', { class: 'home-stats' }, [
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num accent' }, String(data.xp)),
      el('span', { class: 'label' }, 'XP earned')
    ]),
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, completedModules.length + ' / ' + MODULES.length),
      el('span', { class: 'label' }, 'modules complete')
    ]),
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, unlockedAch.length + ' / ' + ACHIEVEMENTS_REGISTRY.length),
      el('span', { class: 'label' }, 'achievements unlocked')
    ])
  ]));

  // Completed modules
  if (completedModules.length) {
    wrap.appendChild(el('h2', { style: 'margin-top: 32px;' }, 'Modules complete'));
    const list = el('div', { class: 'recommend-grid' });
    for (const m of completedModules) {
      list.appendChild(el('div', { class: 'recommend-card', 'data-module': String(m.n) }, [
        el('div', { class: 'eyebrow' }, 'Module ' + m.n),
        el('div', { class: 'name' }, m.title)
      ]));
    }
    wrap.appendChild(list);
  }

  // Achievements unlocked
  if (unlockedAch.length) {
    wrap.appendChild(el('h2', { style: 'margin-top: 32px;' }, 'Achievements (' + unlockedAch.length + ')'));
    const grid = el('div', { class: 'achievements-grid' });
    for (const a of unlockedAch) {
      grid.appendChild(el('div', { class: 'achievement-tile is-unlocked' }, [
        el('span', { class: 'ico' }, '✓'),
        el('div', null, [
          el('p', { class: 'name' }, a.name),
          el('p', { class: 'desc' }, a.desc)
        ])
      ]));
    }
    wrap.appendChild(grid);
  }

  // CTA
  wrap.appendChild(el('div', { style: 'margin-top: 32px; padding: 16px; border: 1px solid var(--border-2); border-radius: var(--radius-3); background: var(--surface-1);' }, [
    el('p', { style: 'margin: 0 0 12px;' }, 'Want to start your own?'),
    el('a', { class: 'btn btn-primary', href: '#/' }, 'Open AISE 2026 →')
  ]));

  return {
    node: wrap,
    title: 'Shared profile',
    crumbs: [{ label: 'Shared profile' }],
    mainClass: 'no-rail'
  };
}

window.aise26 = Object.assign(window.aise26 || {}, {
  share: { buildShareToken, parseShareToken, renderShare }
});
