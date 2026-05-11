// Sound cues. WebAudio synthesis (no asset fetch). Off by default; user
// opts in via Settings → Appearance → Sound design.
//
// Cues: xp, level-up, achievement, streak, complete, quiz-correct, quiz-wrong, nav.

import { getSettings } from './runtime.js';

let _ctx = null;
function ctx() {
  if (_ctx) return _ctx;
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    _ctx = new C();
  } catch { _ctx = null; }
  return _ctx;
}

function shouldPlay(cueId) {
  const s = getSettings();
  if (!s.sound || s.sound === 'off') return false;
  if (s.sound === 'quiet') {
    return ['xp', 'level-up', 'achievement', 'streak'].includes(cueId);
  }
  return true;       // 'full'
}

// Each cue is a small recipe of (frequency, duration, type, volume).
const RECIPES = {
  'xp':            [{ f: 880, d: 0.06, t: 'sine', v: 0.18 }, { f: 1320, d: 0.06, t: 'sine', v: 0.12, delay: 0.04 }],
  'level-up':      [{ f: 523, d: 0.08, t: 'sine', v: 0.18 }, { f: 659, d: 0.08, t: 'sine', v: 0.18, delay: 0.07 }, { f: 784, d: 0.10, t: 'sine', v: 0.20, delay: 0.14 }, { f: 1047, d: 0.18, t: 'sine', v: 0.22, delay: 0.22 }],
  'achievement':   [{ f: 660, d: 0.08, t: 'triangle', v: 0.18 }, { f: 1320, d: 0.20, t: 'triangle', v: 0.16, delay: 0.06 }],
  'streak':        [{ f: 220, d: 0.05, t: 'square', v: 0.16 }, { f: 330, d: 0.05, t: 'square', v: 0.16, delay: 0.04 }],
  'complete':      [{ f: 523, d: 0.07, t: 'sine', v: 0.16 }, { f: 784, d: 0.10, t: 'sine', v: 0.18, delay: 0.06 }],
  'quiz-correct':  [{ f: 880, d: 0.06, t: 'sine', v: 0.16 }, { f: 1175, d: 0.06, t: 'sine', v: 0.14, delay: 0.04 }],
  'quiz-wrong':    [{ f: 220, d: 0.10, t: 'sawtooth', v: 0.14 }],
  'nav':           [{ f: 1320, d: 0.025, t: 'sine', v: 0.10 }]
};

export function play(cueId) {
  if (!shouldPlay(cueId)) return;
  const c = ctx();
  if (!c) return;
  const recipe = RECIPES[cueId];
  if (!recipe) return;
  const start = c.currentTime + 0.005;
  for (const note of recipe) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = note.t || 'sine';
    osc.frequency.value = note.f;
    gain.gain.setValueAtTime(0, start + (note.delay || 0));
    gain.gain.linearRampToValueAtTime(note.v, start + (note.delay || 0) + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + (note.delay || 0) + note.d);
    osc.connect(gain).connect(c.destination);
    osc.start(start + (note.delay || 0));
    osc.stop(start + (note.delay || 0) + note.d + 0.02);
  }
}

// Wire to existing app events
document.addEventListener('aise26:xp-awarded', () => play('xp'));
document.addEventListener('aise26:tier-up', () => play('level-up'));
document.addEventListener('aise26:achievement-unlocked', () => play('achievement'));
document.addEventListener('aise26:streak-bumped', () => play('streak'));

window.aise26 = Object.assign(window.aise26 || {}, { audio: { play } });
