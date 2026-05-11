// Restrained easter eggs. Brand flavor; rewards exploration.
// All respect prefers-reduced-motion.

import { lsGet, lsSet, toast, announce } from './runtime.js';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let _konamiIdx = 0;

function getUnlocked() { return lsGet('easter_eggs.unlocked', []); }
function unlock(id, label, sentence) {
  const list = getUnlocked();
  if (list.includes(id)) return;
  list.push(id);
  lsSet('easter_eggs.unlocked', list);
  toast('🎉 ' + label, 'achievement', 4500);
  announce(sentence || label);
}

// ---- Konami code ----
document.addEventListener('keydown', (e) => {
  // Skip if typing in an input
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  const expected = KONAMI[_konamiIdx];
  if (e.key === expected || e.key.toLowerCase() === expected.toLowerCase()) {
    _konamiIdx++;
    if (_konamiIdx === KONAMI.length) {
      _konamiIdx = 0;
      unlock('konami', 'Konami master unlocked', 'Konami master.');
      // 30s synthwave gradient on home hero
      const home = document.querySelector('.home-hero');
      if (home && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        home.style.transition = 'background 600ms ease';
        home.style.background = 'linear-gradient(135deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0)';
        home.style.backgroundSize = '400% 400%';
        home.style.animation = 'synthwave-pan 6s ease infinite';
        setTimeout(() => {
          home.style.background = '';
          home.style.animation = '';
        }, 30_000);
      }
    }
  } else {
    _konamiIdx = (e.key === KONAMI[0]) ? 1 : 0;
  }
});

// Inject keyframes once
const styleEl = document.createElement('style');
styleEl.textContent = '@keyframes synthwave-pan { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }';
document.head.appendChild(styleEl);

// ---- Late-night theme tint (after midnight UTC, before 06:00) ----
(function lateNight() {
  const h = new Date().getUTCHours();
  if (h >= 0 && h < 6) {
    const root = document.documentElement;
    root.style.setProperty('filter', 'saturate(0.95) sepia(0.04)');
    if (!getUnlocked().includes('night')) {
      // Don't toast immediately on every pageload; only first discovery
      unlock('night', 'Night-mode tint discovered', 'Burning the midnight oil. Tinted for ambiance.');
    }
  }
})();

// ---- Cmdk secret commands ----
document.addEventListener('aise26:cmdk-query', (e) => {
  const q = ((e.detail && e.detail.query) || '').trim().toLowerCase();
  if (q === '42') toast('The answer is hidden in Module 13.', 'info', 3500);
  if (q === 'make me a sandwich') toast('Use the deep-dive prompt to ask Claude. I am a course.', 'info', 3500);
  if (q === 'sudo make me a sandwich') {
    toast('Sandwich coming up.', 'achievement', 3000);
    unlock('sandwich', 'Sandwich master unlocked', 'Sandwich master.');
  }
});

window.aise26 = Object.assign(window.aise26 || {}, { easterEggs: { getUnlocked } });
