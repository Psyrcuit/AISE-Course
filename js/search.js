// Search engine. Ranks concept name + alias + stub matches with hyphen/space
// normalization. Adds fuzzy substring matching + search history.
// Returns {results, total, tokens}.

import { CONCEPTS } from './data.js';
import { lsGet, lsSet } from './runtime.js';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 20;

function _norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Returns search history (most-recent first). De-duplicated; capped at 20.
 */
export function getSearchHistory() { return lsGet(HISTORY_KEY, []); }
export function pushSearchHistory(q) {
  if (!q || q.trim().length < 2) return;
  const hist = lsGet(HISTORY_KEY, []);
  const idx = hist.indexOf(q);
  if (idx >= 0) hist.splice(idx, 1);
  hist.unshift(q);
  if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
  lsSet(HISTORY_KEY, hist);
}
export function clearSearchHistory() { lsSet(HISTORY_KEY, []); }

/**
 * Tiny fuzzy-substring scorer. Returns true if all chars of `needle`
 * appear in `haystack` in order (case-insensitive). Used as a fallback
 * signal after literal substring fails.
 */
function fuzzyMatch(haystack, needle) {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let i = 0;
  for (let j = 0; j < h.length && i < n.length; j++) {
    if (h[j] === n[i]) i++;
  }
  return i === n.length;
}

export function searchConcepts(query) {
  const empty = { results: [], total: 0, tokens: [] };
  const q = (query || '').trim().toLowerCase();
  if (!q) return empty;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return empty;
  const qNorm = _norm(q);

  const results = [];
  for (const c of CONCEPTS) {
    const nameLower = c.name.toLowerCase();
    const nameNorm = _norm(c.name);
    const stubLower = c.stub.toLowerCase();
    let score = 0;

    if (nameLower === q || nameNorm === qNorm) score = Math.max(score, 1000);
    else if (nameLower.startsWith(q) || nameNorm.startsWith(qNorm)) score = Math.max(score, 800);

    for (const a of c.aliases) {
      const al = a.toLowerCase();
      const an = _norm(a);
      if (al === q || an === qNorm) score = Math.max(score, 900);
      else if (al.startsWith(q) || an.startsWith(qNorm)) score = Math.max(score, 700);
      else if (al.includes(q) || an.includes(qNorm)) score = Math.max(score, 400);
    }

    let nameHits = 0;
    for (const t of tokens) if (nameLower.includes(t)) nameHits++;
    if (nameHits === tokens.length) score = Math.max(score, 500 + nameHits * 10);
    else if (nameHits > 0) score = Math.max(score, 300 + nameHits * 10);

    let stubHits = 0;
    for (const t of tokens) if (stubLower.includes(t)) stubHits++;
    if (stubHits === tokens.length) score = Math.max(score, 100 + stubHits * 5);
    else if (stubHits > 0) score = Math.max(score, 50 + stubHits * 5);

    if (c.fleshed && score > 0) score += 5;

    // Fuzzy fallback: needle chars in order through the name. Only if no
    // literal hit and tokens are reasonably long.
    if (score === 0 && q.length >= 3 && fuzzyMatch(nameNorm, qNorm)) {
      score = 30;
    }

    if (score > 0) results.push({
      slug: c.slug, name: c.name, stub: c.stub, module: c.module,
      fleshed: c.fleshed, aliases: c.aliases, score
    });
  }
  results.sort((a, b) => b.score - a.score || a.name.length - b.name.length);
  return { results: results.slice(0, 25), total: results.length, tokens };
}

function escapeRegExpLocal(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function highlightTokens(text, tokens) {
  if (!tokens || !tokens.length) return [document.createTextNode(text)];
  const checker = new RegExp('^(?:' + tokens.map(escapeRegExpLocal).join('|') + ')$', 'i');
  const splitter = new RegExp('(' + tokens.map(escapeRegExpLocal).join('|') + ')', 'gi');
  const parts = text.split(splitter);
  const frag = document.createDocumentFragment();
  for (const part of parts) {
    if (!part) continue;
    if (checker.test(part)) {
      const m = document.createElement('mark');
      m.textContent = part;
      frag.appendChild(m);
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  }
  return [frag];
}

window.aise26 = Object.assign(window.aise26 || {}, {
  searchConcepts, getSearchHistory, pushSearchHistory, clearSearchHistory
});
