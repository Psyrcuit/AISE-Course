// Smaller view modules: home, modules index, glossary, library, profile,
// empty state, not-found.

import { CONCEPTS, MODULES } from '../data.js';
import { lsGet, lsSet, lsDel, lsKeys, getSettings, setSettings, lsResetAll, el, clear, announce, toggleTheme, resolveTheme } from '../runtime.js';
import { conceptBySlug, moduleByN, conceptsForModule, linkifyText } from '../crossref.js';
import { setCycleList, _alphaSlugs } from '../router.js';
import {
  computeTier, nextTier, getConceptState, getSaved, isSaved, toggleSaved,
  getAchievements, getStreak, todayKey, pickDailyQuest,
  toggleRegion, ACHIEVEMENTS_REGISTRY, getNearestAchievements
} from '../gamification.js';
import { copyToClipboard } from '../copy.js';
import { renderHeatmap } from '../components/heatmap.js';

// --- Recommended next (small ranking heuristic) ---
// Order:
// 1. If profile.recommended_path exists, surface up to N concepts from those modules
//    that are not yet completed.
// 2. Otherwise, fall back to fleshed concepts not yet completed in the current module.
// 3. Final fallback: the next 3 fleshed concepts overall the user hasn't completed.
export function computeRecommendedNext(n = 3) {
  const out = [];
  const seen = new Set();
  const settings = getSettings();
  const profile = settings.profile || {};
  const recommendedModules = profile.recommended_path || [];
  // Pass 1: from recommended modules
  for (const modN of recommendedModules) {
    if (out.length >= n) break;
    const concepts = conceptsForModule(modN);
    for (const c of concepts) {
      if (out.length >= n) break;
      if (seen.has(c.slug)) continue;
      const s = getConceptState(c.slug);
      if (s.complete) continue;
      out.push({ concept: c, reason: 'On your recommended path · M' + modN });
      seen.add(c.slug);
    }
  }
  // Pass 2: current module
  if (out.length < n) {
    const cur = settings.current_module || 1;
    for (const c of conceptsForModule(cur)) {
      if (out.length >= n) break;
      if (seen.has(c.slug)) continue;
      const s = getConceptState(c.slug);
      if (s.complete) continue;
      if (!c.fleshed) continue;
      out.push({ concept: c, reason: 'Continuing module ' + cur });
      seen.add(c.slug);
    }
  }
  // Pass 3: any fleshed not completed
  if (out.length < n) {
    for (const c of CONCEPTS) {
      if (out.length >= n) break;
      if (seen.has(c.slug) || !c.fleshed) continue;
      const s = getConceptState(c.slug);
      if (s.complete) continue;
      out.push({ concept: c, reason: 'Recently fleshed' });
      seen.add(c.slug);
    }
  }
  return out;
}

// --- empty / not-found ---
export function renderEmpty(title, hint) {
  const wrap = el('article', { 'aria-labelledby': 'empty-h1', class: 'fade-up' });
  wrap.appendChild(el('h1', { id: 'empty-h1' }, title));
  wrap.appendChild(el('div', { class: 'empty' }, [
    el('h3', null, 'Not yet wired'),
    el('p', null, hint),
  ]));
  return { node: wrap, title, crumbs: [{ label: title }], mainClass: 'no-rail' };
}

export function renderNotFound(msg) {
  const wrap = el('article', { 'aria-labelledby': 'nf-h1', class: 'fade-up' });
  wrap.appendChild(el('h1', { id: 'nf-h1' }, 'Not found'));
  wrap.appendChild(el('p', null, msg || 'That page does not exist.'));
  wrap.appendChild(el('p', null, el('a', { href: '#/' }, 'Back to home')));
  return { node: wrap, title: 'Not found', crumbs: [{ label: 'Not found' }], mainClass: 'no-rail' };
}

// --- HOME (Today's Review) ---
export function renderHome() {
  const wrap = el('article', { 'aria-labelledby': 'home-h1', class: 'fade-up' });

  wrap.appendChild(el('div', { class: 'home-hero' }, [
    el('div', null, [
      el('div', { class: 'home-eyebrow' }, "Today's review"),
      el('h1', { class: 'home-h1', id: 'home-h1' }, 'A map of everything you should know.'),
      el('p', { class: 'home-tagline' }, MODULES.length + ' modules. ' + CONCEPTS.length + ' concepts. Browse on the System Map. Earn XP as you go. Take it day by day.')
    ])
  ]));

  // Stats
  const xp = lsGet('xp', 0);
  const tier = computeTier(xp);
  const streak = getStreak();
  const completedCount = CONCEPTS.filter(c => getConceptState(c.slug).complete).length;

  wrap.appendChild(el('div', { class: 'home-stats fade-up delay-1' }, [
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num accent' }, String(xp)),
      el('span', { class: 'label' }, 'XP - ' + tier.name)
    ]),
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, completedCount + ' / ' + CONCEPTS.length),
      el('span', { class: 'label' }, 'concepts complete')
    ]),
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, String(streak.count)),
      el('span', { class: 'label' }, streak.count > 0 ? 'day streak' : 'start a streak')
    ])
  ]));

  // Daily quest
  const quest = pickDailyQuest();
  let questCard;
  if (quest.concept_slug === '__all_done__') {
    questCard = el('section', { class: 'quest-card fade-up delay-2', 'aria-labelledby': 'quest-h2' }, [
      el('div', { class: 'eyebrow' }, "Course complete"),
      el('h2', { id: 'quest-h2' }, "Every concept marked complete."),
      el('p', null, 'Move on to capstones, playbooks, or the toolkit.'),
      el('a', { class: 'btn btn-accent', href: '#/map' }, 'Open System Map')
    ]);
  } else {
    const qc = conceptBySlug(quest.concept_slug);
    if (qc) {
      const isDone = quest.completed || getConceptState(qc.slug).complete;
      questCard = el('section', { class: 'quest-card fade-up delay-2', 'aria-labelledby': 'quest-h2', 'data-module': String(qc.module) }, [
        el('div', { class: 'eyebrow' }, isDone ? "Today's quest, done" : "Today's quest"),
        el('h2', { id: 'quest-h2' }, qc.name),
        el('p', null, qc.stub),
        el('a', { class: 'btn btn-accent', href: '#/concept/' + qc.slug }, isDone ? 'Review concept' : 'Open concept')
      ]);
    }
  }
  if (questCard) wrap.appendChild(questCard);

  // ----- Continue where you left off (promoted hero) -----
  const last = getSettings().last_concept;
  const lastC = last ? conceptBySlug(last) : null;
  if (lastC) {
    wrap.appendChild(el('div', { class: 'continue-hero fade-up delay-2', 'data-module': String(lastC.module) }, [
      el('div', null, [
        el('div', { class: 'label' }, 'Continue where you left off'),
        el('div', { class: 'target' }, lastC.name),
        el('div', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-top: 4px;' }, lastC.stub)
      ]),
      el('a', { class: 'btn btn-primary', href: '#/concept/' + last }, 'Resume →')
    ]));
  }

  // ----- Recommended next (3 cards) -----
  const recommended = computeRecommendedNext(3);
  if (recommended.length) {
    wrap.appendChild(el('h2', { style: 'margin-top: 24px; font-size: var(--fs-400);' }, 'Recommended next'));
    const grid = el('div', { class: 'recommend-grid' });
    for (const r of recommended) {
      grid.appendChild(el('a', { class: 'recommend-card', href: '#/concept/' + r.concept.slug, 'data-module': String(r.concept.module) }, [
        el('div', { class: 'eyebrow' }, 'Module ' + r.concept.module + (r.concept.fleshed ? ' · fleshed' : '')),
        el('div', { class: 'name' }, r.concept.name),
        el('div', { class: 'reason' }, r.reason)
      ]));
    }
    wrap.appendChild(grid);
  }

  // ----- Activity heatmap (last 365 days) -----
  wrap.appendChild(el('h2', { style: 'margin-top: 24px; font-size: var(--fs-400);' }, 'Daily activity'));
  wrap.appendChild(renderHeatmap({ days: 365, label: 'Last year of activity' }));

  // Two-column grid: recently fleshed | saved + jump
  const grid = el('div', { class: 'home-grid fade-up delay-3', style: 'margin-top: 24px;' });

  // Left: recently fleshed
  const left = el('div', null);

  const fleshed = CONCEPTS.filter(c => c.fleshed).slice(0, 6);
  if (fleshed.length) {
    const fleshedSection = el('section', { class: 'context-card' }, [
      el('h3', null, 'Fleshed concepts to start with'),
      el('div', { style: 'display: grid; grid-template-columns: 1fr; gap: 6px; margin-top: 8px;' },
        fleshed.slice(0, 6).map(c =>
          el('a', {
            href: '#/concept/' + c.slug,
            class: 'concept-row',
            'data-module': String(c.module),
            style: 'padding: 10px 12px;'
          }, [
            el('span', { class: 'tick' }),
            el('div', null, [
              el('p', { class: 'name', style: 'font-size: var(--fs-200); margin-bottom: 0;' }, c.name)
            ]),
            el('span', { class: 'pill pill-mod' }, 'M' + c.module)
          ])
        )
      )
    ]);
    left.appendChild(fleshedSection);
  }
  grid.appendChild(left);

  // Right: saved + jump
  const right = el('div', null);
  const saved = getSaved();
  if (saved.length) {
    const ul = el('ul', null);
    for (const slug of saved.slice(0, 5)) {
      const c = conceptBySlug(slug);
      if (!c) continue;
      ul.appendChild(el('li', null, el('a', { href: '#/concept/' + slug }, c.name)));
    }
    right.appendChild(el('section', { class: 'context-card', style: 'margin-bottom: 12px;' }, [
      el('h3', null, 'Saved (' + saved.length + ')'),
      ul,
      saved.length > 5 ? el('a', { href: '#/library', class: 'btn-link' }, 'See all') : null
    ]));
  }
  right.appendChild(el('section', { class: 'context-card' }, [
    el('h3', null, 'Jump to'),
    el('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 6px;' }, [
      el('a', { class: 'btn btn-sm', href: '#/map' }, 'System Map'),
      el('a', { class: 'btn btn-sm', href: '#/modules' }, 'Modules'),
      el('a', { class: 'btn btn-sm', href: '#/glossary' }, 'Glossary'),
      el('a', { class: 'btn btn-sm', href: '#/playbooks' }, 'Playbooks'),
      el('a', { class: 'btn btn-sm', href: '#/toolkit' }, 'Toolkit'),
      el('a', { class: 'btn btn-sm', href: '#/decisions' }, 'Decisions')
    ])
  ]));
  grid.appendChild(right);

  wrap.appendChild(grid);

  setCycleList(_alphaSlugs);
  linkifyText(wrap);
  return { node: wrap, title: "Today's review", crumbs: [{ label: 'Home' }], mainClass: 'no-rail' };
}

// --- MODULES INDEX ---
export function renderModulesIndex() {
  const wrap = el('article', { 'aria-labelledby': 'modules-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Index'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'modules-h1' }, 'Modules'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, MODULES.length + ' modules. ' + CONCEPTS.length + ' concepts. Pick any.'));
  for (const m of MODULES) {
    const cs = conceptsForModule(m.n);
    const completed = cs.filter(c => getConceptState(c.slug).complete).length;
    const pct = cs.length ? Math.round((completed / cs.length) * 100) : 0;
    wrap.appendChild(el('a', {
      href: '#/module/' + m.n,
      class: 'module-strip',
      'data-module': String(m.n)
    }, [
      el('span', { class: 'module-strip-num' }, 'M' + String(m.n).padStart(2, '0')),
      el('div', { class: 'module-strip-body' }, [
        el('h2', { class: 'module-strip-title' }, m.title),
        el('p', { class: 'module-strip-tagline' }, m.intro)
      ]),
      el('div', { class: 'module-strip-progress' }, [
        el('strong', null, completed + '/' + cs.length),
        el('div', null, pct + '%')
      ])
    ]));
  }
  setCycleList(_alphaSlugs);
  return { node: wrap, title: 'Modules', crumbs: [{ label: 'Modules' }], mainClass: 'no-rail' };
}

// --- MODULE PAGE ---
export function renderModulePage(n) {
  const num = Number(n);
  const m = moduleByN(num);
  if (!m) return renderNotFound('Module ' + n + ' not found.');
  const concepts = conceptsForModule(num);
  setCycleList(concepts.map(c => c.slug));

  const wrap = el('article', { 'aria-labelledby': 'mod-h1', class: 'fade-up', 'data-module': String(num) });
  wrap.appendChild(el('div', { class: 'hero-strip' }, [
    el('div', { class: 'hero-stripe' }),
    el('div', { class: 'hero-meta' }, [
      el('div', { class: 'hero-num' }, 'Module ' + String(num).padStart(2, '0')),
      el('h1', { class: 'hero-title', id: 'mod-h1' }, m.title),
      el('p', { class: 'hero-tagline' }, m.intro)
    ])
  ]));

  // Progress
  const completed = concepts.filter(c => getConceptState(c.slug).complete).length;
  const pct = concepts.length ? Math.round((completed / concepts.length) * 100) : 0;
  wrap.appendChild(el('div', { class: 'playbook-meta-row' }, [
    el('div', null, [el('div', { class: 'label' }, 'Concepts'), el('div', { class: 'value' }, String(concepts.length))]),
    el('div', null, [el('div', { class: 'label' }, 'Complete'), el('div', { class: 'value' }, completed + ' (' + pct + '%)')]),
    el('div', null, [el('div', { class: 'label' }, 'Cumulative quiz'), el('div', { class: 'value' }, [el('a', { href: '#/module/' + num + '/quiz' }, 'Take')])]),
    el('div', null, [el('div', { class: 'label' }, 'Capstone'), el('div', { class: 'value' }, [el('a', { href: '#/capstone/' + num }, 'Open')])]),
    el('div', null, [el('div', { class: 'label' }, 'Stats'), el('div', { class: 'value' }, [el('a', { href: '#/module/' + num + '/stats' }, 'View')])])
  ]));

  // Group by subsection
  const groups = new Map();
  for (const c of concepts) {
    const key = c.subsection || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  const list = el('div', { class: 'module-cluster-list' });
  for (const [section, items] of groups.entries()) {
    if (section) list.appendChild(el('h2', null, section));
    for (const c of items) {
      const state = getConceptState(c.slug);
      list.appendChild(el('a', {
        href: '#/concept/' + c.slug,
        class: 'concept-row' + (state.complete ? ' is-complete' : ''),
        'data-module': String(c.module)
      }, [
        el('span', { class: 'tick' }, state.complete ? '✓' : ''),
        el('div', null, [
          el('p', { class: 'name' }, c.name),
          el('p', { class: 'stub' }, c.stub)
        ]),
        el('span', { class: 'pill ' + (c.fleshed ? 'pill-fleshed' : 'pill-stub') }, c.fleshed ? 'Fleshed' : 'Stub')
      ]));
    }
  }
  wrap.appendChild(list);

  // Next module link
  const nextMod = moduleByN(num + 1);
  if (nextMod) {
    wrap.appendChild(el('div', { class: 'next-prev-nav' }, [
      el('span', null, ''),
      el('a', { href: '#/module/' + (num + 1), class: 'next' }, [
        el('div', { class: 'label' }, 'Next module'),
        el('div', { class: 'target' }, 'Module ' + (num + 1) + ': ' + nextMod.title)
      ])
    ]));
  }

  // Right rail context: jump to module on map
  const ctx = el('div', null, [
    el('section', { class: 'context-card' }, [
      el('h3', null, 'On the map'),
      el('p', { style: 'margin: 0; font-size: var(--fs-200); color: var(--text-3);' }, 'See this module in context with all 16 modules and the cross-reference graph.'),
      el('a', { class: 'btn btn-sm', href: '#/map?module=' + num, style: 'margin-top: 10px;' }, 'Open on map →')
    ])
  ]);

  linkifyText(wrap);
  return { node: wrap, title: 'Module ' + num + ': ' + m.title, crumbs: [{ label: 'Modules', href: '#/modules' }, { label: m.title }], context: ctx };
}

// --- GLOSSARY ---
export function renderGlossary() {
  const wrap = el('article', { 'aria-labelledby': 'glos-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Index'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'glos-h1' }, 'Glossary'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, 'All ' + CONCEPTS.length + ' concepts in alphabetical order. Use j and k to cycle.'));

  // Type-to-filter
  const filterInput = el('input', { type: 'search', placeholder: 'Filter by name or stub', 'aria-label': 'Filter glossary' });
  const toolbar = el('div', { class: 'glossary-toolbar' }, [filterInput]);
  wrap.appendChild(toolbar);

  // Buckets
  const sorted = CONCEPTS.slice().sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  const buckets = new Map();
  for (const c of sorted) {
    const ch = c.name.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(ch) ? ch : '#';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(c);
  }
  const keys = Array.from(buckets.keys()).sort((a, b) => a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b));

  // Letter strip
  const strip = el('div', { class: 'letter-strip' });
  for (const k of keys) strip.appendChild(el('a', { href: '#bucket-' + k }, k));
  wrap.appendChild(strip);

  // Buckets render
  const listsWrap = el('div', null);
  for (const k of keys) {
    const bucket = el('section', { class: 'glossary-bucket', id: 'bucket-' + k });
    bucket.appendChild(el('h2', { class: 'glossary-bucket-letter' }, k));
    for (const c of buckets.get(k)) {
      const state = getConceptState(c.slug);
      bucket.appendChild(el('a', {
        href: '#/concept/' + c.slug,
        class: 'concept-row' + (state.complete ? ' is-complete' : ''),
        'data-module': String(c.module)
      }, [
        el('span', { class: 'tick' }, state.complete ? '✓' : ''),
        el('div', null, [
          el('p', { class: 'name' }, c.name + (c.aliases && c.aliases.length ? ' (' + c.aliases.join(', ') + ')' : '')),
          el('p', { class: 'stub' }, c.stub)
        ]),
        el('span', { class: 'pill pill-mod' }, 'M' + c.module)
      ]));
    }
    listsWrap.appendChild(bucket);
  }
  wrap.appendChild(listsWrap);

  // Live filter
  filterInput.addEventListener('input', () => {
    const q = filterInput.value.toLowerCase().trim();
    const rows = listsWrap.querySelectorAll('.concept-row');
    let totalShown = 0;
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      const visible = !q || text.includes(q);
      r.style.display = visible ? '' : 'none';
      if (visible) totalShown++;
    });
    // Hide empty buckets
    listsWrap.querySelectorAll('.glossary-bucket').forEach(b => {
      const visibleRows = Array.from(b.querySelectorAll('.concept-row')).filter(r => r.style.display !== 'none').length;
      b.style.display = visibleRows ? '' : 'none';
    });
  });

  setCycleList(_alphaSlugs);
  return { node: wrap, title: 'Glossary', crumbs: [{ label: 'Glossary' }], mainClass: 'no-rail' };
}

// --- PROFILE ---
export function renderProfile() {
  const xp = lsGet('xp', 0);
  const tier = computeTier(xp);
  const nt = nextTier(xp);
  const settings = getSettings();
  const ach = getAchievements();
  const streak = getStreak();
  const completedCount = CONCEPTS.filter(c => getConceptState(c.slug).complete).length;
  const moduleCompletedCount = MODULES.filter(m => {
    const cs = conceptsForModule(m.n);
    return cs.length > 0 && cs.every(c => getConceptState(c.slug).complete);
  }).length;
  const unlockedCount = ACHIEVEMENTS_REGISTRY.filter(a => ach[a.id] && ach[a.id].unlocked_at).length;

  const wrap = el('article', { 'aria-labelledby': 'prof-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Mission control'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'prof-h1' }, 'Profile'));

  // Hero
  const hero = el('section', { class: 'profile-hero' });
  hero.appendChild(el('div', { class: 'profile-tier-row' }, [
    el('div', { class: 'profile-tier-badge', 'aria-hidden': 'true' }, String(tier.n)),
    el('div', { class: 'profile-tier-meta' }, [
      el('div', { class: 'profile-tier-num' }, 'Tier ' + tier.n + ' of 8'),
      el('div', { class: 'profile-tier-name' }, tier.name),
      el('div', { class: 'profile-tier-num' }, xp + ' XP earned')
    ])
  ]));
  const pct = nt ? Math.min(100, Math.round(((xp - tier.threshold) / (nt.threshold - tier.threshold)) * 100)) : 100;
  const xpBarLabel = nt ? (nt.threshold - xp) + ' XP to ' + nt.name : 'Top tier reached';
  hero.appendChild(el('div', { class: 'profile-xp-bar' }, [
    el('div', { class: 'meta' }, [
      el('span', null, xpBarLabel),
      el('span', null, pct + '%')
    ]),
    el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': 'Tier progress' }, [
      el('div', { class: 'progress-fill', style: 'width: ' + pct + '%' })
    ])
  ]));
  wrap.appendChild(hero);

  // Stats
  wrap.appendChild(el('div', { class: 'home-stats' }, [
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, completedCount + ' / ' + CONCEPTS.length),
      el('span', { class: 'label' }, 'concepts complete')
    ]),
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, moduleCompletedCount + ' / ' + MODULES.length),
      el('span', { class: 'label' }, 'modules complete')
    ]),
    el('div', { class: 'home-stat' }, [
      el('span', { class: 'num' }, String(streak.count)),
      el('span', { class: 'label' }, 'day streak')
    ])
  ]));

  // Within reach: 3 nearest unlocked achievements with progress
  const nearest = getNearestAchievements(3);
  if (nearest.length) {
    wrap.appendChild(el('h2', { style: 'margin-top: 32px;' }, 'Within reach'));
    const reach = el('div', { class: 'nearest-grid' });
    for (const n of nearest) {
      const pct = Math.round(n.progress * 100);
      reach.appendChild(el('div', { class: 'nearest-card' }, [
        el('div', null, [
          el('div', { class: 'nearest-name' }, n.name),
          el('div', { class: 'nearest-desc' }, n.desc),
          el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), style: 'margin-top: 8px;' }, [
            el('div', { class: 'progress-fill', style: 'width: ' + Math.max(4, pct) + '%' })
          ]),
          el('div', { class: 'nearest-meta' }, pct + '% · +' + n.bonusXP + ' XP on unlock')
        ])
      ]));
    }
    wrap.appendChild(reach);
  }

  // Achievements
  wrap.appendChild(el('h2', { style: 'margin-top: 32px;' }, 'Achievements (' + unlockedCount + ' / ' + ACHIEVEMENTS_REGISTRY.length + ')'));
  const grid = el('div', { class: 'achievements-grid' });
  for (const a of ACHIEVEMENTS_REGISTRY) {
    const unlocked = ach[a.id] && ach[a.id].unlocked_at;
    grid.appendChild(el('div', {
      class: 'achievement-tile ' + (unlocked ? 'is-unlocked' : 'is-locked'),
      'aria-label': a.name + (unlocked ? ' (unlocked)' : ' (locked)')
    }, [
      el('span', { class: 'ico', 'aria-hidden': 'true' }, unlocked ? '✓' : ''),
      el('div', null, [
        el('p', { class: 'name' }, a.name),
        el('p', { class: 'desc' }, a.desc),
        el('p', { class: 'meta' }, unlocked ? 'Unlocked ' + new Date(ach[a.id].unlocked_at).toLocaleDateString() : '+' + a.bonusXP + ' XP when unlocked')
      ])
    ]));
  }
  wrap.appendChild(grid);

  // Settings + Share link
  wrap.appendChild(el('div', { style: 'margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap;' }, [
    el('a', { class: 'btn btn-primary', href: '#/settings' }, 'Open settings'),
    (() => {
      const b = el('button', { class: 'btn btn-ghost', type: 'button' }, '🔗 Generate share link');
      b.addEventListener('click', async () => {
        const { buildShareToken } = await import('./profile-share.js');
        const token = buildShareToken();
        const url = window.location.origin + window.location.pathname + '#/share/' + token;
        try {
          await navigator.clipboard.writeText(url);
          announce('Share URL copied to clipboard.');
          b.textContent = '✓ Copied: ' + url.slice(0, 56) + '...';
          setTimeout(() => { b.textContent = '🔗 Generate share link'; }, 4000);
        } catch {
          _showShareFallback(url);
        }
      });
      return b;
    })()
  ]));

  return { node: wrap, title: 'Profile', crumbs: [{ label: 'Profile' }], mainClass: 'no-rail' };
}

// Inline modal used when clipboard copy fails (clipboard API blocked or http://).
function _showShareFallback(url) {
  const prev = document.activeElement;
  const backdrop = el('div', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'share-fb-h' });
  backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(8,8,10,.6); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(6px);';
  const card = el('div');
  card.style.cssText = 'width: min(520px, 92vw); background: var(--surface-1); border: 1px solid var(--border-3); border-radius: var(--radius-3); box-shadow: var(--shadow-3); padding: 20px;';
  const h = el('h2', { id: 'share-fb-h', style: 'margin: 0 0 8px;' }, 'Copy the share URL');
  const p = el('p', { style: 'color: var(--text-3); margin: 0 0 12px; font-size: var(--fs-200);' }, 'Clipboard access was blocked. Select the URL below and copy it manually.');
  const ta = el('textarea', { rows: '3', readonly: 'readonly' });
  ta.style.cssText = 'width: 100%; box-sizing: border-box; padding: 8px; border-radius: var(--radius-2); border: 1px solid var(--border-2); background: var(--surface-1); color: var(--text-1); font: inherit; word-break: break-all;';
  ta.value = url;
  const row = el('div'); row.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;';
  const closeBtn = el('button', { type: 'button', class: 'btn btn-primary' }, 'Done');
  const close = () => {
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    if (prev && prev.focus) prev.focus();
  };
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
  row.appendChild(closeBtn);
  card.appendChild(h); card.appendChild(p); card.appendChild(ta); card.appendChild(row);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  setTimeout(() => { ta.focus(); ta.select(); }, 0);
}
