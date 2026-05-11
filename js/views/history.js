// Concept history: ring buffer of the last 50 concepts the user viewed.
// Renders at #/history. Each visit to a concept page logs to this list.

import { CONCEPTS, MODULES } from '../data.js';
import { el, lsGet, lsSet } from '../runtime.js';
import { conceptBySlug } from '../crossref.js';
import { getConceptState } from '../gamification.js';

const HISTORY_KEY = 'history';
const MAX_ENTRIES = 50;

/**
 * Append a concept slug to the history. De-dupes consecutive same slug.
 * Newest entry is at index 0.
 */
export function pushHistory(slug) {
  const hist = lsGet(HISTORY_KEY, []);
  if (hist[0] && hist[0].slug === slug) {
    // Update the timestamp on the most recent entry
    hist[0].at = new Date().toISOString();
  } else {
    hist.unshift({ slug, at: new Date().toISOString() });
  }
  while (hist.length > MAX_ENTRIES) hist.pop();
  lsSet(HISTORY_KEY, hist);
}

export function getHistory() { return lsGet(HISTORY_KEY, []); }

export function renderHistory() {
  const wrap = el('article', { 'aria-labelledby': 'hist-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Your trail'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'hist-h1' }, 'History'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'The last 50 concepts you opened. Useful for jumping back to where you were yesterday or rebuilding context.'
  ));

  const hist = getHistory();
  if (!hist.length) {
    wrap.appendChild(el('section', { class: 'context-card' }, [
      el('h3', null, 'No history yet.'),
      el('p', null, 'Open any concept; it logs here automatically.'),
      el('a', { class: 'btn btn-primary', href: '#/modules' }, 'Browse modules')
    ]));
    return { node: wrap, title: 'History', crumbs: [{ label: 'History' }], mainClass: 'no-rail' };
  }

  // Group by day
  const byDay = new Map();
  for (const h of hist) {
    const day = (h.at || '').slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(h);
  }

  const formatDay = (d) => {
    if (!d) return '';
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    if (d === today) return 'Today';
    if (d === yest) return 'Yesterday';
    try {
      return new Date(d + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch { return d; }
  };

  for (const [day, items] of byDay.entries()) {
    const sec = el('section', { class: 'history-day' });
    sec.appendChild(el('h2', null, formatDay(day)));
    const list = el('div', { class: 'module-cluster-list' });
    for (const h of items) {
      const c = conceptBySlug(h.slug);
      if (!c) continue;
      const s = getConceptState(c.slug);
      const time = h.at ? new Date(h.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';
      list.appendChild(el('a', {
        href: '#/concept/' + c.slug,
        class: 'concept-row' + (s.complete ? ' is-complete' : ''),
        'data-module': String(c.module)
      }, [
        el('span', { class: 'tick' }, s.complete ? '✓' : ''),
        el('div', null, [
          el('p', { class: 'name' }, c.name),
          el('p', { class: 'stub', style: 'color: var(--text-3); font-size: var(--fs-100);' },
            'M' + c.module + (time ? ' · ' + time : '')
          )
        ]),
        el('span', { class: 'pill ' + (c.fleshed ? 'pill-fleshed' : 'pill-stub') }, c.fleshed ? 'Fleshed' : 'Stub')
      ]));
    }
    sec.appendChild(list);
    wrap.appendChild(sec);
  }

  // Clear button
  wrap.appendChild(el('div', { style: 'margin-top: 24px;' }, [
    (() => {
      const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Clear history');
      b.addEventListener('click', () => {
        if (confirm('Clear all concept history? Cannot be undone.')) {
          lsSet(HISTORY_KEY, []);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
      return b;
    })()
  ]));

  return {
    node: wrap,
    title: 'History',
    crumbs: [{ label: 'History' }],
    mainClass: 'no-rail'
  };
}

window.aise26 = Object.assign(window.aise26 || {}, { history: { pushHistory, getHistory } });
