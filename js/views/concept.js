// Concept page (the workhorse).
import { FLESHED } from '../fleshed.js';
import { QUIZZES } from '../quizzes.js';
import { FLASHCARDS } from '../flashcards.js';
import { setSettings, el, announce } from '../runtime.js';
import { conceptBySlug, moduleByN, linkifyText, resolveCrossRef } from '../crossref.js';
import {
  awardXP, getConceptState, setConceptState, isSaved, toggleSaved
} from '../gamification.js';
import { mountEditor } from '../editor.js';
import { renderNotFound } from './main.js';
import { openChatSidebar } from '../components/chat-sidebar.js';
import { buildReaderControls } from '../components/reader.js';
import { hasAnyKey } from '../ai.js';
import { pushHistory } from './history.js';
import { mountAnnotator } from '../components/annotate.js';

let _conceptCycleList = null;
export function setConceptCycleList(list) { _conceptCycleList = list; }

export function renderConceptPage(slug) {
  const c = conceptBySlug(slug);
  if (!c) return renderNotFound('Concept "' + slug + '" not found.');
  const m = moduleByN(c.module);
  const state = getConceptState(slug);
  setSettings({ last_concept: slug });
  pushHistory(slug);

  const wrap = el('article', { class: 'fade-up', 'aria-labelledby': 'concept-h1', 'data-module': String(c.module) });

  // Heading
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, m ? m.title : ('Module ' + c.module)));
  wrap.appendChild(el('h1', { id: 'concept-h1', style: 'font-size: var(--fs-700); letter-spacing: -.018em; margin: 4px 0 4px;' }, c.name));
  if (c.aliases && c.aliases.length) {
    wrap.appendChild(el('p', { class: 'concept-aliases' }, 'Also: ' + c.aliases.join(', ')));
  }

  // Meta pills
  wrap.appendChild(el('div', { class: 'concept-meta' }, [
    el('span', { class: 'pill pill-mod' }, 'Module ' + c.module),
    c.subsection ? el('span', { class: 'pill' }, c.subsection) : null
  ]));

  // Definition
  wrap.appendChild(el('section', { class: 'concept-section' }, [
    el('h2', null, 'Definition'),
    el('p', { class: 'prose' }, c.stub)
  ]));

  // Fleshed sections
  const fleshedData = FLESHED && FLESHED[slug] || null;
  if (c.fleshed) {
    const sections = [
      { key: 'opener', title: 'What it actually is' },
      { key: 'breakdown', title: 'Architectural breakdown' },
      { key: 'example', title: 'Worked example' },
      { key: 'failures', title: 'Common failures' }
    ];
    for (const s of sections) {
      const data = fleshedData && fleshedData[s.key];
      if (!data) continue;     // skip empty sections silently
      const sec = el('section', { class: 'concept-section' }, [el('h2', null, s.title)]);
      const renderItem = (piece) => {
        if (typeof piece === 'string') sec.appendChild(el('p', { class: 'prose' }, piece));
        else if (piece && typeof piece === 'object' && typeof piece.code === 'string') {
          sec.appendChild(el('pre', null, el('code', null, piece.code)));
        } else if (piece instanceof Node) sec.appendChild(piece);
      };
      if (typeof data === 'string') renderItem(data);
      else if (Array.isArray(data)) for (const p of data) renderItem(p);
      else renderItem(data);
      wrap.appendChild(sec);
    }
  }

  // See also
  const seeAlso = el('section', { class: 'concept-section' }, [el('h2', null, 'See also')]);
  const seeAlsoList = el('ul', { class: 'see-also-list' });
  const refs = (c.crossRefs || []).slice();
  if (m) refs.push('Module ' + c.module);
  const seen = new Set();
  for (const ref of refs) {
    const r = resolveCrossRef(ref);
    if (!r.ok || seen.has(r.href)) continue;
    seen.add(r.href);
    seeAlsoList.appendChild(el('li', null, el('a', { href: r.href }, r.label)));
  }
  if (!seeAlsoList.children.length) seeAlsoList.appendChild(el('li', { class: 'placeholder' }, 'no cross-references yet'));
  seeAlso.appendChild(seeAlsoList);
  wrap.appendChild(seeAlso);

  // Deep-dive prompt (Editor pattern)
  const promptText = (fleshedData && fleshedData.prompt) ? fleshedData.prompt :
    'I want to deeply understand "' + c.name + '" in the context of being a 2026 AI Solutions Engineer / Architect.\n\nStarting definition: ' + c.stub + '\n\nGo through:\n1. The clearest plain-language explanation, no jargon.\n2. The architectural mechanics. How does this actually work under the hood?\n3. A concrete worked example with numbers or pseudo-code.\n4. Where this fits in production AI systems.\n5. Common failure modes and how to spot them.\n6. How a senior engineer would explain this to a hiring manager in 60 seconds.';

  const promptSection = el('section', { class: 'concept-section', 'aria-label': 'Deep-dive prompt' }, [
    el('h2', null, 'Deep-dive prompt'),
    el('p', { style: 'color: var(--text-3); font-size: var(--fs-200); margin-bottom: 10px;' }, 'Paste this into Claude or ChatGPT to go deeper.')
  ]);
  wrap.appendChild(promptSection);
  mountEditor({
    container: promptSection,
    originalText: promptText,
    type: 'prompt',
    slug,
    monospace: false,
    label: 'Deep-dive prompt'
  });

  // Toolbar (mark complete + save)
  const completeId = 'concept-complete-' + slug;
  const cb = el('input', { type: 'checkbox', id: completeId });
  cb.checked = state.complete;
  cb.addEventListener('change', () => {
    if (cb.checked) {
      setConceptState(slug, { complete: true, completed_at: new Date().toISOString() });
      awardXP(5, 'concept_complete', slug);
      announce(c.name + ' marked complete.');
    } else {
      setConceptState(slug, { complete: false, completed_at: null });
      announce(c.name + ' marked incomplete.');
    }
  });

  const savedNow = isSaved(slug);
  const saveBtn = el('button', {
    class: 'save-toggle',
    type: 'button',
    'aria-pressed': String(savedNow),
    title: savedNow ? 'Remove from Personal Library' : 'Save to Personal Library'
  }, [
    el('span', { 'aria-hidden': 'true' }, savedNow ? '♥' : '♡'),
    el('span', null, savedNow ? 'Saved' : 'Save for later')
  ]);
  saveBtn.addEventListener('click', () => {
    const nowSaved = toggleSaved(slug);
    saveBtn.setAttribute('aria-pressed', String(nowSaved));
    saveBtn.querySelector('span:first-child').textContent = nowSaved ? '♥' : '♡';
    saveBtn.lastElementChild.textContent = nowSaved ? 'Saved' : 'Save for later';
    announce(nowSaved ? 'Saved.' : 'Removed from saved.');
  });

  // AI panel trigger
  const askAiBtn = el('button', { class: 'btn btn-sm btn-ghost', type: 'button', 'aria-label': 'Ask AI about ' + c.name }, [
    el('span', { 'aria-hidden': 'true' }, '🤖 '),
    'Ask AI',
    hasAnyKey() ? el('span', { class: 'ai-badge', 'aria-hidden': 'true' }, 'AI') : null
  ]);
  askAiBtn.addEventListener('click', () => openChatSidebar(c));

  wrap.appendChild(el('div', { class: 'concept-toolbar' }, [
    el('label', { for: completeId }, [cb, ' Mark complete']),
    saveBtn,
    askAiBtn,
    buildReaderControls(c, fleshedData),
    el('a', { class: 'btn btn-sm btn-ghost', href: '#/map?focus=' + slug }, 'View on map')
  ]));

  // Notes
  const notesId = 'concept-notes-' + slug;
  const notesArea = el('textarea', {
    id: notesId,
    placeholder: 'Notes for this concept (saved to Personal Library)',
    'aria-label': 'Notes for ' + c.name,
    spellcheck: 'true'
  });
  notesArea.value = state.notes || '';
  let notesTimer = null;
  notesArea.addEventListener('input', () => {
    if (notesTimer) clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      const notes = notesArea.value;
      const cur = getConceptState(slug);
      const wasFirst = !(cur.notes || '').trim() && notes.trim();
      setConceptState(slug, { notes });
      if (wasFirst) awardXP(5, 'note_first', slug);
    }, 500);
  });
  wrap.appendChild(el('section', { class: 'concept-section' }, [
    el('h2', null, 'Your notes'),
    notesArea
  ]));

  // Flashcard
  const flashcardData = FLASHCARDS && FLASHCARDS[slug];
  if (flashcardData) {
    const fcSec = el('section', { class: 'concept-section' }, [el('h2', null, 'Flashcard')]);
    const card = el('div', { class: 'flashcard', tabindex: '0', role: 'button', 'aria-pressed': 'false', 'aria-label': 'Flashcard. Press to reveal.' });
    const front = el('div', { class: 'flashcard-face flashcard-front' }, flashcardData.front);
    const back = el('div', { class: 'flashcard-face flashcard-back', hidden: '' }, flashcardData.back);
    card.appendChild(front);
    card.appendChild(back);
    let revealed = false;
    let masteredOnce = state.flashcard_mastered === true;
    const reveal = () => {
      revealed = !revealed;
      card.setAttribute('aria-pressed', String(revealed));
      front.hidden = revealed;
      back.hidden = !revealed;
      if (revealed && !masteredOnce) {
        masteredOnce = true;
        setConceptState(slug, { flashcard_mastered: true });
        awardXP(5, 'flashcard_mastered', slug);
        announce('Flashcard mastered.');
      }
    };
    card.addEventListener('click', reveal);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
    });
    fcSec.appendChild(card);
    fcSec.appendChild(el('p', { class: 'placeholder', style: 'font-size: var(--fs-200); color: var(--text-3); margin-top: 8px;' }, 'Click or press Enter to reveal.'));
    wrap.appendChild(fcSec);
  }

  // Quiz
  const quizData = QUIZZES && QUIZZES[slug];
  if (quizData && quizData.length) {
    const quizSec = el('section', { class: 'concept-section' }, [el('h2', null, 'Quiz')]);
    let currentIdx = 0;
    let correctCount = 0;
    let answered = state.quiz_passed === true;
    const card = el('div', { class: 'quiz-card' });
    quizSec.appendChild(card);
    quizSec.appendChild(el('p', { class: 'placeholder', style: 'font-size: var(--fs-200); color: var(--text-3); margin-top: 8px;' }, quizData.length + ' question' + (quizData.length === 1 ? '' : 's') + '. Pass: at least ' + Math.ceil(quizData.length * 0.66) + ' correct.'));
    function renderQuestion() {
      while (card.firstChild) card.removeChild(card.firstChild);
      if (currentIdx >= quizData.length) {
        const passed = correctCount >= Math.ceil(quizData.length * 0.66);
        card.appendChild(el('p', { class: 'quiz-result' }, passed ? 'Passed: ' + correctCount + '/' + quizData.length + '.' : 'Try again: ' + correctCount + '/' + quizData.length + '. Aim for ' + Math.ceil(quizData.length * 0.66) + '+.'));
        if (passed && !answered) {
          answered = true;
          setConceptState(slug, { quiz_passed: true });
          awardXP(10, 'concept_quiz_pass', slug);
          announce('Quiz passed.');
        }
        const retry = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Retry');
        retry.addEventListener('click', () => {
          currentIdx = 0;
          correctCount = 0;
          renderQuestion();
        });
        card.appendChild(retry);
        return;
      }
      const q = quizData[currentIdx];
      card.appendChild(el('p', { class: 'quiz-prompt' }, 'Q' + (currentIdx + 1) + '. ' + q.prompt));
      const opts = el('ul', { class: 'quiz-options' });
      q.options.forEach((opt, i) => {
        const li = el('li');
        const btn = el('button', { class: 'btn btn-sm btn-ghost quiz-option', type: 'button' }, opt);
        btn.addEventListener('click', () => {
          const correct = (i === q.correctIndex);
          if (correct) correctCount++;
          while (card.firstChild) card.removeChild(card.firstChild);
          card.appendChild(el('p', { class: 'quiz-prompt' }, 'Q' + (currentIdx + 1) + '. ' + q.prompt));
          card.appendChild(el('p', { class: 'quiz-feedback ' + (correct ? 'is-correct' : 'is-wrong') }, (correct ? 'Correct. ' : 'Not quite. ') + q.explanation));
          const next = el('button', { class: 'btn btn-sm btn-primary', type: 'button' }, currentIdx + 1 < quizData.length ? 'Next question' : 'See result');
          next.addEventListener('click', () => {
            currentIdx++;
            renderQuestion();
          });
          card.appendChild(next);
        });
        li.appendChild(btn);
        opts.appendChild(li);
      });
      card.appendChild(opts);
    }
    renderQuestion();
    wrap.appendChild(quizSec);
  }

  // Prev / next
  const cycleList = _conceptCycleList || [];
  const idx = cycleList.indexOf(slug);
  if (idx >= 0) {
    const prev = cycleList[(idx - 1 + cycleList.length) % cycleList.length];
    const next = cycleList[(idx + 1) % cycleList.length];
    const prevC = conceptBySlug(prev), nextC = conceptBySlug(next);
    wrap.appendChild(el('div', { class: 'next-prev-nav' }, [
      el('a', { href: '#/concept/' + prev, 'aria-label': 'Previous concept: ' + (prevC ? prevC.name : prev) }, [
        el('div', { class: 'label' }, '← prev (k)'),
        el('div', { class: 'target' }, prevC ? prevC.name : prev)
      ]),
      el('a', { href: '#/concept/' + next, class: 'next', 'aria-label': 'Next concept: ' + (nextC ? nextC.name : next) }, [
        el('div', { class: 'label' }, 'next → (j)'),
        el('div', { class: 'target' }, nextC ? nextC.name : next)
      ])
    ]));
  }

  // Right rail context: TOC + completion + saved
  const toc = el('ul', null, [
    el('li', null, el('a', { href: '#' }, 'Definition')),
    c.fleshed ? el('li', null, el('a', { href: '#' }, 'What it actually is')) : null,
    c.fleshed ? el('li', null, el('a', { href: '#' }, 'Architectural breakdown')) : null,
    c.fleshed ? el('li', null, el('a', { href: '#' }, 'Worked example')) : null,
    c.fleshed ? el('li', null, el('a', { href: '#' }, 'Common failures')) : null,
    el('li', null, el('a', { href: '#' }, 'See also')),
    el('li', null, el('a', { href: '#' }, 'Deep-dive prompt')),
    el('li', null, el('a', { href: '#' }, 'Your notes'))
  ]);
  const ctx = el('div', null, [
    el('section', { class: 'context-card' }, [
      el('h3', null, 'On this page'),
      toc
    ]),
    el('section', { class: 'context-card' }, [
      el('h3', null, 'Module'),
      el('p', { style: 'margin: 0;' }, [
        el('a', { href: '#/module/' + c.module, style: 'color: var(--text-1); font-weight: 500;' }, m ? m.title : 'Module ' + c.module)
      ])
    ])
  ]);

  linkifyText(wrap, { skipSlug: slug });
  // Mount the highlight + annotate component for selection-based note-taking.
  // Defer until DOM is committed so the scope contains the rendered prose.
  setTimeout(() => mountAnnotator(wrap, slug), 30);
  return {
    node: wrap,
    title: c.name,
    crumbs: [{ label: 'Modules', href: '#/modules' }, { label: m ? m.title : 'Module ' + c.module, href: '#/module/' + c.module }, { label: c.name }],
    context: ctx
  };
}
