// Pyodide code playground. Lazy-loads Pyodide from the CDN on first Run click.
// Adds a "Run" button to each <pre><code class="language-python"> block that
// the user opts into. ~12MB download on first use; cached by the browser
// after that.

import { el, announce, toast } from '../runtime.js';

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v' + PYODIDE_VERSION + '/full/pyodide.js';

let _pyodide = null;
let _loading = null;

async function loadPyodide() {
  if (_pyodide) return _pyodide;
  if (_loading) return _loading;
  _loading = (async () => {
    toast('Loading Python runtime (one-time, ~12MB)...', 'info', 8000);
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PYODIDE_URL;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Pyodide CDN unreachable'));
      document.head.appendChild(s);
    });
    if (!window.loadPyodide) throw new Error('Pyodide global missing');
    _pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v' + PYODIDE_VERSION + '/full/' });
    return _pyodide;
  })();
  return _loading;
}

/**
 * Add "Run" button to Python code blocks under `scope`. Idempotent via a
 * data-attribute. Call after the highlighter; respects the highlight markup.
 */
export function attachPlaygrounds(scope) {
  const blocks = scope.querySelectorAll('pre[data-lang="python"]:not([data-playground])');
  for (const pre of blocks) {
    pre.setAttribute('data-playground', '1');
    const ctrl = el('div', { class: 'play-ctrl' });
    const runBtn = el('button', { class: 'btn btn-sm btn-primary', type: 'button' }, '▶ Run');
    const out = el('div', { class: 'play-out', hidden: '' });
    ctrl.appendChild(runBtn);
    pre.parentNode.insertBefore(ctrl, pre.nextSibling);
    pre.parentNode.insertBefore(out, ctrl.nextSibling);

    runBtn.addEventListener('click', async () => {
      runBtn.disabled = true;
      runBtn.textContent = 'Loading...';
      try {
        const py = await loadPyodide();
        runBtn.textContent = 'Running...';
        const code = pre.querySelector('code')?.textContent || '';
        // Capture stdout
        py.setStdout({ batched: (txt) => appendOut(out, txt, 'stdout') });
        py.setStderr({ batched: (txt) => appendOut(out, txt, 'stderr') });
        out.hidden = false;
        out.innerHTML = '';
        let result;
        try {
          result = await py.runPythonAsync(code);
        } catch (err) {
          appendOut(out, String(err), 'stderr');
        }
        if (result !== undefined && result !== null) {
          appendOut(out, String(result), 'result');
        }
        runBtn.textContent = '▶ Run again';
      } catch (err) {
        announce('Pyodide failed to load: ' + err.message);
        out.hidden = false;
        out.textContent = 'Pyodide load failed: ' + err.message;
        runBtn.textContent = 'Retry';
      } finally {
        runBtn.disabled = false;
      }
    });
  }
}

function appendOut(out, text, kind) {
  const line = document.createElement('div');
  line.className = 'play-line play-' + kind;
  line.textContent = text;
  out.appendChild(line);
}

// Re-attach on every route change (after highlight runs).
document.addEventListener('aise26:after-route', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const scope = document.getElementById('main-region') || document;
      attachPlaygrounds(scope);
    });
  });
});

window.aise26 = Object.assign(window.aise26 || {}, { pyodide: { loadPyodide, attachPlaygrounds } });
