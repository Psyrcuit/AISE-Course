// Per-module stats drill-in. Detailed view: completion %, mastery %, quiz pass
// rate, weakest concepts (quizzes with attempts but no pass), recent activity.

import { CONCEPTS, MODULES } from '../data.js';
import { el } from '../runtime.js';
import { conceptsForModule } from '../crossref.js';
import { getConceptState, getSaved } from '../gamification.js';
import { renderNotFound } from './main.js';

export function renderModuleStats(n) {
  const num = parseInt(n, 10);
  const m = MODULES.find(x => x.n === num);
  if (!m) return renderNotFound('Module ' + n + ' not found.');

  const concepts = conceptsForModule(num);
  const total = concepts.length;
  let completed = 0, mastered = 0, quizPassed = 0, savedHere = 0;
  const weakest = [];
  const recent = [];
  const saved = new Set(getSaved());

  for (const c of concepts) {
    const s = getConceptState(c.slug);
    if (s.complete) completed++;
    if (s.flashcard_mastered) mastered++;
    if (s.quiz_passed) quizPassed++;
    if (saved.has(c.slug)) savedHere++;
    if (s.quiz_attempts && s.quiz_attempts.length && !s.quiz_passed) {
      weakest.push({ slug: c.slug, name: c.name, attempts: s.quiz_attempts.length });
    }
    if (s.completed_at) recent.push({ slug: c.slug, name: c.name, at: s.completed_at });
  }
  recent.sort((a, b) => (b.at || '').localeCompare(a.at || ''));

  const wrap = el('article', { 'aria-labelledby': 'ms-h1', class: 'fade-up', 'data-module': String(num) });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Module stats'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'ms-h1' }, 'M' + num + ': ' + m.title));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' }, m.intro));

  // Stat grid
  wrap.appendChild(el('div', { class: 'home-stats', style: 'margin-top: 16px;' }, [
    _stat(completed + ' / ' + total, 'concepts read', completed / Math.max(1, total)),
    _stat(mastered + ' / ' + total, 'flashcards mastered', mastered / Math.max(1, total)),
    _stat(quizPassed + ' / ' + total, 'quizzes passed', quizPassed / Math.max(1, total)),
    _stat(String(savedHere), 'saved', null)
  ]));

  // Progress bars
  wrap.appendChild(el('section', { class: 'practice-section' }, [
    el('h2', null, 'Progress'),
    _bar('Read', completed, total),
    _bar('Mastered', mastered, total),
    _bar('Quiz passed', quizPassed, total)
  ]));

  // Weakest concepts
  if (weakest.length) {
    wrap.appendChild(el('section', { class: 'practice-section' }, [
      el('h2', null, 'Weakest concepts (quiz attempts without a pass)'),
      el('p', { style: 'color: var(--text-3); font-size: var(--fs-200);' }, 'Revisit these and retake the quiz.'),
      el('div', { style: 'display: flex; flex-direction: column; gap: 6px;' },
        weakest.slice(0, 8).map(w =>
          el('a', { class: 'concept-row', href: '#/concept/' + w.slug, 'data-module': String(num) }, [
            el('span', { class: 'tick' }, '!'),
            el('div', null, [
              el('p', { class: 'name' }, w.name),
              el('p', { class: 'stub', style: 'color: var(--text-3); font-size: var(--fs-100);' }, w.attempts + ' attempt' + (w.attempts === 1 ? '' : 's') + ' · still not passed')
            ]),
            el('span', { class: 'pill' }, 'Retry')
          ])
        )
      )
    ]));
  }

  // Recent completions
  if (recent.length) {
    wrap.appendChild(el('section', { class: 'practice-section' }, [
      el('h2', null, 'Recently completed'),
      el('div', { style: 'display: flex; flex-direction: column; gap: 6px;' },
        recent.slice(0, 6).map(r =>
          el('a', { class: 'concept-row is-complete', href: '#/concept/' + r.slug, 'data-module': String(num) }, [
            el('span', { class: 'tick' }, '✓'),
            el('div', null, [
              el('p', { class: 'name' }, r.name),
              el('p', { class: 'stub', style: 'color: var(--text-3); font-size: var(--fs-100);' }, r.at ? new Date(r.at).toLocaleDateString() : '')
            ])
          ])
        )
      )
    ]));
  }

  // Actions
  wrap.appendChild(el('div', { style: 'display: flex; gap: 8px; margin-top: 24px;' }, [
    el('a', { class: 'btn btn-primary', href: '#/module/' + num }, 'Back to module'),
    el('a', { class: 'btn btn-ghost', href: '#/module/' + num + '/quiz' }, 'Take cumulative quiz'),
    el('a', { class: 'btn btn-ghost', href: '#/capstone/' + num }, 'Capstone')
  ]));

  return {
    node: wrap,
    title: 'M' + num + ' stats',
    crumbs: [{ label: 'Modules', href: '#/modules' }, { label: m.title, href: '#/module/' + num }, { label: 'Stats' }],
    mainClass: 'no-rail'
  };
}

function _stat(num, label, pct) {
  return el('div', { class: 'home-stat' }, [
    el('span', { class: 'num' + (pct !== null && pct >= 0.66 ? ' accent' : '') }, num),
    el('span', { class: 'label' }, label)
  ]);
}
function _bar(label, value, total) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return el('div', { style: 'margin-bottom: 12px;' }, [
    el('div', { style: 'display: flex; justify-content: space-between; font-size: var(--fs-100); color: var(--text-3); margin-bottom: 4px;' }, [
      el('span', null, label),
      el('span', null, value + ' / ' + total + ' · ' + pct + '%')
    ]),
    el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct) }, [
      el('div', { class: 'progress-fill', style: 'width: ' + pct + '%' })
    ])
  ]);
}
