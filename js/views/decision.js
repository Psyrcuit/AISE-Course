// Decision tools list + detail.
import { DECISIONS } from '../decisions-data.js';
import { lsGet, lsSet, el, clear } from '../runtime.js';
import { conceptBySlug } from '../crossref.js';
import { renderNotFound } from './main.js';

function getDecisionState(slug) {
  const tool = DECISIONS[slug];
  if (!tool) return {};
  const stored = lsGet('decision_state_' + slug, {});
  const state = {};
  for (const inp of tool.inputs) state[inp.key] = stored[inp.key] || inp.default;
  return state;
}
function setDecisionStateKey(slug, key, value) {
  const cur = lsGet('decision_state_' + slug, {});
  cur[key] = value;
  lsSet('decision_state_' + slug, cur);
}

export function renderDecisions() {
  const wrap = el('article', { 'aria-labelledby': 'dec-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Decision tools'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'dec-h1' }, 'Pick the right tool for the job.'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, 'Interactive when-to-use-what widgets. Answer a few questions; ranked recommendation updates live.'));
  wrap.appendChild(el('div', { class: 'toolkit-grid' }, Object.keys(DECISIONS).map(slug => {
    const t = DECISIONS[slug];
    return el('a', { class: 'toolkit-card', href: '#/decision/' + slug }, [
      el('span', { class: 'toolkit-card-tag' }, 'Decision tool'),
      el('div', { class: 'toolkit-card-title' }, t.title),
      el('p', { class: 'toolkit-card-desc' }, t.intro)
    ]);
  })));
  return { node: wrap, title: 'Decision tools', crumbs: [{ label: 'Decision tools' }], mainClass: 'no-rail' };
}

export function renderDecisionDetail(slug) {
  const tool = DECISIONS[slug];
  if (!tool) return renderNotFound('Decision tool "' + slug + '" not found.');

  const wrap = el('article', { 'aria-labelledby': 'dec-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Decision tool'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'dec-h1' }, tool.title));
  wrap.appendChild(el('p', { class: 'home-tagline' }, tool.intro));

  const layout = el('div', { class: 'decision-page' });
  const form = el('form', { class: 'decision-form' });
  const resultsPane = el('div', { class: 'decision-results-pane' });
  const resultsBlock = el('div', { class: 'decision-results' });
  resultsBlock.appendChild(el('h2', { style: 'font-size: var(--fs-300); margin-top: 0;' }, 'Recommended'));
  const recList = el('div', { 'aria-live': 'polite' });
  resultsBlock.appendChild(recList);
  resultsPane.appendChild(resultsBlock);

  const initial = getDecisionState(slug);
  for (const inp of tool.inputs) {
    const block = el('section', { class: 'decision-question' });
    block.appendChild(el('h3', null, inp.label));
    const ul = el('ul', { class: 'builder-options', role: 'radiogroup', 'aria-label': inp.label });
    for (const opt of inp.options) {
      const id = 'dec-' + slug + '-' + inp.key + '-' + opt.value;
      const item = el('li', null, el('label', { for: id }, [
        el('input', { type: 'radio', name: 'dec-' + slug + '-' + inp.key, id, value: opt.value }),
        el('span', null, opt.label)
      ]));
      const inpEl = item.querySelector('input');
      inpEl.checked = initial[inp.key] === opt.value;
      ul.appendChild(item);
    }
    block.appendChild(ul);
    form.appendChild(block);
  }

  function readState() {
    const s = {};
    for (const inp of tool.inputs) {
      const sel = form.querySelector('input[name="dec-' + slug + '-' + inp.key + '"]:checked');
      s[inp.key] = sel ? sel.value : inp.default;
    }
    return s;
  }
  function refresh() {
    const state = readState();
    const ranked = tool.score(state);
    clear(recList);
    ranked.forEach((rec, i) => {
      const recBlock = el('div', { class: 'decision-rec' + (i === 0 ? ' is-top' : '') });
      const concept = rec.slug ? conceptBySlug(rec.slug) : null;
      recBlock.appendChild(el('div', null, [
        el('span', { class: 'rank', 'aria-hidden': 'true' }, String(i + 1)),
        concept ? el('a', { class: 'title', href: '#/concept/' + rec.slug, style: 'color: var(--text-1);' }, rec.option) : el('span', { class: 'title' }, rec.option),
        el('span', { class: 'score', 'aria-label': 'Match score' }, '(' + rec.score + ')')
      ]));
      recBlock.appendChild(el('p', { class: 'rationale' }, rec.rationale));
      recList.appendChild(recBlock);
    });
    for (const k of Object.keys(state)) setDecisionStateKey(slug, k, state[k]);
  }
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);

  layout.appendChild(form);
  layout.appendChild(resultsPane);
  wrap.appendChild(layout);

  if (tool.conceptsTouched && tool.conceptsTouched.length) {
    wrap.appendChild(el('section', { class: 'concept-section' }, [
      el('h2', null, 'Concepts touched'),
      el('ul', { class: 'see-also-list' }, tool.conceptsTouched.map(cs => {
        const c = conceptBySlug(cs);
        if (!c) return null;
        return el('li', null, el('a', { href: '#/concept/' + cs }, c.name));
      }).filter(Boolean))
    ]));
  }

  refresh();
  return {
    node: wrap,
    title: tool.title,
    crumbs: [{ label: 'Decision tools', href: '#/decisions' }, { label: tool.title }],
    mainClass: 'no-rail'
  };
}
