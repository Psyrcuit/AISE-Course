// Prompt linter. 8-rubric heuristic scoring + optional AI critique with key.

import { el, clear } from '../../runtime.js';
import { lintPrompt } from '../../heuristics.js';
import { aiOrFallback, hasAnyKey } from '../../ai.js';

const SAMPLE = 'You are a senior support engineer. Classify each ticket into billing, technical, or account. Output only the single label, no explanation. Do not use for: refund disputes (escalate instead). Examples: "My charge looks wrong" -> billing. Constraint: respond in 1 word.';

export function renderPromptLinter() {
  const wrap = el('article', { 'aria-labelledby': 'pl-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Utility'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'pl-h1' }, 'Prompt linter'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    '8-dimension rubric: clarity, output format, role, examples, negative triggers, context separation, length, constraints. ' +
    'Heuristic-first; with an API key, also runs an LLM-as-judge for nuance.'
  ));

  const ta = el('textarea', {
    class: 'editor-textarea',
    rows: '10',
    style: 'width: 100%; min-height: 200px; font-family: var(--font-mono); font-size: var(--fs-200); margin-top: 16px;',
    placeholder: 'Paste a prompt...'
  });
  ta.value = SAMPLE;
  wrap.appendChild(ta);

  const ctrls = el('div', { style: 'display: flex; gap: 8px; margin-top: 8px;' }, [
    btn('Use sample', () => { ta.value = SAMPLE; render(); }),
    btn('Clear', () => { ta.value = ''; render(); }),
    el('div', { style: 'flex: 1;' }),
    (() => {
      const b = el('button', { class: 'btn btn-primary btn-sm', type: 'button' }, hasAnyKey() ? 'Critique with AI' : 'Heuristic only');
      b.addEventListener('click', renderAi);
      return b;
    })()
  ]);
  wrap.appendChild(ctrls);

  const stage = el('div', { style: 'margin-top: 16px;' });
  wrap.appendChild(stage);
  ta.addEventListener('input', render);

  function render() {
    const result = lintPrompt(ta.value);
    clear(stage);
    stage.appendChild(renderRubric(result));
  }

  async function renderAi() {
    const result = lintPrompt(ta.value);
    clear(stage);
    stage.appendChild(renderRubric(result));
    if (!hasAnyKey()) return;
    const aiBlock = el('div', { style: 'margin-top: 16px; padding: 16px; border: 1px solid var(--border-2); border-radius: var(--radius-3); background: var(--surface-1);' });
    aiBlock.appendChild(el('div', { class: 'practice-card-eyebrow' }, 'AI critique · loading...'));
    stage.appendChild(aiBlock);
    const out = await aiOrFallback(
      async () => {
        const { aiCall } = await import('../../ai.js');
        const sys = 'You are a senior LLM prompt engineer. Critique the user prompt: 3 specific strengths, 3 specific gaps, 1 rewrite suggestion. Be concrete; no fluff.';
        return await aiCall({ system: sys, messages: [{ role: 'user', content: ta.value }], maxTokens: 600 });
      },
      () => 'No AI critique available without an API key.'
    );
    clear(aiBlock);
    aiBlock.appendChild(el('div', { class: 'practice-card-eyebrow' }, out.source === 'ai' ? 'AI critique' : 'Heuristic fallback'));
    aiBlock.appendChild(el('pre', { style: 'white-space: pre-wrap; font-family: inherit; font-size: var(--fs-200); color: var(--text-2); margin: 8px 0 0;' }, out.value));
  }

  render();

  return {
    node: wrap,
    title: 'Prompt linter',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'Prompt linter' }],
    mainClass: 'no-rail'
  };
}

function renderRubric(result) {
  const sec = el('section', { class: 'utility-section' });
  // Score donut
  const head = el('div', { style: 'display: flex; align-items: center; gap: 16px;' }, [
    el('div', {
      class: 'utility-score-ring',
      style: '--ring-pct: ' + result.score + '%;',
      'aria-label': 'Score: ' + result.score + ' percent'
    }, [
      el('div', { class: 'utility-score-num' }, String(result.score)),
      el('div', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, '/ 100')
    ]),
    el('div', { style: 'flex: 1;' }, [
      el('div', { style: 'font-size: var(--fs-300); font-weight: 500;' }, result.passed + ' / ' + result.total + ' dimensions pass'),
      el('p', { style: 'color: var(--text-3); font-size: var(--fs-100); margin: 4px 0 0;' },
        result.score >= 80 ? 'Production-ready.' : result.score >= 60 ? 'Solid; tighten the gaps.' : 'Significant gaps; iterate before deployment.'
      )
    ])
  ]);
  sec.appendChild(head);

  // Per-dimension list
  const list = el('div', { style: 'display: grid; grid-template-columns: 1fr; gap: 6px; margin-top: 16px;' });
  for (const d of result.dimensions) {
    list.appendChild(el('div', {
      class: 'utility-rubric-row ' + (d.ok ? 'is-pass' : 'is-fail')
    }, [
      el('span', { class: 'utility-rubric-icon', 'aria-hidden': 'true' }, d.ok ? '✓' : '!'),
      el('div', null, [
        el('div', { style: 'font-weight: 500; font-size: var(--fs-200);' }, d.label),
        el('div', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, d.note)
      ])
    ]));
  }
  sec.appendChild(list);
  return sec;
}

function btn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}
