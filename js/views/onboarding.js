// 4-step onboarding wizard: Welcome / Role / Goal / Level + optional placement.
// Saves to aise26:settings.profile and aise26:settings.onboarding_seen.

import { el, clear, getSettings, setSettings, announce } from '../runtime.js';
import { ROLE_OPTIONS, LEVEL_OPTIONS, GOAL_SUGGESTIONS, getPlacementQuiz, scorePlacement, recommendPath } from '../onboarding-data.js';

const STEPS = ['welcome', 'role', 'goal', 'level'];

export function renderOnboarding() {
  // Mutable state collected across steps
  const state = {
    step: 0,
    role: null,
    goal: '',
    level: null,
    placement: null
  };

  const root = el('div', { class: 'onboarding-root' });

  function rerender() {
    clear(root);
    if (state.step < 0) state.step = 0;
    if (state.step === 0) root.appendChild(renderWelcome(state, advance, finish));
    else if (state.step === 1) root.appendChild(renderRole(state, advance, back, finish));
    else if (state.step === 2) root.appendChild(renderGoal(state, advance, back, finish));
    else if (state.step === 3) root.appendChild(renderLevel(state, advance, back, finish, openPlacement));
    else if (state.step === 4) root.appendChild(renderPlacement(state, finish, back));
  }

  function advance() { state.step++; rerender(); }
  function back() { state.step = Math.max(0, state.step - 1); rerender(); }
  function openPlacement() { state.step = 4; rerender(); }

  function finish() {
    const profile = {
      role: state.role,
      goal: state.goal || null,
      level: state.level || (state.placement ? state.placement.level : null),
      placement_score: state.placement ? state.placement.score : null,
      recommended_path: recommendPath({ role: state.role, goal: state.goal, level: state.level || (state.placement && state.placement.level) }),
      created_at: new Date().toISOString()
    };
    setSettings({ profile, onboarding_seen: true });
    announce('Onboarding complete. Welcome.');
    window.location.hash = '#/';
  }

  rerender();

  return {
    node: root,
    title: 'Welcome',
    crumbs: [],
    mainClass: 'no-rail full-bleed'
  };
}

// ---------- Step 0: Welcome ----------
function renderWelcome(state, advance, finish) {
  const card = _card();
  card.appendChild(_progress(0, 4));
  card.appendChild(el('div', { class: 'onboarding-step-num' }, 'Step 1 of 4'));
  card.appendChild(el('h2', null, 'Welcome to Cartograph.'));
  card.appendChild(el('p', null, 'The 2026 AI Solutions Engineer\'s atlas. 514 concepts across 16 modules. Built for daily practice.'));
  card.appendChild(el('p', null, 'Two minutes of setup so the home page knows what to put in front of you. Skip any step.'));
  const actions = el('div', { class: 'onboarding-actions' });
  actions.appendChild(_skip(finish, 'Skip onboarding'));
  const next = el('button', { class: 'btn btn-primary', type: 'button' }, 'Get started →');
  next.addEventListener('click', advance);
  actions.appendChild(next);
  card.appendChild(actions);
  return card;
}

// ---------- Step 1: Role ----------
function renderRole(state, advance, back, finish) {
  const card = _card();
  card.appendChild(_progress(1, 4));
  card.appendChild(el('div', { class: 'onboarding-step-num' }, 'Step 2 of 4'));
  card.appendChild(el('h2', null, 'What\'s your role?'));
  card.appendChild(el('p', null, 'Drives toolkit emphasis, recommended modules, voice on the home page.'));
  const opts = el('div', { class: 'onboarding-options' });
  for (const o of ROLE_OPTIONS) {
    const btn = el('button', { class: 'onboarding-option' + (state.role === o.value ? ' is-selected' : ''), type: 'button' });
    btn.appendChild(el('div', { style: 'font-weight:500;' }, o.label));
    btn.appendChild(el('div', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-top: 4px;' }, o.desc));
    btn.addEventListener('click', () => { state.role = o.value; advance(); });
    opts.appendChild(btn);
  }
  card.appendChild(opts);
  card.appendChild(_actions(back, advance, finish, 'Back', 'Skip', 'Next →', !!state.role));
  return card;
}

// ---------- Step 2: Goal ----------
function renderGoal(state, advance, back, finish) {
  const card = _card();
  card.appendChild(_progress(2, 4));
  card.appendChild(el('div', { class: 'onboarding-step-num' }, 'Step 3 of 4'));
  card.appendChild(el('h2', null, 'What\'s your goal?'));
  card.appendChild(el('p', null, 'A short phrase. Drives recommended path and home page hierarchy.'));
  const input = el('input', {
    type: 'text', class: 'settings-input', maxlength: '120', placeholder: 'e.g., Ship a RAG system in 30 days',
    value: state.goal || '', style: 'width: 100%; margin-bottom: 12px;'
  });
  input.addEventListener('input', () => { state.goal = input.value; });
  card.appendChild(input);
  card.appendChild(el('div', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-bottom: 12px;' }, 'Suggestions:'));
  const sugg = el('div', { class: 'onboarding-options' });
  for (const s of GOAL_SUGGESTIONS) {
    const b = el('button', { class: 'onboarding-option' + (state.goal === s ? ' is-selected' : ''), type: 'button' }, s);
    b.addEventListener('click', () => { state.goal = s; input.value = s; rerenderSelectedClass(sugg, s); });
    sugg.appendChild(b);
  }
  card.appendChild(sugg);
  card.appendChild(_actions(back, advance, finish, 'Back', 'Skip', 'Next →', true));
  return card;
}
function rerenderSelectedClass(container, selectedText) {
  const buttons = container.querySelectorAll('.onboarding-option');
  for (const b of buttons) {
    if (b.textContent === selectedText) b.classList.add('is-selected');
    else b.classList.remove('is-selected');
  }
}

// ---------- Step 3: Level ----------
function renderLevel(state, advance, back, finish, openPlacement) {
  const card = _card();
  card.appendChild(_progress(3, 4));
  card.appendChild(el('div', { class: 'onboarding-step-num' }, 'Step 4 of 4'));
  card.appendChild(el('h2', null, 'Where are you starting?'));
  card.appendChild(el('p', null, 'You can also take a 12-question placement quiz to fine-tune the recommendation.'));
  const opts = el('div', { class: 'onboarding-options' });
  for (const o of LEVEL_OPTIONS) {
    const btn = el('button', { class: 'onboarding-option' + (state.level === o.value ? ' is-selected' : ''), type: 'button' });
    btn.appendChild(el('div', { style: 'font-weight:500;' }, o.label));
    btn.appendChild(el('div', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-top: 4px;' }, o.desc));
    btn.addEventListener('click', () => { state.level = o.value; advance(); });
    opts.appendChild(btn);
  }
  card.appendChild(opts);
  const placeBtn = el('button', { class: 'btn btn-ghost btn-sm', type: 'button', style: 'margin-top: 12px;' }, 'Take placement quiz instead →');
  placeBtn.addEventListener('click', openPlacement);
  card.appendChild(placeBtn);
  card.appendChild(_actions(back, finish, finish, 'Back', 'Skip', 'Finish ✓', true));
  return card;
}

// ---------- Step 4 (optional): Placement quiz ----------
function renderPlacement(state, finish, back) {
  const card = _card();
  card.appendChild(_progress(4, 4));
  card.appendChild(el('div', { class: 'onboarding-step-num' }, 'Placement quiz · 12 questions'));
  card.appendChild(el('h2', null, 'Quick diagnostic.'));
  card.appendChild(el('p', null, 'No pressure; pick your best guess. We use it to set your starting level and tailor the recommended path.'));

  const quiz = getPlacementQuiz();
  let idx = 0;
  const answers = [];

  const stage = el('div', { class: 'onboarding-quiz-stage' });
  card.appendChild(stage);

  function renderQ() {
    clear(stage);
    if (idx >= quiz.length) {
      const result = scorePlacement(quiz, answers);
      state.placement = result;
      stage.appendChild(el('h3', null, 'Result: ' + result.score + ' / ' + result.total));
      stage.appendChild(el('p', null, 'Level: ' + result.level + '. We adjusted your recommended path accordingly.'));
      const finishBtn = el('button', { class: 'btn btn-primary', type: 'button' }, 'See your home →');
      finishBtn.addEventListener('click', finish);
      stage.appendChild(finishBtn);
      return;
    }
    const q = quiz[idx];
    stage.appendChild(el('div', { class: 'onboarding-step-num', style: 'margin-bottom: 8px;' }, 'Question ' + (idx + 1) + ' of ' + quiz.length));
    stage.appendChild(el('p', { style: 'font-weight: 500; margin: 0 0 12px;' }, q.prompt));
    const opts = el('div', { class: 'onboarding-options' });
    q.options.forEach((label, i) => {
      const b = el('button', { class: 'onboarding-option', type: 'button' }, label);
      b.addEventListener('click', () => {
        answers.push({ slug: q.slug, choice: i });
        idx++;
        renderQ();
      });
      opts.appendChild(b);
    });
    stage.appendChild(opts);
  }
  renderQ();

  const actions = el('div', { class: 'onboarding-actions', style: 'margin-top: 16px;' });
  actions.appendChild(_skip(finish, 'Skip placement'));
  actions.appendChild(el('button', { class: 'btn btn-ghost btn-sm', type: 'button', on: { click: back } }, 'Back'));
  card.appendChild(actions);
  return card;
}

// ---------- helpers ----------
function _card() { return el('section', { class: 'onboarding', 'aria-live': 'polite' }); }
function _progress(active, total) {
  const w = el('div', { class: 'onboarding-progress' });
  for (let i = 0; i <= total; i++) {
    w.appendChild(el('div', { class: 'onboarding-progress-dot' + (i <= active ? ' is-active' : '') }));
  }
  return w;
}
function _skip(onFinish, label) {
  const b = el('button', { class: 'onboarding-skip', type: 'button' }, label || 'Skip onboarding');
  b.addEventListener('click', onFinish);
  return b;
}
function _actions(onBack, onNext, onSkip, backLabel, skipLabel, nextLabel, canAdvance) {
  const w = el('div', { class: 'onboarding-actions' });
  const left = el('div', { style: 'display: flex; gap: 8px;' });
  if (onBack) {
    const b = el('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, backLabel || 'Back');
    b.addEventListener('click', onBack);
    left.appendChild(b);
  }
  w.appendChild(left);

  const right = el('div', { style: 'display: flex; gap: 8px;' });
  if (onSkip) {
    right.appendChild(_skip(onSkip, skipLabel));
  }
  const next = el('button', { class: 'btn btn-primary', type: 'button', disabled: !canAdvance }, nextLabel || 'Next →');
  next.addEventListener('click', onNext);
  right.appendChild(next);
  w.appendChild(right);
  return w;
}

window.aise26 = Object.assign(window.aise26 || {}, { renderOnboarding });
