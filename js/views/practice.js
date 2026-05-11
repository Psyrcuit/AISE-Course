// Practice hub: unified surface for SRS, quiz retakes, capstones, mock interview.
// Surface order locked in DESIGN.md §5.

import { el } from '../runtime.js';
import { CONCEPTS, MODULES } from '../data.js';
import { srsStats, dueToday, forecast } from '../srs.js';
import { getConceptState, getCapstoneState, pickDailyQuest } from '../gamification.js';
import { conceptBySlug, conceptsForModule } from '../crossref.js';

export function renderPractice() {
  const wrap = el('article', { 'aria-labelledby': 'pr-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Practice hub'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'pr-h1' }, 'Practice'));

  // ----- Section 1: Due today -----
  const dueSec = el('section', { class: 'practice-section' });
  dueSec.appendChild(el('h2', null, 'Due today'));

  const stats = srsStats();
  const quizRetakes = listQuizRetakes();
  const quest = pickDailyQuest();

  const dueCards = el('div', { class: 'practice-cards' });

  // SRS card
  dueCards.appendChild(el('div', { class: 'practice-card' + (stats.dueNow > 0 ? ' is-primary' : '') }, [
    el('div', { class: 'practice-card-eyebrow' }, 'SRS deck'),
    el('div', { class: 'practice-card-headline' }, stats.dueNow > 0 ? stats.dueNow + ' card' + (stats.dueNow === 1 ? '' : 's') + ' due' : 'No cards due'),
    el('p', { class: 'practice-card-desc' }, stats.mastered + ' of ' + stats.total + ' mastered. ' + stats.seen + ' seen.'),
    el('a', { class: 'btn ' + (stats.dueNow > 0 ? 'btn-primary' : 'btn-ghost'), href: '#/review' }, stats.dueNow > 0 ? 'Start review →' : 'Open review')
  ]));

  // Quiz retake card
  dueCards.appendChild(el('div', { class: 'practice-card' }, [
    el('div', { class: 'practice-card-eyebrow' }, 'Quiz retakes'),
    el('div', { class: 'practice-card-headline' }, quizRetakes.length + ' to retake'),
    el('p', { class: 'practice-card-desc' }, quizRetakes.length ? 'Concepts where you missed at least one question recently.' : 'No retakes pending.'),
    quizRetakes.length ? el('a', { class: 'btn btn-ghost', href: '#/concept/' + quizRetakes[0].slug }, 'Retake first →') : null
  ]));

  // Daily quest card
  if (quest && quest.concept_slug && quest.concept_slug !== '__all_done__') {
    const qc = conceptBySlug(quest.concept_slug);
    if (qc) {
      dueCards.appendChild(el('div', { class: 'practice-card', 'data-module': String(qc.module) }, [
        el('div', { class: 'practice-card-eyebrow' }, 'Daily quest'),
        el('div', { class: 'practice-card-headline' }, qc.name),
        el('p', { class: 'practice-card-desc' }, qc.stub),
        el('a', { class: 'btn btn-ghost', href: '#/concept/' + qc.slug }, quest.completed ? 'Review' : 'Open →')
      ]));
    }
  }

  dueSec.appendChild(dueCards);
  wrap.appendChild(dueSec);

  // ----- Section 2: Per-module practice -----
  const modSec = el('section', { class: 'practice-section' });
  modSec.appendChild(el('h2', null, 'By module'));
  modSec.appendChild(el('p', { style: 'color: var(--text-3); font-size: var(--fs-200);' },
    'Cumulative quizzes (10 questions across the module) and capstones. Each module is a row.'
  ));

  const modList = el('div', { class: 'practice-modules' });
  for (const m of MODULES) {
    const concepts = conceptsForModule(m.n);
    const completed = concepts.filter(c => getConceptState(c.slug).complete).length;
    const cap = getCapstoneState(m.n);
    const capPassed = cap && cap.passed;
    modList.appendChild(el('div', { class: 'practice-module-row', 'data-module': String(m.n) }, [
      el('span', { class: 'practice-module-dot', 'aria-hidden': 'true' }),
      el('div', { class: 'practice-module-meta' }, [
        el('h3', { class: 'practice-module-title' }, 'M' + m.n + ': ' + m.title),
        el('p', { class: 'practice-module-stats' }, completed + ' / ' + concepts.length + ' read' + (capPassed ? ' · capstone passed ✓' : ''))
      ]),
      el('div', { class: 'practice-module-actions' }, [
        el('a', { class: 'btn btn-sm btn-ghost', href: '#/module/' + m.n }, 'Module'),
        el('a', { class: 'btn btn-sm btn-ghost', href: '#/module/' + m.n + '/quiz', 'aria-label': 'Cumulative quiz for module ' + m.n }, 'Quiz'),
        el('a', { class: 'btn btn-sm btn-ghost', href: '#/capstone/' + m.n, 'aria-label': 'Capstone for module ' + m.n }, 'Capstone' + (capPassed ? ' ✓' : ''))
      ])
    ]));
  }
  modSec.appendChild(modList);
  wrap.appendChild(modSec);

  // ----- Section 3: Career prep -----
  const careerSec = el('section', { class: 'practice-section' });
  careerSec.appendChild(el('h2', null, 'Career prep'));
  const careerCards = el('div', { class: 'practice-cards' });
  careerCards.appendChild(el('div', { class: 'practice-card' }, [
    el('div', { class: 'practice-card-eyebrow' }, 'Mock interview'),
    el('div', { class: 'practice-card-headline' }, 'Concept explanation + Systems design'),
    el('p', { class: 'practice-card-desc' }, 'Random concept, you explain. Or pick a systems-design prompt. Heuristic feedback by default; AI grading with a key.'),
    el('a', { class: 'btn btn-ghost', href: '#/interview' }, 'Open →')
  ]));
  careerCards.appendChild(el('div', { class: 'practice-card' }, [
    el('div', { class: 'practice-card-eyebrow' }, 'Career hub'),
    el('div', { class: 'practice-card-headline' }, 'Resume bullets · Salary · Portfolio'),
    el('p', { class: 'practice-card-desc' }, 'Aggregated career tools and Module 12 deep dive.'),
    el('a', { class: 'btn btn-ghost', href: '#/career' }, 'Open hub →')
  ]));
  careerSec.appendChild(careerCards);
  wrap.appendChild(careerSec);

  // Right rail: forecast + tips
  const fc = forecast(7);
  const ctx = el('div', null, [
    el('section', { class: 'context-card' }, [
      el('h3', null, '7-day forecast'),
      el('div', { style: 'display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 8px;' },
        fc.map(d => el('div', {
          style: 'display: flex; flex-direction: column; align-items: center; padding: 4px;',
          title: 'Day +' + d.day + ': ' + d.count + ' due'
        }, [
          el('div', { style: 'font-size: 10px; color: var(--text-3);' }, d.day === 0 ? 'today' : '+' + d.day),
          el('div', { style: 'font-weight: 600; font-size: var(--fs-200);' }, String(d.count))
        ]))
      )
    ]),
    el('section', { class: 'context-card' }, [
      el('h3', null, 'How SRS works'),
      el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); line-height: 1.6;' },
        'Each card you rate is scheduled for next review based on how well you knew it. ' +
        'Easy: longer interval. Again: see it tomorrow. The math compounds: 5 minutes a day beats hour-long cramming.'
      )
    ])
  ]);

  return {
    node: wrap,
    title: 'Practice',
    crumbs: [{ label: 'Practice' }],
    context: ctx
  };
}

// Quiz retake list: concepts where the user has attempted a quiz and at least
// one answer was wrong. Uses concept state quiz_attempts (added later);
// graceful fallback for legacy shape.
function listQuizRetakes() {
  const out = [];
  for (const c of CONCEPTS) {
    const s = getConceptState(c.slug);
    if (!s) continue;
    const attempts = s.quiz_attempts || [];
    if (s.quiz_passed) continue;
    if (attempts.length > 0) out.push({ slug: c.slug, name: c.name, attempts: attempts.length });
  }
  return out;
}
