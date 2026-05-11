// Per-concept AI panel: slide-in sidebar with three tabs (Ask / Tutor / Rewrite).
// Uses aiOrFallback so heuristic-only mode still produces useful output.

import { el, clear, lsGet, lsSet, announce } from '../runtime.js';
import { aiOrFallback, hasAnyKey } from '../ai.js';

const TABS = [
  { id: 'ask', label: 'Ask' },
  { id: 'tutor', label: 'Tutor' },
  { id: 'rewrite', label: 'Rewrite' }
];

let _currentSidebar = null;
let _lastFocus = null;

/**
 * Open the chat sidebar attached to a specific concept.
 * concept: a concept object (slug, name, stub, ...).
 */
export function openChatSidebar(concept) {
  if (_currentSidebar) closeChatSidebar();
  _lastFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'chat-sidebar-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Ask AI about ' + concept.name);

  const sidebar = el('aside', { class: 'chat-sidebar' });
  // Header
  const header = el('header', { class: 'chat-sidebar-head' });
  header.appendChild(el('div', null, [
    el('div', { class: 'practice-card-eyebrow' }, 'Concept'),
    el('div', { style: 'font-size: var(--fs-300); font-weight: 500; color: var(--text-1);' }, concept.name)
  ]));
  const closeBtn = el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close AI panel' }, '×');
  closeBtn.addEventListener('click', closeChatSidebar);
  header.appendChild(closeBtn);
  sidebar.appendChild(header);

  // Tabs - roving tabindex + arrow-key navigation
  let activeTab = lsGet('settings', {}).chat_tab || 'ask';
  const tablist = el('div', { class: 'chat-sidebar-tablist', role: 'tablist', 'aria-label': 'AI assistant modes' });
  const tabButtons = [];
  function selectTab(id, focus) {
    activeTab = id;
    const settings = lsGet('settings', {});
    settings.chat_tab = id;
    lsSet('settings', settings);
    for (const btn of tabButtons) {
      const isMatch = btn.dataset.tabId === id;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
      btn.setAttribute('tabindex', isMatch ? '0' : '-1');
      if (focus && isMatch) btn.focus();
    }
    renderTab();
  }
  for (const t of TABS) {
    const tab = el('button', {
      class: 'chat-sidebar-tab' + (t.id === activeTab ? ' is-active' : ''),
      type: 'button',
      role: 'tab',
      id: 'chat-tab-' + t.id,
      'aria-controls': 'chat-panel-' + t.id,
      'aria-selected': String(t.id === activeTab),
      tabindex: t.id === activeTab ? '0' : '-1',
      'data-tab-id': t.id
    }, t.label);
    tab.addEventListener('click', () => selectTab(t.id, false));
    tab.addEventListener('keydown', (e) => {
      const i = tabButtons.indexOf(tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(tabButtons[(i + 1) % tabButtons.length].dataset.tabId, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(tabButtons[(i - 1 + tabButtons.length) % tabButtons.length].dataset.tabId, true); }
      else if (e.key === 'Home') { e.preventDefault(); selectTab(tabButtons[0].dataset.tabId, true); }
      else if (e.key === 'End') { e.preventDefault(); selectTab(tabButtons[tabButtons.length - 1].dataset.tabId, true); }
    });
    tabButtons.push(tab);
    tablist.appendChild(tab);
  }
  sidebar.appendChild(tablist);

  // Tab content stage
  const stage = el('div', { class: 'chat-sidebar-body', role: 'tabpanel' });
  sidebar.appendChild(stage);

  // Footer key indicator
  sidebar.appendChild(el('div', { class: 'chat-sidebar-foot' },
    hasAnyKey() ? 'API key connected - AI features active.' : 'No API key - heuristic-only mode. Set a key in Settings → API key for richer responses.'
  ));

  overlay.appendChild(sidebar);
  document.body.appendChild(overlay);

  _currentSidebar = overlay;

  // Wire close on overlay click + Escape
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeChatSidebar(); });
  function onKey(e) { if (e.key === 'Escape') closeChatSidebar(); }
  document.addEventListener('keydown', onKey);
  overlay.__cleanup = () => document.removeEventListener('keydown', onKey);

  // Tiny entrance
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  function renderTab() {
    clear(stage);
    stage.id = 'chat-panel-' + activeTab;
    stage.setAttribute('aria-labelledby', 'chat-tab-' + activeTab);
    if (activeTab === 'ask') stage.appendChild(renderAsk(concept));
    else if (activeTab === 'tutor') stage.appendChild(renderTutor(concept));
    else stage.appendChild(renderRewrite(concept));
  }
  renderTab();

  // Move focus into the sidebar for screen readers
  setTimeout(() => closeBtn.focus(), 0);
}

export function closeChatSidebar() {
  if (!_currentSidebar) return;
  if (typeof _currentSidebar.__cleanup === 'function') _currentSidebar.__cleanup();
  _currentSidebar.classList.remove('is-open');
  const prev = _lastFocus;
  setTimeout(() => {
    if (_currentSidebar) _currentSidebar.remove();
    _currentSidebar = null;
    if (prev && typeof prev.focus === 'function') prev.focus();
  }, 220);
}

// ---------- Ask tab ----------
function renderAsk(concept) {
  const sec = el('section', { class: 'chat-tab' });
  const history = lsGet('chat:' + concept.slug, []);
  const thread = el('div', { class: 'chat-thread' });

  function renderThread() {
    clear(thread);
    if (!history.length) {
      thread.appendChild(el('p', { class: 'chat-empty' }, 'Ask anything about this concept. The AI sees the definition; with a key it can pull more nuance.'));
    }
    for (const msg of history) {
      thread.appendChild(el('div', { class: 'chat-msg chat-msg-' + msg.role }, [
        el('div', { class: 'chat-msg-role' }, msg.role === 'user' ? 'You' : 'AI'),
        el('div', { class: 'chat-msg-body' }, msg.content)
      ]));
    }
    thread.scrollTop = thread.scrollHeight;
  }
  renderThread();
  sec.appendChild(thread);

  const input = el('textarea', {
    class: 'chat-input',
    rows: '2',
    placeholder: 'Ask about ' + concept.name + '...'
  });
  const sendBtn = el('button', { class: 'btn btn-primary btn-sm', type: 'button' }, hasAnyKey() ? 'Send' : 'Ask (heuristic)');
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
  });

  async function send() {
    const q = input.value.trim();
    if (!q) return;
    history.push({ role: 'user', content: q });
    lsSet('chat:' + concept.slug, history);
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Thinking...';
    renderThread();

    const out = await aiOrFallback(
      async () => {
        const { aiCall } = await import('../ai.js');
        const sys = 'You are a senior AI engineering tutor. Help the user understand "' + concept.name + '". Definition: ' + concept.stub + '. Be precise; cite tradeoffs; give one concrete example when useful. No filler.';
        // Replay full thread
        const messages = history.map(m => ({ role: m.role, content: m.content }));
        return await aiCall({ system: sys, messages, maxTokens: 800 });
      },
      () => heuristicAsk(q, concept)
    );
    history.push({ role: 'assistant', content: out.value });
    lsSet('chat:' + concept.slug, history);
    sendBtn.disabled = false;
    sendBtn.textContent = hasAnyKey() ? 'Send' : 'Ask (heuristic)';
    renderThread();
  }

  sec.appendChild(el('div', { class: 'chat-compose' }, [
    input,
    el('div', { class: 'chat-compose-actions' }, [
      el('button', { class: 'btn btn-ghost btn-sm', type: 'button', on: { click: () => { history.length = 0; lsSet('chat:' + concept.slug, []); renderThread(); } } }, 'Clear'),
      sendBtn
    ])
  ]));
  return sec;
}

// ---------- Tutor tab ----------
function renderTutor(concept) {
  const sec = el('section', { class: 'chat-tab' });
  sec.appendChild(el('p', { class: 'chat-empty' },
    'Socratic tutor: AI asks you questions, you answer, AI assesses. Builds active recall instead of passive reading.'
  ));
  const start = el('button', { class: 'btn btn-primary', type: 'button' }, hasAnyKey() ? 'Start tutor session' : 'Start (heuristic mode)');
  const session = el('div', { class: 'chat-thread', style: 'margin-top: 12px;' });
  sec.appendChild(start);
  sec.appendChild(session);

  start.addEventListener('click', async () => {
    start.disabled = true;
    start.textContent = 'Loading...';
    clear(session);
    const out = await aiOrFallback(
      async () => {
        const { aiCall } = await import('../ai.js');
        const sys = 'You are a Socratic tutor for "' + concept.name + '". Ask the user one focused question that probes their understanding. Brief; one sentence.';
        return await aiCall({ system: sys, messages: [{ role: 'user', content: 'Start the session.' }], maxTokens: 200 });
      },
      () => heuristicTutorQuestion(concept)
    );
    session.appendChild(el('div', { class: 'chat-msg chat-msg-assistant' }, [
      el('div', { class: 'chat-msg-role' }, 'AI'),
      el('div', { class: 'chat-msg-body' }, out.value)
    ]));
    const ans = el('textarea', { class: 'chat-input', rows: '3', placeholder: 'Your answer...' });
    const submit = el('button', { class: 'btn btn-primary btn-sm', type: 'button', style: 'margin-top: 8px;' }, 'Submit');
    submit.addEventListener('click', async () => {
      submit.disabled = true;
      submit.textContent = 'Grading...';
      session.appendChild(el('div', { class: 'chat-msg chat-msg-user' }, [
        el('div', { class: 'chat-msg-role' }, 'You'),
        el('div', { class: 'chat-msg-body' }, ans.value)
      ]));
      const verdict = await aiOrFallback(
        async () => {
          const { aiCall } = await import('../ai.js');
          const sys = 'You are a Socratic tutor for "' + concept.name + '". The user answered a probing question. Assess: 1 sentence on what was correct, 1 sentence on what they missed, 1 follow-up question. Brief.';
          return await aiCall({ system: sys, messages: [{ role: 'user', content: 'Question: ' + out.value + '\nUser answer: ' + ans.value }], maxTokens: 300 });
        },
        () => heuristicTutorAssessment(ans.value, concept)
      );
      session.appendChild(el('div', { class: 'chat-msg chat-msg-assistant' }, [
        el('div', { class: 'chat-msg-role' }, 'AI'),
        el('div', { class: 'chat-msg-body' }, verdict.value)
      ]));
      submit.disabled = false;
      submit.textContent = 'Submit';
      ans.value = '';
    });
    session.appendChild(ans);
    session.appendChild(submit);
    start.disabled = false;
    start.textContent = 'New question';
  });
  return sec;
}

// ---------- Rewrite tab ----------
function renderRewrite(concept) {
  const sec = el('section', { class: 'chat-tab' });
  sec.appendChild(el('p', { class: 'chat-empty' },
    'Rewrite the worked example for a specific persona. Engineer / PM / Leader produce different framings of the same concept.'
  ));
  const personas = [
    { id: 'engineer', label: 'Engineer (technical, code-heavy)' },
    { id: 'pm', label: 'Product manager (decision tradeoffs)' },
    { id: 'leader', label: 'Engineering leader (strategy + risk)' },
    { id: 'student', label: 'Student (analogy-driven)' }
  ];
  for (const p of personas) {
    const b = el('button', { class: 'onboarding-option', type: 'button', style: 'margin-bottom: 6px;' }, p.label);
    b.addEventListener('click', async () => {
      const stage = el('div', { class: 'chat-thread', style: 'margin-top: 8px;' });
      sec.appendChild(stage);
      stage.appendChild(el('div', { class: 'chat-msg chat-msg-assistant' }, [
        el('div', { class: 'chat-msg-role' }, 'AI · ' + p.label),
        el('div', { class: 'chat-msg-body' }, 'Generating...')
      ]));
      const out = await aiOrFallback(
        async () => {
          const { aiCall } = await import('../ai.js');
          const sys = 'You are explaining the concept "' + concept.name + '" tailored for a specific reader. Stay accurate; reframe priorities and language for the persona. Output: 1 paragraph (~80-130 words).';
          const user = 'Persona: ' + p.label + '\nDefinition: ' + concept.stub;
          return await aiCall({ system: sys, messages: [{ role: 'user', content: user }], maxTokens: 400 });
        },
        () => heuristicPersonaRewrite(p.id, concept)
      );
      clear(stage);
      stage.appendChild(el('div', { class: 'chat-msg chat-msg-assistant' }, [
        el('div', { class: 'chat-msg-role' }, 'AI · ' + p.label),
        el('div', { class: 'chat-msg-body' }, out.value)
      ]));
    });
    sec.appendChild(b);
  }
  return sec;
}

// ---------- Heuristic fallbacks ----------
function heuristicAsk(q, concept) {
  return 'Heuristic-only mode. Definition recap: ' + concept.stub + '\n\nTo unlock richer answers, set an Anthropic or OpenAI API key in Settings → API key.';
}
function heuristicTutorQuestion(concept) {
  return 'In your own words, when would you choose to use ' + concept.name + ' over alternatives? Name one tradeoff.';
}
function heuristicTutorAssessment(answer, concept) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (words < 8) return 'Too brief to assess - try 2-3 sentences. Cover when you would use ' + concept.name + ' AND a tradeoff.';
  return 'Length is acceptable (' + words + ' words). Connect the answer to the definition: ' + concept.stub;
}
function heuristicPersonaRewrite(personaId, concept) {
  const intros = {
    engineer: 'For an engineer: ',
    pm: 'For a PM: ',
    leader: 'For an engineering leader: ',
    student: 'For a student: '
  };
  return (intros[personaId] || '') + concept.stub + ' (Heuristic rewrite. With an API key, this becomes a tailored full paragraph.)';
}

window.aise26 = Object.assign(window.aise26 || {}, { openChatSidebar, closeChatSidebar });
