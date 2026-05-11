// Cross-reference engine. Builds slug/name indexes, resolves cross-refs,
// auto-linkifies any concept name in body text. Ported from M2.

import { CONCEPTS, MODULES } from './data.js';

export const slugIndex = new Map();
for (const c of CONCEPTS) slugIndex.set(c.slug, c);

export const nameIndex = new Map();
for (const c of CONCEPTS) {
  nameIndex.set(c.name.toLowerCase(), c.slug);
  for (const a of c.aliases) nameIndex.set(a.toLowerCase(), c.slug);
}

export const moduleIndex = new Map();
for (const m of MODULES) moduleIndex.set(m.n, m);

export function conceptBySlug(slug) { return slugIndex.get(slug) || null; }
export function moduleByN(n) { return moduleIndex.get(Number(n)) || null; }
export function conceptsForModule(n) {
  const num = Number(n);
  return CONCEPTS.filter(c => c.module === num);
}

export function resolveCrossRef(rawRef) {
  const ref = String(rawRef || '').trim();
  if (!ref) return { ok: false, raw: ref, kind: 'empty' };
  const modMatch = ref.match(/^Module\s+(\d+)\b/i);
  if (modMatch) {
    const n = parseInt(modMatch[1], 10);
    if (moduleIndex.has(n)) {
      return { ok: true, kind: 'module', n, href: '#/module/' + n, label: 'Module ' + n + ': ' + moduleIndex.get(n).title };
    }
    return { ok: false, raw: ref, kind: 'module-missing', n };
  }
  const slug = nameIndex.get(ref.toLowerCase());
  if (slug) {
    const c = slugIndex.get(slug);
    return { ok: true, kind: 'concept', slug, href: '#/concept/' + slug, label: c.name };
  }
  const norm = ref.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  if (nameIndex.has(norm)) {
    const slug2 = nameIndex.get(norm);
    const c2 = slugIndex.get(slug2);
    return { ok: true, kind: 'concept', slug: slug2, href: '#/concept/' + slug2, label: c2.name };
  }
  return { ok: false, raw: ref, kind: 'unresolved' };
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const _allNames = [];
for (const c of CONCEPTS) {
  _allNames.push(c.name);
  for (const a of c.aliases) _allNames.push(a);
}
_allNames.sort((a, b) => b.length - a.length);
const _boundary = '(?:^|(?<=[^A-Za-z0-9_-]))';
const _boundaryEnd = '(?=$|[^A-Za-z0-9_-])';
const _linkifyRegex = new RegExp(
  _boundary + '(' + _allNames.map(escapeRegExp).join('|') + ')' + _boundaryEnd,
  'g'
);

const _linkifySkip = new Set(['A', 'CODE', 'PRE', 'BUTTON', 'TEXTAREA', 'INPUT', 'KBD', 'SCRIPT', 'STYLE']);

export function linkifyText(rootNode, opts = {}) {
  if (!rootNode) return 0;
  const skipSlug = opts.skipSlug || null;
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentNode;
      while (p) {
        if (p.nodeType === 1 && _linkifySkip.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p === rootNode) break;
        p = p.parentNode;
      }
      return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const targets = [];
  let n;
  while ((n = walker.nextNode())) targets.push(n);
  let linkCount = 0;
  for (const textNode of targets) {
    const text = textNode.nodeValue;
    _linkifyRegex.lastIndex = 0;
    if (!_linkifyRegex.test(text)) continue;
    _linkifyRegex.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let lastIdx = 0;
    let match;
    while ((match = _linkifyRegex.exec(text)) !== null) {
      const matchedText = match[0];
      const slug = nameIndex.get(matchedText.toLowerCase());
      if (!slug || slug === skipSlug) continue;
      if (match.index > lastIdx) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
      }
      const a = document.createElement('a');
      a.href = '#/concept/' + slug;
      a.className = 'xref';
      a.textContent = matchedText;
      a.dataset.slug = slug;
      frag.appendChild(a);
      lastIdx = match.index + matchedText.length;
      linkCount++;
    }
    if (lastIdx > 0) {
      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }
      textNode.parentNode.replaceChild(frag, textNode);
    }
  }
  return linkCount;
}

export function validateCrossRefs() {
  const unresolved = [];
  for (const c of CONCEPTS) {
    for (const ref of c.crossRefs) {
      const r = resolveCrossRef(ref);
      if (!r.ok) unresolved.push({ from: c.slug, ref });
    }
  }
  return unresolved;
}

window.aise26 = Object.assign(window.aise26 || {}, {
  CONCEPTS, MODULES,
  slugIndex, nameIndex, moduleIndex,
  conceptBySlug, moduleByN, conceptsForModule,
  resolveCrossRef, linkifyText, validateCrossRefs
});
