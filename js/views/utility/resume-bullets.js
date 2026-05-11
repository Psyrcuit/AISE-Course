// Resume bullet generator. Pulls from completed modules + saved concepts.
// Heuristic emits templated bullets; AI mode polishes them into strong copy.

import { el, clear, getSettings, lsGet, lsSet, announce } from '../../runtime.js';
import { CONCEPTS, MODULES } from '../../data.js';
import { getConceptState, getSaved } from '../../gamification.js';
import { conceptsForModule } from '../../crossref.js';
import { aiOrFallback, hasAnyKey } from '../../ai.js';
import { copyToClipboard } from '../../copy.js';

const TEMPLATES = [
  { theme: 'rag', when: ['retrieval-augmented-generation-rag', 'advanced-rag', 'hybrid-search'],
    bullet: 'Designed and shipped a retrieval-augmented generation pipeline ({CONCEPTS}) that improved answer quality by X% on a Y-document corpus.' },
  { theme: 'agents', when: ['ai-agent', 'mcp', 'tool-use', 'durable-execution'],
    bullet: 'Built {CONCEPTS}-based autonomous agents handling N tasks/day with sub-X% failure; durable-execution backbone for crash recovery.' },
  { theme: 'evals', when: ['evaluation-eval', 'golden-set', 'llm-as-judge', 'faithfulness'],
    bullet: 'Established {CONCEPTS} eval pipeline that became the merge gate; reduced regression escapes by Y% over Q1.' },
  { theme: 'prompts', when: ['prompt-caching', 'structured-output', 'pydantic', 'instructor'],
    bullet: 'Optimized production prompts using {CONCEPTS}, reducing per-call latency by Xms and monthly LLM spend by Y%.' },
  { theme: 'gov', when: ['eu-ai-act', 'iso-iec-42001', 'nist-ai-rmf', 'sr-11-7'],
    bullet: 'Led AI governance program aligned to {CONCEPTS}; prepared organization for ISO 42001 audit / EU AI Act compliance.' },
  { theme: 'voice', when: ['voice-agent-architecture', 'cartesia', 'deepgram', 'realtime-api'],
    bullet: 'Engineered real-time voice agents using {CONCEPTS} stack with sub-800ms round-trip; deployed to N concurrent sessions.' },
  { theme: 'local', when: ['ollama', 'vllm', 'mac-studio-m3-ultra-512gb', 'qlora'],
    bullet: 'Stood up local-first AI infrastructure with {CONCEPTS}; cut cloud LLM spend by X% on bulk workloads.' },
  { theme: 'fine-tune', when: ['fine-tuning', 'lora', 'qlora', 'dpo'],
    bullet: 'Fine-tuned domain models using {CONCEPTS}; improved task accuracy from X% to Y% at Z× lower per-call cost.' }
];

export function renderResumeBullets() {
  const wrap = el('article', { 'aria-labelledby': 'rb-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Toolkit · Career'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'rb-h1' }, 'Resume bullets'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Inputs: your completed modules, saved concepts, profile goal. ' +
    'Heuristic produces templated bullets with placeholders to fill in (X%, Y count, ...); AI mode polishes them into ready-to-paste copy.'
  ));

  const stage = el('div', { style: 'margin-top: 16px;' });
  wrap.appendChild(stage);

  function render() {
    clear(stage);
    const settings = getSettings();
    const completedSlugs = CONCEPTS.filter(c => getConceptState(c.slug).complete).map(c => c.slug);
    const saved = getSaved();
    const themeHits = TEMPLATES.filter(t => t.when.some(s => completedSlugs.includes(s) || saved.includes(s)));

    if (themeHits.length === 0) {
      stage.appendChild(el('section', { class: 'context-card' }, [
        el('h3', null, 'Not enough activity yet.'),
        el('p', null, 'Mark concepts complete on at least one of: RAG, agents, evals, prompts, governance, voice, local AI, or fine-tuning. Then return for templated bullets.')
      ]));
      return;
    }

    const bulletsList = themeHits.map(t => {
      const conceptNames = t.when
        .map(s => CONCEPTS.find(c => c.slug === s))
        .filter(c => c && (completedSlugs.includes(c.slug) || saved.includes(c.slug)))
        .map(c => c.name);
      return t.bullet.replace('{CONCEPTS}', conceptNames.slice(0, 3).join(', ') || 'core concepts');
    });

    const text = bulletsList.map(b => '- ' + b).join('\n');

    const block = el('section', { class: 'context-card' });
    block.appendChild(el('h3', null, 'Heuristic bullets (template + your activity)'));
    block.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3);' }, 'Placeholders to fill: X%, Y count, dates, scope. Edit before pasting into a real resume.'));
    const ta = el('textarea', { class: 'editor-textarea', rows: '10', style: 'width: 100%; font-family: var(--font-mono); font-size: var(--fs-200);' });
    ta.value = text;
    block.appendChild(ta);
    block.appendChild(el('div', { style: 'display: flex; gap: 8px; margin-top: 8px;' }, [
      _btn('Copy', () => { copyToClipboard(ta.value); announce('Bullets copied.'); }),
      _btn('Polish with AI', polish)
    ]));
    stage.appendChild(block);

    async function polish() {
      if (!hasAnyKey()) {
        announce('Set an API key in Settings to polish.');
        return;
      }
      ta.disabled = true;
      const out = await aiOrFallback(
        async () => {
          const { aiCall } = await import('../../ai.js');
          const sys = 'You are a senior AI engineering resume coach. Polish the user\'s bullet drafts: tighten language, replace placeholders with realistic numbers when context allows, lead with verbs, quantify impact, drop fluff. Return ONLY the bullets, one per line, prefixed with "- ". Keep the count the same.';
          return await aiCall({ system: sys, messages: [{ role: 'user', content: 'Profile goal: ' + (settings.profile?.goal || 'AI engineering role') + '\nDrafts:\n' + ta.value }], maxTokens: 800 });
        },
        () => ta.value
      );
      ta.disabled = false;
      ta.value = out.value;
      announce(out.source === 'ai' ? 'AI polished.' : 'Heuristic kept (no AI key).');
    }
  }

  render();

  return {
    node: wrap,
    title: 'Resume bullets',
    crumbs: [{ label: 'Toolkit', href: '#/toolkit' }, { label: 'Resume bullets' }],
    mainClass: 'no-rail'
  };
}

function _btn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}
