// Tiny syntax highlighter. Regex-based; covers the languages used in the
// course's code blocks: Python, JavaScript / TypeScript, JSON, YAML, Bash, SQL.
// Auto-detects language from content patterns; users can also set a hint
// via a leading comment like "# python" or "// js".
//
// Output: HTML with <span class="hl-{kind}"> spans. Caller passes raw text;
// returns escaped + tagged HTML. Safe by construction (escape happens before
// regex tokenization, then we wrap with class spans).

const KEYWORDS = {
  python: new Set([
    'False','None','True','and','as','assert','async','await','break','class','continue',
    'def','del','elif','else','except','finally','for','from','global','if','import','in',
    'is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield',
    'match','case'
  ]),
  js: new Set([
    'await','async','break','case','catch','class','const','continue','debugger','default',
    'delete','do','else','export','extends','false','finally','for','from','function',
    'if','import','in','instanceof','let','new','null','of','return','static','super','switch',
    'this','throw','true','try','typeof','undefined','var','void','while','with','yield','as',
    'interface','type','enum','namespace','readonly','public','private','protected'
  ]),
  bash: new Set([
    'if','then','else','elif','fi','for','do','done','while','until','case','esac',
    'function','return','exit','export','readonly','local','source','alias','unset',
    'true','false'
  ]),
  sql: new Set([
    'SELECT','FROM','WHERE','GROUP','BY','ORDER','HAVING','JOIN','LEFT','RIGHT','INNER','OUTER',
    'ON','AS','AND','OR','NOT','NULL','IS','IN','LIKE','BETWEEN','LIMIT','OFFSET','UNION',
    'INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','INDEX','DROP','ALTER',
    'PRIMARY','KEY','FOREIGN','REFERENCES','CONSTRAINT','DEFAULT','CHECK','UNIQUE'
  ])
};

const PUNCT_RE = /[(){}\[\];:,.<>=+\-*/%!&|^~?]/;

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/**
 * Detect language from content + optional leading hint.
 */
export function detectLang(text) {
  const head = text.slice(0, 200);
  const m = head.match(/^\s*(?:#|\/\/|--)\s*(python|py|js|javascript|ts|typescript|json|yaml|yml|bash|sh|sql)\b/i);
  if (m) {
    const tag = m[1].toLowerCase();
    if (tag === 'py') return 'python';
    if (tag === 'javascript') return 'js';
    if (tag === 'typescript') return 'ts';
    if (tag === 'yml') return 'yaml';
    if (tag === 'sh') return 'bash';
    return tag;
  }
  if (/^[\s\n]*[{[]/.test(text) && /[}\]]/.test(text) && !/\bdef\b|\bfunction\b|\bclass\b/.test(text)) {
    // Looks like JSON
    return 'json';
  }
  if (/^\s*\w+:\s/m.test(text) && !/[{};]/.test(text)) {
    return 'yaml';
  }
  if (/\bdef\b|\bimport\b|\bclass\s+\w+:/.test(text) || /\bself\b|\b__init__\b/.test(text)) {
    return 'python';
  }
  if (/\b(?:const|let|var|function|export|import|=>)\b/.test(text)) {
    return 'js';
  }
  if (/\$\(|\becho\b|\bgrep\b|\b\$\w+\b|\bsudo\b/.test(text)) return 'bash';
  if (/\b(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i.test(text)) return 'sql';
  return 'plain';
}

/**
 * Highlight `text`. Returns HTML string with class-tagged spans.
 */
export function highlight(text, lang) {
  if (!text) return '';
  if (!lang) lang = detectLang(text);
  if (lang === 'plain') return escapeHtml(text);
  if (lang === 'json') return highlightJson(text);
  if (lang === 'yaml') return highlightYaml(text);
  return highlightProgrammatic(text, lang);
}

function highlightProgrammatic(text, lang) {
  // Tokenize: comments, strings, numbers, keywords, identifiers, punctuation.
  const out = [];
  let i = 0;
  const N = text.length;
  const isPython = lang === 'python';
  const isBash = lang === 'bash';
  const isSql = lang === 'sql';
  const keywordSet = KEYWORDS[lang === 'ts' ? 'js' : lang] || KEYWORDS.js;
  const lineCommentStart = isPython || isBash ? '#' : '/';
  while (i < N) {
    const ch = text[i];

    // Comments
    if (isPython && ch === '#') {
      const eol = text.indexOf('\n', i);
      const end = eol === -1 ? N : eol;
      out.push('<span class="hl-comment">', escapeHtml(text.slice(i, end)), '</span>');
      i = end;
      continue;
    }
    if (isBash && ch === '#') {
      const eol = text.indexOf('\n', i);
      const end = eol === -1 ? N : eol;
      out.push('<span class="hl-comment">', escapeHtml(text.slice(i, end)), '</span>');
      i = end;
      continue;
    }
    if (!isPython && !isBash && ch === '/' && text[i + 1] === '/') {
      const eol = text.indexOf('\n', i);
      const end = eol === -1 ? N : eol;
      out.push('<span class="hl-comment">', escapeHtml(text.slice(i, end)), '</span>');
      i = end;
      continue;
    }
    if (!isPython && !isBash && ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      const end = close === -1 ? N : close + 2;
      out.push('<span class="hl-comment">', escapeHtml(text.slice(i, end)), '</span>');
      i = end;
      continue;
    }
    if (isSql && ch === '-' && text[i + 1] === '-') {
      const eol = text.indexOf('\n', i);
      const end = eol === -1 ? N : eol;
      out.push('<span class="hl-comment">', escapeHtml(text.slice(i, end)), '</span>');
      i = end;
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < N) {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === quote) { j++; break; }
        if (text[j] === '\n' && quote !== '`') break;
        j++;
      }
      out.push('<span class="hl-string">', escapeHtml(text.slice(i, j)), '</span>');
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch) && (i === 0 || /[^a-zA-Z0-9_]/.test(text[i - 1]))) {
      let j = i;
      while (j < N && /[0-9._eE+\-x]/.test(text[j])) j++;
      out.push('<span class="hl-number">', escapeHtml(text.slice(i, j)), '</span>');
      i = j;
      continue;
    }

    // Identifiers / keywords
    if (/[A-Za-z_$@]/.test(ch)) {
      let j = i;
      while (j < N && /[A-Za-z0-9_$@]/.test(text[j])) j++;
      const word = text.slice(i, j);
      if (keywordSet.has(word) || (isSql && keywordSet.has(word.toUpperCase()))) {
        out.push('<span class="hl-keyword">', escapeHtml(word), '</span>');
      } else if (text[j] === '(' && !isBash && !isSql) {
        out.push('<span class="hl-fn">', escapeHtml(word), '</span>');
      } else if (/^[A-Z]/.test(word) && /^[A-Z][A-Za-z0-9_]*$/.test(word) && !isBash) {
        out.push('<span class="hl-type">', escapeHtml(word), '</span>');
      } else {
        out.push(escapeHtml(word));
      }
      i = j;
      continue;
    }

    // Punctuation
    if (PUNCT_RE.test(ch)) {
      out.push('<span class="hl-punct">', escapeHtml(ch), '</span>');
      i++;
      continue;
    }

    // Default
    out.push(escapeHtml(ch));
    i++;
  }
  return out.join('');
}

function highlightJson(text) {
  // Strings, numbers, booleans/null, punctuation, keys.
  let out = '';
  let i = 0;
  const N = text.length;
  while (i < N) {
    const ch = text[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < N) {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === '"') { j++; break; }
        j++;
      }
      // Look ahead: is this a key (followed by :)?
      let k = j;
      while (k < N && /\s/.test(text[k])) k++;
      const isKey = text[k] === ':';
      out += '<span class="hl-' + (isKey ? 'key' : 'string') + '">' + escapeHtml(text.slice(i, j)) + '</span>';
      i = j;
      continue;
    }
    if (/[0-9-]/.test(ch) && (i === 0 || /[^a-zA-Z0-9_]/.test(text[i - 1]))) {
      let j = i;
      while (j < N && /[0-9.eE+\-]/.test(text[j])) j++;
      out += '<span class="hl-number">' + escapeHtml(text.slice(i, j)) + '</span>';
      i = j;
      continue;
    }
    if (/[a-z]/.test(ch)) {
      let j = i;
      while (j < N && /[a-z]/.test(text[j])) j++;
      const word = text.slice(i, j);
      if (word === 'true' || word === 'false' || word === 'null') {
        out += '<span class="hl-keyword">' + word + '</span>';
      } else {
        out += escapeHtml(word);
      }
      i = j;
      continue;
    }
    if (PUNCT_RE.test(ch)) {
      out += '<span class="hl-punct">' + escapeHtml(ch) + '</span>';
      i++;
      continue;
    }
    out += escapeHtml(ch);
    i++;
  }
  return out;
}

function highlightYaml(text) {
  // Each line: optional comment, optional key:, value
  return text.split('\n').map(line => {
    // Comment (whole-line)
    if (/^\s*#/.test(line)) return '<span class="hl-comment">' + escapeHtml(line) + '</span>';
    // key: value pattern
    const m = line.match(/^(\s*-?\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)(\s*.*)$/);
    if (m) {
      const [, indent, key, sep, val] = m;
      let valHtml;
      if (/^\s*$/.test(val)) valHtml = '';
      else if (/^\s*"[^"]*"\s*$/.test(val) || /^\s*'[^']*'\s*$/.test(val)) valHtml = '<span class="hl-string">' + escapeHtml(val) + '</span>';
      else if (/^\s*-?[0-9]/.test(val)) valHtml = '<span class="hl-number">' + escapeHtml(val) + '</span>';
      else if (/^\s*(true|false|null|yes|no|on|off)\s*$/i.test(val)) valHtml = '<span class="hl-keyword">' + escapeHtml(val) + '</span>';
      else valHtml = escapeHtml(val);
      return escapeHtml(indent) + '<span class="hl-key">' + escapeHtml(key) + '</span><span class="hl-punct">' + escapeHtml(sep) + '</span>' + valHtml;
    }
    return escapeHtml(line);
  }).join('\n');
}

/**
 * Apply highlighting to all <pre><code> blocks under `root`.
 */
export function highlightAll(root = document) {
  const blocks = root.querySelectorAll('pre > code:not(.hl-done)');
  for (const code of blocks) {
    const text = code.textContent || '';
    const lang = detectLang(text);
    code.innerHTML = highlight(text, lang);
    code.classList.add('hl-done');
    code.setAttribute('data-lang', lang);
    code.parentElement.setAttribute('data-lang', lang);
  }
}

window.aise26 = Object.assign(window.aise26 || {}, { highlight: { highlight, detectLang, highlightAll } });
