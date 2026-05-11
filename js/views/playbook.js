// Playbook list + detail.
import { PLAYBOOKS } from '../playbooks-data.js';
import { lsGet, lsSet, el, clear, announce } from '../runtime.js';
import { conceptBySlug, linkifyText } from '../crossref.js';
import { copyToClipboard } from '../copy.js';
import { checkAchievements } from '../gamification.js';
import { renderNotFound } from './main.js';

function getPlaybookStepState(slug, n) {
  return lsGet('playbook:' + slug + ':step:' + n, false);
}
function setPlaybookStepState(slug, n, complete) {
  lsSet('playbook:' + slug + ':step:' + n, !!complete);
}

export function renderPlaybooks() {
  const wrap = el('article', { 'aria-labelledby': 'pb-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Applied'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'pb-h1' }, 'Playbooks'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, 'Step-by-step guides that integrate concepts into a working result. Mark steps complete as you go; progress saves locally.'));

  for (const slug of Object.keys(PLAYBOOKS)) {
    const p = PLAYBOOKS[slug];
    const completed = p.steps.filter((_, i) => getPlaybookStepState(slug, p.steps[i].n)).length;
    wrap.appendChild(el('a', { class: 'playbook-card', href: '#/playbook/' + slug }, [
      el('div', { class: 'time' }, p.timeEstimate),
      el('div', { class: 'title' }, p.title),
      el('p', { class: 'outcome' }, p.outcome),
      el('div', { class: 'meta' }, p.steps.length + ' steps' + (completed ? ' · ' + completed + ' complete' : '') + ' · ' + p.conceptsTouched.length + ' concepts')
    ]));
  }
  return { node: wrap, title: 'Playbooks', crumbs: [{ label: 'Playbooks' }], mainClass: 'no-rail' };
}

export function renderPlaybookDetail(slug) {
  const p = PLAYBOOKS[slug];
  if (!p) return renderNotFound('Playbook "' + slug + '" not found.');

  const wrap = el('article', { class: 'fade-up', 'aria-labelledby': 'pbd-h1' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Playbook'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'pbd-h1' }, p.title));
  wrap.appendChild(el('p', { class: 'home-tagline' }, p.outcome));

  // Meta row
  wrap.appendChild(el('div', { class: 'playbook-meta-row' }, [
    el('div', null, [el('div', { class: 'label' }, 'Time'), el('div', { class: 'value' }, p.timeEstimate)]),
    el('div', null, [el('div', { class: 'label' }, 'Steps'), el('div', { class: 'value' }, String(p.steps.length))]),
    el('div', null, [el('div', { class: 'label' }, 'Concepts'), el('div', { class: 'value' }, String(p.conceptsTouched.length))])
  ]));

  // Prereqs
  wrap.appendChild(el('section', { class: 'concept-section' }, [
    el('h2', null, 'Prerequisites'),
    el('ul', null, p.prereqs.map(pr => el('li', null, pr)))
  ]));

  // Concepts touched
  wrap.appendChild(el('section', { class: 'concept-section' }, [
    el('h2', null, 'Concepts touched'),
    el('ul', { class: 'see-also-list' }, p.conceptsTouched.map(cs => {
      const c = conceptBySlug(cs);
      if (!c) return null;
      return el('li', null, el('a', { href: '#/concept/' + cs }, c.name));
    }).filter(Boolean))
  ]));

  // Steps
  for (const step of p.steps) {
    const isComplete = getPlaybookStepState(p.slug, step.n);
    const sec = el('section', {
      class: 'step-block' + (isComplete ? ' is-complete' : ''),
      id: 'step-' + step.n,
      'aria-labelledby': 'step-h-' + step.n
    });
    sec.appendChild(el('h2', { id: 'step-h-' + step.n }, [
      el('span', { class: 'step-num', 'aria-hidden': 'true' }, String(step.n)),
      'Step ' + step.n + ': ' + step.title
    ]));
    for (const piece of step.body) {
      if (typeof piece === 'string') sec.appendChild(el('p', { class: 'prose' }, piece));
      else if (piece && piece.code) {
        const pre = el('pre', null, el('code', null, piece.code));
        const copy = el('button', { class: 'btn btn-sm btn-ghost', type: 'button', 'aria-label': 'Copy code' }, 'Copy');
        copy.addEventListener('click', (e) => copyToClipboard(piece.code, e.currentTarget));
        sec.appendChild(el('div', null, [pre, copy]));
      }
    }
    sec.appendChild(el('div', { class: 'step-checkpoint' }, step.checkpoint));
    const completeId = 'pb-step-' + p.slug + '-' + step.n;
    const cb = el('input', { type: 'checkbox', id: completeId });
    cb.checked = isComplete;
    cb.addEventListener('change', () => {
      setPlaybookStepState(p.slug, step.n, cb.checked);
      sec.classList.toggle('is-complete', cb.checked);
      announce(cb.checked ? 'Step ' + step.n + ' marked complete.' : 'Step ' + step.n + ' unmarked.');
      const allDone = p.steps.every(s => getPlaybookStepState(p.slug, s.n));
      lsSet('playbook:' + p.slug + ':complete', allDone);
      checkAchievements();
    });
    sec.appendChild(el('div', { style: 'margin-top: 12px;' }, [
      el('label', { for: completeId, style: 'display: inline-flex; align-items: center; gap: 8px;' }, [cb, ' Mark step complete'])
    ]));
    wrap.appendChild(sec);
  }

  // What next
  wrap.appendChild(el('section', { class: 'concept-section' }, [
    el('h2', null, 'What to do next'),
    el('p', { class: 'prose' }, p.whatNext)
  ]));

  // Common failures
  wrap.appendChild(el('section', { class: 'concept-section' }, [
    el('h2', null, 'Common failures'),
    el('ul', { class: 'common-failures-list' }, p.commonFailures.map(f =>
      el('li', null, [
        el('p', { class: 'issue' }, f.issue),
        el('p', { class: 'fix' }, f.fix)
      ])
    ))
  ]));

  linkifyText(wrap);
  return {
    node: wrap,
    title: p.title,
    crumbs: [{ label: 'Playbooks', href: '#/playbooks' }, { label: p.title }],
    mainClass: 'no-rail'
  };
}
