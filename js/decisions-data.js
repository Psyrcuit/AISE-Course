// Auto-extracted from course.html.legacy by build/extract.mjs.
// Do not edit by hand. Re-run the script to refresh.

export const DECISIONS = {
      'rag-vs-finetune-vs-prompt': {
        slug: 'rag-vs-finetune-vs-prompt',
        title: 'RAG vs Fine-tuning vs Prompt Engineering',
        intro: 'Pick the technique that matches your problem. Most teams default to one of the three; the wrong default costs months. Answer the questions; the recommendations recompute live.',
        conceptsTouched: ['retrieval-augmented-generation-rag', 'fine-tuning', 'context-engineering'],
        inputs: [
          { key: 'freshness', label: 'How often does your knowledge change?', kind: 'radio', options: [
            { value: 'static',    label: 'Rarely. The corpus is frozen for months.' },
            { value: 'monthly',   label: 'Monthly cadence; planned updates.' },
            { value: 'realtime',  label: 'Daily or live. Knowledge changes constantly.' }
          ], default: 'monthly' },
          { key: 'domain', label: 'How specialized is the language and reasoning?', kind: 'radio', options: [
            { value: 'general',   label: 'General domain. A frontier model already understands it.' },
            { value: 'mid',       label: 'Mid-specialized. Vocabulary or jargon, but standard reasoning.' },
            { value: 'narrow',    label: 'Highly narrow. Custom vocabulary, custom reasoning steps.' }
          ], default: 'mid' },
          { key: 'latency', label: 'What latency budget?', kind: 'radio', options: [
            { value: 'tight',     label: 'Tight. Sub-second p95 required.' },
            { value: 'normal',    label: 'Normal. 1-3 seconds is fine.' },
            { value: 'loose',     label: 'Loose. 5+ seconds is acceptable.' }
          ], default: 'normal' },
          { key: 'team', label: 'What is your team size?', kind: 'radio', options: [
            { value: 'solo',      label: 'Solo or 2-3 engineers.' },
            { value: 'small',     label: '4-10 engineers including ML expertise.' },
            { value: 'large',     label: '10+ engineers with dedicated ML ops.' }
          ], default: 'solo' },
          { key: 'volume', label: 'What is your data volume?', kind: 'radio', options: [
            { value: 'small',     label: 'Under 100K examples.' },
            { value: 'medium',    label: '100K to 1M.' },
            { value: 'large',     label: 'Over 1M, refreshes often.' }
          ], default: 'small' }
        ],
        score: (s) => {
          // Returns ranked list of {option, score, rationale}.
          let ragScore = 50;
          let ftScore  = 50;
          let peScore  = 50;

          // Freshness: RAG handles fresh data; fine-tuning struggles.
          if (s.freshness === 'realtime') { ragScore += 30; ftScore -= 20; }
          if (s.freshness === 'monthly')  { ragScore += 10; }
          if (s.freshness === 'static')   { ftScore += 5; peScore += 5; }

          // Domain: narrow domains often need fine-tuning.
          if (s.domain === 'narrow') { ftScore += 25; peScore -= 10; }
          if (s.domain === 'mid')    { ragScore += 10; }
          if (s.domain === 'general'){ peScore += 15; }

          // Latency: prompt engineering and fine-tuning are fastest at inference.
          if (s.latency === 'tight') { ftScore += 15; peScore += 10; ragScore -= 10; }

          // Team size: fine-tuning needs ML expertise.
          if (s.team === 'solo')   { peScore += 15; ragScore += 10; ftScore -= 20; }
          if (s.team === 'large')  { ftScore += 15; }

          // Volume: large data improves fine-tuning.
          if (s.volume === 'large')  { ftScore += 15; }
          if (s.volume === 'small')  { peScore += 10; ragScore += 5; ftScore -= 15; }

          // Build rationale strings
          const items = [
            { option: 'Prompt engineering', score: peScore, slug: 'context-engineering', rationale: 'Cheapest path. Best when the model already understands your domain and you can iterate on the prompt without changing weights or pipelines.' },
            { option: 'RAG (Retrieval-Augmented Generation)', score: ragScore, slug: 'retrieval-augmented-generation-rag', rationale: 'Best when knowledge changes faster than you can fine-tune. Adds infrastructure (embeddings, vector DB, retrieval) but keeps the source of truth outside the model.' },
            { option: 'Fine-tuning', score: ftScore, slug: 'fine-tuning', rationale: 'Highest leverage when the domain is narrow, latency is tight, and you can amortize ML team cost. Slow to update, costly to maintain.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      'agent-framework': {
        slug: 'agent-framework',
        title: 'Agent framework selection',
        intro: 'LangGraph, CrewAI, Pydantic AI, Mastra, Claude Agent SDK, OpenAI Agents SDK, and others all want to be your agent runtime. Match the framework to the constraints you actually have, not the marketing site.',
        conceptsTouched: ['langgraph', 'claude-agent-sdk', 'crewai', 'pydantic-ai', 'mastra'],
        inputs: [
          { key: 'lang', label: 'What language do you want to write the agent in?', kind: 'radio', options: [
            { value: 'python',     label: 'Python.' },
            { value: 'typescript', label: 'TypeScript / JavaScript.' },
            { value: 'either',     label: 'Either; pick what fits the framework best.' }
          ], default: 'python' },
          { key: 'durability', label: 'Do agents need to survive crashes or take days?', kind: 'radio', options: [
            { value: 'no',         label: 'No. Each agent run finishes within a single request.' },
            { value: 'maybe',      label: 'Sometimes. A few minutes is fine; days is too long.' },
            { value: 'yes',        label: 'Yes. Agents may run for hours/days, restart, retry.' }
          ], default: 'no' },
          { key: 'arch', label: 'Single agent or multi-agent system?', kind: 'radio', options: [
            { value: 'single',     label: 'Single agent with tools.' },
            { value: 'multi',      label: 'Multiple specialists with handoffs.' },
            { value: 'graph',      label: 'Complex DAG with conditional routing.' }
          ], default: 'single' },
          { key: 'familiarity', label: 'How familiar is your team with agent frameworks?', kind: 'radio', options: [
            { value: 'new',        label: 'New to agents. Want a low-ceremony framework.' },
            { value: 'mid',        label: 'Some experience. Comfortable with abstractions.' },
            { value: 'expert',     label: 'Expert. Want the most flexible primitive.' }
          ], default: 'mid' }
        ],
        score: (s) => {
          let langGraph = 50, crewAI = 50, pydanticAI = 50, mastra = 50, claudeSdk = 50, openaiSdk = 50, smolagents = 50;

          if (s.lang === 'python')     { langGraph += 10; crewAI += 10; pydanticAI += 10; smolagents += 10; mastra -= 30; }
          if (s.lang === 'typescript') { mastra += 25; claudeSdk += 5; openaiSdk += 5; langGraph -= 15; pydanticAI -= 25; }

          if (s.durability === 'yes')   { langGraph += 25; smolagents -= 10; crewAI -= 10; }
          if (s.durability === 'maybe') { langGraph += 10; }

          if (s.arch === 'single')      { pydanticAI += 15; claudeSdk += 10; smolagents += 10; }
          if (s.arch === 'multi')       { crewAI += 20; openaiSdk += 15; claudeSdk += 5; }
          if (s.arch === 'graph')       { langGraph += 25; }

          if (s.familiarity === 'new')  { crewAI += 15; pydanticAI += 10; smolagents += 10; langGraph -= 15; }
          if (s.familiarity === 'expert') { langGraph += 15; smolagents += 10; }

          const items = [
            { option: 'LangGraph', score: langGraph, slug: 'langgraph', rationale: 'Graph-based, durable execution; the heaviest framework but the most powerful. Best when agents run long, branch on state, and require reliability.' },
            { option: 'CrewAI', score: crewAI, slug: 'crewai', rationale: 'Role-based, fastest to scaffold a multi-agent flow. Best when you want a small team of specialists hand-off work.' },
            { option: 'Pydantic AI', score: pydanticAI, slug: 'pydantic-ai', rationale: 'Type-safe Python, simple API. Best for single agents with strong return-type guarantees.' },
            { option: 'Mastra', score: mastra, slug: 'mastra', rationale: 'TypeScript-first; Vercel-aligned. Best when your stack is JS/TS and you want first-class agent primitives in Node.' },
            { option: 'Claude Agent SDK', score: claudeSdk, slug: 'claude-agent-sdk', rationale: 'Anthropic-native. Best when you are tightly coupled to Claude and want first-party support.' },
            { option: 'OpenAI Agents SDK', score: openaiSdk, slug: 'openai-agents-sdk', rationale: 'Handoff-based; replaced Swarm. Best for multi-agent systems on OpenAI infrastructure.' },
            { option: 'Smolagents', score: smolagents, slug: 'smolagents', rationale: 'Code-driven, minimal Hugging Face framework. Best when you want the agent to write and execute Python directly.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      'vector-db': {
        slug: 'vector-db',
        title: 'Vector database selection',
        intro: 'Pinecone, Weaviate, Qdrant, Chroma, LanceDB, Milvus, pgvector. The right pick depends on scale, filtering needs, and how much infra you want to operate.',
        conceptsTouched: ['vector-database', 'hnsw', 'hybrid-search', 'pgvector'],
        inputs: [
          { key: 'scale', label: 'How many vectors at peak?', kind: 'radio', options: [
            { value: 'small',  label: 'Under 1M vectors.' },
            { value: 'medium', label: '1M to 100M.' },
            { value: 'large',  label: 'Over 100M.' }
          ], default: 'small' },
          { key: 'filter', label: 'Do you need rich metadata filtering?', kind: 'radio', options: [
            { value: 'no',     label: 'No. Vector similarity is enough.' },
            { value: 'some',   label: 'Some. Tag-based filters at query time.' },
            { value: 'heavy',  label: 'Heavy. Combine vector with structured queries.' }
          ], default: 'some' },
          { key: 'hosting', label: 'Hosting preference?', kind: 'radio', options: [
            { value: 'managed',  label: 'Managed SaaS. Pay to not run it.' },
            { value: 'selfhost', label: 'Self-host on our cluster.' },
            { value: 'embed',    label: 'Embedded with the app, no separate service.' }
          ], default: 'managed' },
          { key: 'hybrid', label: 'Need hybrid search (vector + keyword)?', kind: 'radio', options: [
            { value: 'yes', label: 'Yes. BM25 + vector improves quality.' },
            { value: 'no',  label: 'No. Pure vector is fine.' }
          ], default: 'yes' },
          { key: 'pg', label: 'Already running Postgres?', kind: 'radio', options: [
            { value: 'yes', label: 'Yes. We can extend it.' },
            { value: 'no',  label: 'No.' }
          ], default: 'yes' }
        ],
        score: (s) => {
          let pinecone = 50, weaviate = 50, qdrant = 50, chroma = 50, lancedb = 50, milvus = 50, pgvector = 50;

          if (s.scale === 'small')  { chroma += 20; lancedb += 15; pgvector += 10; milvus -= 15; }
          if (s.scale === 'medium') { qdrant += 15; weaviate += 10; pinecone += 10; }
          if (s.scale === 'large')  { milvus += 20; pinecone += 15; qdrant += 10; chroma -= 20; lancedb -= 10; pgvector -= 15; }

          if (s.filter === 'heavy') { qdrant += 20; weaviate += 15; pgvector += 15; chroma -= 5; }
          if (s.filter === 'no')    { lancedb += 5; }

          if (s.hosting === 'managed')  { pinecone += 20; weaviate += 5; qdrant += 5; }
          if (s.hosting === 'selfhost') { qdrant += 15; weaviate += 15; milvus += 15; pgvector += 10; pinecone -= 25; }
          if (s.hosting === 'embed')    { chroma += 25; lancedb += 25; pinecone -= 30; pgvector -= 10; }

          if (s.hybrid === 'yes') { weaviate += 15; qdrant += 10; pgvector += 10; lancedb += 5; chroma -= 5; }

          if (s.pg === 'yes') { pgvector += 25; }
          if (s.pg === 'no')  { pgvector -= 15; }

          const items = [
            { option: 'Pinecone', score: pinecone, slug: 'pinecone', rationale: 'Managed, scales out cleanly, the path of least resistance for production teams that want to skip ops.' },
            { option: 'Weaviate', score: weaviate, slug: 'weaviate', rationale: 'Open-source with built-in modules, hybrid search, and rich filtering. Strongest balanced pick for self-hosted production.' },
            { option: 'Qdrant', score: qdrant, slug: 'qdrant', rationale: 'Rust-based, fast, strong filtering. Best when you want self-host with rich metadata queries.' },
            { option: 'Chroma', score: chroma, slug: 'chroma', rationale: 'Lightweight Python-native, perfect for prototyping and small-scale apps. Drops off above ~10M vectors.' },
            { option: 'LanceDB', score: lancedb, slug: 'lancedb', rationale: 'Embedded multimodal vector DB. Best when you want one-process simplicity with analytical queries.' },
            { option: 'Milvus', score: milvus, slug: 'milvus', rationale: 'Distributed, billion-scale, the heaviest pick. Best when you have a dedicated platform team and 100M+ vectors.' },
            { option: 'pgvector', score: pgvector, slug: 'pgvector', rationale: 'A Postgres extension. Best when you already run Postgres and the scale is moderate; "use what you have."' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      'model-tier-selection': {
        slug: 'model-tier-selection',
        title: 'Model tier selection',
        intro: 'Pick the right model tier for the task. Defaulting to frontier costs 5-30x more than necessary on routine work; under-spec\'ing degrades quality on hard tasks.',
        conceptsTouched: ['claude-opus-sonnet-haiku', 'frontier-model', 'reasoning-models', 'model-routing', 'cost-estimation'],
        inputs: [
          { key: 'task_complexity', label: 'How complex is the task?', kind: 'radio', options: [
            { value: 'simple', label: 'Simple. Classification, routing, lookup, format conversion.' },
            { value: 'medium', label: 'Medium. Drafting, summarization, multi-turn chat, tool use.' },
            { value: 'hard', label: 'Hard. Multi-step reasoning, complex coding, agentic flows.' }
          ], default: 'medium' },
          { key: 'volume', label: 'What is your traffic volume?', kind: 'radio', options: [
            { value: 'low', label: 'Low. Under 1K calls/day.' },
            { value: 'medium', label: 'Medium. 1K-100K calls/day.' },
            { value: 'high', label: 'High. 100K+ calls/day.' }
          ], default: 'medium' },
          { key: 'latency', label: 'Latency budget?', kind: 'radio', options: [
            { value: 'realtime', label: 'Real-time. Sub-1s p95.' },
            { value: 'normal', label: 'Normal. 1-5s acceptable.' },
            { value: 'batch', label: 'Batch. 24-hour async OK.' }
          ], default: 'normal' },
          { key: 'cost_sensitivity', label: 'How cost-sensitive?', kind: 'radio', options: [
            { value: 'low', label: 'Low. Quality first; cost negligible.' },
            { value: 'medium', label: 'Medium. Quality matters; cost considered.' },
            { value: 'high', label: 'High. Cost is binding constraint; quality threshold acceptable.' }
          ], default: 'medium' },
          { key: 'reasoning_needed', label: 'Does the task need explicit reasoning steps?', kind: 'radio', options: [
            { value: 'no', label: 'No. Direct answer or transformation.' },
            { value: 'sometimes', label: 'Sometimes. Most cases simple; edge cases hard.' },
            { value: 'yes', label: 'Yes. Multi-step logic, math, or agentic planning.' }
          ], default: 'sometimes' }
        ],
        score: (s) => {
          let opus = 50, sonnet = 50, haiku = 50, reasoning = 30;

          // Complexity tilts heavily.
          if (s.task_complexity === 'simple')  { haiku += 30; sonnet -= 10; opus -= 30; reasoning -= 20; }
          if (s.task_complexity === 'medium')  { sonnet += 25; haiku -= 5; opus -= 5; }
          if (s.task_complexity === 'hard')    { opus += 30; sonnet += 5; haiku -= 30; reasoning += 20; }

          // Volume favors smaller models for cost reasons.
          if (s.volume === 'high')   { haiku += 20; opus -= 15; }
          if (s.volume === 'medium') { sonnet += 10; }
          if (s.volume === 'low')    { opus += 10; }

          // Latency favors smaller / faster.
          if (s.latency === 'realtime') { haiku += 20; reasoning -= 30; opus -= 10; }
          if (s.latency === 'batch')    { reasoning += 10; opus += 5; }

          // Cost sensitivity tilts toward Haiku.
          if (s.cost_sensitivity === 'high')   { haiku += 25; opus -= 25; reasoning -= 20; }
          if (s.cost_sensitivity === 'low')    { opus += 15; reasoning += 10; }

          // Reasoning need.
          if (s.reasoning_needed === 'yes')       { reasoning += 30; opus += 15; haiku -= 20; }
          if (s.reasoning_needed === 'sometimes') { sonnet += 15; }
          if (s.reasoning_needed === 'no')        { haiku += 10; reasoning -= 20; }

          const items = [
            { option: 'Claude Opus 4.7 (or GPT-5.5)', score: opus, slug: 'claude-opus-sonnet-haiku', rationale: 'Frontier capability. Justified for hard agentic tasks, complex coding, multi-step reasoning where Sonnet evals fall short.' },
            { option: 'Claude Sonnet 4.6 (or GPT-5.5 mini)', score: sonnet, slug: 'claude-opus-sonnet-haiku', rationale: 'The workhorse. 80-90% of Opus capability at 25-30% of the cost. Default for most production work.' },
            { option: 'Claude Haiku 4.5 (or GPT-5.5 nano)', score: haiku, slug: 'claude-opus-sonnet-haiku', rationale: 'Fast, cheap, sufficient for classification, routing, simple extractions. The right choice for high-volume routine traffic.' },
            { option: 'Reasoning model (Claude with extended thinking, o-series, Gemini Thinking)', score: reasoning, slug: 'reasoning-models', rationale: 'Explicit thinking budget for math, multi-step logic, complex extraction. Adds cost; justified on hard problems where quality matters more than speed.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      'local-vs-cloud-ai': {
        slug: 'local-vs-cloud-ai',
        title: 'Local vs cloud AI',
        intro: 'When to run AI locally versus call frontier cloud APIs. Privacy, cost, capability, and ops considerations.',
        conceptsTouched: ['local-first-ai', 'the-capability-ceiling', 'the-hybrid-stack-pattern', 'apple-silicon-unified-memory-architecture', 'sovereign-ai'],
        inputs: [
          { key: 'data_sensitivity', label: 'Data sensitivity?', kind: 'radio', options: [
            { value: 'low', label: 'Low. Public or non-sensitive data.' },
            { value: 'medium', label: 'Medium. Internal company data, no PII.' },
            { value: 'high', label: 'High. PII, regulated data (HIPAA / GDPR), NDA-bound.' }
          ], default: 'medium' },
          { key: 'task_difficulty', label: 'Task difficulty?', kind: 'radio', options: [
            { value: 'routine', label: 'Routine. Most personal or daily-driver tasks.' },
            { value: 'mixed', label: 'Mixed. Some routine, some hard.' },
            { value: 'frontier', label: 'Frontier. Complex agentic flows, hardest reasoning.' }
          ], default: 'mixed' },
          { key: 'volume', label: 'Usage volume?', kind: 'radio', options: [
            { value: 'low', label: 'Low. A few queries per day.' },
            { value: 'medium', label: 'Medium. 50-500 queries per day.' },
            { value: 'high', label: 'High. 1000+ queries per day.' }
          ], default: 'medium' },
          { key: 'ops_capacity', label: 'Operations capacity?', kind: 'radio', options: [
            { value: 'none', label: 'None. Want zero ops surface.' },
            { value: 'some', label: 'Some. Comfortable maintaining one tool.' },
            { value: 'plenty', label: 'Plenty. Run my own infrastructure already.' }
          ], default: 'some' },
          { key: 'budget', label: 'Hardware budget?', kind: 'radio', options: [
            { value: 'tiny', label: 'Tiny. Use existing devices.' },
            { value: 'modest', label: 'Modest. $1K-3K for entry hardware.' },
            { value: 'serious', label: 'Serious. $5K-15K for power workstation.' }
          ], default: 'modest' }
        ],
        score: (s) => {
          let cloud = 50, local = 50, hybrid = 50, sovereign = 20;

          if (s.data_sensitivity === 'high')   { local += 30; sovereign += 30; cloud -= 20; }
          if (s.data_sensitivity === 'medium') { hybrid += 15; }
          if (s.data_sensitivity === 'low')    { cloud += 15; }

          if (s.task_difficulty === 'frontier') { cloud += 25; local -= 25; sovereign += 10; hybrid += 10; }
          if (s.task_difficulty === 'mixed')    { hybrid += 25; }
          if (s.task_difficulty === 'routine')  { local += 20; }

          if (s.volume === 'high')   { local += 15; sovereign += 5; cloud -= 5; }
          if (s.volume === 'low')    { cloud += 10; local -= 10; }

          if (s.ops_capacity === 'none')   { cloud += 25; local -= 25; sovereign -= 30; }
          if (s.ops_capacity === 'plenty') { local += 15; sovereign += 20; }

          if (s.budget === 'tiny')    { cloud += 25; local -= 30; sovereign -= 30; }
          if (s.budget === 'serious') { local += 15; sovereign += 10; }

          const items = [
            { option: 'Cloud-only (Anthropic / OpenAI / Gemini API)', score: cloud, slug: 'anthropic-api', rationale: 'Frontier capability, zero ops, predictable per-call cost. Best when data sensitivity is low and ops capacity is constrained.' },
            { option: 'Local-only (Ollama + Mac Studio / GPU rig)', score: local, slug: 'local-first-ai', rationale: 'Full privacy, zero token costs, capability ownership. Best for routine tasks on sensitive data with serious hardware budget and ops willingness.' },
            { option: 'Hybrid (local for sensitive / routine, cloud for hard)', score: hybrid, slug: 'the-hybrid-stack-pattern', rationale: 'Best of both. Local handles 80% of work; cloud handles the 20% that needs frontier capability. The dominant 2026 pattern.' },
            { option: 'Sovereign AI (Anthropic Sovereign / Azure Government / on-prem deployment)', score: sovereign, slug: 'sovereign-ai', rationale: 'Frontier capability with full data residency. Best for regulated public sector, defense, healthcare consortia, large banks where compliance demands it.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      'observability-platform': {
        slug: 'observability-platform',
        title: 'Observability platform selection',
        intro: 'Pick the LLM observability platform that matches your stack. Tradeoffs around vendor lock-in, ease of integration, eval depth, and self-hosted vs managed.',
        conceptsTouched: ['langsmith', 'langfuse', 'helicone', 'arize-phoenix', 'braintrust'],
        inputs: [
          { key: 'framework', label: 'What is your primary stack?', kind: 'radio', options: [
            { value: 'langchain', label: 'LangChain / LangGraph heavy.' },
            { value: 'mixed', label: 'Mixed. Multiple frameworks or vendor SDKs directly.' },
            { value: 'minimal', label: 'Minimal. Bare API calls; no framework.' }
          ], default: 'mixed' },
          { key: 'hosting', label: 'Hosting preference?', kind: 'radio', options: [
            { value: 'managed', label: 'Managed. Zero ops; vendor handles infrastructure.' },
            { value: 'self', label: 'Self-hosted. We run our own infrastructure.' },
            { value: 'either', label: 'Either; pick by other factors.' }
          ], default: 'managed' },
          { key: 'eval_priority', label: 'Eval workflow priority?', kind: 'radio', options: [
            { value: 'core', label: 'Core. Eval-driven development; CI gates on scores.' },
            { value: 'important', label: 'Important. Regular eval runs; not every PR.' },
            { value: 'occasional', label: 'Occasional. Mostly trace inspection; eval secondary.' }
          ], default: 'important' },
          { key: 'integration_burden', label: 'Acceptable integration effort?', kind: 'radio', options: [
            { value: 'minimal', label: 'Minimal. URL change or proxy; no SDK rewrite.' },
            { value: 'small', label: 'Small. Add a wrapper; minimal code changes.' },
            { value: 'meaningful', label: 'Meaningful. SDK integration with custom hooks acceptable.' }
          ], default: 'small' },
          { key: 'compliance', label: 'Compliance / data residency requirements?', kind: 'radio', options: [
            { value: 'none', label: 'None. Vendor data handling is fine.' },
            { value: 'us', label: 'US. SOC 2 / standard enterprise.' },
            { value: 'eu_or_strict', label: 'EU residency or strict (HIPAA / FedRAMP).' }
          ], default: 'us' }
        ],
        score: (s) => {
          let langsmith = 50, langfuse = 50, helicone = 50, phoenix = 50, braintrust = 50;

          if (s.framework === 'langchain') { langsmith += 30; }
          if (s.framework === 'mixed')     { langfuse += 10; phoenix += 10; braintrust += 10; }
          if (s.framework === 'minimal')   { helicone += 20; langsmith -= 10; }

          if (s.hosting === 'self')    { langfuse += 25; phoenix += 20; langsmith -= 20; helicone -= 15; }
          if (s.hosting === 'managed') { langsmith += 15; helicone += 15; braintrust += 10; }

          if (s.eval_priority === 'core')      { braintrust += 25; langsmith += 10; phoenix += 10; }
          if (s.eval_priority === 'occasional') { helicone += 15; }

          if (s.integration_burden === 'minimal') { helicone += 25; }
          if (s.integration_burden === 'meaningful') { langsmith += 5; braintrust += 10; }

          if (s.compliance === 'eu_or_strict') { langfuse += 25; phoenix += 15; helicone -= 15; }
          if (s.compliance === 'none')         { helicone += 5; }

          const items = [
            { option: 'LangSmith', score: langsmith, slug: 'langsmith', rationale: 'LangChain\'s first-party observability. Tightest integration with LangChain stacks; managed; mature.' },
            { option: 'Langfuse', score: langfuse, slug: 'langfuse', rationale: 'Open-source self-hostable. Strong feature parity with managed alternatives. Default for self-hosted and EU-residency teams.' },
            { option: 'Helicone', score: helicone, slug: 'helicone', rationale: 'Proxy-based; one URL change for instrumentation. Lightest integration; great for non-LangChain stacks wanting fast time-to-observability.' },
            { option: 'Arize Phoenix', score: phoenix, slug: 'arize-phoenix', rationale: 'Open-source, OpenTelemetry-native, strong tracing. Free; self-hosted with optional commercial Arize AX for scale.' },
            { option: 'Braintrust', score: braintrust, slug: 'braintrust', rationale: 'Eval-first platform. Best fit when evals are the development backbone and CI gates on eval scores.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      // ===== Salary negotiator (M-F career tool) ==========================
      'salary-negotiator': {
        slug: 'salary-negotiator',
        title: 'Salary negotiator: AI engineering comp ranges',
        intro: 'Comp ranges by role × location × experience × company tier. Cites M12 source data (Levels.fyi May 2026, KORE1 four-lane breakdown, Big Four bands, Anthropic London). Adjust the inputs; the recommendations recompute live.',
        conceptsTouched: ['top-lab-medians-levels-fyi-may-2026', 'kore1-four-lane-breakdown', 'big-four-bands', 'anthropic-london-salaries', 'ai-premium'],
        inputs: [
          { key: 'role', label: 'Role', kind: 'radio', options: [
            { value: 'se',     label: 'AI Solutions Engineer (SE) - pre-sales' },
            { value: 'fde',    label: 'Forward Deployed Engineer (FDE)' },
            { value: 'eng',    label: 'AI Engineer / Applied AI Engineer' },
            { value: 'arch',   label: 'AI Solutions Architect' },
            { value: 'consult', label: 'AI Implementation Consultant (Big Four)' }
          ], default: 'eng' },
          { key: 'tier', label: 'Company tier', kind: 'radio', options: [
            { value: 'frontier', label: 'AI lab / frontier (OpenAI, Anthropic, Google DeepMind, Meta GenAI)' },
            { value: 'aio_native', label: 'AI-native scaleup (Glean, Hebbia, Harvey, Replit, Cursor)' },
            { value: 'tier1',    label: 'Tier-1 enterprise (Palantir, JPM, banks, Big Four AI)' },
            { value: 'midmarket', label: 'Midmarket / startup' }
          ], default: 'aio_native' },
          { key: 'level', label: 'Experience', kind: 'radio', options: [
            { value: 'junior', label: 'Junior (<3 years)' },
            { value: 'mid',    label: 'Mid (3-7 years)' },
            { value: 'senior', label: 'Senior (7-12 years)' },
            { value: 'staff',  label: 'Staff+ (12+ years or principal)' }
          ], default: 'mid' },
          { key: 'location', label: 'Location', kind: 'radio', options: [
            { value: 'sf',     label: 'SF / NYC / Seattle (US tier-1 metro)' },
            { value: 'us-other', label: 'Other US metro' },
            { value: 'london', label: 'London' },
            { value: 'eu-other', label: 'Other EU' },
            { value: 'remote', label: 'Remote / non-tier-1' }
          ], default: 'sf' }
        ],
        score: function(state) {
          // Base ranges in USD (total comp). Numbers calibrated against M12 source data.
          const baseTotal = {
            se:    { junior: [130, 200], mid: [180, 280], senior: [250, 380], staff: [320, 500] },
            fde:   { junior: [170, 260], mid: [240, 380], senior: [350, 550], staff: [450, 800] },
            eng:   { junior: [140, 220], mid: [220, 340], senior: [320, 500], staff: [450, 750] },
            arch:  { junior: [140, 200], mid: [200, 320], senior: [300, 480], staff: [400, 650] },
            consult: { junior: [110, 160], mid: [145, 218], senior: [200, 300], staff: [280, 450] }
          };
          const tierMul = { frontier: 1.55, aio_native: 1.10, tier1: 1.00, midmarket: 0.85 };
          const locMul = { sf: 1.05, 'us-other': 0.92, london: 1.00, 'eu-other': 0.88, remote: 0.85 };

          const base = baseTotal[state.role] && baseTotal[state.role][state.level] ? baseTotal[state.role][state.level] : [150, 250];
          const lo = Math.round(base[0] * tierMul[state.tier] * locMul[state.location]);
          const hi = Math.round(base[1] * tierMul[state.tier] * locMul[state.location]);
          const target = Math.round((lo + hi) / 2);

          // Build recommendations: [primary range card, anchor card, BATNA card]
          const items = [];
          items.push({
            option: 'Total comp range (USD)',
            score: 100,
            rationale: '$' + lo + 'K - $' + hi + 'K total comp; midpoint $' + target + 'K. Base typically 50-65% of total at AI labs and AI-native; 70-90% at consulting / enterprise.'
          });

          // Anchor advice
          const anchor = Math.round(hi * 1.05);
          items.push({
            option: 'Opening anchor',
            score: 95,
            rationale: 'Open ~$' + anchor + 'K (5% above range top). Recruiters expect a counter; opening at the midpoint forfeits negotiation room. Frame around scope + impact + competing offers.'
          });

          // Walk-away
          items.push({
            option: 'Walk-away floor',
            score: 90,
            rationale: 'Below $' + Math.round(lo * 0.95) + 'K, decline. The next interview cycle pays for itself within 2 months at this comp level.'
          });

          // BATNA / leverage
          let leverage = '';
          if (state.tier === 'frontier') leverage = 'Frontier-lab comp anchored to OpenAI / Anthropic Levels.fyi medians. Offers move when you have a competing offer from another frontier lab.';
          else if (state.tier === 'aio_native') leverage = 'AI-native scaleups stretch most when you have an AI-lab offer in hand. Use that as the anchor; ask for matching equity even at lower base.';
          else if (state.tier === 'tier1') leverage = 'Tier-1 enterprise pays for FDE/architect roles where customer-deployed value is direct. Frame around quantified impact at prior roles.';
          else leverage = 'Midmarket leverage is scope (lead the AI function), equity %, and learning velocity. Comp ceiling is real; growth path matters more.';

          items.push({
            option: 'Leverage notes',
            score: 80,
            rationale: leverage
          });

          // Citation
          items.push({
            option: 'Sources',
            score: 70,
            rationale: 'Numbers derived from Levels.fyi (May 2026), KORE1 four-lane breakdown, Big Four bands, Anthropic London disclosed ranges. See module 12 for the underlying concept pages.'
          });

          return items;
        }
      },

      // ===== Vector DB selection (v8) =====
      'vector-db-pick': {
        slug: 'vector-db-pick',
        title: 'Vector database picker',
        intro: 'Pinecone, Qdrant, Weaviate, pgvector, Chroma, Milvus, LanceDB all win on different axes. Answer the questions; the ranker recomputes live.',
        conceptsTouched: ['vector-database', 'pinecone', 'qdrant', 'weaviate', 'pgvector', 'chroma', 'milvus', 'lancedb'],
        inputs: [
          { key: 'scale', label: 'How many vectors at peak?', kind: 'radio', options: [
            { value: 'small',  label: 'Under 1M' },
            { value: 'medium', label: '1M-50M' },
            { value: 'large',  label: '50M-500M' },
            { value: 'huge',   label: '500M+' }
          ], default: 'medium' },
          { key: 'host', label: 'Hosting preference', kind: 'radio', options: [
            { value: 'managed',     label: 'Fully managed (no ops)' },
            { value: 'self-host',   label: 'Self-hosted (k8s OK)' },
            { value: 'embedded',    label: 'Embedded / in-process' },
            { value: 'in-postgres', label: 'In my existing Postgres' }
          ], default: 'managed' },
          { key: 'hybrid', label: 'Hybrid (vector + keyword) search?', kind: 'radio', options: [
            { value: 'yes',  label: 'Yes, important' },
            { value: 'maybe', label: 'Nice to have' },
            { value: 'no',   label: 'No, vector only' }
          ], default: 'yes' },
          { key: 'budget', label: 'Budget posture', kind: 'radio', options: [
            { value: 'tight',  label: 'Tight; minimize per-month' },
            { value: 'flex',   label: 'Flexible; pay for less ops' }
          ], default: 'flex' }
        ],
        score: (s) => {
          const r = { pinecone: 50, qdrant: 50, weaviate: 50, pgvector: 50, chroma: 50, milvus: 50, lancedb: 50 };
          if (s.scale === 'small')  { r.pgvector += 30; r.chroma += 30; r.lancedb += 20; r.milvus -= 30; }
          if (s.scale === 'medium') { r.qdrant += 20; r.pinecone += 15; r.pgvector += 10; r.weaviate += 10; r.chroma -= 10; r.milvus -= 10; }
          if (s.scale === 'large')  { r.qdrant += 20; r.weaviate += 15; r.pinecone += 10; r.milvus += 10; r.pgvector -= 15; r.chroma -= 30; }
          if (s.scale === 'huge')   { r.milvus += 40; r.pinecone += 20; r.qdrant += 5; r.pgvector -= 50; r.chroma -= 50; r.lancedb -= 20; }
          if (s.host === 'managed')     { r.pinecone += 25; r.weaviate += 5; r.qdrant -= 5; r.pgvector -= 10; r.chroma -= 15; }
          if (s.host === 'self-host')   { r.qdrant += 20; r.weaviate += 15; r.milvus += 10; r.pinecone -= 25; }
          if (s.host === 'embedded')    { r.chroma += 30; r.lancedb += 30; r.pgvector += 10; r.pinecone -= 30; r.qdrant -= 5; }
          if (s.host === 'in-postgres') { r.pgvector += 50; r.pinecone -= 20; r.qdrant -= 10; }
          if (s.hybrid === 'yes')   { r.weaviate += 15; r.qdrant += 10; r.pgvector += 5; r.chroma -= 10; }
          if (s.hybrid === 'no')    { r.lancedb += 10; r.chroma += 5; }
          if (s.budget === 'tight') { r.pgvector += 15; r.qdrant += 10; r.chroma += 10; r.pinecone -= 20; }
          if (s.budget === 'flex')  { r.pinecone += 15; }
          const items = [
            { option: 'Pinecone',  score: r.pinecone, slug: 'pinecone', rationale: 'Fully-managed default. Low ops cost, mature SDKs. Cost rises sharply at scale; no on-prem.' },
            { option: 'Qdrant',    score: r.qdrant, slug: 'qdrant', rationale: 'Rust-native, fast single-node, simple API. Best self-hosted choice for moderate scale.' },
            { option: 'Weaviate',  score: r.weaviate, slug: 'weaviate', rationale: 'Built-in hybrid search, modular embedders, GraphQL or REST. Operationally heavier; needs k8s at scale.' },
            { option: 'pgvector',  score: r.pgvector, slug: 'pgvector', rationale: 'Use the database you already have. Filtering + vector search in one SQL query. Past 10-50M needs careful tuning.' },
            { option: 'Chroma',    score: r.chroma, slug: 'chroma', rationale: 'Embedded; SQLite-style ergonomics for AI builders. Prototyping and small-to-medium production.' },
            { option: 'Milvus',    score: r.milvus, slug: 'milvus', rationale: 'Billion-scale. Compute/storage separation. Needs k8s + 1 dedicated engineer to operate.' },
            { option: 'LanceDB',   score: r.lancedb, slug: 'lancedb', rationale: 'Columnar Lance format; mixed analytical + vector workloads. Embedded; S3-backed for cloud.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      },

      // ===== Voice agent stack (v8) =====
      'voice-agent-stack': {
        slug: 'voice-agent-stack',
        title: 'Voice agent stack picker',
        intro: 'Real-time voice agents have a tight pipeline: VAD > STT > LLM > TTS. Answer the questions; the recommendation balances latency, quality, and vendor lock-in.',
        conceptsTouched: ['voice-agent-architecture', 'realtime-api', 'deepgram', 'cartesia', 'elevenlabs', 'whisper'],
        inputs: [
          { key: 'priority', label: 'What matters most?', kind: 'radio', options: [
            { value: 'latency',     label: 'Lowest possible latency (sub-500ms)' },
            { value: 'quality',     label: 'Highest audio quality (storytelling, brand voice)' },
            { value: 'cost',        label: 'Lowest cost (high volume)' },
            { value: 'control',     label: 'Maximum control / interceptable transcripts' }
          ], default: 'latency' },
          { key: 'use_case', label: 'Use case', kind: 'radio', options: [
            { value: 'support',     label: 'Customer support / scheduling' },
            { value: 'companion',   label: 'Companion / interview / coaching' },
            { value: 'narration',   label: 'Audiobook / content narration' },
            { value: 'phone',       label: 'Outbound phone calls (Twilio-style)' }
          ], default: 'support' },
          { key: 'volume', label: 'Volume', kind: 'radio', options: [
            { value: 'low',     label: 'Under 1000 calls/day' },
            { value: 'mid',     label: '1K-100K/day' },
            { value: 'high',    label: '100K+/day' }
          ], default: 'mid' }
        ],
        score: (s) => {
          let pipeline = 50, realtime = 50, selfhost = 50;
          if (s.priority === 'latency')  { realtime += 25; pipeline += 10; selfhost -= 10; }
          if (s.priority === 'quality')  { pipeline += 20; realtime -= 10; }
          if (s.priority === 'cost')     { selfhost += 30; realtime -= 10; pipeline += 5; }
          if (s.priority === 'control')  { pipeline += 30; realtime -= 25; selfhost += 10; }
          if (s.use_case === 'support')   { pipeline += 5; realtime += 5; }
          if (s.use_case === 'companion') { realtime += 20; pipeline += 5; }
          if (s.use_case === 'narration') { pipeline += 25; realtime -= 30; }
          if (s.use_case === 'phone')     { pipeline += 15; realtime -= 5; }
          if (s.volume === 'high')        { selfhost += 25; realtime -= 15; pipeline += 5; }
          const items = [
            { option: 'Composed pipeline (Deepgram + Claude + Cartesia)',  score: pipeline, slug: 'voice-agent-architecture', rationale: 'Separate STT + LLM + TTS. Maximum control: interceptable transcripts, fine-grained logging, vendor flexibility. ~500-700ms round-trip with careful tuning.' },
            { option: 'OpenAI Realtime API',  score: realtime, slug: 'realtime-api', rationale: 'Single WebSocket; native audio in and out. Sub-500ms round-trip. Less control (no separate transcripts) but the most natural-feeling experience.' },
            { option: 'Self-hosted (Whisper + open-weight LLM + Piper)', score: selfhost, slug: 'whisper', rationale: 'Zero per-call cost at high volume; full data control. Higher latency (~800-1200ms); ops burden non-trivial. Best for high-volume + cost-sensitive + on-prem.' }
          ];
          items.sort((a, b) => b.score - a.score);
          return items;
        }
      }

    };
