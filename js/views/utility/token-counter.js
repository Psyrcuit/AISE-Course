// Token counter + visualizer (merged tool with two modes).
// Heuristic-based estimator across 6 model tokenizers; visualization mode
// shows approximate subword boundaries with per-piece coloring.

import { el, clear, announce } from '../../runtime.js';
import { estimateTokens, visualizeTokens, listModels } from '../../tokenizers.js';

const SAMPLE = 'Hi! Customer support ticket: My charge for $99 last month seems wrong. Can you investigate the duplicate charge and refund the difference within 24 hours?';

export function renderTokenCounter() {
  const wrap = el('article', { 'aria-labelledby': 'tc-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Utility'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'tc-h1' }, 'Token counter & visualizer'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Paste any text. Counter mode shows estimated counts across major tokenizers. ' +
    'Visualizer shows approximate subword boundaries with color-coded categories. Estimates are within ~5% for English prose; exact counts need the vendor SDK.'
  ));

  let mode = 'count';
  const modeRow = el('div', { class: 'settings-tablist', role: 'tablist', style: 'margin: 16px 0;' });
  for (const m of [{ id: 'count', label: 'Counter' }, { id: 'visualize', label: 'Visualize' }]) {
    const t = el('button', {
      class: 'settings-tab' + (m.id === mode ? ' is-active' : ''),
      type: 'button',
      role: 'tab'
    }, m.label);
    t.addEventListener('click', () => {
      mode = m.id;
      for (const tab of modeRow.querySelectorAll('.settings-tab')) tab.classList.toggle('is-active', tab.textContent === m.label);
      render();
    });
    modeRow.appendChild(t);
  }
  wrap.appendChild(modeRow);

  const ta = el('textarea', {
    class: 'editor-textarea',
    rows: '8',
    style: 'width: 100%; min-height: 160px; font-family: var(--font-mono); font-size: var(--fs-200);',
    placeholder: 'Paste text...'
  });
  ta.value = SAMPLE;
  wrap.appendChild(ta);

  const sampleRow = el('div', { style: 'display: flex; gap: 8px; margin-top: 8px;' }, [
    btn('Use sample', () => { ta.value = SAMPLE; render(); }),
    btn('Clear', () => { ta.value = ''; render(); })
  ]);
  wrap.appendChild(sampleRow);

  const stage = el('div', { style: 'margin-top: 16px;' });
  wrap.appendChild(stage);

  ta.addEventListener('input', render);
  render();

  function render() {
    clear(stage);
    if (mode === 'count') stage.appendChild(renderCounterView(ta.value));
    else stage.appendChild(renderVisualizeView(ta.value));
  }

  return {
    node: wrap,
    title: 'Token counter',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'Token counter' }],
    mainClass: 'no-rail'
  };
}

function renderCounterView(text) {
  const sec = el('section', { class: 'utility-section' });
  const models = listModels();
  const grid = el('div', { class: 'utility-counts-grid' });
  for (const m of models) {
    const tokens = estimateTokens(text, m.id);
    grid.appendChild(el('div', { class: 'utility-count-card' }, [
      el('div', { class: 'practice-card-eyebrow' }, m.name),
      el('div', { style: 'font-size: var(--fs-600); font-weight: 600; color: var(--accent);' }, String(tokens)),
      el('div', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, 'tokens')
    ]));
  }
  sec.appendChild(grid);

  // Quick interpretive line
  const claudeCount = estimateTokens(text, 'claude');
  const gptCount = estimateTokens(text, 'gpt-cl100k');
  const llamaCount = estimateTokens(text, 'llama3');
  const ratio = (claudeCount / Math.max(1, gptCount)).toFixed(2);
  sec.appendChild(el('p', { style: 'font-size: var(--fs-200); color: var(--text-3); margin-top: 12px;' },
    'Claude is ' + ratio + 'x GPT cl100k for this input. ' +
    'At 1M characters/day this would cost ~' + ((claudeCount / Math.max(1, text.length)) * 1_000_000).toFixed(0) + ' tokens/day on Claude (estimate).'
  ));
  return sec;
}

function renderVisualizeView(text) {
  const sec = el('section', { class: 'utility-section' });
  const tokens = visualizeTokens(text, 'claude');
  sec.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-bottom: 8px;' },
    tokens.length + ' approximate tokens (Claude). Word fragments break into ~4-char subwords; whitespace is highlighted gray; punctuation tinted.'
  ));
  const board = el('div', { class: 'token-board' });
  for (const tok of tokens) {
    board.appendChild(el('span', {
      class: 'token-pill token-' + tok.kind,
      title: 'Token ' + tok.id + ' · ' + tok.kind
    }, tok.text === '\n' ? '↵' : tok.text === ' ' ? '·' : tok.text));
  }
  sec.appendChild(board);
  return sec;
}

function btn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}
