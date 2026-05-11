// Cumulative module quiz: 10 questions drawn from across the module's
// concept QUIZZES. Pass at 7+ correct earns MODULE_QUIZ_PASS XP (50).

import { el, clear, announce } from '../runtime.js';
import { CONCEPTS, MODULES } from '../data.js';
import { QUIZZES } from '../quizzes.js';
import { conceptsForModule, conceptBySlug } from '../crossref.js';
import { awardXP, getConceptState } from '../gamification.js';
import { XP_VALUES } from '../gam-data.js';
import { renderNotFound } from './main.js';

const QUESTIONS_PER_QUIZ = 10;

export function renderModuleQuiz(n) {
  const num = parseInt(n, 10);
  const m = MODULES.find(x => x.n === num);
  if (!m) return renderNotFound('Module ' + n + ' not found.');

  // Build a deck of 10 questions from across the module's concepts
  const concepts = conceptsForModule(num);
  const allQs = [];
  for (const c of concepts) {
    const qs = QUIZZES[c.slug];
    if (!qs || !qs.length) continue;
    for (const q of qs) allQs.push({ slug: c.slug, conceptName: c.name, ...q });
  }
  // Stable seed per day so a user's "today's quiz" is consistent
  const today = new Date();
  const seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate() + num;
  const deck = _shuffleSeeded(allQs, seed).slice(0, QUESTIONS_PER_QUIZ);

  const wrap = el('article', { 'aria-labelledby': 'mq-h1', class: 'fade-up', 'data-module': String(num) });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Cumulative quiz'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'mq-h1' }, 'Module ' + num + ' quiz: ' + m.title));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    deck.length + ' questions drawn from across the module. Pass at ' + Math.ceil(deck.length * 0.7) + ' correct to earn ' + XP_VALUES.MODULE_QUIZ_PASS + ' XP.'
  ));

  if (!deck.length) {
    wrap.appendChild(el('section', { class: 'context-card' }, [
      el('h3', null, 'Quiz not available yet.'),
      el('p', null, 'No concept quizzes exist for this module. Build them first; the cumulative quiz auto-populates.')
    ]));
    return { node: wrap, title: 'Module ' + num + ' quiz', crumbs: [{ label: 'Practice', href: '#/practice' }, { label: 'M' + num + ' quiz' }], mainClass: 'no-rail' };
  }

  let idx = 0;
  let correct = 0;
  const answers = [];
  const stage = el('section', { class: 'mq-stage' });
  wrap.appendChild(stage);

  function render() {
    clear(stage);
    if (idx >= deck.length) {
      const passThreshold = Math.ceil(deck.length * 0.7);
      const passed = correct >= passThreshold;

      stage.appendChild(el('div', {
        class: 'mq-result-banner ' + (passed ? 'is-pass' : 'is-fail')
      }, [
        el('div', { class: 'practice-card-eyebrow' }, passed ? 'Passed' : 'Try again'),
        el('div', { style: 'font-size: var(--fs-700); font-weight: 700;' }, correct + ' / ' + deck.length),
        el('p', null, passed
          ? '+' + XP_VALUES.MODULE_QUIZ_PASS + ' XP earned. The cumulative quiz refreshes daily; come back for a different deck.'
          : 'Aim for ' + passThreshold + '+ correct. Review the missed concepts; the deck reshuffles tomorrow.'
        )
      ]));

      if (passed) {
        // Idempotent XP via per-day key so re-takes don't double-pay
        const dayKey = today.getUTCFullYear() + '-' + String(today.getUTCMonth() + 1).padStart(2, '0') + '-' + String(today.getUTCDate()).padStart(2, '0');
        awardXP(XP_VALUES.MODULE_QUIZ_PASS, 'module_quiz_pass', 'm' + num + '-' + dayKey);
      }

      // Per-question review
      stage.appendChild(el('h2', { style: 'margin-top: 24px;' }, 'Per-question review'));
      const list = el('div', { style: 'display: flex; flex-direction: column; gap: 10px;' });
      deck.forEach((q, i) => {
        const ans = answers[i];
        const wasCorrect = ans !== undefined && ans === q.correctIndex;
        list.appendChild(el('div', { class: 'mq-review ' + (wasCorrect ? 'is-correct' : 'is-wrong') }, [
          el('div', { class: 'practice-card-eyebrow' }, 'Q' + (i + 1) + ' · ' + q.conceptName),
          el('p', { style: 'margin: 4px 0; font-weight: 500;' }, q.prompt),
          el('p', { style: 'color: var(--text-3); font-size: var(--fs-100); margin: 0;' },
            'Your answer: ' + (ans !== undefined ? q.options[ans] : '(skipped)') +
            ' · Correct: ' + q.options[q.correctIndex]
          ),
          el('p', { style: 'color: var(--text-2); font-size: var(--fs-200); margin: 4px 0 0;' }, q.explanation)
        ]));
      });
      stage.appendChild(list);

      // Actions
      const acts = el('div', { style: 'display: flex; gap: 8px; margin-top: 24px;' });
      const retry = el('button', { class: 'btn btn-primary', type: 'button' }, 'Retry');
      retry.addEventListener('click', () => {
        idx = 0;
        correct = 0;
        answers.length = 0;
        render();
      });
      acts.appendChild(retry);
      acts.appendChild(el('a', { class: 'btn btn-ghost', href: '#/module/' + num }, 'Back to module'));
      acts.appendChild(el('a', { class: 'btn btn-ghost', href: '#/capstone/' + num }, 'Take capstone'));
      stage.appendChild(acts);
      return;
    }

    const q = deck[idx];
    stage.appendChild(el('div', { class: 'mq-progress' }, [
      el('span', null, 'Question ' + (idx + 1) + ' of ' + deck.length),
      el('div', { class: 'mq-progress-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(deck.length), 'aria-valuenow': String(idx) }, [
        el('div', { class: 'mq-progress-fill', style: 'width: ' + (idx / deck.length * 100) + '%' })
      ])
    ]));

    const concept = conceptBySlug(q.slug);
    if (concept) {
      stage.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); letter-spacing: 0.06em; text-transform: uppercase; margin: 12px 0 4px;' }, 'Concept: ' + concept.name));
    }
    stage.appendChild(el('h2', { style: 'margin: 0 0 16px; font-size: var(--fs-400);' }, q.prompt));

    const opts = el('div', { class: 'mq-options' });
    q.options.forEach((label, i) => {
      const b = el('button', { class: 'mq-option', type: 'button' }, label);
      b.addEventListener('click', () => {
        answers.push(i);
        if (i === q.correctIndex) correct++;
        // Show feedback briefly
        clear(stage);
        const isC = i === q.correctIndex;
        stage.appendChild(el('div', { class: 'mq-feedback ' + (isC ? 'is-correct' : 'is-wrong') }, [
          el('div', { class: 'practice-card-eyebrow' }, isC ? 'Correct' : 'Not quite'),
          el('p', { style: 'margin: 4px 0;' }, q.prompt),
          el('p', { style: 'color: var(--text-2); margin: 8px 0;' }, 'Your answer: ' + q.options[i] + (isC ? ' ✓' : '')),
          isC ? null : el('p', { style: 'color: var(--text-2); margin: 4px 0;' }, 'Correct: ' + q.options[q.correctIndex]),
          el('p', { style: 'color: var(--text-3); font-size: var(--fs-200); margin: 8px 0 0;' }, q.explanation)
        ]));
        const cont = el('button', { class: 'btn btn-primary', type: 'button', style: 'margin-top: 12px;' }, idx + 1 < deck.length ? 'Next question →' : 'See result →');
        cont.addEventListener('click', () => { idx++; render(); });
        stage.appendChild(cont);
      });
      opts.appendChild(b);
    });
    stage.appendChild(opts);
  }

  render();

  return {
    node: wrap,
    title: 'Module ' + num + ' quiz',
    crumbs: [{ label: 'Practice', href: '#/practice' }, { label: m.title, href: '#/module/' + num }, { label: 'Quiz' }],
    mainClass: 'no-rail'
  };
}

// Deterministic shuffle seeded from a number
function _shuffleSeeded(arr, seed) {
  const out = arr.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
