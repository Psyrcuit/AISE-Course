// Skill tree page (#/path). Your-progression-aware view.
// Differs from System Map (exploratory) - this surface emphasizes locks,
// completion, and the recommended order.

import { CONCEPTS, MODULES } from '../data.js';
import { el, getSettings } from '../runtime.js';
import { getConceptState, isSaved } from '../gamification.js';
import { conceptsForModule } from '../crossref.js';

export function renderPath() {
  const wrap = el('article', { 'aria-labelledby': 'path-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Your trajectory'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'path-h1' }, 'Path'));

  const settings = getSettings();
  const profile = settings.profile || {};
  const recommended = (profile.recommended_path || []).slice();

  // Quick stats banner
  const allConcepts = CONCEPTS.length;
  const allComplete = CONCEPTS.filter(c => getConceptState(c.slug).complete).length;
  const masteredCount = CONCEPTS.filter(c => {
    const s = getConceptState(c.slug);
    return s.complete && s.flashcard_mastered && s.quiz_passed;
  }).length;

  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Module-by-module progression with prerequisite chains. ' +
    allComplete + ' of ' + allConcepts + ' concepts read; ' + masteredCount + ' mastered (read + flashcard + quiz).'
  ));

  if (recommended.length) {
    wrap.appendChild(el('div', { class: 'continue-hero' }, [
      el('div', null, [
        el('div', { class: 'label' }, 'Recommended order'),
        el('div', { class: 'target' }, recommended.map(n => 'M' + n).join(' → '))
      ]),
      el('a', { class: 'btn btn-primary', href: '#/module/' + recommended[0] }, 'Start here →')
    ]));
  } else {
    wrap.appendChild(el('p', { class: 'placeholder' },
      'No personalized path yet. ',
      el('a', { href: '#/onboarding' }, 'Run onboarding'),
      ' to generate one.'
    ));
  }

  // Module grid with concept nodes
  const modulesWrap = el('div', { class: 'path-modules' });

  for (const m of MODULES) {
    const concepts = conceptsForModule(m.n);
    const completed = concepts.filter(c => getConceptState(c.slug).complete).length;
    const mastered = concepts.filter(c => {
      const s = getConceptState(c.slug);
      return s.complete && s.flashcard_mastered && s.quiz_passed;
    }).length;
    const pct = concepts.length ? Math.round(completed / concepts.length * 100) : 0;

    const modCard = el('section', {
      class: 'path-module',
      'data-module': String(m.n),
      'aria-labelledby': 'path-mod-' + m.n
    });

    modCard.appendChild(el('div', { class: 'path-module-head' }, [
      el('span', { class: 'path-module-dot', 'aria-hidden': 'true' }),
      el('h3', { class: 'path-module-title', id: 'path-mod-' + m.n }, 'M' + m.n + ': ' + m.title),
      el('span', { class: 'path-module-meta' }, completed + ' / ' + concepts.length + (mastered ? ' · ' + mastered + ' mastered' : ''))
    ]));

    modCard.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); margin: 0 0 10px;' }, m.intro));

    // Progress bar
    modCard.appendChild(el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': 'Module ' + m.n + ' progress', style: 'margin-bottom: 12px;' }, [
      el('div', { class: 'progress-fill', style: 'width: ' + pct + '%' })
    ]));

    // Concept nodes
    const nodes = el('div', { class: 'path-nodes' });
    let prevDone = true;            // first node always available
    concepts.forEach((c, i) => {
      const s = getConceptState(c.slug);
      const completed = !!s.complete;
      const isMastered = completed && s.flashcard_mastered && s.quiz_passed;
      // Light prerequisite logic: the very first concept of a module is always available;
      // each subsequent concept "unlocks" once the previous one is read OR once you've
      // viewed any concept in that module (so users aren't forced into strict order).
      const isLocked = false;        // soft lock: never strict; tree shows visual hints only
      let cls = 'path-node';
      if (completed) cls += ' is-completed';
      if (isMastered) cls += ' is-mastered';
      if (isLocked) cls += ' is-locked';

      const node = el('a', {
        class: cls,
        href: '#/concept/' + c.slug,
        title: c.name + (isMastered ? ' (mastered)' : completed ? ' (read)' : '')
      });
      node.appendChild(el('span', null, c.name));
      if (isMastered) node.appendChild(el('span', { class: 'path-node-state', 'aria-label': 'Mastered' }, '★'));
      else if (completed) node.appendChild(el('span', { class: 'path-node-state', 'aria-label': 'Completed' }, '✓'));
      nodes.appendChild(node);
      prevDone = completed;
    });
    modCard.appendChild(nodes);
    modulesWrap.appendChild(modCard);
  }

  wrap.appendChild(modulesWrap);

  // Right rail context
  const ctx = el('div', null, [
    el('section', { class: 'context-card' }, [
      el('h3', null, 'Legend'),
      el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); line-height: 1.6;' }, [
        'Subtle outline: not started. ',
        'Filled tinted: read. ',
        'Module-hue solid: mastered (read + flashcard + quiz).'
      ])
    ]),
    el('section', { class: 'context-card' }, [
      el('h3', null, 'Other views'),
      el('ul', { style: 'list-style:none; padding:0; margin:0;' }, [
        el('li', { style: 'margin-bottom: 6px;' }, el('a', { href: '#/map' }, 'System Map (exploratory)')),
        el('li', { style: 'margin-bottom: 6px;' }, el('a', { href: '#/modules' }, 'Modules index')),
        el('li', null, el('a', { href: '#/glossary' }, 'Alphabetical glossary'))
      ])
    ])
  ]);

  return {
    node: wrap,
    title: 'Path',
    crumbs: [{ label: 'Path' }],
    context: ctx
  };
}
