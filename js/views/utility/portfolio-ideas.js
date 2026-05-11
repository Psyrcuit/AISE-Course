// Portfolio project idea generator. Heuristic from completed modules + interests;
// AI mode produces tailored project specs with scope.

import { el, clear, getSettings } from '../../runtime.js';
import { CONCEPTS, MODULES } from '../../data.js';
import { conceptsForModule } from '../../crossref.js';
import { getConceptState, getSaved } from '../../gamification.js';
import { aiOrFallback, hasAnyKey } from '../../ai.js';
import { copyToClipboard } from '../../copy.js';

const IDEAS = [
  { theme: 'rag', title: 'Domain-specific RAG over public docs', scope: '2-3 weekend builds. Pick a small public corpus (kubernetes docs, FastAPI guide). Build retrieval + answer with citations. Deploy to a public URL. Add a small eval set; instrument cost.' },
  { theme: 'agents', title: 'Personal automation agent', scope: '~1 week. Use Claude Agent SDK or Mastra. Pick one daily friction (email triage, calendar prep, repo housekeeping). Ship it for yourself; demo on Twitter.' },
  { theme: 'evals', title: 'Open-source eval harness for a real product', scope: '~2 weeks. Pick an open-source LLM-using project (Continue, OpenWebUI). Build a 50-question golden set, LLM-as-judge alignment, CI gating. Open a PR.' },
  { theme: 'prompts', title: 'Prompt-engineering case study writeup', scope: '~1 week. Pick a non-trivial task (resume polishing, structured extraction, translation). A/B test 5 prompt variants with Promptfoo. Write a blog post with traces.' },
  { theme: 'voice', title: 'Voice agent for a niche', scope: '~1 week. Cartesia + Deepgram + Claude. Pick a niche (booking lessons, restaurant recs). Sub-800ms round-trip. Demo with audio.' },
  { theme: 'local', title: 'Personal RAG over your notes', scope: '~1 week. Ollama + AnythingLLM (or build it). Index your Obsidian vault. Ship as a Mac/Win desktop demo.' },
  { theme: 'multimodal', title: 'Document parsing + extraction product', scope: '~2 weeks. Mistral OCR + Claude vision over invoices / contracts. Output structured JSON with Pydantic. Public demo with sample uploads.' },
  { theme: 'fine-tune', title: 'Fine-tune a small model for a deterministic task', scope: '~1 week. QLoRA on Llama 3 8B. Pick a specific extraction or classification. Beat zero-shot frontier on cost-per-task; document.' },
  { theme: 'agents-swe', title: 'Coding agent for a niche language / framework', scope: '~2 weeks. Claude Code or build with Agent SDK. Pick a non-Python language (Elixir, Zig). Sandboxed, eval-gated, demo on real bugs.' },
  { theme: 'observability', title: 'LLM observability dashboard', scope: '~1 week. Helicone or Langfuse on your favorite open-source LLM project. Public dashboard with traces, costs, latencies.' }
];

export function renderPortfolioIdeas() {
  const wrap = el('article', { 'aria-labelledby': 'pi-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Career'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'pi-h1' }, 'Portfolio project ideas'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    '5 buildable projects scoped to your completed modules + saved concepts. Each idea includes a rough timebox.'
  ));

  const stage = el('div', { style: 'margin-top: 16px;' });
  wrap.appendChild(stage);

  function render() {
    clear(stage);
    const settings = getSettings();
    const completed = CONCEPTS.filter(c => getConceptState(c.slug).complete).map(c => c.slug);
    const saved = getSaved();

    // Score themes by activity
    const themeScores = {};
    for (const idea of IDEAS) themeScores[idea.theme] = 0;
    for (const c of CONCEPTS) {
      const isComplete = completed.includes(c.slug);
      const isSaved = saved.includes(c.slug);
      if (!isComplete && !isSaved) continue;
      const score = isComplete ? 2 : 1;
      if (/rag|retriev|chunk|hybrid/.test(c.slug)) themeScores.rag += score;
      else if (/agent|mcp|tool-use|durable/.test(c.slug)) themeScores.agents += score;
      else if (/eval|golden|llm-as-judge|faithful/.test(c.slug)) themeScores.evals += score;
      else if (/prompt-cach|structured|pydantic|instructor/.test(c.slug)) themeScores.prompts += score;
      else if (/voice|cartesia|deepgram|realtime/.test(c.slug)) themeScores.voice += score;
      else if (/ollama|vllm|mac-studio|qlora/.test(c.slug)) themeScores.local += score;
      else if (/multimodal|ocr|extraction|vlm/.test(c.slug)) themeScores.multimodal += score;
      else if (/fine-tun|lora|dpo|grpo/.test(c.slug)) themeScores['fine-tune'] += score;
      else if (/cursor|claude-code|aider|copilot/.test(c.slug)) themeScores['agents-swe'] += score;
      else if (/observ|langfuse|helicone|braintrust/.test(c.slug)) themeScores.observability += score;
    }

    const ranked = [...IDEAS].sort((a, b) => themeScores[b.theme] - themeScores[a.theme]).slice(0, 5);

    const list = el('div', { style: 'display: grid; grid-template-columns: 1fr; gap: 12px;' });
    for (const idea of ranked) {
      const score = themeScores[idea.theme];
      list.appendChild(el('div', { class: 'practice-card' }, [
        el('div', { class: 'practice-card-eyebrow' }, idea.theme.toUpperCase() + (score > 0 ? ' · ' + score + ' related concepts' : '')),
        el('div', { class: 'practice-card-headline' }, idea.title),
        el('p', { class: 'practice-card-desc' }, idea.scope),
        el('div', { style: 'display: flex; gap: 6px;' }, [
          _btn('Copy idea', () => { copyToClipboard(idea.title + '\n' + idea.scope); }),
          _btn('Tailor with AI', () => tailor(idea))
        ])
      ]));
    }
    stage.appendChild(list);

    const out = el('div', { style: 'margin-top: 16px;' });
    stage.appendChild(out);

    async function tailor(idea) {
      clear(out);
      const block = el('section', { class: 'context-card' });
      block.appendChild(el('h3', null, idea.title + ' - tailored'));
      block.appendChild(el('p', { style: 'color: var(--text-3);' }, hasAnyKey() ? 'Asking AI...' : 'Heuristic mode (no API key).'));
      out.appendChild(block);
      const result = await aiOrFallback(
        async () => {
          const { aiCall } = await import('../../ai.js');
          const sys = 'You are a senior AI engineering portfolio coach. Given a project theme + the user\'s background, produce a one-paragraph tailored scope (~120 words): goals, tech stack, success criteria, public-demo plan. Realistic for a working engineer\'s evenings/weekends.';
          const user = 'Goal: ' + (settings.profile?.goal || 'AI engineering role') +
                       '\nLevel: ' + (settings.profile?.level || 'intermediate') +
                       '\nBase idea: ' + idea.title + ' - ' + idea.scope;
          return await aiCall({ system: sys, messages: [{ role: 'user', content: user }], maxTokens: 500 });
        },
        () => idea.scope + '\n\n(With an API key, this becomes a tailored paragraph based on your profile.)'
      );
      clear(block);
      block.appendChild(el('h3', null, idea.title + ' - tailored'));
      block.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, result.source === 'ai' ? 'AI tailored' : 'Heuristic'));
      block.appendChild(el('p', null, result.value));
    }
  }

  render();

  return {
    node: wrap,
    title: 'Portfolio ideas',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'Portfolio ideas' }],
    mainClass: 'no-rail'
  };
}

function _btn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}
