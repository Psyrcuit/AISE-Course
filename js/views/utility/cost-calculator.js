// Cost calculator. Inputs: avg input/output tokens, calls per user/day, users.
// Sliders for cache hit % and batch %. Output: monthly cost forecast.

import { el, clear } from '../../runtime.js';
import { estimateMonthlyCost } from '../../heuristics.js';

// 2026 reference pricing (per million tokens)
const VENDORS = [
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', input: 15, output: 75 },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', input: 3, output: 15 },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', input: 0.8, output: 4 },
  { id: 'gpt-5-5', name: 'GPT-5.5', input: 10, output: 40 },
  { id: 'gpt-5-5-mini', name: 'GPT-5.5 mini', input: 1.5, output: 6 },
  { id: 'gemini-3-1-pro', name: 'Gemini 3.1 Pro', input: 7, output: 21 },
  { id: 'llama-self-host', name: 'Llama 3 (self-hosted)', input: 0.4, output: 0.4 }
];

export function renderCostCalculator() {
  const wrap = el('article', { 'aria-labelledby': 'cc-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Utility'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'cc-h1' }, 'Cost calculator'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Tokens-per-call x calls-per-user-per-day x users x days, with cache and batch discounts. Pricing as of May 2026 reference data.'
  ));

  const state = {
    inputTokens: 2000,
    outputTokens: 500,
    callsPerUser: 20,
    users: 10000,
    days: 30,
    vendor: 'claude-sonnet-4-6',
    cacheHit: 0,
    batch: 0
  };

  const form = el('div', { class: 'utility-form' });
  wrap.appendChild(form);

  form.appendChild(numField('Avg input tokens / call', state.inputTokens, v => { state.inputTokens = v; render(); }, 0, 200000, 100));
  form.appendChild(numField('Avg output tokens / call', state.outputTokens, v => { state.outputTokens = v; render(); }, 0, 16000, 50));
  form.appendChild(numField('Calls per user / day', state.callsPerUser, v => { state.callsPerUser = v; render(); }, 0, 1000, 1));
  form.appendChild(numField('Users', state.users, v => { state.users = v; render(); }, 0, 10_000_000, 100));
  form.appendChild(numField('Days', state.days, v => { state.days = v; render(); }, 1, 365, 1));

  const vendorSel = el('select', { class: 'settings-input' });
  for (const v of VENDORS) {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name + ' ($' + v.input + '/$' + v.output + ' per Mtok)';
    if (v.id === state.vendor) opt.selected = true;
    vendorSel.appendChild(opt);
  }
  vendorSel.addEventListener('change', () => { state.vendor = vendorSel.value; render(); });
  form.appendChild(el('div', { class: 'utility-form-row' }, [
    el('label', null, 'Vendor / tier'),
    vendorSel
  ]));

  form.appendChild(sliderField('Prompt cache hit', state.cacheHit, '%', v => { state.cacheHit = v; render(); }, 0, 100, 5));
  form.appendChild(sliderField('Batch API portion', state.batch, '%', v => { state.batch = v; render(); }, 0, 100, 5));

  const stage = el('div', { style: 'margin-top: 24px;' });
  wrap.appendChild(stage);

  function render() {
    clear(stage);
    const vendor = VENDORS.find(v => v.id === state.vendor);
    const result = estimateMonthlyCost({
      inputTokensPerCall: state.inputTokens,
      outputTokensPerCall: state.outputTokens,
      callsPerUserPerDay: state.callsPerUser,
      users: state.users,
      daysPerMonth: state.days,
      pricePerMInput: vendor.input,
      pricePerMOutput: vendor.output,
      cacheHitPct: state.cacheHit,
      batchPct: state.batch
    });

    const card = el('div', { style: 'padding: 20px; border: 1px solid var(--border-2); border-radius: var(--radius-3); background: var(--surface-1);' });
    card.appendChild(el('div', { class: 'practice-card-eyebrow' }, 'Forecasted monthly cost · ' + vendor.name));
    card.appendChild(el('div', { style: 'font-size: var(--fs-700); font-weight: 700; color: var(--accent);' }, '$' + result.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })));
    card.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-top: 4px;' },
      'Input $' + result.inputCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) +
      ' · Output $' + result.outputCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) +
      ' · ' + (result.totalInputTokens / 1_000_000).toFixed(1) + 'M input tokens · ' +
      (result.totalOutputTokens / 1_000_000).toFixed(1) + 'M output tokens'
    ));
    stage.appendChild(card);

    // Cross-vendor comparison
    const comp = el('div', { style: 'margin-top: 16px;' });
    comp.appendChild(el('h3', { style: 'margin: 0 0 8px;' }, 'Same workload, all vendors'));
    const grid = el('div', { class: 'utility-counts-grid' });
    for (const v of VENDORS) {
      const r = estimateMonthlyCost({
        inputTokensPerCall: state.inputTokens,
        outputTokensPerCall: state.outputTokens,
        callsPerUserPerDay: state.callsPerUser,
        users: state.users,
        daysPerMonth: state.days,
        pricePerMInput: v.input,
        pricePerMOutput: v.output,
        cacheHitPct: state.cacheHit,
        batchPct: state.batch
      });
      grid.appendChild(el('div', { class: 'utility-count-card' + (v.id === state.vendor ? ' is-active' : '') }, [
        el('div', { class: 'practice-card-eyebrow' }, v.name),
        el('div', { style: 'font-size: var(--fs-400); font-weight: 600;' }, '$' + r.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })),
        el('div', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, '/ month')
      ]));
    }
    comp.appendChild(grid);
    stage.appendChild(comp);
  }

  render();

  return {
    node: wrap,
    title: 'Cost calculator',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'Cost calculator' }],
    mainClass: 'no-rail'
  };
}

function numField(label, value, onChange, min, max, step) {
  const inp = el('input', { type: 'number', class: 'settings-input', value: String(value), min: String(min), max: String(max), step: String(step) });
  inp.addEventListener('input', () => onChange(parseFloat(inp.value) || 0));
  return el('div', { class: 'utility-form-row' }, [el('label', null, label), inp]);
}
function sliderField(label, value, suffix, onChange, min, max, step) {
  const inp = el('input', { type: 'range', value: String(value), min: String(min), max: String(max), step: String(step), style: 'width: 100%;' });
  const out = el('div', { style: 'min-width: 60px; text-align: right; font-variant-numeric: tabular-nums;' }, String(value) + suffix);
  inp.addEventListener('input', () => {
    const v = parseFloat(inp.value);
    out.textContent = v + suffix;
    onChange(v);
  });
  return el('div', { class: 'utility-form-row' }, [
    el('label', null, label),
    el('div', { style: 'display: flex; gap: 8px; align-items: center;' }, [inp, out])
  ]);
}
