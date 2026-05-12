// Topics surface: alternative discovery view that buckets the 514 concepts
// into ~25 topic clusters and renders a tag cloud sized by concept count.
// Click a topic → filtered list of concepts that match that theme.

import { CONCEPTS, MODULES } from '../data.js';
import { el, clear } from '../runtime.js';
import { getConceptState } from '../gamification.js';

// Topic definitions: each topic has a label, color hue (matching module
// hue ramp), and a list of concept-slug regex patterns or explicit slug
// inclusions. Concepts can belong to multiple topics.
const TOPICS = [
  { id: 'rag',          label: 'RAG & Retrieval',         hue: 110, match: /retrieval|rag|chunk|hybrid|reranking|bm25|hyde|rrf|cross-encoder|bi-encoder|query-expansion|graphrag|agentic-rag|advanced-rag|modular-rag|naive-rag/i },
  { id: 'embeddings',   label: 'Embeddings & Vectors',    hue: 200, match: /embedding|vector|cosine|dot-product|euclidean|mrl|hnsw|ann|ivf|diskann/i },
  { id: 'tokenization', label: 'Tokenization',            hue: 50,  match: /token|bpe|sentencepiece|tiktoken|vocabulary|tokenizer/i },
  { id: 'prompting',    label: 'Prompting Patterns',      hue: 290, match: /prompt|cot|tot|chain-of-thought|tree-of-thoughts|self-consistency|prompt-chaining|zero-shot|few-shot|negative-triggers|prompt-injection|jailbreak|instructor|pydantic|json-mode|constrained-decoding|structured-output|inverse-scaling|prompt-template|system-prompt|user-prompt|assistant-message/i },
  { id: 'agents',       label: 'Agents & MCP',            hue: 230, match: /agent|mcp|tool-use|tool-definition|orchestration|handoff|delegation|durable-execution|crewai|langgraph|langchain|llamaindex|smolagents|mastra|microsoft-agent|google-adk|claude-agent-sdk|openai-agents|pydantic-ai|subagent|react-pattern|agentic-loop|multi-agent/i },
  { id: 'voice',        label: 'Voice & Multimodal',      hue: 25,  match: /voice|tts|stt|whisper|deepgram|cartesia|elevenlabs|realtime-api|vad|streaming-inference|multimodal|vision-language|video-generation|image-generation/i },
  { id: 'local',        label: 'Local-First AI',          hue: 170, match: /ollama|vllm|sglang|tensorrt|llama-cpp|llamafile|koboldcpp|lm-studio|mac-studio|mac-mini|nvidia-rtx|multi-gpu|gguf|awq|gptq|mlx|exl2|hqq|threadripper|tinybox|local-first|local-model|local-retrieval|memory-bandwidth|vram-vs|hybrid-stack|capability-ceiling|case-for-local|case-against-local|apple-silicon|framework-desktop|project-digits|jan|gpt4all|mistral-rs|continuous-batching|pagedattention|radixattention|tensor-pipeline|fp16-bf16|int8-vs|activation-vs|localai|text-generation-webui|open-webui|anythingllm|khoj|onyx|librechat|lobechat/i },
  { id: 'pkm',          label: 'Personal Knowledge',      hue: 320, match: /obsidian|logseq|notion|roam|capacities|tana|anytype|standard-notes|heptabase|joplin|para|code-method|basb|zettelkasten|smart-notes|atomic-notes|evergreen-notes|bidirectional-links|backlinks|daily-notes|markdown-as|capture-layer|vault-layer|local-model-layer|local-retrieval-rag|agent-automation-layer|orchestration-front-end|memory-layer|capture-to-knowledge|apple-notes|drafts|google-keep|bear|day-one|reflect|mem-ai|granola|otter-ai|fireflies|limitless|personal-ai|whisper-cpp|whisperx|vosk|piper|bark|melotts|smart-connections|copilot-for-obsidian|templater|dataview|excalidraw|canvas|obsidian-sync|obsidian-publish|bases|r-localllama|hugging-face-spaces|ollama-community/i },
  { id: 'memory',       label: 'Agent Memory',            hue: 260, match: /^mem0$|^zep$|cognee|letta|langchain-memory|llamaindex-memory|memory-layer/i },
  { id: 'evals',        label: 'Evals & Observability',   hue: 350, match: /eval|golden-set|llm-as-judge|aligning|ragas|error-analysis|axial-coding|faithfulness|answer-relevancy|context-precision|beir|mteb|promptfoo|langsmith|langfuse|helicone|arize-phoenix|braintrust|inspect|hallucination|drift-detection/i },
  { id: 'deploy',       label: 'Deployment & Ops',        hue: 200, match: /inference-serving|batch-api|streaming-responses|rate-limiting|tpm-rpm|token-budgeting|cost-estimation|model-gateway|litellm|portkey|openrouter|model-routing|fallback-strategy|logging-best-practices|pii-redaction|microsoft-presidio|agent-sandboxing|kubernetes-for-llm/i },
  { id: 'finetune',     label: 'Fine-tuning',             hue: 80,  match: /fine-tuning|full-fine-tuning|peft|lora|qlora|rlhf|^dpo$|grpo|raft|synthetic-data|catastrophic-forgetting|hugging-face-trl|axolotl|unsloth/i },
  { id: 'gov',          label: 'Governance & Risk',       hue: 350, match: /eu-ai-act|gpai|provider-deployer|ai-literacy|fria|nist-ai-rmf|nist-ai-600|iso-iec-42001|aims|iso-iec-23894|colorado-ai-act|gdpr-article-22|dpia|aiia|sr-11-7|three-lines-of-defense|model-inventory|model-card|system-card|data-card|ai-bom|aws-well-architected|build-vs-buy|tco-for-ai|vendor-scorecard|vendor-lock-in|klarna-case|jpmorgan-coin|wells-fargo|walmart-4m|booking-com|kaiser-tpmg|ai-center-of-excellence|hub-and-spoke|workflow-redesign|ai-red-teaming|pyrit|mitre-atlas|owasp-llm|project-glasswing|attacker-moves-second|differential-privacy|ip-indemnification|sovereign-ai/i },
  { id: 'career',       label: 'Career & Roles',          hue: 30,  match: /ai-solutions-engineer|ai-solutions-architect|ai-engineer-chip|applied-ai-engineer|ai-native-software|ai-product-manager|ml-engineer-vs|ai-evaluation-engineer|agent-engineer|ai-red-team-security|ai-implementation|forward-deployed|chief-ai-officer|levels-fyi|built-in|ai-premium|kore1|top-lab-medians|big-four-bands|anthropic-london|hiring-manager|ai-ml-systems-design|behavioral|take-home|demo-round|mirror-pattern|ai-tinkerers|ai-engineer-world|recruiting-channels|hacker-news/i },
  { id: 'coding-ai',    label: 'AI Coding Agents',        hue: 65,  match: /claude-code|ai-coding-agent|progressive-autonomy|pair-programming|ai-as-junior|ai-as-rubber|cursor|continue-dev|cline|aider|github-copilot|copilot-workspace|windsurf|codex-cli|gemini-cli|qwen-code|opencode|^devin$|replit-agent|openai-codex|background-agent|mention-pattern|plan-then-execute|spec-driven|test-driven|diff-based-vs|codebase-indexing|review-discipline|swe-bench|terminal-bench|capability-frontier|token-cost|personal-subscription/i },
  { id: 'product',      label: 'AI Product Patterns',     hue: 125, match: /^manual$|^suggest$|^assist$|^automate$|^autonomous$|copilot-pattern|autopilot-pattern|generator-pattern|rewriter-pattern|summarizer-pattern|classifier-pattern|extractor-pattern|conversational|embedded-suggest|^agent-pattern$|search-pattern|q-a-pattern|knowledge-worker|vertical-ai|ai-as-feature|trust-building|fallback-pattern|cost-shape|model-swap|latency-budgets|streaming-as-ux|citation-and|edit-friendly|undo-regenerate/i },
  { id: 'data',         label: 'Data Engineering',        hue: 215, match: /document-processing|^ocr$|mistral-ocr|anthropic-vision|google-document|azure-document|aws-textract|tesseract|layoutlm|multimodal-extraction|entity-extraction|relation-extraction|knowledge-graph|structured-data-extraction|unstructured-io|web-scraping|firecrawl|crawl4ai|browse-ai|scrapingbee|data-labeling|dataset-versioning|data-validation|apache-spark|^dlt$|feature-stores|experiment-tracking|weights-biases|^mlflow$/i },
  { id: 'frontier',     label: 'Frontier & 2026',         hue: 290, match: /agentic-ai-growth|reasoning-models|test-time-compute|state-space|diffusion-language|multimodal-native|open-weight-catching|personal-ai-sovereignty|sovereign-ai-nation|ai-standards-convergence|productivity-paradox|ai-incident-sharing/i },
  { id: 'foundations',  label: 'Foundations',             hue: 110, match: /^large-language-model|^foundation-model$|^frontier-model$|^model-family|^open-weight-model$|^closed-weight-model$|^parameters$|^pre-training$|^post-training$|^transformer|^self-attention$|^multi-head-attention|^positional-encoding|^rope$|^kv-cache$|^mixture-of-experts|^context-window|^logits$|^softmax$|^token$|^tokenization$|^bpe$|^sentencepiece$|^tiktoken$|^vocabulary$|^tokenizer-as-pricing|^embedding$|^embedding-model$|^vector$|^cosine|^dot-product$|^euclidean|^mrl$|^inference$|^sampling$|^temperature$|^top-p$|^top-k$|^latency$|^throughput$|^quantization$/i },
  { id: 'anthropic',    label: 'Anthropic Stack',         hue: 125, match: /^agent-development-kit|claude-md|claude-skills|skill-md|progressive-disclosure|skill-design-pattern|skill-creator|^hooks$|pretooluse|plugin-marketplace|^subagents$|^plugins$|^cowork$|claude-in-excel|claude-in-chrome|claude-desktop|^anthropic-api$|prompt-caching-anthropic|batch-api-anthropic|computer-use|extended-thinking|constitutional-ai|claude-opus-sonnet/i }
];

export function renderTopics() {
  const wrap = el('article', { 'aria-labelledby': 'tp-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Discover by topic'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'tp-h1' }, 'Topics'));
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    'Concepts grouped into ' + TOPICS.length + ' themes. Concepts can belong to multiple topics. ' +
    'Sized by concept count; click any topic to see its concepts.'
  ));

  // Compute counts + completion per topic
  const enriched = TOPICS.map(t => {
    const matched = CONCEPTS.filter(c => t.match.test(c.slug));
    const completed = matched.filter(c => getConceptState(c.slug).complete).length;
    return { ...t, count: matched.length, completed, concepts: matched };
  }).filter(t => t.count > 0);
  enriched.sort((a, b) => b.count - a.count);

  // Cloud
  const maxCount = Math.max(...enriched.map(t => t.count));
  const cloud = el('div', { class: 'topics-cloud' });
  for (const t of enriched) {
    const pct = t.count / maxCount;
    // Map count to font size 14-32px
    const fontSize = 14 + pct * 18;
    const cardOpacity = 0.55 + pct * 0.45;
    const completePct = t.count ? Math.round(t.completed / t.count * 100) : 0;
    const tile = el('a', {
      class: 'topic-tile',
      href: '#/topics/' + t.id,
      style: 'font-size: ' + fontSize.toFixed(0) + 'px; --topic-hue: oklch(72% 0.14 ' + t.hue + '); opacity: ' + cardOpacity + ';',
      title: t.label + ' · ' + t.count + ' concepts · ' + completePct + '% complete'
    });
    tile.appendChild(el('span', { class: 'topic-tile-label' }, t.label));
    tile.appendChild(el('span', { class: 'topic-tile-count' }, ' · ' + t.count));
    cloud.appendChild(tile);
  }
  wrap.appendChild(cloud);

  return {
    node: wrap,
    title: 'Topics',
    crumbs: [{ label: 'Topics' }],
    mainClass: 'no-rail'
  };
}

export function renderTopic(id) {
  const t = TOPICS.find(x => x.id === id);
  if (!t) {
    const wrap = el('article', null);
    wrap.appendChild(el('h1', null, 'Topic not found'));
    wrap.appendChild(el('a', { href: '#/topics' }, '← Back to topics'));
    return { node: wrap, title: 'Topic', crumbs: [{ label: 'Topics', href: '#/topics' }, { label: 'Not found' }] };
  }

  const matched = CONCEPTS.filter(c => t.match.test(c.slug));
  const wrap = el('article', { 'aria-labelledby': 'topic-h1', class: 'fade-up' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'Topic'));
  wrap.appendChild(el('h1', { class: 'home-h1', id: 'topic-h1', style: 'color: oklch(72% 0.14 ' + t.hue + ');' }, t.label));
  const completed = matched.filter(c => getConceptState(c.slug).complete).length;
  wrap.appendChild(el('p', { style: 'color: var(--text-2);' },
    matched.length + ' concepts · ' + completed + ' complete · spans ' +
    [...new Set(matched.map(c => c.module))].length + ' modules'
  ));

  // Group by module
  const byModule = {};
  for (const c of matched) {
    if (!byModule[c.module]) byModule[c.module] = [];
    byModule[c.module].push(c);
  }
  for (const m of MODULES) {
    if (!byModule[m.n]) continue;
    const sec = el('section', { class: 'concept-section', 'data-module': String(m.n) });
    sec.appendChild(el('h2', null, 'M' + m.n + ': ' + m.title));
    const list = el('div', { class: 'module-cluster-list' });
    for (const c of byModule[m.n]) {
      const state = getConceptState(c.slug);
      list.appendChild(el('a', {
        href: '#/concept/' + c.slug,
        class: 'concept-row' + (state.complete ? ' is-complete' : ''),
        'data-module': String(c.module)
      }, [
        el('span', { class: 'tick' }, state.complete ? '✓' : ''),
        el('div', null, [
          el('p', { class: 'name' }, c.name),
          el('p', { class: 'stub' }, c.stub)
        ])
      ]));
    }
    sec.appendChild(list);
    wrap.appendChild(sec);
  }

  return {
    node: wrap,
    title: t.label,
    crumbs: [{ label: 'Topics', href: '#/topics' }, { label: t.label }],
    mainClass: 'no-rail'
  };
}

window.aise26 = Object.assign(window.aise26 || {}, { TOPICS });
