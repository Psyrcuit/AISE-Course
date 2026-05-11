// Capstone scenario viewer. Slide-deck-style: one question per "card,"
// dots at the top show progress and per-step correctness post-submission.
// Optional boss-battle reskin: HP bar that drops on wrong answers (toggle in Settings).
import { CAPSTONES, XP_VALUES } from '../gam-data.js';
import { lsGet, lsSet, el, clear, announce, getSettings } from '../runtime.js';
import { conceptBySlug, moduleByN } from '../crossref.js';
import { awardXP, getCapstoneState, passThreshold } from '../gamification.js';
import { renderEmpty, renderNotFound } from './main.js';

export function renderCapstone(n) {
  const num = Number(n);
  const cs = CAPSTONES[num];
  if (!cs) return renderEmpty('Capstone (Module ' + num + ')', 'Capstone for this module is not yet authored. Capstones populate during module-fill phases.');
  const m = moduleByN(num);

  const wrap = el('article', { class: 'fade-up', 'aria-labelledby': 'cap-h1', 'data-module': String(num) });

  const bossMode = !!getSettings().boss_mode;
  if (bossMode) wrap.classList.add('is-boss-mode');

  wrap.appendChild(el('div', { class: 'home-eyebrow' }, bossMode ? 'Boss battle' : 'Capstone'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'cap-h1' }, cs.title));
  wrap.appendChild(el('p', { class: 'home-tagline' }, cs.scenario));
  wrap.appendChild(el('div', { class: 'concept-meta' }, [
    el('span', { class: 'pill' }, cs.steps.length + ' steps'),
    el('span', { class: 'pill' }, 'Pass: ' + passThreshold(cs.steps.length) + '/' + cs.steps.length)
  ]));

  // Boss HP bar (only in boss mode)
  let bossHp = null;
  if (bossMode) {
    bossHp = el('div', { class: 'boss-hp', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(cs.steps.length), 'aria-valuenow': String(cs.steps.length) });
    bossHp.appendChild(el('div', { class: 'boss-hp-label' }, [
      el('span', null, 'BOSS HP'),
      el('span', { class: 'boss-hp-value' }, cs.steps.length + ' / ' + cs.steps.length)
    ]));
    bossHp.appendChild(el('div', { class: 'boss-hp-bar' }, [
      el('div', { class: 'boss-hp-fill', style: 'width: 100%;' })
    ]));
    wrap.appendChild(bossHp);
  }

  // Progress dots
  const dotsWrap = el('div', { class: 'capstone-progress', role: 'presentation' });
  for (let i = 0; i < cs.steps.length; i++) {
    dotsWrap.appendChild(el('div', { class: 'dot' + (i === 0 ? ' is-active' : '') }));
  }
  wrap.appendChild(dotsWrap);

  let stepIndex = 0;
  const answers = new Array(cs.steps.length).fill(-1);
  const stepShell = el('div', null);
  wrap.appendChild(stepShell);

  function renderStep() {
    clear(stepShell);
    const step = cs.steps[stepIndex];
    const sec = el('section', { class: 'capstone-step', 'aria-labelledby': 'cap-step-h' });
    sec.appendChild(el('div', { class: 'num' }, 'Step ' + (stepIndex + 1) + ' of ' + cs.steps.length));
    sec.appendChild(el('h2', { id: 'cap-step-h' }, step.prompt));
    const ul = el('ul', { class: 'builder-options', role: 'radiogroup', 'aria-label': 'Options' });
    step.options.forEach((opt, j) => {
      const id = 'cap-' + num + '-' + stepIndex + '-' + j;
      const item = el('li', null, el('label', { for: id }, [
        el('input', { type: 'radio', name: 'cap-' + num + '-' + stepIndex, id, value: String(j) }),
        el('span', null, opt)
      ]));
      const inp = item.querySelector('input');
      inp.checked = answers[stepIndex] === j;
      inp.addEventListener('change', () => { answers[stepIndex] = j; });
      ul.appendChild(item);
    });
    sec.appendChild(ul);

    // Foot navigation
    const foot = el('div', { class: 'capstone-foot' });
    const back = el('button', { class: 'btn', type: 'button' }, '← Previous');
    back.disabled = stepIndex === 0;
    back.addEventListener('click', () => { stepIndex = Math.max(0, stepIndex - 1); renderStep(); refreshDots(); });
    foot.appendChild(back);
    if (stepIndex < cs.steps.length - 1) {
      const next = el('button', { class: 'btn btn-primary', type: 'button' }, 'Next →');
      next.addEventListener('click', () => { stepIndex = Math.min(cs.steps.length - 1, stepIndex + 1); renderStep(); refreshDots(); });
      foot.appendChild(next);
    } else {
      const submit = el('button', { class: 'btn btn-primary', type: 'button' }, 'Submit');
      submit.addEventListener('click', submitCapstone);
      foot.appendChild(submit);
    }
    sec.appendChild(foot);
    stepShell.appendChild(sec);
  }
  function refreshDots(submission) {
    const dots = dotsWrap.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.classList.remove('is-active', 'is-correct', 'is-wrong');
      if (submission) {
        if (submission[i]) d.classList.add('is-correct');
        else d.classList.add('is-wrong');
      } else if (i === stepIndex) {
        d.classList.add('is-active');
      }
    });
  }

  const resultShell = el('div', null);
  wrap.appendChild(resultShell);

  function submitCapstone() {
    const correct = answers.map((c, i) => c === cs.steps[i].correctIndex);
    const score = correct.filter(Boolean).length;
    const total = cs.steps.length;
    const passed = score >= passThreshold(total);

    const prev = getCapstoneState(num);
    const nextState = {
      complete: prev.complete,
      capstone_passed: prev.capstone_passed || passed,
      capstone_score: score,
      capstone_attempts: (prev.capstone_attempts || 0) + 1
    };
    lsSet('module:' + num, nextState);
    if (passed && !prev.capstone_passed) {
      awardXP(XP_VALUES.CAPSTONE_PASS, 'capstone_pass', String(num));
    }

    refreshDots(correct);

    // Update boss HP bar if in boss mode
    if (bossHp) {
      const remainingHp = score; // each correct = surviving 1 HP segment
      const fill = bossHp.querySelector('.boss-hp-fill');
      const value = bossHp.querySelector('.boss-hp-value');
      const pct = (remainingHp / total) * 100;
      if (fill) fill.style.width = pct + '%';
      if (value) value.textContent = remainingHp + ' / ' + total;
      bossHp.setAttribute('aria-valuenow', String(remainingHp));
      bossHp.classList.add(passed ? 'is-defeated' : 'is-victorious');
    }

    clear(resultShell);
    const banner = el('div', { class: 'capstone-result ' + (passed ? 'is-pass' : 'is-fail'), role: 'status' }, [
      el('h2', { style: 'margin-top: 0;' }, passed ? (bossMode ? 'Boss defeated.' : 'Capstone passed') : (bossMode ? 'You fell. Train and retry.' : 'Capstone failed')),
      el('p', null, 'Score: ' + score + ' of ' + total + ' (threshold ' + passThreshold(total) + ').')
    ]);
    resultShell.appendChild(banner);
    announce((passed ? 'Capstone passed.' : 'Capstone failed.') + ' Score ' + score + ' of ' + total + '.', 'assertive');

    cs.steps.forEach((step, i) => {
      const fb = el('div', {
        class: 'capstone-step-feedback ' + (correct[i] ? 'is-correct' : 'is-wrong')
      }, [
        el('strong', null, 'Step ' + (i + 1) + ': ' + (correct[i] ? 'correct' : 'incorrect')),
        ' ',
        el('span', null, step.explanation)
      ]);
      resultShell.appendChild(fb);
    });
    if (!passed) {
      const retry = el('button', { class: 'btn btn-primary', type: 'button', style: 'margin-top: 16px;' }, 'Retry');
      retry.addEventListener('click', () => window.dispatchEvent(new HashChangeEvent('hashchange')));
      resultShell.appendChild(retry);
    } else {
      resultShell.appendChild(el('a', { class: 'btn btn-accent', href: '#/module/' + num, style: 'margin-top: 16px;' }, 'Back to module'));
    }
  }

  renderStep();
  return {
    node: wrap,
    title: cs.title,
    crumbs: [{ label: 'Modules', href: '#/modules' }, { label: m ? m.title : 'Module ' + num, href: '#/module/' + num }, { label: 'Capstone' }],
    mainClass: 'no-rail'
  };
}
