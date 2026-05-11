// Extract static data literals from course.html.legacy into modular ESM files
// in js/. Re-runnable. Idempotent. Run: `node build/extract.mjs`
//
// Outputs:
//   js/data.js          - CONCEPTS, MODULES
//   js/fleshed.js       - FLESHED
//   js/gam-data.js      - XP_VALUES, TIERS, ACHIEVEMENTS_REGISTRY, CAPSTONES
//   js/toolkit-data.js  - TOOLKIT
//   js/playbooks-data.js - PLAYBOOKS
//   js/decisions-data.js - DECISIONS

import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('course.html.legacy', 'utf8');

function extractBetweenSentinels(beginRe, endRe) {
  const begin = html.match(beginRe);
  const end = html.match(endRe);
  if (!begin || !end) return null;
  const start = begin.index + begin[0].length;
  return html.slice(start, end.index);
}

function extractDeclaration(name, body) {
  // Match `const NAME = <expr>;` where <expr> may be wrapped in
  // Object.freeze(...) or a plain { ... } / [ ... ]. Brace-count from the
  // first { or [ found after the assignment.
  const re = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*`, 'g');
  const match = re.exec(body);
  if (!match) return null;
  let i = re.lastIndex;
  // Skip any wrapper like Object.freeze( or new Map( ...
  let prefix = '';
  while (i < body.length && body[i] !== '{' && body[i] !== '[') {
    prefix += body[i];
    i++;
  }
  const open = body[i];
  if (open !== '{' && open !== '[') return null;
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, strCh = '', escape = false;
  for (let j = i; j < body.length; j++) {
    const ch = body[j];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === strCh) { inStr = false; continue; }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        // Re-attach any wrapper (e.g. Object.freeze( ... )) by including the
        // matching trailing `)` if the prefix had an opening `(`.
        let end = j + 1;
        const openParens = (prefix.match(/\(/g) || []).length;
        const closeParens = (prefix.match(/\)/g) || []).length;
        const stillOpen = openParens - closeParens;
        for (let k = 0; k < stillOpen && end < body.length; ) {
          if (body[end] === ')') { k++; }
          end++;
        }
        return prefix.trim() + body.slice(i, end);
      }
    }
  }
  return null;
}

function writeModule(path, header, exports) {
  const lines = [
    '// Auto-extracted from course.html.legacy by build/extract.mjs.',
    '// Do not edit by hand. Re-run the script to refresh.',
    ''
  ];
  if (header) lines.push(header, '');
  for (const [name, value] of exports) {
    lines.push(`export const ${name} = ${value};`);
    lines.push('');
  }
  const out = lines.join('\n');
  writeFileSync(path, out);
  console.log(`wrote ${path} (${(out.length / 1024).toFixed(1)} KB)`);
}

// ---- data.js (CONCEPTS, MODULES) ----
const m2 = extractBetweenSentinels(/\/\* === AISE26 M2 BEGIN === \*\//, /\/\* === AISE26 M2 END === \*\//);
if (!m2) { console.error('M2 sentinels not found'); process.exit(1); }
const CONCEPTS = extractDeclaration('CONCEPTS', m2);
const MODULES = extractDeclaration('MODULES', m2);
writeModule('js/data.js', null, [['MODULES', MODULES], ['CONCEPTS', CONCEPTS]]);

// ---- fleshed.js (FLESHED) ----
const m10 = extractBetweenSentinels(/\/\* === AISE26 M10 BEGIN === \*\//, /\/\* === AISE26 M10 END === \*\//);
if (!m10) { console.error('M10 sentinels not found'); process.exit(1); }
const FLESHED = extractDeclaration('FLESHED', m10);
writeModule('js/fleshed.js', null, [['FLESHED', FLESHED]]);

// ---- gam-data.js (XP_VALUES, TIERS, ACHIEVEMENTS_REGISTRY, CAPSTONES) ----
const m5 = extractBetweenSentinels(/\/\* === AISE26 M5 BEGIN === \*\//, /\/\* === AISE26 M5 END === \*\//);
if (!m5) { console.error('M5 sentinels not found'); process.exit(1); }
const XP_VALUES = extractDeclaration('XP_VALUES', m5);
const TIERS = extractDeclaration('TIERS', m5);
const ACHIEVEMENTS_REGISTRY = extractDeclaration('ACHIEVEMENTS_REGISTRY', m5);
const CAPSTONES = extractDeclaration('CAPSTONES', m5);
writeModule('js/gam-data.js', null, [
  ['XP_VALUES', XP_VALUES],
  ['TIERS', TIERS],
  ['ACHIEVEMENTS_REGISTRY', ACHIEVEMENTS_REGISTRY],
  ['CAPSTONES', CAPSTONES]
]);

// ---- toolkit-data.js (TOOLKIT) ----
const m7 = extractBetweenSentinels(/\/\* === AISE26 M7 BEGIN === \*\//, /\/\* === AISE26 M7 END === \*\//);
if (!m7) { console.error('M7 sentinels not found'); process.exit(1); }
const TOOLKIT = extractDeclaration('TOOLKIT', m7);
const BUILDER_SECTIONS = extractDeclaration('BUILDER_SECTIONS', m7);
writeModule('js/toolkit-data.js', null, [['TOOLKIT', TOOLKIT], ['BUILDER_SECTIONS', BUILDER_SECTIONS]]);

// ---- playbooks-data.js (PLAYBOOKS) ----
const m8 = extractBetweenSentinels(/\/\* === AISE26 M8 BEGIN === \*\//, /\/\* === AISE26 M8 END === \*\//);
if (!m8) { console.error('M8 sentinels not found'); process.exit(1); }
const PLAYBOOKS = extractDeclaration('PLAYBOOKS', m8);
writeModule('js/playbooks-data.js', null, [['PLAYBOOKS', PLAYBOOKS]]);

// ---- decisions-data.js (DECISIONS) ----
const m9 = extractBetweenSentinels(/\/\* === AISE26 M9 BEGIN === \*\//, /\/\* === AISE26 M9 END === \*\//);
if (!m9) { console.error('M9 sentinels not found'); process.exit(1); }
const DECISIONS = extractDeclaration('DECISIONS', m9);
writeModule('js/decisions-data.js', null, [['DECISIONS', DECISIONS]]);

console.log('\nAll data modules extracted.');
