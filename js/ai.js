// AI client wrapper. Hybrid pattern: every feature should call aiOrFallback().
// If a key is connected and the call succeeds, return the AI result. Otherwise
// run the heuristic. The boundary lets every feature ship without a key first.

import { apiKeyGet, apiKeyHas, hasPassphrase, getSettings, lsGet } from './runtime.js';

export const VENDORS = ['anthropic', 'openai'];

// Default model per vendor. Users override per-call if they want.
const DEFAULT_MODELS = {
  anthropic: 'claude-haiku-4-5',
  openai: 'gpt-5.5-mini'
};

/**
 * Returns true if at least one vendor has a stored key. Does NOT decrypt.
 */
export function hasAnyKey() {
  for (const v of VENDORS) if (apiKeyHas(v)) return true;
  return false;
}

/**
 * Picks the preferred vendor based on what's configured.
 * Order: Anthropic > OpenAI.
 */
export function preferredVendor() {
  if (apiKeyHas('anthropic')) return 'anthropic';
  if (apiKeyHas('openai')) return 'openai';
  return null;
}

/**
 * High-level: try the AI version, fall back to heuristic on any failure.
 * Caller passes both an aiFn (returns Promise<string>) and a heuristicFn (sync).
 *
 * Use when the result type is text. For structured outputs, use the same shape
 * but parse JSON in the aiFn.
 */
export async function aiOrFallback(aiFn, heuristicFn, opts = {}) {
  if (!hasAnyKey() || !hasPassphrase()) return { source: 'heuristic', value: heuristicFn() };
  try {
    const value = await Promise.race([
      aiFn(),
      _timeout(opts.timeoutMs || 30_000, 'AI call timed out')
    ]);
    return { source: 'ai', value };
  } catch (err) {
    console.warn('[aise26:ai] fallback to heuristic:', err && err.message);
    return { source: 'heuristic', value: heuristicFn(), error: err && err.message };
  }
}

function _timeout(ms, msg) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));
}

/**
 * Low-level Anthropic call. Returns the assistant text.
 */
export async function callAnthropic({ system, messages, model, maxTokens = 1024 }) {
  const key = await apiKeyGet('anthropic');
  if (!key) throw new Error('No Anthropic key');
  const body = {
    model: model || DEFAULT_MODELS.anthropic,
    max_tokens: maxTokens,
    system: system || undefined,
    messages
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Anthropic ' + res.status + ': ' + (await res.text()));
  const data = await res.json();
  if (data.content && data.content.length) {
    return data.content.map(c => c.text || '').join('');
  }
  return '';
}

/**
 * Low-level OpenAI chat-completions call. Returns the assistant text.
 */
export async function callOpenAI({ system, messages, model, maxTokens = 1024 }) {
  const key = await apiKeyGet('openai');
  if (!key) throw new Error('No OpenAI key');
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: system });
  for (const m of messages) msgs.push(m);
  const body = {
    model: model || DEFAULT_MODELS.openai,
    max_tokens: maxTokens,
    messages: msgs
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + key },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('OpenAI ' + res.status + ': ' + (await res.text()));
  const data = await res.json();
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
}

/**
 * High-level: call whatever vendor is configured.
 */
export async function aiCall({ system, messages, model, maxTokens }) {
  const v = preferredVendor();
  if (!v) throw new Error('No API key configured');
  if (v === 'anthropic') return callAnthropic({ system, messages, model, maxTokens });
  if (v === 'openai') return callOpenAI({ system, messages, model, maxTokens });
  throw new Error('Unsupported vendor: ' + v);
}

window.aise26 = Object.assign(window.aise26 || {}, {
  ai: { hasAnyKey, preferredVendor, aiOrFallback, aiCall, callAnthropic, callOpenAI }
});
