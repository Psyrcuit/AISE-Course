// Clipboard helper. Used by editor + many view buttons.
import { announce } from './runtime.js';

export async function copyToClipboard(text, btn) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    announce('Copied.');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    }
  } catch (err) {
    console.warn('[aise26] copy failed', err);
    announce('Copy failed.', 'assertive');
  }
}

window.aise26 = Object.assign(window.aise26 || {}, { copyToClipboard });
