// Mock interview surface. Two modes: Concept explanation, Systems design.
// Heuristic grading by default; AI grading (LLM-as-judge) when key connected.

import { el, clear, announce, lsGet, lsSet } from '../runtime.js';
import { CONCEPTS } from '../data.js';
import { conceptBySlug } from '../crossref.js';
import { aiOrFallback, hasAnyKey } from '../ai.js';

const MODES = [
  { id: 'concept', label: 'Concept explanation' },
  { id: 'systems', label: 'Systems design' }
];

// 12 systems-design prompts pulled from the course's typical territory.
const SYSTEMS_PROMPTS = [
  { id: 'rag-customer-support', title: 'RAG for customer support', body: 'Design a RAG system for a SaaS company with 50K customers. Multi-tenant. Per-tenant policy documents. Sub-second latency target. Walk through retrieval, generation, observability, cost tradeoffs.' },
  { id: 'agent-coding', title: 'Coding agent', body: 'Design an autonomous coding agent that can take a GitHub issue and produce a PR. Discuss tool surface, sandboxing, evaluation, cost guardrails.' },
  { id: 'eval-pipeline', title: 'Eval pipeline', body: 'Design an end-to-end eval pipeline for a customer-support LLM. Golden set sourcing, LLM-as-judge alignment, CI gating, drift detection.' },
  { id: 'voice-agent', title: 'Voice agent for scheduling', body: 'Design a real-time voice agent that books restaurant reservations. Latency budget, STT/TTS choices, fallback, observability.' },
  { id: 'multi-agent-research', title: 'Multi-agent research', body: 'Design a research-agent system that takes a question and produces a sourced report. Subagent boundaries, durable execution, hallucination defense.' },
  { id: 'enterprise-rag', title: 'Enterprise document RAG', body: 'Design RAG over 10M internal documents with permissions. Embedding choice, retrieval, reranking, governance, compliance.' },
  { id: 'fine-tune-vs-rag', title: 'Fine-tune vs RAG decision', body: 'Customer wants a chatbot with their domain knowledge. Walk through the build-vs-buy decision: fine-tuning vs RAG vs prompt engineering. What questions do you ask, what does the answer hinge on?' },
  { id: 'cost-optimization', title: 'Cost optimization', body: 'A production LLM app costs $50K/month at API rates. The CFO wants 50% reduction without quality loss. Design the cost-optimization plan.' },
  { id: 'hallucination-safety', title: 'Hallucination defense', body: 'Design defenses against hallucination for a medical Q&A chatbot. Architecture, eval, escalation, audit trail.' },
  { id: 'streaming-tools', title: 'Streaming with tool use', body: 'Design a chat product where the model streams responses AND uses tools mid-response. UX for tool calls, partial output, error handling.' },
  { id: 'local-first-stack', title: 'Local-first AI stack', body: 'Design a personal AI stack for a privacy-sensitive consultant. Local model serving, retrieval, agent automation, memory. What runs locally vs cloud?' },
  { id: 'ai-coding-team-rollout', title: 'Coding-tool team rollout', body: '500-engineer org wants to roll out AI coding tools. Tool selection, governance, eval, rollout sequence, success metrics.' }
];

export function renderInterview() {
  const wrap = el('article', { 'aria-labelledby': 'iv-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Career prep'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'iv-h1' }, 'Mock interview'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Two modes. Concept explanation: random concept, you explain it. Systems design: full design prompt, you sketch the architecture. Heuristic feedback by default; AI grading with a key.' +
    (hasAnyKey() ? ' AI grading available.' : '')
  ));

  // Mode tabs (roving tabindex + arrow-key navigation)
  const tabs = el('div', { class: 'settings-tablist', role: 'tablist', 'aria-label': 'Interview mode', style: 'margin: 16px 0;' });
  let activeMode = lsGet('settings', {}).interview_mode || 'concept';
  const modeStage = el('div', { role: 'tabpanel' });
  const modeButtons = [];

  function selectMode(id, focus) {
    activeMode = id;
    const settings = lsGet('settings', {});
    settings.interview_mode = id;
    lsSet('settings', settings);
    for (const btn of modeButtons) {
      const match = btn.dataset.modeId === id;
      btn.classList.toggle('is-active', match);
      btn.setAttribute('aria-selected', String(match));
      btn.setAttribute('tabindex', match ? '0' : '-1');
      if (focus && match) btn.focus();
    }
    modeStage.id = 'interview-panel-' + id;
    modeStage.setAttribute('aria-labelledby', 'interview-tab-' + id);
    renderStage();
  }

  for (const m of MODES) {
    const t = el('button', {
      class: 'settings-tab' + (m.id === activeMode ? ' is-active' : ''),
      type: 'button',
      role: 'tab',
      id: 'interview-tab-' + m.id,
      'aria-controls': 'interview-panel-' + m.id,
      'aria-selected': String(m.id === activeMode),
      tabindex: m.id === activeMode ? '0' : '-1',
      'data-mode-id': m.id
    }, m.label);
    t.addEventListener('click', () => selectMode(m.id, false));
    t.addEventListener('keydown', (e) => {
      const i = modeButtons.indexOf(t);
      if (e.key === 'ArrowRight') { e.preventDefault(); selectMode(modeButtons[(i + 1) % modeButtons.length].dataset.modeId, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); selectMode(modeButtons[(i - 1 + modeButtons.length) % modeButtons.length].dataset.modeId, true); }
      else if (e.key === 'Home') { e.preventDefault(); selectMode(modeButtons[0].dataset.modeId, true); }
      else if (e.key === 'End') { e.preventDefault(); selectMode(modeButtons[modeButtons.length - 1].dataset.modeId, true); }
    });
    modeButtons.push(t);
    tabs.appendChild(t);
  }
  modeStage.id = 'interview-panel-' + activeMode;
  modeStage.setAttribute('aria-labelledby', 'interview-tab-' + activeMode);
  wrap.appendChild(tabs);
  wrap.appendChild(modeStage);

  function renderStage() {
    clear(modeStage);
    if (activeMode === 'concept') modeStage.appendChild(renderConceptMode());
    else modeStage.appendChild(renderSystemsMode());
  }
  renderStage();

  return {
    node: wrap,
    title: 'Mock interview',
    crumbs: [{ label: 'Practice', href: '#/practice' }, { label: 'Interview' }],
    mainClass: 'no-rail'
  };
}

function renderConceptMode() {
  const sec = el('section');
  sec.appendChild(el('p', { style: 'color: var(--text-3); font-size: var(--fs-200);' }, 'Click below to draw a random concept. Explain it in your own words. We grade structure, key-term coverage, and (with a key) deep nuance.'));

  const drawBtn = el('button', { class: 'btn btn-primary', type: 'button' }, 'Draw a concept');
  const slot = el('div', { style: 'margin-top: 16px;' });
  sec.appendChild(drawBtn);
  sec.appendChild(slot);

  drawBtn.addEventListener('click', () => {
    const fleshed = CONCEPTS.filter(c => c.fleshed);
    const c = fleshed[Math.floor(Math.random() * fleshed.length)];
    renderQuestion(slot, c);
  });
  return sec;
}

function renderQuestion(slot, concept) {
  clear(slot);
  slot.appendChild(el('h2', { style: 'margin-top: 0;' }, concept.name));
  slot.appendChild(el('p', { style: 'color: var(--text-3); font-size: var(--fs-200);' }, 'Module ' + concept.module + ' · ' + (concept.subsection || '')));
  slot.appendChild(el('p', null, 'Explain ' + concept.name + ' as if to a hiring manager. Aim for ~60 seconds (~120-180 words). Cover: what it is, why it matters, when to use it, common failures.'));
  const ta = el('textarea', {
    class: 'editor-textarea',
    placeholder: 'Type your explanation...',
    rows: '10',
    style: 'width: 100%; min-height: 220px;'
  });
  slot.appendChild(ta);

  const submit = el('button', { class: 'btn btn-primary', type: 'button', style: 'margin-top: 12px;' }, 'Grade me');
  const feedbackSlot = el('div', { style: 'margin-top: 16px;' });
  slot.appendChild(submit);
  slot.appendChild(feedbackSlot);

  submit.addEventListener('click', async () => {
    submit.disabled = true;
    submit.textContent = 'Grading...';
    const text = ta.value.trim();
    const result = await gradeConceptExplanation(text, concept);
    renderFeedback(feedbackSlot, result);
    submit.disabled = false;
    submit.textContent = 'Grade me';
  });
}

async function gradeConceptExplanation(text, concept) {
  return aiOrFallback(
    async () => {
      const { aiCall } = await import('../ai.js');
      const sys = 'You are a senior AI engineering hiring manager. Grade explanations on: clarity, accuracy, structure, depth, business framing. Output JSON: {"score": 1-5, "strengths": [string], "gaps": [string], "verdict": "string"}.';
      const user = 'Concept: ' + concept.name + '\nReference definition: ' + concept.stub + '\n\nCandidate explanation:\n' + text;
      const out = await aiCall({ system: sys, messages: [{ role: 'user', content: user }], maxTokens: 600 });
      try { return JSON.parse(out); } catch { return { score: 3, strengths: [], gaps: [], verdict: out }; }
    },
    () => heuristicGrade(text, concept)
  );
}

function heuristicGrade(text, concept) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const reference = (concept.stub + ' ' + concept.name).toLowerCase().split(/[\s,.;:()\\/]+/).filter(w => w.length > 4);
  const lower = text.toLowerCase();
  const hits = reference.filter(w => lower.includes(w)).length;
  const coverage = reference.length ? hits / reference.length : 0;
  const lengthBand = words < 30 ? 'too short' : words > 400 ? 'too long' : 'good length';

  let score = 3;
  const strengths = [];
  const gaps = [];
  if (coverage > 0.5) strengths.push('Strong coverage of key terms (' + Math.round(coverage * 100) + '%).');
  else gaps.push('Light on key terms (' + Math.round(coverage * 100) + '% coverage).');
  if (words >= 80 && words <= 250) strengths.push('Length is interview-appropriate (' + words + ' words).');
  else gaps.push(lengthBand === 'too short' ? 'Too brief; aim for 100-200 words.' : 'Too long; trim to under 250 words.');
  if (/why|because|so that|matters|production/.test(lower)) strengths.push('Includes business framing.');
  else gaps.push('Missing the "why it matters" framing.');
  if (/example|e\.g\.|for instance|consider/.test(lower)) strengths.push('Includes a concrete example.');
  else gaps.push('No worked example or analogy.');
  if (/fail|trap|gotcha|risk|pitfall/.test(lower)) strengths.push('Includes failure modes.');
  else gaps.push('No failure modes called out.');

  if (strengths.length >= 4) score = 5;
  else if (strengths.length >= 3) score = 4;
  else if (strengths.length >= 2) score = 3;
  else if (strengths.length >= 1) score = 2;
  else score = 1;

  return { score, strengths, gaps, verdict: 'Heuristic grade. ' + (score >= 4 ? 'Strong explanation.' : score >= 3 ? 'Solid foundation with room to tighten.' : 'Several gaps to address before an interview.') };
}

function renderFeedback(slot, result) {
  const { value: r, source } = result;
  clear(slot);
  const card = el('div', { style: 'padding: 16px; border: 1px solid var(--border-2); border-radius: var(--radius-3); background: var(--surface-1);' });
  card.appendChild(el('div', { style: 'display: flex; align-items: baseline; gap: 12px;' }, [
    el('div', { style: 'font-size: var(--fs-600); font-weight: 600; color: var(--accent);' }, String(r.score) + ' / 5'),
    el('div', { style: 'color: var(--text-2);' }, r.verdict || ''),
    el('div', { style: 'margin-left: auto; font-size: var(--fs-100); color: var(--text-3);' }, source === 'ai' ? 'AI graded' : 'Heuristic')
  ]));
  if (r.strengths && r.strengths.length) {
    card.appendChild(el('h3', { style: 'margin: 16px 0 6px; font-size: var(--fs-200); color: var(--success);' }, 'Strengths'));
    const ul = el('ul', { style: 'margin: 0; padding-left: 20px; color: var(--text-2); font-size: var(--fs-200); line-height: 1.6;' });
    for (const s of r.strengths) ul.appendChild(el('li', null, s));
    card.appendChild(ul);
  }
  if (r.gaps && r.gaps.length) {
    card.appendChild(el('h3', { style: 'margin: 16px 0 6px; font-size: var(--fs-200); color: var(--warn);' }, 'Gaps'));
    const ul = el('ul', { style: 'margin: 0; padding-left: 20px; color: var(--text-2); font-size: var(--fs-200); line-height: 1.6;' });
    for (const s of r.gaps) ul.appendChild(el('li', null, s));
    card.appendChild(ul);
  }
  slot.appendChild(card);
}

function renderSystemsMode() {
  const sec = el('section');
  sec.appendChild(el('p', { style: 'color: var(--text-3); font-size: var(--fs-200);' }, 'Pick a systems-design prompt. Sketch your architecture in the textarea (bullet outlines work). Heuristic feedback checks structure + key concepts; AI mode grades against a senior-engineer rubric.'));

  const list = el('div', { style: 'display: grid; grid-template-columns: 1fr; gap: 8px; margin: 12px 0;' });
  for (const p of SYSTEMS_PROMPTS) {
    const b = el('button', { class: 'onboarding-option', type: 'button' });
    b.appendChild(el('div', { style: 'font-weight: 500;' }, p.title));
    b.appendChild(el('div', { style: 'font-size: var(--fs-100); color: var(--text-3); margin-top: 4px;' }, p.body));
    b.addEventListener('click', () => {
      renderSystemsPrompt(slot, p);
    });
    list.appendChild(b);
  }
  sec.appendChild(list);
  const slot = el('div');
  sec.appendChild(slot);
  return sec;
}

function renderSystemsPrompt(slot, prompt) {
  clear(slot);
  slot.appendChild(el('h2', null, prompt.title));
  slot.appendChild(el('p', null, prompt.body));
  const ta = el('textarea', {
    class: 'editor-textarea',
    placeholder: 'Sketch the architecture, decisions, tradeoffs...',
    rows: '14',
    style: 'width: 100%; min-height: 320px; margin-top: 8px;'
  });
  slot.appendChild(ta);
  const submit = el('button', { class: 'btn btn-primary', type: 'button', style: 'margin-top: 12px;' }, 'Grade my design');
  const feedbackSlot = el('div', { style: 'margin-top: 16px;' });
  slot.appendChild(submit);
  slot.appendChild(feedbackSlot);
  submit.addEventListener('click', async () => {
    submit.disabled = true;
    submit.textContent = 'Grading...';
    const text = ta.value.trim();
    const result = await gradeSystemsDesign(text, prompt);
    renderFeedback(feedbackSlot, result);
    submit.disabled = false;
    submit.textContent = 'Grade my design';
  });
}

async function gradeSystemsDesign(text, prompt) {
  return aiOrFallback(
    async () => {
      const { aiCall } = await import('../ai.js');
      const sys = 'You are a senior AI engineering hiring manager grading a systems-design answer. Evaluate: scope coverage, tradeoff fluency, eval discipline, ops awareness, business framing. Output JSON {"score": 1-5, "strengths": [string], "gaps": [string], "verdict": "string"}.';
      const user = 'Prompt: ' + prompt.title + '\n' + prompt.body + '\n\nCandidate answer:\n' + text;
      const out = await aiCall({ system: sys, messages: [{ role: 'user', content: user }], maxTokens: 800 });
      try { return JSON.parse(out); } catch { return { score: 3, strengths: [], gaps: [], verdict: out }; }
    },
    () => heuristicSystemsGrade(text, prompt)
  );
}

function heuristicSystemsGrade(text, prompt) {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const checks = [
    { label: 'Mentions retrieval / RAG', re: /retriev|rag|vector|embed|chunk/, weight: /rag|retriev/.test(prompt.body.toLowerCase()) ? 2 : 1 },
    { label: 'Mentions evals or measurement', re: /eval|metric|measure|golden|score|judge/, weight: 2 },
    { label: 'Mentions tradeoffs explicitly', re: /tradeoff|tension|cost vs|alternative|consider|either|or we could/, weight: 2 },
    { label: 'Mentions cost / latency budget', re: /cost|latenc|budget|tok\/s|throughput|p95/, weight: 1 },
    { label: 'Mentions safety / guardrails / observability', re: /guardrail|observab|monitor|prompt injection|audit|log|fallback/, weight: 1 },
    { label: 'Concrete model / vendor / framework choices', re: /claude|gpt|gemini|llama|mistral|qdrant|pinecone|langgraph|mastra|pydantic|temporal|inngest/, weight: 1 },
    { label: 'Outlined architecture (numbered or sectioned)', re: /^\s*[\d-]+[.)]\s/m, weight: 1 },
    { label: 'Length adequate (200+ words)', re: null, weight: words >= 200 ? 2 : 0 }
  ];
  const strengths = [];
  const gaps = [];
  let totalWeight = 0;
  let scored = 0;
  for (const c of checks) {
    totalWeight += c.weight;
    const hit = c.re ? c.re.test(lower) : c.weight > 0;
    if (hit) {
      scored += c.weight;
      strengths.push(c.label);
    } else {
      gaps.push(c.label);
    }
  }
  const ratio = totalWeight ? scored / totalWeight : 0;
  let score = 1;
  if (ratio >= 0.85) score = 5;
  else if (ratio >= 0.65) score = 4;
  else if (ratio >= 0.45) score = 3;
  else if (ratio >= 0.25) score = 2;
  return {
    score,
    strengths,
    gaps,
    verdict: 'Heuristic grade. ' + (score >= 4 ? 'Strong design pass.' : score >= 3 ? 'Reasonable scope; tighten the missing dimensions.' : 'Several core systems-design dimensions are uncovered.')
  };
}
