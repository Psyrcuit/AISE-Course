// Audio narration + reading mode for concept pages.
// - Audio: browser SpeechSynthesis API (no asset fetch, no API key).
// - Reading mode: full-screen, distraction-free reading surface.

import { el, clear, getSettings, setSettings, announce, lsSet } from '../runtime.js';

let _state = {
  utterance: null,
  speaking: false,
  paused: false,
  voice: null,
  rate: 1.0,
  pitch: 1.0
};

let _readingOverlay = null;
let _readingLastFocus = null;

/**
 * Build a "Listen" + "Read mode" button row that goes into the concept toolbar.
 */
export function buildReaderControls(concept, fleshedData) {
  const wrap = el('span', { style: 'display: inline-flex; gap: 6px;' });
  const listenBtn = el('button', {
    class: 'btn btn-sm btn-ghost',
    type: 'button',
    'aria-label': 'Listen to this concept'
  }, [el('span', { 'aria-hidden': 'true' }, '🔊 '), 'Listen']);
  listenBtn.addEventListener('click', () => toggleListen(concept, fleshedData, listenBtn));
  wrap.appendChild(listenBtn);

  const readBtn = el('button', {
    class: 'btn btn-sm btn-ghost',
    type: 'button',
    'aria-label': 'Open reading mode'
  }, [el('span', { 'aria-hidden': 'true' }, '📖 '), 'Read mode']);
  readBtn.addEventListener('click', () => openReadingMode(concept, fleshedData));
  wrap.appendChild(readBtn);

  return wrap;
}

// ---------- Audio narration ----------
function _supportsSpeech() {
  return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function _composeText(concept, fleshedData) {
  const parts = [];
  parts.push(concept.name + '. ');
  parts.push('Module ' + concept.module + '. ');
  parts.push(concept.stub + ' ');
  if (fleshedData) {
    if (fleshedData.opener) parts.push('What it actually is. ' + _flatten(fleshedData.opener) + ' ');
    if (fleshedData.breakdown) parts.push('Architectural breakdown. ' + _flatten(fleshedData.breakdown) + ' ');
    if (fleshedData.example) parts.push('Worked example. ' + _flatten(fleshedData.example, true) + ' ');
    if (fleshedData.failures) parts.push('Common failures. ' + _flatten(fleshedData.failures) + ' ');
  }
  return parts.join('');
}

function _flatten(piece, skipCode = false) {
  if (typeof piece === 'string') return piece;
  if (Array.isArray(piece)) return piece.map(p => _flatten(p, skipCode)).filter(Boolean).join(' ');
  if (piece && typeof piece === 'object' && typeof piece.code === 'string') {
    return skipCode ? '' : piece.code;
  }
  return '';
}

function _pickVoice() {
  if (_state.voice) return _state.voice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer English voices that sound natural; OS-specific defaults
  const english = voices.filter(v => /^en[-_]/i.test(v.lang));
  // Any "Natural", "Neural", "Premium", or specific known good ones first
  const preferred = english.find(v => /natural|neural|premium|samantha|alex|daniel|moira/i.test(v.name));
  _state.voice = preferred || english[0] || voices[0];
  return _state.voice;
}

function toggleListen(concept, fleshedData, btn) {
  if (!_supportsSpeech()) {
    announce('Speech synthesis is not supported on this browser.');
    return;
  }
  const synth = window.speechSynthesis;
  // If currently speaking and the same concept, pause/resume; otherwise stop+start
  if (_state.speaking) {
    if (_state.paused) {
      synth.resume();
      _state.paused = false;
      btn.innerHTML = '<span aria-hidden="true">⏸ </span>Pause';
      announce('Resumed.');
    } else {
      synth.pause();
      _state.paused = true;
      btn.innerHTML = '<span aria-hidden="true">▶ </span>Resume';
      announce('Paused.');
    }
    return;
  }
  // Cancel any prior speaking
  synth.cancel();
  const text = _composeText(concept, fleshedData);
  if (!text.trim()) return;
  const utt = new SpeechSynthesisUtterance(text);
  const voice = _pickVoice();
  if (voice) utt.voice = voice;
  utt.rate = _state.rate;
  utt.pitch = _state.pitch;
  utt.onstart = () => {
    _state.speaking = true;
    _state.paused = false;
    btn.innerHTML = '<span aria-hidden="true">⏸ </span>Pause';
  };
  utt.onend = utt.onerror = () => {
    _state.speaking = false;
    _state.paused = false;
    btn.innerHTML = '<span aria-hidden="true">🔊 </span>Listen';
  };
  _state.utterance = utt;
  synth.speak(utt);
}

// Stop speech on hash change so leaving the concept page kills the audio.
window.addEventListener('hashchange', () => {
  if (_state.speaking && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    _state.speaking = false;
    _state.paused = false;
  }
});

// Voices may load async on some platforms.
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { _state.voice = null; };
}

// ---------- Reading mode ----------
function openReadingMode(concept, fleshedData) {
  if (_readingOverlay) closeReadingMode();
  _readingLastFocus = document.activeElement;
  lsSet('reader_opened', true);
  const overlay = document.createElement('div');
  overlay.className = 'reading-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Reading mode: ' + concept.name);

  const inner = el('div', { class: 'reading-inner' });
  // Header bar
  const head = el('header', { class: 'reading-head' }, [
    el('div', { class: 'practice-card-eyebrow' }, 'Reading mode · M' + concept.module),
    el('div', { style: 'display: flex; gap: 8px;' }, [
      _readBtn('🔊 Listen', () => {
        const trigger = head.querySelector('.reading-listen-btn');
        toggleListen(concept, fleshedData, trigger);
      }, 'reading-listen-btn'),
      _readBtn('×', closeReadingMode, '', 'Close reading mode')
    ])
  ]);
  inner.appendChild(head);

  // Title
  inner.appendChild(el('h1', { class: 'reading-title' }, concept.name));
  if (concept.aliases && concept.aliases.length) {
    inner.appendChild(el('p', { class: 'reading-aliases' }, 'Also: ' + concept.aliases.join(', ')));
  }
  inner.appendChild(el('p', { class: 'reading-stub' }, concept.stub));

  // Fleshed sections
  if (fleshedData) {
    inner.appendChild(_section('What it actually is', fleshedData.opener));
    inner.appendChild(_section('Architectural breakdown', fleshedData.breakdown));
    inner.appendChild(_section('Worked example', fleshedData.example));
    inner.appendChild(_section('Common failures', fleshedData.failures));
  }

  // Footer
  inner.appendChild(el('div', { class: 'reading-foot' }, [
    el('p', { style: 'color: var(--text-3); font-size: var(--fs-100);' }, 'Esc to close · Reading mode strips chrome for distraction-free reading.')
  ]));

  overlay.appendChild(inner);
  document.body.appendChild(overlay);
  _readingOverlay = overlay;

  function onKey(e) { if (e.key === 'Escape') closeReadingMode(); }
  document.addEventListener('keydown', onKey);
  overlay.__cleanup = () => document.removeEventListener('keydown', onKey);

  requestAnimationFrame(() => overlay.classList.add('is-open'));
  // Move focus into the dialog for screen readers
  setTimeout(() => {
    const focusable = overlay.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }, 0);
}

function closeReadingMode() {
  if (!_readingOverlay) return;
  if (typeof _readingOverlay.__cleanup === 'function') _readingOverlay.__cleanup();
  if (_state.speaking && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  _readingOverlay.classList.remove('is-open');
  const prev = _readingLastFocus;
  _readingLastFocus = null;
  setTimeout(() => {
    if (_readingOverlay) _readingOverlay.remove();
    _readingOverlay = null;
    if (prev && typeof prev.focus === 'function') prev.focus();
  }, 220);
}

function _section(label, piece) {
  if (!piece) return null;
  const sec = el('section', { class: 'reading-section' }, [
    el('h2', null, label)
  ]);
  if (typeof piece === 'string') sec.appendChild(el('p', null, piece));
  else if (Array.isArray(piece)) {
    for (const p of piece) {
      if (typeof p === 'string') sec.appendChild(el('p', null, p));
      else if (p && typeof p === 'object' && typeof p.code === 'string') {
        sec.appendChild(el('pre', null, el('code', null, p.code)));
      }
    }
  } else if (piece && typeof piece === 'object' && typeof piece.code === 'string') {
    sec.appendChild(el('pre', null, el('code', null, piece.code)));
  }
  return sec;
}

function _readBtn(label, onClick, cls, ariaLabel) {
  const b = el('button', { class: 'btn btn-sm btn-ghost' + (cls ? ' ' + cls : ''), type: 'button', 'aria-label': ariaLabel || label }, label);
  b.addEventListener('click', onClick);
  return b;
}

window.aise26 = Object.assign(window.aise26 || {}, { reader: { buildReaderControls, openReadingMode, closeReadingMode } });
