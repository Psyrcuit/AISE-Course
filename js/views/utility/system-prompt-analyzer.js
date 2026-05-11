// System prompt analyzer. Heuristic checklist + AI critique.

import { el, clear } from '../../runtime.js';
import { analyzeSystemPrompt } from '../../heuristics.js';
import { aiOrFallback, hasAnyKey } from '../../ai.js';

const SAMPLE = 'You are a customer-support triage agent. Classify each ticket into billing, technical, or account. Output only the single label, no explanation. Do NOT use for: refund-dispute escalations (transfer to human). If the ticket is ambiguous, respond "unknown" rather than guessing. Examples: "My charge looks wrong" -> billing. "Login button broken" -> technical. "Close my account" -> account.';

export function renderSystemPromptAnalyzer() {
  const wrap = el('article', { 'aria-labelledby': 'sp-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Utility'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'sp-h1' }, 'System prompt analyzer'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    '8-point checklist: critical rule leads, identity set, capability inventory, negative triggers, output format, edge-case handling, length, no filler praise.'
  ));

  const ta = el('textarea', {
    class: 'editor-textarea',
    rows: '10',
    style: 'width: 100%; min-height: 200px; margin-top: 16px; font-family: var(--font-mono); font-size: var(--fs-200);',
    placeholder: 'Paste a system prompt...'
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
    clear(stage);
    const result = analyzeSystemPrompt(ta.value);
    stage.appendChild(renderResult(result));
  }

  async function renderAi() {
    render();
    if (!hasAnyKey()) return;
    const block = el('div', { style: 'margin-top: 16px; padding: 16px; border: 1px solid var(--border-2); border-radius: var(--radius-3); background: var(--surface-1);' });
    block.appendChild(el('div', { class: 'practice-card-eyebrow' }, 'AI critique · loading...'));
    stage.appendChild(block);
    const out = await aiOrFallback(
      async () => {
        const { aiCall } = await import('../../ai.js');
        const sys = 'You are a senior LLM application engineer. Critique the user-provided system prompt: 3 strengths, 3 weaknesses, 1 concrete rewrite suggestion. Be terse.';
        return await aiCall({ system: sys, messages: [{ role: 'user', content: ta.value }], maxTokens: 600 });
      },
      () => 'No AI critique without an API key.'
    );
    clear(block);
    block.appendChild(el('div', { class: 'practice-card-eyebrow' }, out.source === 'ai' ? 'AI critique' : 'Heuristic fallback'));
    block.appendChild(el('pre', { style: 'white-space: pre-wrap; font-family: inherit; font-size: var(--fs-200); color: var(--text-2); margin: 8px 0 0;' }, out.value));
  }

  render();

  return {
    node: wrap,
    title: 'System prompt analyzer',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'System prompt analyzer' }],
    mainClass: 'no-rail'
  };
}

function renderResult(result) {
  const sec = el('section', { class: 'utility-section' });
  sec.appendChild(el('div', { style: 'display: flex; align-items: center; gap: 16px;' }, [
    el('div', {
      class: 'utility-score-ring',
      style: '--ring-pct: ' + result.score + '%;'
    }, [
      el('div', { class: 'utility-score-num' }, String(result.score)),
      el('div', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, '/ 100')
    ]),
    el('div', { style: 'flex: 1;' }, [
      el('div', { style: 'font-weight: 500; font-size: var(--fs-300);' }, result.passed + ' / ' + result.total + ' checks pass'),
      el('p', { style: 'color: var(--text-3); font-size: var(--fs-100); margin: 4px 0 0;' },
        result.score === 100 ? 'Tight system prompt.' : 'Address the items below.'
      )
    ])
  ]));
  const list = el('div', { style: 'display: grid; grid-template-columns: 1fr; gap: 6px; margin-top: 16px;' });
  for (const c of result.checks) {
    list.appendChild(el('div', { class: 'utility-rubric-row ' + (c.ok ? 'is-pass' : 'is-fail') }, [
      el('span', { class: 'utility-rubric-icon' }, c.ok ? '✓' : '!'),
      el('div', { style: 'font-size: var(--fs-200);' }, c.label)
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
