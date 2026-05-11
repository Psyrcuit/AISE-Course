// Voice agent latency budget calculator. Sliders per pipeline stage.

import { el, clear } from '../../runtime.js';

export function renderLatencyBudget() {
  const wrap = el('article', { 'aria-labelledby': 'lb-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Utility'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'lb-h1' }, 'Latency budget calculator'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Voice agent round-trip: VAD → STT → LLM → TTS → audio out. Target ~800ms; comfort threshold 500-700ms.'
  ));

  const state = {
    vad: 50,
    stt: 200,
    llm: 250,
    tts: 100,
    network: 100
  };

  const form = el('div', { class: 'utility-form' });
  wrap.appendChild(form);

  const stages = [
    { id: 'vad', label: 'VAD (end-of-speech)', max: 500, hint: '300-400ms typical; longer feels patient, shorter interrupts' },
    { id: 'stt', label: 'STT first-final transcript', max: 1500, hint: 'Deepgram Nova 3 ~150ms; Whisper streaming ~300ms' },
    { id: 'llm', label: 'LLM TTFT (cached prompt)', max: 2000, hint: 'Haiku ~150ms; Sonnet ~250ms; Opus ~400ms (with cache)' },
    { id: 'tts', label: 'TTS first-audio', max: 1000, hint: 'Cartesia Sonic ~80ms; ElevenLabs ~300ms' },
    { id: 'network', label: 'Network + buffering', max: 500, hint: '50-150ms typical for a well-served region' }
  ];

  for (const s of stages) {
    form.appendChild(slider(s.label, state[s.id], 'ms', s.max, s.hint, v => { state[s.id] = v; render(); }));
  }

  const stage = el('div', { style: 'margin-top: 24px;' });
  wrap.appendChild(stage);

  function render() {
    clear(stage);
    const total = state.vad + state.stt + state.llm + state.tts + state.network;
    let band, color;
    if (total <= 600) { band = 'Excellent - feels conversational.'; color = 'var(--success)'; }
    else if (total <= 800) { band = 'Comfortable - feels human-paced.'; color = 'var(--accent)'; }
    else if (total <= 1100) { band = 'Noticeable lag.'; color = 'var(--warn)'; }
    else { band = 'Robotic / broken - restructure pipeline.'; color = 'var(--danger)'; }

    const card = el('div', { style: 'padding: 20px; border: 1px solid var(--border-2); border-radius: var(--radius-3); background: var(--surface-1);' });
    card.appendChild(el('div', { class: 'practice-card-eyebrow' }, 'Round-trip latency'));
    card.appendChild(el('div', { style: 'font-size: var(--fs-700); font-weight: 700; color: ' + color + ';' }, total + 'ms'));
    card.appendChild(el('p', { style: 'color: var(--text-2); margin: 4px 0 0;' }, band));

    // Stage breakdown bar
    const bar = el('div', { class: 'utility-budget-bar' });
    const slices = [
      { label: 'VAD', value: state.vad, color: 'var(--hue-1)' },
      { label: 'STT', value: state.stt, color: 'var(--hue-3)' },
      { label: 'LLM', value: state.llm, color: 'var(--accent)' },
      { label: 'TTS', value: state.tts, color: 'var(--hue-7)' },
      { label: 'Net', value: state.network, color: 'var(--hue-9)' }
    ];
    for (const s of slices) {
      const pct = (s.value / total) * 100;
      bar.appendChild(el('div', {
        class: 'utility-budget-slice',
        style: 'flex-basis: ' + pct + '%; background: ' + s.color + ';',
        title: s.label + ': ' + s.value + 'ms (' + pct.toFixed(0) + '%)'
      }, [
        el('div', { class: 'utility-budget-label' }, s.label),
        el('div', { class: 'utility-budget-value' }, s.value + 'ms')
      ]));
    }
    card.appendChild(bar);

    // Suggestions
    const suggestions = [];
    if (state.llm > 400) suggestions.push('LLM TTFT is heavy - try Haiku tier, prompt caching, or shorter system prompt.');
    if (state.stt > 300) suggestions.push('STT is slow - switch to Deepgram or Realtime API.');
    if (state.tts > 200) suggestions.push('TTS first-audio is slow - Cartesia for streaming, ElevenLabs for narration.');
    if (state.vad > 400) suggestions.push('VAD threshold is patient - drop to ~300ms for snappier turn-taking.');
    if (suggestions.length) {
      const ul = el('ul', { style: 'margin: 12px 0 0; padding-left: 20px; color: var(--text-2); font-size: var(--fs-200);' });
      for (const s of suggestions) ul.appendChild(el('li', null, s));
      card.appendChild(el('h3', { style: 'margin: 16px 0 4px; font-size: var(--fs-200);' }, 'Optimization ideas'));
      card.appendChild(ul);
    }
    stage.appendChild(card);
  }
  render();

  return {
    node: wrap,
    title: 'Latency budget',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'Latency budget' }],
    mainClass: 'no-rail'
  };
}

function slider(label, value, suffix, max, hint, onChange) {
  const inp = el('input', { type: 'range', value: String(value), min: '0', max: String(max), step: '10', style: 'flex: 1;' });
  const out = el('div', { style: 'min-width: 70px; text-align: right; font-variant-numeric: tabular-nums;' }, value + suffix);
  inp.addEventListener('input', () => {
    const v = parseInt(inp.value, 10);
    out.textContent = v + suffix;
    onChange(v);
  });
  return el('div', { class: 'utility-form-row' }, [
    el('label', null, [
      el('div', null, label),
      hint ? el('div', { style: 'font-size: var(--fs-100); color: var(--text-4); font-weight: normal;' }, hint) : null
    ]),
    el('div', { style: 'display: flex; gap: 8px; align-items: center;' }, [inp, out])
  ]);
}
