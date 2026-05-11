// Text-selection highlights with notes. Select any text inside a concept's
// prose; a small popover offers "Highlight" or "Highlight + note". Saved
// highlights persist at aise26:highlights:{slug} and re-render on revisit.

import { el, lsGet, lsSet, announce } from '../runtime.js';

let _popover = null;
let _activeSlug = null;
let _activeScope = null;
let _lastFocus = null;

/**
 * Attach selection-listener to a scope (the article wrapper). Selection events
 * inside that scope show a small popover near the selection. Idempotent:
 * unmounts any previous listener before re-registering (prevents leak when
 * the same view re-mounts on hashchange).
 */
export function mountAnnotator(scope, slug) {
  // Always clear previous listener registration first - prevents
  // selectionchange handler from firing multiple times when concept pages
  // are re-mounted (was a memory + performance leak).
  unmountAnnotator();
  _activeSlug = slug;
  _activeScope = scope;
  scope.classList.add('annotatable');
  document.addEventListener('selectionchange', _onSelectionChange);
  document.addEventListener('keydown', _onKeydown);
  // Restore highlights from storage
  restoreHighlights(scope, slug);
}

export function unmountAnnotator() {
  document.removeEventListener('selectionchange', _onSelectionChange);
  document.removeEventListener('keydown', _onKeydown);
  hidePopover();
  _activeSlug = null;
  _activeScope = null;
}

function _onKeydown(e) {
  if (e.key === 'Escape' && _popover && _popover.style.display !== 'none') {
    e.preventDefault();
    hidePopover();
    if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
  }
}

function _onSelectionChange() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) { hidePopover(); return; }
  const range = sel.getRangeAt(0);
  if (!_activeScope || !_activeScope.contains(range.commonAncestorContainer)) { hidePopover(); return; }
  const text = sel.toString();
  if (!text || text.length < 4 || text.length > 600) { hidePopover(); return; }
  showPopover(range, text);
}

function showPopover(range, text) {
  if (!_popover) {
    _popover = document.createElement('div');
    _popover.className = 'annotate-popover';
    _popover.setAttribute('role', 'toolbar');
    _popover.setAttribute('aria-label', 'Highlight controls');
    document.body.appendChild(_popover);
  }
  const r = range.getBoundingClientRect();
  _popover.style.top = (window.scrollY + r.top - 44) + 'px';
  _popover.style.left = (window.scrollX + r.left + r.width / 2 - 110) + 'px';
  _popover.innerHTML = '';
  const hl = document.createElement('button');
  hl.className = 'btn btn-sm btn-ghost';
  hl.type = 'button';
  hl.textContent = 'Highlight';
  hl.setAttribute('aria-label', 'Save highlight');
  hl.addEventListener('click', () => saveHighlight(text, ''));
  const note = document.createElement('button');
  note.className = 'btn btn-sm btn-ghost';
  note.type = 'button';
  note.textContent = '+ note';
  note.setAttribute('aria-label', 'Save highlight with a note');
  note.addEventListener('click', () => {
    _openNotePrompt(text);
  });
  _popover.appendChild(hl);
  _popover.appendChild(note);
  _popover.style.display = 'flex';
}

function _openNotePrompt(text) {
  _lastFocus = document.activeElement;
  hidePopover();
  const backdrop = document.createElement('div');
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'annot-note-h');
  backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(8, 8, 10, .6); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(6px);';
  const card = document.createElement('div');
  card.style.cssText = 'width: min(480px, 92vw); background: var(--surface-1); border: 1px solid var(--border-3); border-radius: var(--radius-3); box-shadow: var(--shadow-3); padding: 20px;';
  const h = document.createElement('h2');
  h.id = 'annot-note-h';
  h.textContent = 'Add a note';
  h.style.margin = '0 0 8px';
  const snippet = document.createElement('p');
  snippet.style.cssText = 'color: var(--text-3); margin: 0 0 12px; font-size: var(--fs-200);';
  snippet.textContent = '"' + (text.length > 120 ? text.slice(0, 120) + '...' : text) + '"';
  const ta = document.createElement('textarea');
  ta.rows = 4;
  ta.style.cssText = 'width: 100%; box-sizing: border-box; padding: 8px; border-radius: var(--radius-2); border: 1px solid var(--border-2); background: var(--surface-1); color: var(--text-1); font: inherit;';
  ta.setAttribute('aria-label', 'Note text');
  const row = document.createElement('div');
  row.style.cssText = 'display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn btn-ghost';
  cancel.textContent = 'Cancel';
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'btn btn-primary';
  save.textContent = 'Save';
  const close = () => {
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
  };
  cancel.addEventListener('click', close);
  save.addEventListener('click', () => {
    const note = ta.value;
    close();
    saveHighlight(text, note);
  });
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
  row.appendChild(cancel);
  row.appendChild(save);
  card.appendChild(h);
  card.appendChild(snippet);
  card.appendChild(ta);
  card.appendChild(row);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  setTimeout(() => ta.focus(), 0);
}

function hidePopover() {
  if (_popover) _popover.style.display = 'none';
}

function saveHighlight(text, note) {
  if (!_activeSlug) return;
  const key = 'highlights:' + _activeSlug;
  const list = lsGet(key, []);
  list.push({ text, note: note || '', at: new Date().toISOString() });
  lsSet(key, list);
  announce('Highlight saved.');
  hidePopover();
  if (_activeScope) restoreHighlights(_activeScope, _activeSlug);
  // Force-clear selection
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
}

/**
 * Walk the prose nodes inside `scope`, wrap any text match with <mark class="annotate-mark">.
 * Idempotent: wraps each highlight at most once per render.
 */
export function restoreHighlights(scope, slug) {
  const list = lsGet('highlights:' + slug, []);
  if (!list.length) return;
  // Clear any previous marks first to keep idempotent
  scope.querySelectorAll('mark.annotate-mark').forEach(m => {
    const parent = m.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(m.textContent || ''), m);
    parent.normalize();
  });
  // Wrap each saved highlight text in the first matching prose paragraph
  const paragraphs = scope.querySelectorAll('.prose, p.prose, .reading-section p, .concept-section p');
  for (const h of list) {
    for (const p of paragraphs) {
      const txt = p.textContent || '';
      const idx = txt.indexOf(h.text);
      if (idx === -1) continue;
      // Walk text nodes to find the span and wrap it
      _wrapTextRange(p, h.text, h.note);
      break;
    }
  }
}

function _wrapTextRange(root, target, note) {
  // Simple approach: only wrap if target appears in a single text node
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const t = node.nodeValue || '';
    const i = t.indexOf(target);
    if (i === -1) continue;
    const before = t.slice(0, i);
    const after = t.slice(i + target.length);
    const mark = document.createElement('mark');
    mark.className = 'annotate-mark';
    mark.textContent = target;
    if (note) mark.title = note;
    const parent = node.parentNode;
    if (before) parent.insertBefore(document.createTextNode(before), node);
    parent.insertBefore(mark, node);
    if (after) parent.insertBefore(document.createTextNode(after), node);
    parent.removeChild(node);
    return;
  }
}

export function getHighlights(slug) { return lsGet('highlights:' + slug, []); }
export function clearHighlights(slug) {
  lsSet('highlights:' + slug, []);
  if (_activeScope && _activeSlug === slug) restoreHighlights(_activeScope, slug);
}

// Clean up popover on hashchange. Use a single registration so repeated
// mounts/unmounts don't stack listeners.
if (!window.__aise26_annot_hashchange_wired) {
  window.__aise26_annot_hashchange_wired = true;
  window.addEventListener('hashchange', () => { unmountAnnotator(); });
}

window.aise26 = Object.assign(window.aise26 || {}, {
  annotate: { mountAnnotator, unmountAnnotator, getHighlights, clearHighlights }
});
