// Personal Library: tabs + search + filter + export.
import { CONCEPTS } from '../data.js';
import { lsGet, lsKeys, el, clear, announce } from '../runtime.js';
import { conceptBySlug } from '../crossref.js';
import { getConceptState, getSaved, todayKey } from '../gamification.js';

function truncate(s, n) {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '...' : t;
}

function libraryEntries(tab) {
  const entries = [];
  if (tab === 'saved') {
    for (const slug of getSaved()) {
      const c = conceptBySlug(slug);
      if (!c) continue;
      entries.push({ title: c.name, href: '#/concept/' + slug, preview: c.stub, meta: 'Module ' + c.module, raw: '', key: 'saved:' + slug });
    }
  } else if (tab === 'prompts') {
    for (const k of lsKeys('edit_prompt_')) {
      const slug = k.slice('edit_prompt_'.length);
      const c = conceptBySlug(slug);
      if (!c) continue;
      const v = lsGet(k, '');
      entries.push({ title: c.name + ': edited prompt', href: '#/concept/' + slug, preview: truncate(v, 220), meta: 'Module ' + c.module, raw: v, key: k });
    }
  } else if (tab === 'generators') {
    for (const k of lsKeys('edit_generator_')) {
      const slug = k.slice('edit_generator_'.length);
      const v = lsGet(k, '');
      entries.push({ title: 'Edited generator: ' + slug, href: '#/toolkit', preview: truncate(v, 220), meta: 'Toolkit', raw: v, key: k });
    }
  } else if (tab === 'templates') {
    for (const k of lsKeys('edit_template_')) {
      const slug = k.slice('edit_template_'.length);
      const v = lsGet(k, '');
      entries.push({ title: 'Edited template: ' + slug, href: '#/toolkit', preview: truncate(v, 220), meta: 'Toolkit', raw: v, key: k });
    }
  } else if (tab === 'notes') {
    for (const c of CONCEPTS) {
      const s = getConceptState(c.slug);
      if (!s.notes || !s.notes.trim()) continue;
      entries.push({ title: c.name, href: '#/concept/' + c.slug, preview: truncate(s.notes, 220), meta: 'Module ' + c.module, raw: s.notes, key: 'concept:' + c.slug + ':notes' });
    }
  } else if (tab === 'drafts') {
    for (const k of lsKeys('builder_draft_')) {
      const v = lsGet(k, null);
      if (v === null) continue;
      const previewText = typeof v === 'string' ? v : JSON.stringify(v);
      entries.push({ title: 'Builder draft: ' + k.slice('builder_draft_'.length), href: '#/toolkit', preview: truncate(previewText, 220), meta: 'Builder', raw: previewText, key: k });
    }
  }
  return entries;
}

function exportMarkdown() {
  const lines = ['# Personal Library Export', 'Generated: ' + new Date().toISOString(), ''];
  const tabs = [
    ['saved', 'Saved concepts'],
    ['prompts', 'My prompts'],
    ['generators', 'My generators'],
    ['templates', 'My templates'],
    ['notes', 'Notes'],
    ['drafts', 'Builder drafts']
  ];
  for (const [tab, heading] of tabs) {
    const items = libraryEntries(tab);
    if (!items.length) continue;
    lines.push('## ' + heading, '');
    for (const it of items) {
      lines.push('### ' + it.title);
      lines.push(it.meta + (it.href ? ' - ' + it.href : ''));
      if (it.raw) {
        lines.push('', '```', it.raw, '```');
      }
      lines.push('');
    }
  }
  const md = lines.join('\n');
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aise26-library-' + todayKey() + '.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Library exported.');
}

let _libState = { tab: 'saved', search: '' };

export function renderLibrary() {
  const wrap = el('article', { 'aria-labelledby': 'lib-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Personal'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'lib-h1' }, 'Library'));
  wrap.appendChild(el('p', { class: 'home-tagline' }, 'Saved concepts, edited prompts and templates, notes, builder drafts. Export to markdown for your second brain.'));

  const tabs = [
    { key: 'saved', label: 'Saved' },
    { key: 'prompts', label: 'My prompts' },
    { key: 'generators', label: 'My generators' },
    { key: 'templates', label: 'My templates' },
    { key: 'notes', label: 'Notes' },
    { key: 'drafts', label: 'Builder drafts' }
  ];
  const tablist = el('ul', { class: 'lib-tabs', role: 'tablist' });
  const panel = el('div', { id: 'library-panel', role: 'tabpanel', tabindex: '-1' });

  function renderPanel() {
    clear(panel);
    const toolbar = el('div', { class: 'lib-toolbar' });
    const search = el('input', { type: 'search', placeholder: 'Filter ' + _libState.tab + '...', 'aria-label': 'Filter' });
    search.value = _libState.search;
    search.addEventListener('input', () => { _libState.search = search.value; renderPanel(); });
    const exportBtn = el('button', { class: 'btn', type: 'button' }, 'Export everything');
    exportBtn.addEventListener('click', exportMarkdown);
    toolbar.appendChild(search);
    toolbar.appendChild(exportBtn);
    panel.appendChild(toolbar);

    let entries = libraryEntries(_libState.tab);
    if (_libState.search) {
      const q = _libState.search.toLowerCase();
      entries = entries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.preview && e.preview.toLowerCase().includes(q)) ||
        (e.raw && String(e.raw).toLowerCase().includes(q))
      );
    }
    if (!entries.length) {
      panel.appendChild(el('div', { class: 'empty' }, [
        el('h3', null, 'Nothing here yet'),
        el('p', null, _libState.search ? 'Try a different search term.' : 'Open a concept and start editing or saving to populate this view.')
      ]));
      return;
    }
    const list = el('ul', { class: 'lib-list' });
    for (const e of entries) {
      list.appendChild(el('li', { class: 'lib-entry' }, [
        el('div', { class: 'lib-entry-head' }, [
          el('a', { class: 'lib-entry-title', href: e.href }, e.title),
          el('span', { class: 'lib-entry-meta' }, e.meta)
        ]),
        el('p', { class: 'lib-entry-preview' }, e.preview || '')
      ]));
    }
    panel.appendChild(list);
  }

  for (const t of tabs) {
    const li = el('li', { role: 'presentation' });
    const btn = el('button', {
      class: 'lib-tab', role: 'tab', type: 'button',
      'aria-selected': t.key === _libState.tab ? 'true' : 'false',
      'aria-controls': 'library-panel'
    }, t.label);
    btn.addEventListener('click', () => {
      _libState.tab = t.key;
      tablist.querySelectorAll('.lib-tab').forEach(b => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      renderPanel();
    });
    li.appendChild(btn);
    tablist.appendChild(li);
  }

  wrap.appendChild(tablist);
  wrap.appendChild(panel);
  renderPanel();
  return { node: wrap, title: 'Personal Library', crumbs: [{ label: 'Library' }], mainClass: 'no-rail' };
}
