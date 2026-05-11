// Shared rule-based scoring helpers for prompt linter, system-prompt analyzer,
// and other heuristic-default utilities.

/**
 * Score an arbitrary prompt against an 8-rubric checklist.
 * Returns { score 0-100, dimensions: {...}, suggestions: [...] }.
 */
export function lintPrompt(text) {
  const t = String(text || '');
  const lower = t.toLowerCase();
  const lines = t.split('\n');
  const words = t.split(/\s+/).filter(Boolean).length;

  const rubric = [
    {
      key: 'clarity',
      label: 'Clarity of intent',
      ok: words >= 10 && /\b(write|generate|return|output|produce|classify|extract|summariz|explain|design|critique)\b/i.test(t),
      pass: 'Verb directs the model to a specific outcome.',
      fail: 'Lead with a directive verb (write, classify, extract, design...).'
    },
    {
      key: 'output_format',
      label: 'Output format specified',
      ok: /(json|yaml|markdown|list|table|bullet|csv|xml|format:|return only|respond with)/i.test(t),
      pass: 'Explicit output format described.',
      fail: 'Specify the output shape (JSON / list / single-word answer / etc.).'
    },
    {
      key: 'role_or_persona',
      label: 'Role or persona set',
      ok: /(you are|act as|behave as|expert in|specialized|senior|consultant|engineer)/i.test(t),
      pass: 'Persona / role is set.',
      fail: 'Add a role: "You are a senior X engineer..." or similar grounding.'
    },
    {
      key: 'examples',
      label: 'Examples or schema',
      ok: /(example|e\.g\.|for instance|sample|here is one|<example>|input:.*output:)/i.test(t),
      pass: 'Includes at least one example.',
      fail: 'Few-shot example(s) help with non-obvious formats.'
    },
    {
      key: 'negative_triggers',
      label: 'Negative triggers (Do NOT)',
      ok: /(do not|don't|never|avoid|refuse|do NOT use for)/i.test(t),
      pass: 'Includes "do not" guidance.',
      fail: 'Add explicit negative triggers: what NOT to do / when NOT to invoke.'
    },
    {
      key: 'context_separation',
      label: 'Context vs instructions separated',
      ok: /(<context>|<input>|<document>|---|\bgiven the following\b|\binstruction:|\binput:)/i.test(t),
      pass: 'Delimiters separate untrusted content from instructions.',
      fail: 'Use delimiters (XML tags, ---, fenced blocks) to separate content from instructions.'
    },
    {
      key: 'length',
      label: 'Length appropriate',
      ok: words >= 30 && words <= 800,
      pass: 'Length is in the practical range.',
      fail: words < 30 ? 'Too brief; may underspecify.' : 'Too long; tighten and rely on tools or chains.'
    },
    {
      key: 'tools_or_constraints',
      label: 'Constraints / boundaries',
      ok: /(under \d|less than|max_tokens|word limit|in 60 seconds|only|exactly|must)/i.test(t),
      pass: 'Includes constraints (length, choice, etc.).',
      fail: 'Add explicit constraints (max length, forbidden values, exact format).'
    }
  ];

  const passed = rubric.filter(r => r.ok).length;
  const score = Math.round((passed / rubric.length) * 100);
  const suggestions = rubric.filter(r => !r.ok).map(r => r.label + ': ' + r.fail);

  return {
    score,
    passed,
    total: rubric.length,
    dimensions: rubric.map(r => ({ key: r.key, label: r.label, ok: r.ok, note: r.ok ? r.pass : r.fail })),
    suggestions
  };
}

/**
 * Analyze a system prompt against best-practice checklist.
 */
export function analyzeSystemPrompt(text) {
  const t = String(text || '');
  const lines = t.split('\n');
  const words = t.split(/\s+/).filter(Boolean).length;
  const firstLine = (lines[0] || '').trim();
  const lower = t.toLowerCase();

  const checks = [
    { label: 'Critical rule leads', ok: firstLine.length > 12 && /(must|never|always|do not|primary|role:|you are)/i.test(firstLine) },
    { label: 'Identity / role set', ok: /(you are|act as|behave as|specialized|expert in)/i.test(t) },
    { label: 'Capability inventory', ok: /(can|may|use|have access|tools? available|can call)/i.test(t) },
    { label: 'Negative triggers (Do NOT)', ok: /(do not|don't|never|refuse|reject|do NOT)/i.test(t) },
    { label: 'Output format declared', ok: /(json|markdown|format|return only|output)/i.test(t) },
    { label: 'Edge case / failure handling', ok: /(if not|when no|unable|cannot|fallback|edge case|escalate|do not know)/i.test(t) },
    { label: 'Length 50-800 words', ok: words >= 50 && words <= 800 },
    { label: 'No filler praise / "let me explain"', ok: !/(\blet me explain\b|\bi'll be happy to\b|\bi'd love to\b)/i.test(t) }
  ];
  const passed = checks.filter(c => c.ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
    checks,
    notes: passed === checks.length ? ['Tight system prompt.'] : checks.filter(c => !c.ok).map(c => 'Address: ' + c.label)
  };
}

/**
 * Cost forecast for a typical usage shape. All tokens in millions.
 */
export function estimateMonthlyCost({
  inputTokensPerCall,
  outputTokensPerCall,
  callsPerUserPerDay,
  users,
  daysPerMonth = 30,
  pricePerMInput = 3,
  pricePerMOutput = 15,
  cacheHitPct = 0,
  cachedReadDiscountPct = 90,        // Anthropic cache reads cost 10% of normal
  batchPct = 0,
  batchDiscountPct = 50
}) {
  const totalInput = inputTokensPerCall * callsPerUserPerDay * users * daysPerMonth;
  const totalOutput = outputTokensPerCall * callsPerUserPerDay * users * daysPerMonth;
  const cachedInput = totalInput * (cacheHitPct / 100);
  const uncachedInput = totalInput - cachedInput;
  const batchedInput = uncachedInput * (batchPct / 100);
  const realtimeInput = uncachedInput - batchedInput;
  const batchedOutput = totalOutput * (batchPct / 100);
  const realtimeOutput = totalOutput - batchedOutput;
  const inputCost = (realtimeInput / 1_000_000) * pricePerMInput
                    + (batchedInput / 1_000_000) * pricePerMInput * (1 - batchDiscountPct / 100)
                    + (cachedInput / 1_000_000) * pricePerMInput * (1 - cachedReadDiscountPct / 100);
  const outputCost = (realtimeOutput / 1_000_000) * pricePerMOutput
                     + (batchedOutput / 1_000_000) * pricePerMOutput * (1 - batchDiscountPct / 100);
  return {
    monthly: inputCost + outputCost,
    inputCost,
    outputCost,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    breakdown: {
      cachedInput,
      uncachedInput,
      batchedInput,
      realtimeInput,
      batchedOutput,
      realtimeOutput
    }
  };
}

window.aise26 = Object.assign(window.aise26 || {}, { heuristics: { lintPrompt, analyzeSystemPrompt, estimateMonthlyCost } });
