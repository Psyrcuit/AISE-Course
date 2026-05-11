// Tabbed settings: Profile / Appearance / API key / Data / About.
// Replaces the inline Settings block previously in profile view.

import {
  el, clear, getSettings, setSettings, lsResetAll, lsKeys, lsGet, lsSet, lsDel,
  applyTheme, resolveTheme, setTheme, THEMES, announce, toast,
  apiKeySet, apiKeyHas, apiKeyClear, apiKeyGet, setPassphrase, hasPassphrase
} from '../runtime.js';
import { toggleRegion } from '../gamification.js';
import { hasAnyKey } from '../ai.js';
import { CONCEPTS, MODULES } from '../data.js';
import { buildCourseMarkdown, buildModuleMarkdown, downloadText } from '../export-course.js';
import { downloadEpub } from '../export-epub.js';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'api', label: 'API key' },
  { id: 'data', label: 'Data' },
  { id: 'about', label: 'About' }
];

export function renderSettings(params) {
  // Determine active tab from query string (?tab=...) or fall back to last-used
  const activeId = (params && params.tab && TABS.find(t => t.id === params.tab))
    ? params.tab
    : 'profile';

  const wrap = el('article', { 'aria-labelledby': 'settings-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Mission control'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'settings-h1' }, 'Settings'));

  // Tablist
  const tablist = el('div', { class: 'settings-tablist', role: 'tablist', 'aria-label': 'Settings sections' });
  const panels = el('div', { class: 'settings-panels' });
  for (const t of TABS) {
    const isActive = t.id === activeId;
    const tab = el('button', {
      class: 'settings-tab' + (isActive ? ' is-active' : ''),
      type: 'button',
      role: 'tab',
      id: 'settings-tab-' + t.id,
      'aria-selected': String(isActive),
      'aria-controls': 'settings-panel-' + t.id,
      tabindex: isActive ? '0' : '-1'
    }, t.label);
    tab.addEventListener('click', () => {
      window.location.hash = '#/settings?tab=' + t.id;
    });
    tablist.appendChild(tab);

    const panel = el('div', {
      class: 'settings-panel' + (isActive ? ' is-active' : ''),
      role: 'tabpanel',
      id: 'settings-panel-' + t.id,
      'aria-labelledby': 'settings-tab-' + t.id,
      hidden: isActive ? null : ''
    });
    if (t.id === 'profile') panel.appendChild(_profilePanel());
    else if (t.id === 'appearance') panel.appendChild(_appearancePanel());
    else if (t.id === 'api') panel.appendChild(_apiPanel());
    else if (t.id === 'data') panel.appendChild(_dataPanel());
    else if (t.id === 'about') panel.appendChild(_aboutPanel());
    panels.appendChild(panel);
  }
  wrap.appendChild(tablist);
  wrap.appendChild(panels);

  return {
    node: wrap,
    title: 'Settings',
    crumbs: [{ label: 'Settings' }],
    mainClass: 'no-rail'
  };
}

// ------- Profile panel -------
function _profilePanel() {
  const s = getSettings();
  const profile = s.profile || {};
  const sec = el('section');
  sec.appendChild(el('p', { class: 'settings-blurb' }, 'Your profile drives onboarding, recommended path, and the home Today section. Edit anytime.'));

  // Role
  sec.appendChild(_row('Role', 'Your starting point. Drives toolkit emphasis.', _select(
    profile.role || '',
    [
      { value: '', label: 'Not set' },
      { value: 'engineer-leveling-up', label: 'Engineer leveling up' },
      { value: 'career-changer', label: 'Pursuing AI Engineer / FDE / Solutions role' },
      { value: 'leader', label: 'Engineering leader / architect' },
      { value: 'curious', label: 'Just exploring' }
    ],
    (v) => setSettings({ profile: { ...profile, role: v || null } })
  )));

  // Goal
  const goalInput = el('input', { type: 'text', class: 'settings-input', maxlength: '120', placeholder: 'e.g., Ship a RAG system in 30 days', value: profile.goal || '' });
  goalInput.addEventListener('change', () => {
    setSettings({ profile: { ...profile, goal: goalInput.value.slice(0, 120) || null } });
    announce('Goal saved.');
  });
  sec.appendChild(_row('Goal', '~80 chars; what you want to learn / build / land.', goalInput));

  // Level
  sec.appendChild(_row('Level', 'Adjusts placement and recommended path.', _select(
    profile.level || '',
    [
      { value: '', label: 'Not set' },
      { value: 'beginner', label: 'Beginner: new to LLMs' },
      { value: 'intermediate', label: 'Intermediate: comfortable basics' },
      { value: 'advanced', label: 'Advanced: production experience' }
    ],
    (v) => setSettings({ profile: { ...profile, level: v || null } })
  )));

  // Daily target
  sec.appendChild(_row('Daily target', 'Drives daily quest sizing and "due today" caps.', _select(
    String(s.daily_target || 10),
    [
      { value: '5', label: '5 min/day' },
      { value: '10', label: '10 min/day' },
      { value: '20', label: '20 min/day' },
      { value: '30', label: '30 min/day' },
      { value: '60', label: '1 hour/day' }
    ],
    (v) => setSettings({ daily_target: parseInt(v, 10) })
  )));

  // Replay onboarding
  sec.appendChild(_row('Replay onboarding', '4-step wizard. Captures role / goal / level fresh.',
    _btn('Replay', () => {
      setSettings({ onboarding_seen: false });
      window.location.hash = '#/onboarding';
    })
  ));
  sec.appendChild(_row('Replay first-time tour', '6-step coach-mark tour highlighting Cmd+K, j/k, save, etc.',
    _btn('Replay', () => {
      setSettings({ tour_seen: false });
      announce('Tour will replay on next route change.');
    })
  ));
  return sec;
}

// ------- Appearance panel -------
function _appearancePanel() {
  const s = getSettings();
  const sec = el('section');
  sec.appendChild(el('p', { class: 'settings-blurb' }, '5 themes; sound design off-by-default; honors system reduced-motion preference.'));

  // Theme
  sec.appendChild(_row('Theme', 'Dark / Light / Cyberpunk / Sepia / High-contrast. All AA-compliant.',
    _select(resolveTheme(),
      THEMES.map(t => ({ value: t, label: _titleCase(t) })),
      (v) => setTheme(v)
    )
  ));

  // Sound
  sec.appendChild(_row('Sound design', '8 subtle cues. Off by default; quiet mode plays only XP / achievement / streak.',
    _select(s.sound || 'off',
      [
        { value: 'off', label: 'Off' },
        { value: 'quiet', label: 'Quiet' },
        { value: 'full', label: 'Full' }
      ],
      (v) => setSettings({ sound: v })
    )
  ));

  // Reduce motion
  sec.appendChild(_row('Reduce motion', 'Disable animations. Auto from system preference if not set explicitly.',
    _select(s.reduce_motion === null ? '' : (s.reduce_motion ? 'on' : 'off'),
      [
        { value: '', label: 'Auto (system)' },
        { value: 'on', label: 'On' },
        { value: 'off', label: 'Off' }
      ],
      (v) => {
        const next = v === '' ? null : v === 'on';
        setSettings({ reduce_motion: next });
        applyTheme(resolveTheme());
      }
    )
  ));

  // Compact layout
  sec.appendChild(_row('Compact layout', 'Tighter spacing; useful on dense displays.',
    _toggle(!!s.compact_layout, (val) => {
      setSettings({ compact_layout: val });
      document.documentElement.setAttribute('data-compact', String(val));
    })
  ));

  // Boss-battle capstone reskin
  sec.appendChild(_row('Boss-battle capstones', 'Adds an HP bar to capstone questions; correct answers chip away at the boss.',
    _toggle(!!s.boss_mode, (val) => setSettings({ boss_mode: val }))
  ));

  // Region (kept for backward compat with M12 INTL toggle)
  sec.appendChild(_row('Region', 'US is default. INTL surfaces global comp comparisons in Module 12.',
    (() => {
      const b = el('button', { class: 'btn', type: 'button' });
      const refresh = () => { b.textContent = (getSettings().region || 'US'); b.setAttribute('aria-label', 'Region. Current: ' + b.textContent + '. Click to toggle.'); };
      refresh();
      b.addEventListener('click', () => { toggleRegion(); refresh(); });
      return b;
    })()
  ));

  return sec;
}

// ------- API key panel -------
function _apiPanel() {
  const sec = el('section');
  sec.appendChild(el('p', { class: 'settings-blurb' },
    'BYO key unlocks AI-powered features (chat sidebar, AI quiz generation, prompt linter LLM-as-judge, etc.). Heuristic versions of every feature work without a key.'
  ));
  sec.appendChild(el('p', { class: 'settings-blurb' },
    'Keys are encrypted in your browser via WebCrypto (AES-GCM, PBKDF2-derived from your passphrase). Plain text is never persisted. The passphrase lives only in memory until tab close.'
  ));

  for (const vendor of ['anthropic', 'openai']) {
    const isSet = apiKeyHas(vendor);
    const row = el('div', { class: 'settings-row' });
    row.appendChild(el('div', null, [
      el('div', { class: 'label' }, _titleCase(vendor) + ' API key'),
      el('div', { class: 'desc' }, isSet ? 'Stored, encrypted.' : 'Not set.')
    ]));

    const ctrls = el('div', { class: 'settings-key-ctrls' });
    if (isSet) {
      const testBtn = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Test');
      testBtn.addEventListener('click', async () => {
        const pp = await _ensurePassphrase('Enter your passphrase to test the ' + _titleCase(vendor) + ' key.');
        if (!pp) return;
        const ppArg = pp === '__cached__' ? undefined : pp;
        try {
          const k = await apiKeyGet(vendor, ppArg);
          if (k && k.length > 4) toast('Key decrypts. Length: ' + k.length + ' chars.', 'info');
          else toast('Wrong passphrase.', 'info');
        } catch { toast('Failed to decrypt.', 'info'); }
      });
      const clearBtn = el('button', { class: 'btn btn-sm btn-danger', type: 'button' }, 'Clear');
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear stored ' + _titleCase(vendor) + ' key?')) {
          apiKeyClear(vendor);
          announce(_titleCase(vendor) + ' key cleared.');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      });
      ctrls.appendChild(testBtn);
      ctrls.appendChild(clearBtn);
    } else {
      const setBtn = el('button', { class: 'btn btn-sm btn-primary', type: 'button' }, 'Set key');
      setBtn.addEventListener('click', async () => {
        const k = await _securePrompt({
          title: 'Set ' + _titleCase(vendor) + ' API key',
          help: 'Paste your ' + _titleCase(vendor) + ' API key (sk-... or similar). It is encrypted with your passphrase before storage; the raw key never touches localStorage in plaintext.',
          inputType: 'password',
          placeholder: vendor === 'anthropic' ? 'sk-ant-...' : 'sk-...'
        });
        if (!k) return;
        const pp = await _ensurePassphrase('Choose a passphrase for encrypting your ' + _titleCase(vendor) + ' key. You will need it on each session that uses the key.');
        if (!pp) return;
        // Only forward an actual passphrase string; sentinel means apiKeySet
        // should reuse the in-memory _passphrase from runtime.js.
        const ppArg = pp === '__cached__' ? undefined : pp;
        try {
          await apiKeySet(vendor, k.trim(), ppArg);
          announce(_titleCase(vendor) + ' key stored, encrypted.');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } catch (err) { toast('Failed to store key: ' + err.message, 'info'); }
      });
      ctrls.appendChild(setBtn);
    }
    row.appendChild(ctrls);
    sec.appendChild(row);
  }

  // Passphrase indicator
  const passSec = el('div', { class: 'settings-row' });
  passSec.appendChild(el('div', null, [
    el('div', { class: 'label' }, 'Passphrase (this session)'),
    el('div', { class: 'desc' }, hasPassphrase() ? 'Loaded into memory; AI features active until tab close.' : 'Not loaded. AI features will fall back to heuristics.')
  ]));
  if (hasPassphrase()) {
    const lockBtn = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Lock');
    lockBtn.addEventListener('click', () => {
      setPassphrase(null);
      announce('Passphrase cleared.');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    passSec.appendChild(lockBtn);
  }
  sec.appendChild(passSec);

  return sec;
}

// ------- Data panel -------
function _dataPanel() {
  const sec = el('section');
  sec.appendChild(el('p', { class: 'settings-blurb' }, 'All data lives in your browser. Export to take it with you; reset to start clean.'));

  // Export library
  sec.appendChild(_row('Export library', 'Markdown bundle: saved concepts, edits, notes, builder drafts.',
    _btn('Export .md', () => {
      // Library export uses the existing flow; this button is a shortcut.
      window.location.hash = '#/library';
      announce('Open Personal Library to export.');
    })
  ));

  // Export full course
  sec.appendChild(_row('Export full course as Markdown', 'All 514 concepts as a single .md file (~1MB). Carry the course offline; print to PDF; share.',
    _btn('Download .md', () => {
      const md = buildCourseMarkdown();
      downloadText(md, 'aise26-course-' + new Date().toISOString().slice(0, 10) + '.md');
    })
  ));

  // Export full course as EPUB
  sec.appendChild(_row('Export full course as EPUB', 'Real .epub file for Kindle, Apple Books, iBooks, Calibre. 16 chapters; ~1.2MB. No vendored library.',
    _btn('Download .epub', () => downloadEpub())
  ));

  // Export per-module
  const modSelect = el('select', { class: 'settings-input' });
  modSelect.appendChild(_opt('', 'Pick a module...'));
  for (const m of MODULES) modSelect.appendChild(_opt(String(m.n), 'M' + m.n + ': ' + m.title));
  const modBtn = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Download module .md');
  modBtn.addEventListener('click', () => {
    const v = parseInt(modSelect.value, 10);
    if (!v) return;
    const m = MODULES.find(x => x.n === v);
    const md = buildModuleMarkdown(v);
    downloadText(md, 'aise26-m' + v + '-' + (m ? m.title.toLowerCase().replace(/\s+/g, '-') : '') + '.md');
  });
  sec.appendChild(_row('Export single module', 'Smaller .md file, just one module.',
    el('div', { style: 'display: flex; gap: 8px;' }, [modSelect, modBtn])
  ));

  // Export settings
  sec.appendChild(_row('Export all settings + state', 'Single JSON of every aise26: key. Use to back up or move devices.',
    _btn('Download JSON', () => {
      const dump = {};
      for (const k of lsKeys('')) dump[k] = lsGet(k, null);
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aise26-export-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    })
  ));

  // Import settings
  sec.appendChild(_row('Import settings + state', 'JSON file from a previous export. Merges by key; existing values overwritten.',
    (() => {
      const inp = el('input', { type: 'file', class: 'settings-file' });
      inp.style.display = 'none';
      inp.addEventListener('change', async () => {
        if (!inp.files || !inp.files[0]) return;
        const txt = await inp.files[0].text();
        try {
          const obj = JSON.parse(txt);
          if (typeof obj !== 'object' || !obj) throw new Error('Not a JSON object');
          if (!confirm('Overwrite existing keys with imported values?')) return;
          for (const k of Object.keys(obj)) lsSet(k, obj[k]);
          announce('Settings imported.');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } catch (err) { toast('Import failed: ' + err.message, 'info'); }
      });
      const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, 'Choose file...');
      b.addEventListener('click', () => inp.click());
      const wrap = el('div');
      wrap.appendChild(b);
      wrap.appendChild(inp);
      return wrap;
    })()
  ));

  // Reset
  sec.appendChild(_row('Reset all progress', 'Clears XP, badges, streaks, notes, edits, saved, profile, API keys, SRS state. Cannot be undone.',
    (() => {
      const b = el('button', { class: 'btn btn-sm btn-danger', type: 'button' }, 'Reset');
      b.addEventListener('click', () => { if (lsResetAll(true)) window.location.hash = '#/'; });
      return b;
    })()
  ));

  return sec;
}

// ------- About panel -------
function _aboutPanel() {
  const sec = el('section');
  sec.appendChild(el('p', { class: 'settings-blurb' }, 'Course version, footprint, and license details.'));
  sec.appendChild(_row('Version', '', el('code', null, 'v3.0.0-dev')));
  sec.appendChild(_row('Concepts', 'Total fleshed concepts in the bundle.', el('code', null, String(CONCEPTS.length))));
  sec.appendChild(_row('Modules', '', el('code', null, String(MODULES.length))));
  sec.appendChild(_row('License', 'Course content released under MIT. See vendor/ for third-party library licenses.', el('code', null, 'MIT')));
  sec.appendChild(_row('Encryption', 'API keys encrypted at rest with AES-GCM 256-bit (PBKDF2 100k iters).', el('code', null, 'WebCrypto')));
  return sec;
}

// ------- Helpers -------
function _row(label, desc, control) {
  return el('div', { class: 'settings-row' }, [
    el('div', null, [
      el('div', { class: 'label' }, label),
      desc ? el('div', { class: 'desc' }, desc) : null
    ]),
    control
  ]);
}
function _select(value, options, onChange) {
  const sel = el('select', { class: 'settings-input' });
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    if (String(o.value) === String(value)) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => onChange(sel.value));
  return sel;
}
function _btn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}
function _opt(value, label) {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = label;
  return o;
}
function _toggle(initial, onChange) {
  const b = el('button', { class: 'btn btn-sm', type: 'button', 'aria-pressed': String(initial) }, initial ? 'On' : 'Off');
  b.addEventListener('click', () => {
    const next = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(next));
    b.textContent = next ? 'On' : 'Off';
    onChange(next);
  });
  return b;
}
function _titleCase(s) { return String(s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

// Returns the passphrase string when newly set, the sentinel '__cached__' when
// the session already has one in memory, and null on cancel. Callers should
// pass the result to apiKeySet only if it's a non-sentinel string; otherwise
// apiKeySet will pull from the in-memory session passphrase.
async function _ensurePassphrase(message) {
  if (hasPassphrase()) return '__cached__';
  const p = await _securePrompt({
    title: 'Passphrase required',
    help: message,
    inputType: 'password',
    placeholder: 'Your passphrase'
  });
  if (p) { setPassphrase(p); return p; }
  return null;
}

// Inline replacement for window.prompt(). Returns Promise<string|null>.
// Uses a focus-managed modal dialog so screen readers announce it correctly
// and styling/theme matches the rest of the app.
function _securePrompt({ title, help, inputType, placeholder }) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const backdrop = el('div', { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sp-h' });
    backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(8,8,10,.6); display: flex; align-items: center; justify-content: center; z-index: 220; backdrop-filter: blur(6px);';
    const card = el('div');
    card.style.cssText = 'width: min(480px, 92vw); background: var(--surface-1); border: 1px solid var(--border-3); border-radius: var(--radius-3); box-shadow: var(--shadow-3); padding: 20px;';
    const h = el('h2', { id: 'sp-h', style: 'margin: 0 0 8px;' }, title || 'Enter value');
    const p = el('p', { style: 'color: var(--text-3); margin: 0 0 12px; font-size: var(--fs-200);' }, help || '');
    const input = el('input', {
      type: inputType || 'text',
      placeholder: placeholder || '',
      'aria-label': title || 'Value'
    });
    input.style.cssText = 'width: 100%; box-sizing: border-box; padding: 10px; border-radius: var(--radius-2); border: 1px solid var(--border-2); background: var(--surface-1); color: var(--text-1); font: inherit;';
    const row = el('div'); row.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;';
    const cancel = el('button', { type: 'button', class: 'btn btn-ghost' }, 'Cancel');
    const ok = el('button', { type: 'button', class: 'btn btn-primary' }, 'OK');
    const close = (val) => {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      if (prev && prev.focus) prev.focus();
      resolve(val);
    };
    cancel.addEventListener('click', () => close(null));
    ok.addEventListener('click', () => close(input.value));
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(null); });
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
      if (e.key === 'Enter' && e.target === input) { e.preventDefault(); close(input.value); }
    });
    row.appendChild(cancel);
    row.appendChild(ok);
    card.appendChild(h); card.appendChild(p); card.appendChild(input); card.appendChild(row);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
    setTimeout(() => input.focus(), 0);
  });
}
