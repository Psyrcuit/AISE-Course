// Voice commands. Tiny SpeechRecognition wrapper that opens cmdk and types
// what the user says, then either auto-submits the top result or lets the
// user confirm via Enter. Browser-native (Chrome / Edge / Safari modern); no
// vendor. Off by default; user opts in via Settings → Appearance later, or
// by pressing the mic button in the topstrip.
//
// Usage: import './voice.js'; in app.js. Then call window.aise26.voice.start()
// from a button click handler.

import { announce, toast, lsSet } from './runtime.js';

let _rec = null;
let _listening = false;

export function isSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function start() {
  if (_listening) { stop(); return; }
  const Sup = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Sup) {
    announce('Voice recognition is not supported on this browser.');
    return;
  }
  _rec = new Sup();
  _rec.lang = (navigator.language || 'en-US').replace('_', '-');
  _rec.interimResults = true;
  _rec.continuous = false;
  _rec.onstart = () => { _listening = true; toast('Listening...', 'info', 5000); };
  _rec.onerror = (e) => { _listening = false; announce('Voice error: ' + e.error); };
  _rec.onend = () => { _listening = false; };
  _rec.onresult = (e) => {
    let transcript = '';
    let isFinal = false;
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
      if (e.results[i].isFinal) isFinal = true;
    }
    transcript = transcript.trim();
    if (!transcript) return;

    // Open cmdk and stream the transcript into the input
    document.dispatchEvent(new CustomEvent('aise26:open-cmdk'));
    setTimeout(() => {
      const input = document.querySelector('.cmd-input');
      if (input) {
        input.value = transcript;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (isFinal) {
        // If transcript starts with "go to" or "open", submit immediately
        const lower = transcript.toLowerCase().trim();
        if (/^(go to|open|navigate to|jump to|take me to)\s+/.test(lower)) {
          setTimeout(() => {
            const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            (input || document.activeElement).dispatchEvent(enter);
          }, 200);
        }
      }
    }, 60);
  };
  try { _rec.start(); lsSet('voice_used', true); }
  catch (err) { announce('Voice start failed: ' + err.message); }
}

export function stop() {
  if (_rec) { try { _rec.stop(); } catch {} }
  _listening = false;
}

window.aise26 = Object.assign(window.aise26 || {}, { voice: { start, stop, isSupported } });
