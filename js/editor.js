// Universal editor pattern. Read mode (display + Copy + Edit), edit mode
// (textarea + Save / Cancel / Reset). Auto-save on blur with 500ms debounce.
// Storage key: aise26:edit_{type}_{slug}.

import { lsGet, lsSet, lsDel, announce, el, clear } from './runtime.js';
import { copyToClipboard } from './copy.js';

export function mountEditor(opts) {
  const container = opts.container;
  const storageKey = 'edit_' + opts.type + '_' + opts.slug;
  const block = el('div', {
    class: 'editor-block',
    'data-editor-type': opts.type,
    'data-editor-slug': opts.slug
  });
  container.appendChild(block);

  function isEdited() { return lsGet(storageKey, null) !== null; }
  function currentText() {
    const stored = lsGet(storageKey, null);
    return stored !== null ? stored : opts.originalText;
  }

  function renderRead() {
    clear(block);
    block.classList.toggle('is-edited', isEdited());
    if (isEdited()) {
      const indicator = el('div', { class: 'editor-edited-indicator', 'aria-label': 'edited' }, [
        el('span', { class: 'editor-dot', 'aria-hidden': 'true' }),
        el('span', null, 'Edited'),
        el('button', { class: 'btn-link', type: 'button', 'aria-label': 'Reset to original' }, 'Reset')
      ]);
      indicator.querySelector('button').addEventListener('click', doReset);
      block.appendChild(indicator);
    }
    const display = el('pre', {
      class: 'editor-display' + (opts.monospace ? ' editor-mono' : ''),
      tabindex: '0',
      'aria-label': (opts.label || 'Editable content') + '. Press Cmd or Ctrl plus E to edit.'
    }, [el('code', null, currentText())]);
    block.appendChild(display);
    const copyBtn = el('button', { class: 'btn btn-sm', type: 'button' }, 'Copy');
    copyBtn.addEventListener('click', (e) => copyToClipboard(currentText(), e.currentTarget));
    const editBtn = el('button', {
      class: 'btn btn-sm btn-primary',
      type: 'button',
      'data-editor-action': 'edit'
    }, 'Edit');
    editBtn.addEventListener('click', renderEdit);
    block.appendChild(el('div', { class: 'editor-toolbar' }, [copyBtn, editBtn]));
  }

  function renderEdit() {
    clear(block);
    block.classList.add('is-edited');
    const ta = el('textarea', {
      class: 'editor-textarea',
      spellcheck: 'true',
      'aria-label': opts.label || ('Edit ' + opts.type)
    });
    ta.value = currentText();
    let blurTimer = null;
    ta.addEventListener('blur', () => {
      if (blurTimer) clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        const before = lsGet(storageKey, null);
        lsSet(storageKey, ta.value);
        if (before !== ta.value && opts.onSave) opts.onSave(ta.value);
      }, 500);
    });
    block.appendChild(ta);

    const saveBtn = el('button', { class: 'btn btn-sm btn-primary', type: 'button' }, 'Save');
    const cancelBtn = el('button', { class: 'btn btn-sm', type: 'button' }, 'Cancel');
    const resetBtn = el('button', { class: 'btn btn-sm btn-danger', type: 'button' }, 'Reset to original');
    saveBtn.addEventListener('click', () => {
      if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }
      lsSet(storageKey, ta.value);
      if (opts.onSave) opts.onSave(ta.value);
      announce('Saved.');
      renderRead();
    });
    cancelBtn.addEventListener('click', () => { announce('Cancelled.'); renderRead(); });
    resetBtn.addEventListener('click', doReset);
    block.appendChild(el('div', { class: 'editor-toolbar' }, [saveBtn, cancelBtn, resetBtn]));
    Promise.resolve().then(() => ta.focus());
    announce('Edit mode.');
  }

  function doReset() {
    lsDel(storageKey);
    if (opts.onReset) opts.onReset();
    announce('Reset to original.');
    renderRead();
  }

  renderRead();
  return { renderRead, renderEdit, doReset };
}

document.addEventListener('aise26:toggle-edit', (e) => {
  const focused = e.detail?.target || document.activeElement;
  if (!focused || !focused.closest) return;
  const block = focused.closest('.editor-block');
  if (!block) return;
  const editBtn = block.querySelector('button[data-editor-action="edit"]');
  if (editBtn) editBtn.click();
});

window.aise26 = Object.assign(window.aise26 || {}, { mountEditor });
