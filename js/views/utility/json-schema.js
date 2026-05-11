// JSON Schema generator. Plain-language description -> Pydantic class + JSON Schema.
// Heuristic mode parses noun:type patterns; AI mode runs an LLM call.

import { el, clear } from '../../runtime.js';
import { aiOrFallback, hasAnyKey } from '../../ai.js';

const SAMPLE = 'A support ticket has: a unique id (string starting with TK-), a category which is one of billing/technical/account, an urgency from low/medium/high, a customer email, an optional account_id, and a created_at timestamp.';

export function renderJsonSchema() {
  const wrap = el('article', { 'aria-labelledby': 'js-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Utility'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'js-h1' }, 'JSON Schema generator'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Describe an object in plain language; get a Pydantic class plus JSON Schema. ' +
    'Heuristic parses "noun: type" patterns; with a key, an LLM produces tighter schemas.'
  ));

  const ta = el('textarea', {
    class: 'editor-textarea',
    rows: '6',
    style: 'width: 100%; min-height: 130px; margin-top: 16px;',
    placeholder: 'Describe the object...'
  });
  ta.value = SAMPLE;
  wrap.appendChild(ta);

  const ctrls = el('div', { style: 'display: flex; gap: 8px; margin-top: 8px;' }, [
    btn('Use sample', () => { ta.value = SAMPLE; render(); }),
    btn('Generate', () => render()),
    el('div', { style: 'flex: 1;' }),
    (() => {
      const b = el('button', { class: 'btn btn-primary btn-sm', type: 'button' }, hasAnyKey() ? 'Generate with AI' : 'Heuristic only');
      b.addEventListener('click', renderAi);
      return b;
    })()
  ]);
  wrap.appendChild(ctrls);

  const stage = el('div', { style: 'margin-top: 16px;' });
  wrap.appendChild(stage);

  async function renderAi() {
    if (!hasAnyKey()) { render(); return; }
    clear(stage);
    stage.appendChild(el('p', null, 'Asking AI...'));
    const out = await aiOrFallback(
      async () => {
        const { aiCall } = await import('../../ai.js');
        const sys = 'You are a senior Python / TypeScript engineer. Given a plain-language description of an object, produce: 1) A Pydantic v2 BaseModel class with field types, descriptions, and validators where natural. 2) The corresponding JSON Schema. Output as a markdown block with two fenced code sections labeled "python" and "json". Be precise; use Literal for enums, Optional for optional fields.';
        return await aiCall({ system: sys, messages: [{ role: 'user', content: ta.value }], maxTokens: 1000 });
      },
      () => heuristicSchema(ta.value)
    );
    clear(stage);
    stage.appendChild(renderOutput(out));
  }

  function render() {
    clear(stage);
    stage.appendChild(renderOutput({ source: 'heuristic', value: heuristicSchema(ta.value) }));
  }
  render();

  return {
    node: wrap,
    title: 'JSON Schema',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'JSON Schema' }],
    mainClass: 'no-rail'
  };
}

function renderOutput(out) {
  const sec = el('section', { class: 'utility-section' });
  sec.appendChild(el('div', { class: 'practice-card-eyebrow' }, out.source === 'ai' ? 'AI generated' : 'Heuristic generated'));
  sec.appendChild(el('pre', {
    style: 'white-space: pre-wrap; font-family: var(--font-mono); font-size: var(--fs-100); padding: 14px; background: var(--surface-2); border-radius: var(--radius-2); margin-top: 8px; overflow-x: auto;'
  }, out.value));
  return sec;
}

function btn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}

// ---- Heuristic schema generator ----
// Looks for patterns like "noun: type" and "field which is one of x/y/z".
function heuristicSchema(text) {
  if (!text || !text.trim()) return '# Provide a description above.';

  const fields = [];
  // Pattern 1: "x is one of a/b/c" or "x: one of a, b, c" -> enum
  const enumRe = /\b([a-z][a-z0-9_]*?)\s+(?:is\s+one\s+of|:\s*one\s+of)\s+([a-z0-9_/, ]+)/gi;
  let m;
  while ((m = enumRe.exec(text)) !== null) {
    const name = camelToSnake(m[1]);
    const opts = m[2].split(/[/,]/).map(s => s.trim()).filter(Boolean);
    fields.push({ name, type: 'Literal', literal: opts, optional: false, description: 'Enum field' });
  }
  // Pattern 2: "X is a string starting with Y-" -> pattern
  const patternRe = /\b([a-z][a-z0-9_]*?)\s+(?:is\s+a|is\s+an)?\s*(?:unique\s+)?string\s+starting\s+with\s+([A-Z]+-?)/gi;
  while ((m = patternRe.exec(text)) !== null) {
    const name = camelToSnake(m[1]);
    if (!fields.find(f => f.name === name)) {
      fields.push({ name, type: 'str', pattern: '^' + m[2] + '\\\\d+$', optional: false, description: 'Identifier' });
    }
  }
  // Pattern 3: optional field markers
  const optionalRe = /\boptional\s+([a-z][a-z0-9_]*)/gi;
  const optionals = new Set();
  while ((m = optionalRe.exec(text)) !== null) optionals.add(camelToSnake(m[1]));

  // Pattern 4: known noun -> type mapping
  const nounRe = /\b(id|name|email|phone|url|count|price|amount|description|created_at|updated_at|timestamp|status|category|urgency|customer_email|account_id)\b/gi;
  while ((m = nounRe.exec(text)) !== null) {
    const noun = camelToSnake(m[1].toLowerCase());
    if (fields.find(f => f.name === noun)) continue;
    let type = 'str';
    if (/email/.test(noun)) type = 'EmailStr';
    else if (/url/.test(noun)) type = 'HttpUrl';
    else if (/count|amount|price/.test(noun)) type = 'float';
    else if (/timestamp|_at/.test(noun)) type = 'datetime';
    fields.push({ name: noun, type, optional: optionals.has(noun), description: noun.replace(/_/g, ' ') });
  }

  // Render
  if (!fields.length) {
    return '# Heuristic could not extract fields. Try: "X has: a name (string), a count (int), an optional flag (bool)."';
  }

  const className = inferClassName(text);
  let py = 'from typing import Optional, Literal\nfrom datetime import datetime\nfrom pydantic import BaseModel, Field\n\nclass ' + className + '(BaseModel):\n';
  for (const f of fields) {
    let typeStr;
    if (f.type === 'Literal' && f.literal) typeStr = 'Literal[' + f.literal.map(o => '"' + o + '"').join(', ') + ']';
    else typeStr = f.type;
    if (f.optional) typeStr = 'Optional[' + typeStr + '] = None';
    let line = '    ' + f.name + ': ' + typeStr;
    if (f.pattern) line = line + (f.optional ? '' : ' = Field(pattern=r"' + f.pattern + '", description="' + f.description + '")');
    else if (!f.optional) line = line + ' = Field(description="' + f.description + '")';
    py += line + '\n';
  }

  // JSON Schema
  const schema = {
    type: 'object',
    title: className,
    properties: {},
    required: []
  };
  for (const f of fields) {
    if (f.type === 'Literal' && f.literal) schema.properties[f.name] = { type: 'string', enum: f.literal };
    else if (f.type === 'str' || f.type === 'EmailStr' || f.type === 'HttpUrl') schema.properties[f.name] = { type: 'string', description: f.description };
    else if (f.type === 'float') schema.properties[f.name] = { type: 'number', description: f.description };
    else if (f.type === 'datetime') schema.properties[f.name] = { type: 'string', format: 'date-time', description: f.description };
    if (f.pattern) schema.properties[f.name].pattern = f.pattern;
    if (!f.optional) schema.required.push(f.name);
  }

  return '```python\n' + py + '```\n\n```json\n' + JSON.stringify(schema, null, 2) + '\n```';
}

function camelToSnake(s) { return s.replace(/[A-Z]/g, m => '_' + m.toLowerCase()).replace(/^_/, ''); }

function inferClassName(text) {
  const m = text.match(/\b(?:a|an)\s+([A-Za-z]+)\s+(?:has|with|contains)/i);
  if (m) return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
  return 'Item';
}
