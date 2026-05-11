// Export the entire course as a single Markdown file (or a per-module split).
// No vendored zip library; we emit one big .md and let the browser download it.
// Per-module export: emits a single .md file scoped to one module.

import { CONCEPTS, MODULES } from './data.js';
import { FLESHED } from './fleshed.js';
import { announce } from './runtime.js';

/**
 * Build the full-course Markdown string.
 */
export function buildCourseMarkdown() {
  const parts = [];
  parts.push('# AI Solutions Engineer / Architect 2026');
  parts.push('');
  parts.push('A map of everything a 2026 AI Solutions Engineer or Architect needs to know.');
  parts.push('');
  parts.push(MODULES.length + ' modules · ' + CONCEPTS.length + ' concepts. Generated ' + new Date().toISOString().slice(0, 10) + '.');
  parts.push('');
  parts.push('---');
  parts.push('');
  // Table of contents
  parts.push('## Table of contents');
  parts.push('');
  for (const m of MODULES) {
    parts.push('- **Module ' + m.n + '. ' + m.title + '** - ' + m.intro);
  }
  parts.push('');
  parts.push('---');
  parts.push('');

  for (const m of MODULES) {
    parts.push('# Module ' + m.n + '. ' + m.title);
    parts.push('');
    parts.push('> ' + m.intro);
    parts.push('');
    const concepts = CONCEPTS.filter(c => c.module === m.n);
    for (const c of concepts) {
      parts.push('## ' + c.name);
      if (c.aliases && c.aliases.length) {
        parts.push('');
        parts.push('*Also known as: ' + c.aliases.join(', ') + '*');
      }
      parts.push('');
      parts.push('**Definition.** ' + c.stub);
      parts.push('');
      const f = FLESHED && FLESHED[c.slug];
      if (f) {
        if (f.opener) {
          parts.push('### What it actually is');
          parts.push('');
          parts.push(_flatten(f.opener));
          parts.push('');
        }
        if (f.breakdown) {
          parts.push('### Architectural breakdown');
          parts.push('');
          parts.push(_flatten(f.breakdown));
          parts.push('');
        }
        if (f.example) {
          parts.push('### Worked example');
          parts.push('');
          parts.push(_flatten(f.example, { renderCode: true }));
          parts.push('');
        }
        if (f.failures) {
          parts.push('### Common failures');
          parts.push('');
          parts.push(_flattenAsList(f.failures));
          parts.push('');
        }
      }
      if (c.crossRefs && c.crossRefs.length) {
        parts.push('### See also');
        parts.push('');
        for (const r of c.crossRefs) parts.push('- ' + r);
        parts.push('');
      }
      parts.push('---');
      parts.push('');
    }
  }
  parts.push('');
  parts.push('*End of course export. ' + CONCEPTS.length + ' concepts.*');
  parts.push('');
  return parts.join('\n');
}

/**
 * Build a single-module Markdown string.
 */
export function buildModuleMarkdown(modN) {
  const m = MODULES.find(x => x.n === modN);
  if (!m) return '# Module not found.';
  const parts = [];
  parts.push('# Module ' + m.n + '. ' + m.title);
  parts.push('');
  parts.push('> ' + m.intro);
  parts.push('');
  parts.push('Generated ' + new Date().toISOString().slice(0, 10) + '.');
  parts.push('');
  parts.push('---');
  parts.push('');
  const concepts = CONCEPTS.filter(c => c.module === modN);
  for (const c of concepts) {
    parts.push('## ' + c.name);
    if (c.aliases && c.aliases.length) parts.push('*Also: ' + c.aliases.join(', ') + '*');
    parts.push('');
    parts.push(c.stub);
    parts.push('');
    const f = FLESHED && FLESHED[c.slug];
    if (f) {
      if (f.opener) { parts.push('### What it actually is'); parts.push(''); parts.push(_flatten(f.opener)); parts.push(''); }
      if (f.breakdown) { parts.push('### Architectural breakdown'); parts.push(''); parts.push(_flatten(f.breakdown)); parts.push(''); }
      if (f.example) { parts.push('### Worked example'); parts.push(''); parts.push(_flatten(f.example, { renderCode: true })); parts.push(''); }
      if (f.failures) { parts.push('### Common failures'); parts.push(''); parts.push(_flattenAsList(f.failures)); parts.push(''); }
    }
    parts.push('---');
    parts.push('');
  }
  return parts.join('\n');
}

function _flatten(piece, opts = {}) {
  if (typeof piece === 'string') return piece;
  if (Array.isArray(piece)) return piece.map(p => _flatten(p, opts)).filter(Boolean).join('\n\n');
  if (piece && typeof piece === 'object' && typeof piece.code === 'string') {
    return opts.renderCode ? '```\n' + piece.code + '\n```' : '';
  }
  return '';
}
function _flattenAsList(piece) {
  if (typeof piece === 'string') return '- ' + piece;
  if (Array.isArray(piece)) return piece.map(p => '- ' + _flatten(p)).filter(s => s !== '- ').join('\n');
  return _flatten(piece);
}

/**
 * Trigger a browser download of arbitrary text content.
 */
export function downloadText(content, filename, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  announce('Download started: ' + filename);
}

window.aise26 = Object.assign(window.aise26 || {}, {
  exportCourse: { buildCourseMarkdown, buildModuleMarkdown, downloadText }
});
