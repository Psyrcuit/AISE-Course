// Runtime: localStorage helpers, settings, theme, announcer, toast, global hotkeys.
// Ported from course.html.legacy and adapted for ESM.

export const NS = 'aise26:';

export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[aise26] lsGet failed for', key, err);
    return fallback;
  }
}

export function lsSet(key, value) {
  try { localStorage.setItem(NS + key, JSON.stringify(value)); return true; }
  catch (err) { console.warn('[aise26] lsSet failed for', key, err); return false; }
}

export function lsDel(key) {
  try { localStorage.removeItem(NS + key); return true; }
  catch (err) { console.warn('[aise26] lsDel failed for', key, err); return false; }
}

export function lsKeys(prefix = '') {
  const out = [];
  try {
    const fullPrefix = NS + prefix;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) out.push(k.slice(NS.length));
    }
  } catch (err) {
    console.warn('[aise26] lsKeys failed', err);
  }
  return out;
}

export function lsResetAll(confirmFirst = true) {
  if (confirmFirst && !confirm('Reset all course progress? This will clear XP, badges, streaks, notes, edits, and saved concepts. This action cannot be undone.')) {
    return false;
  }
  for (const k of lsKeys('')) lsDel(k);
  announce('All progress reset.', 'assertive');
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  return true;
}

// ----- Settings -----
// v3 schema additions: profile, tour_seen, onboarding_seen, theme variant, sound, etc.
// All keys live under aise26:settings.
const DEFAULT_SETTINGS = {
  dark_mode: null,
  region: 'US',
  last_concept: null,
  search_history: [],
  current_module: 1,
  reveal_seen: false,

  // v3 additions
  theme: null,                 // 'dark'|'light'|'cyberpunk'|'sepia'|'high-contrast'|null (auto)
  sound: 'off',                // 'off'|'quiet'|'full'
  reduce_motion: null,         // null = auto from prefers-reduced-motion
  compact_layout: false,
  daily_target: 10,            // minutes/day target
  boss_mode: false,            // capstone boss-battle reskin
  toolkit_tab: 'templates',
  rail_groups: { learn: true, practice: true, build: true, you: true },
  tour_seen: false,
  onboarding_seen: false,
  profile: null                // { role, goal, level, placement_score?, recommended_path[], created_at }
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...lsGet('settings', {}) };
}
export function setSettings(patch) {
  const merged = { ...getSettings(), ...patch };
  lsSet('settings', merged);
  return merged;
}

// ----- Theme (5 variants: dark, light, cyberpunk, sepia, high-contrast) -----
const root = document.documentElement;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const THEMES = ['dark', 'light', 'cyberpunk', 'sepia', 'high-contrast'];

export function resolveTheme() {
  const s = getSettings();
  // Explicit theme variant wins
  if (s.theme && THEMES.includes(s.theme)) return s.theme;
  // Legacy dark_mode flag for backward compat
  if (s.dark_mode === true) return 'dark';
  if (s.dark_mode === false) return 'light';
  return prefersDark.matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const isDark = theme === 'dark' || theme === 'cyberpunk' || theme === 'high-contrast';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const icon = btn.querySelector('.ico');
    if (icon) icon.textContent = isDark ? '◐' : '◑';
  }
  // Reduced-motion meta-attribute for CSS to respect.
  const s = getSettings();
  const reduce = s.reduce_motion === null ? prefersReducedMotion.matches : !!s.reduce_motion;
  root.setAttribute('data-reduce-motion', String(reduce));
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  setSettings({ theme, dark_mode: theme === 'dark' ? true : theme === 'light' ? false : null });
  applyTheme(theme);
  announce('Theme: ' + theme.replace('-', ' ') + '.');
}

export function toggleTheme() {
  // Topstrip toggle still cycles dark <-> light for the existing UX.
  const cur = resolveTheme();
  const next = (cur === 'dark' || cur === 'cyberpunk' || cur === 'high-contrast') ? 'light' : 'dark';
  setSettings({ theme: next, dark_mode: next === 'dark' });
  applyTheme(next);
  announce(next === 'dark' ? 'Dark mode on.' : 'Light mode on.');
}

// Apply theme immediately so first paint is correct.
applyTheme(resolveTheme());
prefersDark.addEventListener('change', () => {
  const s = getSettings();
  if (!s.theme && s.dark_mode === null) applyTheme(resolveTheme());
});
prefersReducedMotion.addEventListener('change', () => {
  if (getSettings().reduce_motion === null) applyTheme(resolveTheme());
});

// ----- aria-live announcer -----
const announceTimers = new WeakMap();
export function announce(text, mode = 'polite') {
  const node = document.getElementById(mode === 'assertive' ? 'sr-assertive' : 'sr-polite');
  if (!node) return;
  const prev = announceTimers.get(node);
  if (prev) clearTimeout(prev);
  node.textContent = '';
  const t = setTimeout(() => { node.textContent = text; }, 50);
  announceTimers.set(node, t);
}

// ----- Toast -----
export function toast(text, kind = 'info', durationMs = 3200) {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'tier' ? ' toast-tier' : kind === 'achievement' ? ' toast-achievement' : '');
  el.setAttribute('role', 'status');
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 240);
  }, durationMs);
}

// ----- Tier-up toast (richer markup) -----
export function tierUpToast(tierNumber, tierName) {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast toast-tier';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="tier-tag">Tier up</span> <strong>Tier ${tierNumber}: ${escapeHtml(tierName)}</strong>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 240);
  }, 4000);
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ----- Global hotkeys -----
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl+K opens Command Palette
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K') && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('aise26:open-cmdk'));
    return;
  }
  // Cmd/Ctrl+E toggles edit mode on focused editor block
  if ((e.metaKey || e.ctrlKey) && (e.key === 'e' || e.key === 'E') && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('aise26:toggle-edit', { detail: { target: document.activeElement } }));
    return;
  }
  if (e.key === 'Escape') {
    document.dispatchEvent(new CustomEvent('aise26:escape'));
    return;
  }
  if (isTypingTarget(e.target)) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === '/') {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('aise26:open-cmdk'));
    return;
  }
  if (e.key === 'j' || e.key === 'k') {
    document.dispatchEvent(new CustomEvent('aise26:cycle-concept', { detail: { dir: e.key === 'j' ? 1 : -1 } }));
  }
});

// Theme toggle wiring
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.closest && t.closest('#theme-toggle')) toggleTheme();
});

// ----- DOM helper used by many views -----
const _ALLOWED_ATTRS = new Set([
  'role', 'tabindex', 'for', 'id', 'name', 'type', 'href', 'title',
  'value', 'placeholder', 'spellcheck', 'autocomplete', 'min', 'max',
  'step', 'pattern', 'maxlength', 'minlength', 'rows', 'cols',
  'checked', 'disabled', 'readonly', 'required', 'multiple', 'selected',
  'style', 'src', 'alt', 'width', 'height', 'target', 'rel', 'open'
]);
export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'on' && typeof v === 'object') {
        for (const evt of Object.keys(v)) node.addEventListener(evt, v[evt]);
      }
      else if (k.startsWith('data-') || k.startsWith('aria-')) node.setAttribute(k, v);
      else if (_ALLOWED_ATTRS.has(k)) node.setAttribute(k, v);
    }
  }
  if (children) {
    const arr = Array.isArray(children) ? children : [children];
    for (const c of arr) {
      if (c === null || c === undefined || c === false) continue;
      if (c instanceof Node) node.appendChild(c);
      else node.appendChild(document.createTextNode(String(c)));
    }
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// ----- WebCrypto API key storage -----
// Keys are encrypted at rest in localStorage. Plain text is never persisted.
// Storage shape: aise26:api_key.{vendor} = { iv: base64, ct: base64, salt: base64 }
// Encryption: AES-GCM with PBKDF2(passphrase, salt, 100k iters) -> 256-bit key.
// Passphrase is held in memory only for the session; cleared on tab close.

let _passphrase = null;            // in-memory; never persisted
const PBKDF2_ITERS = 100_000;

const enc = new TextEncoder();
const dec = new TextDecoder();

function _b64encode(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function _b64decode(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function _deriveKey(passphrase, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function setPassphrase(p) { _passphrase = p || null; }
export function hasPassphrase() { return !!_passphrase; }
export function clearPassphrase() { _passphrase = null; }

export async function apiKeySet(vendor, plaintext, passphrase) {
  const pp = passphrase || _passphrase;
  if (!pp) throw new Error('Passphrase required');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await _deriveKey(pp, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  lsSet('api_key.' + vendor, { iv: _b64encode(iv), ct: _b64encode(ct), salt: _b64encode(salt) });
  if (passphrase) _passphrase = passphrase;
  return true;
}

export async function apiKeyGet(vendor, passphrase) {
  const pp = passphrase || _passphrase;
  if (!pp) return null;        // no passphrase set; caller should treat as "no key"
  const stored = lsGet('api_key.' + vendor, null);
  if (!stored) return null;
  const iv = _b64decode(stored.iv);
  const salt = _b64decode(stored.salt);
  const ct = _b64decode(stored.ct);
  const key = await _deriveKey(pp, salt);
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    if (passphrase) _passphrase = passphrase;
    return dec.decode(pt);
  } catch { return null; }     // wrong passphrase
}

export function apiKeyHas(vendor) { return lsGet('api_key.' + vendor, null) !== null; }

export function apiKeyClear(vendor) {
  if (vendor) lsDel('api_key.' + vendor);
  else for (const k of lsKeys('api_key.')) lsDel(k);
}

// ----- Activity log (for heatmap / streaks) -----
// Records 1 entry per user-action day. Keys: aise26:activity.{YYYY-MM-DD} = count.
function _todayKey() {
  const d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
export function logActivity() {
  const k = 'activity.' + _todayKey();
  const cur = lsGet(k, 0);
  lsSet(k, cur + 1);
}
export function getActivityByDay(days = 365) {
  const out = {};
  const now = Date.now();
  for (let i = 0; i < days; i++) {
    const d = new Date(now - i * 86_400_000);
    const k = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
    const v = lsGet('activity.' + k, 0);
    if (v > 0) out[k] = v;
  }
  return out;
}

// ----- Public window mount for tests + console -----
window.aise26 = Object.assign(window.aise26 || {}, {
  NS, lsGet, lsSet, lsDel, lsKeys, lsResetAll,
  getSettings, setSettings,
  resolveTheme, applyTheme, toggleTheme, setTheme, THEMES,
  announce, toast, tierUpToast,
  el, clear,
  setPassphrase, hasPassphrase, clearPassphrase,
  apiKeySet, apiKeyGet, apiKeyHas, apiKeyClear,
  logActivity, getActivityByDay
});
