// Auto-extracted from course.html.legacy by build/extract.mjs.
// Do not edit by hand. Re-run the script to refresh.

export const XP_VALUES = Object.freeze({
      CONCEPT_COMPLETE:        5,
      CONCEPT_QUIZ_PASS:       10,
      FLASHCARD_MASTERED:      5,
      MODULE_QUIZ_PASS:        50,
      MODULE_COMPLETE:         200,
      CAPSTONE_PASS:           100,
      STREAK_7DAY_MILESTONE:   50,
      STREAK_30DAY_MILESTONE:  200,
      NOTE_WRITTEN_FIRST_TIME: 5,
      CROSS_REF_CLICKED_X25:   25
    });

export const TIERS = Object.freeze([
      { n: 1, name: 'Curious Engineer',          threshold: 0 },
      { n: 2, name: 'Apprentice Builder',        threshold: 250 },
      { n: 3, name: 'Practicing Engineer',       threshold: 750 },
      { n: 4, name: 'AI Engineer',               threshold: 1750 },
      { n: 5, name: 'Solutions Engineer',        threshold: 3500 },
      { n: 6, name: 'Solutions Architect',       threshold: 6000 },
      { n: 7, name: 'Forward Deployed Engineer', threshold: 9000 },
      { n: 8, name: 'Principal Architect',       threshold: 13000 }
    ]);

export const ACHIEVEMENTS_REGISTRY = [
      { id: 'first_steps',        name: 'First Steps',        desc: 'Complete your first concept.',                          bonusXP: 10,  cond: s => s.completedCount >= 1 },
      { id: 'vocab_explorer',     name: 'Vocab Explorer',     desc: 'Master 50 flashcards.',                                  bonusXP: 50,  cond: s => s.flashcardsMastered >= 50 },
      { id: 'builder',            name: 'Builder',            desc: 'Complete the Anthropic Stack module.',                   bonusXP: 100, cond: s => s.modulesComplete[5] === true },
      { id: 'rag_whisperer',      name: 'RAG Whisperer',      desc: 'Pass every RAG concept quiz.',                           bonusXP: 75,  cond: s => s.ragQuizzesPassed === true },
      { id: 'architect',          name: 'Architect',          desc: 'Complete your first module.',                            bonusXP: 50,  cond: s => Object.values(s.modulesComplete).filter(Boolean).length >= 1 },
      { id: 'polyglot',           name: 'Polyglot',           desc: 'Toggle the international comp view.',                    bonusXP: 10,  cond: s => s.region === 'INTL' },
      { id: 'speedrunner',        name: 'Speedrunner',        desc: 'Complete a module in one session.',                      bonusXP: 75,  cond: s => s.speedrunCompleted === true },
      { id: 'persistent',         name: 'Persistent',         desc: '7-day review streak.',                                   bonusXP: 50,  cond: s => s.streakCount >= 7 },
      { id: 'iron_mind',          name: 'Iron Mind',          desc: '30-day review streak.',                                  bonusXP: 200, cond: s => s.streakCount >= 30 },
      { id: 'stack_master',       name: 'Stack Master',       desc: 'Complete all 16 modules.',                               bonusXP: 500, cond: s => Object.values(s.modulesComplete).filter(Boolean).length >= 16 },
      { id: 'cross_referencer',   name: 'Cross-Referencer',   desc: 'Click 50 cross-reference links.',                        bonusXP: XP_VALUES.CROSS_REF_CLICKED_X25, cond: s => s.xrefClicks >= 50 },
      { id: 'note_taker',         name: 'Note-Taker',         desc: 'Write notes on 25 concepts.',                            bonusXP: 50,  cond: s => s.notesCount >= 25 },
      { id: 'saver',              name: 'Saver',              desc: 'Save 20 concepts for later.',                            bonusXP: 25,  cond: s => s.savedCount >= 20 },
      { id: 'capstone_crusher',   name: 'Capstone Crusher',   desc: 'Pass 5 module capstones first try.',                     bonusXP: 150, cond: s => s.capstonesFirstTry >= 5 },
      { id: 'boss_slayer',        name: 'Boss Slayer',        desc: 'Pass all 16 module capstones.',                          bonusXP: 500, cond: s => s.capstonesPassed >= 16 },
      { id: 'local_hero',         name: 'Local Hero',         desc: 'Complete the Local-First module.',                       bonusXP: 100, cond: s => s.modulesComplete[7] === true },
      { id: 'recruiter_ready',    name: 'Recruiter Ready',    desc: 'Complete the Career module.',                            bonusXP: 100, cond: s => s.modulesComplete[12] === true },
      { id: 'compliance_officer', name: 'Compliance Officer', desc: 'Complete the Enterprise Architecture module.',           bonusXP: 100, cond: s => s.modulesComplete[11] === true },
      { id: 'encyclopedia',       name: 'Encyclopedia',       desc: 'Read every concept in the glossary.',                    bonusXP: 250, cond: s => s.completedCount >= s.totalConcepts },
      { id: 'self_taught',        name: 'Self-Taught',        desc: 'Complete the Set up Claude Code playbook end-to-end.',   bonusXP: 50,  cond: s => s.selfTaughtPlaybookComplete === true },

      // ----- v5 expansions -----
      { id: 'flashcard_century',  name: 'Flashcard Century',  desc: 'Master 100 flashcards.',                                 bonusXP: 100, cond: s => s.flashcardsMastered >= 100 },
      { id: 'flashcard_marathon', name: 'Flashcard Marathon', desc: 'Master 250 flashcards.',                                 bonusXP: 250, cond: s => s.flashcardsMastered >= 250 },
      { id: 'flashcard_master',   name: 'Flashcard Master',   desc: 'Master all 514 flashcards.',                             bonusXP: 500, cond: s => s.flashcardsMastered >= 514 },
      { id: 'quiz_apprentice',    name: 'Quiz Apprentice',    desc: 'Pass 10 concept quizzes.',                               bonusXP: 50,  cond: s => s.quizzesPassed >= 10 },
      { id: 'quiz_journeyman',    name: 'Quiz Journeyman',    desc: 'Pass 50 concept quizzes.',                               bonusXP: 150, cond: s => s.quizzesPassed >= 50 },
      { id: 'cumulative_solver',  name: 'Cumulative Solver',  desc: 'Pass 5 cumulative module quizzes.',                      bonusXP: 100, cond: s => s.moduleQuizzesPassed >= 5 },
      { id: 'cumulative_master',  name: 'Cumulative Master',  desc: 'Pass cumulative quizzes for all 16 modules.',            bonusXP: 400, cond: s => s.moduleQuizzesPassed >= 16 },
      { id: 'three_day_streak',   name: 'Three Day Streak',   desc: 'Three days of activity in a row.',                       bonusXP: 25,  cond: s => s.streakCount >= 3 },
      { id: 'first_xp',           name: 'First XP',           desc: 'Earn your first XP.',                                    bonusXP: 5,   cond: s => (s.totalXP || 0) >= 5 },
      { id: 'apprentice_tier',    name: 'Apprentice Tier',    desc: 'Reach tier 2: Apprentice Builder.',                      bonusXP: 50,  cond: s => (s.totalXP || 0) >= 250 },
      { id: 'engineer_tier',      name: 'Engineer Tier',      desc: 'Reach tier 4: AI Engineer.',                             bonusXP: 100, cond: s => (s.totalXP || 0) >= 1750 },
      { id: 'principal_tier',     name: 'Principal Tier',     desc: 'Reach tier 8: Principal Architect.',                     bonusXP: 500, cond: s => (s.totalXP || 0) >= 13000 },
      { id: 'configurator',       name: 'Configurator',       desc: 'Set an API key in Settings.',                            bonusXP: 25,  cond: s => s.apiKeySet === true },
      { id: 'goal_setter',        name: 'Goal Setter',        desc: 'Complete onboarding wizard with a profile goal.',        bonusXP: 25,  cond: s => s.profileGoalSet === true },
      { id: 'speedrun_kanji',     name: 'Speedrun Kanji',     desc: 'Trigger the Konami code.',                               bonusXP: 50,  cond: s => s.konamiUnlocked === true },
      { id: 'voice_explorer',     name: 'Voice Explorer',     desc: 'Try the voice-search button.',                           bonusXP: 25,  cond: s => s.voiceUsed === true },
      { id: 'reader',             name: 'Reader',             desc: 'Open Reading mode.',                                     bonusXP: 25,  cond: s => s.readerOpened === true }
    ];

export const CAPSTONES = {
      1: {
        module: 1,
        title: 'Foundations capstone',
        scenario: 'A teammate asks you to pick the right model and reasoning settings for a customer-support classifier. The team is cost-sensitive but quality cannot drop below 92% accuracy.',
        steps: [
          {
            prompt: 'Which model tier is most appropriate for high-volume classification on a small fixed label set?',
            options: ['Claude Opus 4.7', 'Claude Sonnet 4.6', 'Claude Haiku 4.5', 'GPT-5.5 Pro'],
            correctIndex: 2,
            explanation: 'Classification with a small label set is what Haiku-tier models exist for. They run 5-10x cheaper than Opus with negligible quality difference on bounded tasks.'
          },
          {
            prompt: 'Two models tokenize the same support ticket into different counts. The most likely cause is...',
            options: ['One model has a bug', 'Different vocabularies and BPE merges', 'Different temperatures', 'Different context windows'],
            correctIndex: 1,
            explanation: 'Tokenizer-as-pricing: each model family has its own vocabulary, so the same string produces different token counts. Always test on your actual data.'
          },
          {
            prompt: 'For consistent classification output, the right temperature setting is...',
            options: ['1.0 (default)', '2.0 for variety', '0.0 for deterministic outputs', 'top-p only, ignore temperature'],
            correctIndex: 2,
            explanation: 'For tasks with one correct answer (classification), temperature 0 maximizes consistency. Variety is not a feature here.'
          },
          {
            prompt: 'The support team complains a 200K-context call is slow. The dominant latency contributor is most likely...',
            options: ['Network latency', 'Output token generation', 'Prefill (computing K and V for the input context)', 'Tokenization'],
            correctIndex: 2,
            explanation: 'Long-context calls are prefill-bound. Reducing input length is usually higher-leverage than picking a faster model.'
          },
          {
            prompt: 'You compare embeddings across vectors of different magnitudes. The right similarity metric is...',
            options: ['Euclidean distance', 'Cosine similarity', 'Dot product without normalization', 'L1 distance'],
            correctIndex: 1,
            explanation: 'Cosine similarity is direction-only; embedding semantic similarity is encoded in direction. Magnitude varies and would dominate Euclidean.'
          }
        ]
      },
      2: {
        module: 2,
        title: 'Prompting Patterns capstone',
        scenario: 'You are building a structured-extraction pipeline for invoices. Reliability is the goal; latency and cost are secondary.',
        steps: [
          {
            prompt: 'For maximum reliability of structured JSON output, the correct technique is...',
            options: ['Ask for JSON in the prompt', 'Use vendor-native structured output (tool use or JSON Schema mode)', 'Parse with a generic regex after the call', 'Set temperature 0 only'],
            correctIndex: 1,
            explanation: 'Constrained decoding via vendor-native structured-output enforces the schema at sample time. Prompt-only is best-effort; constrained-decoding is bulletproof.'
          },
          {
            prompt: 'The model occasionally hallucinates field values that are not in the invoice. The correct mitigation is...',
            options: ['Increase temperature', 'Add explicit "if the field is not present, return null" instruction', 'Switch to a smaller model', 'Trust the model'],
            correctIndex: 1,
            explanation: 'Hallucinations on structured extraction often come from the model never being told what to do when a field is absent. Make the absence path explicit.'
          },
          {
            prompt: 'Few-shot examples for a structured-extraction task should...',
            options: ['Be diverse and cover edge cases', 'All look the same', 'Be only positive cases', 'Be very long for completeness'],
            correctIndex: 0,
            explanation: 'Examples teach the pattern. If they do not include edge cases, the model will fail on edge cases. Diversity matters.'
          },
          {
            prompt: 'A long static system prompt sent on every request is best optimized via...',
            options: ['Compressing it manually', 'Prompt caching with cache_control', 'Using a smaller model', 'Removing instructions'],
            correctIndex: 1,
            explanation: 'Prompt caching gives 90% discount on cached portions and lower latency. The system prompt is the canonical use case.'
          },
          {
            prompt: 'A user attempts a prompt injection in submitted invoice text. The right defense layer is...',
            options: ['Trust the model to refuse', 'Treat user content as untrusted data with explicit delimiters', 'Use a smaller model', 'Increase temperature'],
            correctIndex: 1,
            explanation: 'Defense in depth: treat input as data, not instructions. Wrap user content in <untrusted> tags and instruct the model to never follow instructions inside them.'
          }
        ]
      },
      3: {
        module: 3,
        title: 'Context Engineering & RAG capstone',
        scenario: 'You are building RAG for an enterprise knowledge base of 100K documents. Accuracy is paramount; users notice subtle hallucinations.',
        steps: [
          {
            prompt: 'For 100K technical documents with code samples, the best chunking strategy is...',
            options: ['Fixed 500 tokens with no overlap', 'Semantic chunking with code blocks treated atomically', 'One chunk per file', 'Random partitioning'],
            correctIndex: 1,
            explanation: 'Semantic chunking respects meaning; treating code blocks atomically prevents broken samples. Naive token-count chunking is a baseline only.'
          },
          {
            prompt: 'Pure vector search misses queries containing exact error codes ("ERR_CONN_RESET"). The fix is...',
            options: ['Switch embedding model', 'Add hybrid search (vector + BM25) with RRF fusion', 'Use fewer chunks', 'Lower the temperature'],
            correctIndex: 1,
            explanation: 'BM25 catches rare exact-match terms that semantic similarity dilutes. Hybrid search via Reciprocal Rank Fusion combines both signals.'
          },
          {
            prompt: 'Top-K retrieval returns 50 chunks; the model gets confused. The right fix is...',
            options: ['Retrieve more', 'Add a cross-encoder reranker before generation', 'Use a larger model', 'Disable retrieval'],
            correctIndex: 1,
            explanation: 'A cross-encoder reranker scores (query, document) pairs jointly. Reduce 50 candidates to top 5; the model sees focused context, hallucinations drop.'
          },
          {
            prompt: 'The most important RAG quality metric for an enterprise knowledge base is...',
            options: ['Answer length', 'Answer relevancy', 'Faithfulness (claims grounded in retrieved context)', 'Latency'],
            correctIndex: 2,
            explanation: 'Faithfulness measures whether claims trace back to retrieved sources. Unfaithful answers are the dangerous failure mode in trust-sensitive domains.'
          },
          {
            prompt: 'Users ask multi-hop questions ("Compare X and Y across our policy and the new vendor terms"). The right architecture extension is...',
            options: ['Stuff more in context', 'Agentic RAG with the model deciding what to retrieve and when', 'Switch to fine-tuning', 'Use a smaller model'],
            correctIndex: 1,
            explanation: 'Multi-hop questions need iterative retrieval. Agentic RAG lets the model decompose the question and retrieve in stages.'
          }
        ]
      },
      4: {
        module: 4,
        title: 'Agents & MCP capstone',
        scenario: 'You are designing an autonomous agent that handles internal IT tickets. It must call tools, escalate to humans on ambiguity, and run reliably across multi-step tasks.',
        steps: [
          {
            prompt: 'Tool definitions must include...',
            options: ['Just a name', 'Name, description, and JSON Schema for parameters', 'Only the parameters', 'A code example'],
            correctIndex: 1,
            explanation: 'Tool definitions need precise schemas so the model can format calls correctly. The description should include positive AND negative triggers ("Do NOT use for...").'
          },
          {
            prompt: 'For a long-running multi-step ticket workflow that must survive crashes, the right pattern is...',
            options: ['Run in a loop until done', 'Durable execution (Temporal, Inngest)', 'In-memory state', 'Single-shot prompt'],
            correctIndex: 1,
            explanation: 'Durable execution persists state per step; restart picks up at last completed step. Without it, every transient failure loses progress.'
          },
          {
            prompt: 'You want an internal CRM accessible to the agent. The right protocol is...',
            options: ['Custom HTTP endpoint with no schema', 'MCP (Model Context Protocol) server', 'Embed CRM data in system prompt', 'Webhook'],
            correctIndex: 1,
            explanation: 'MCP standardizes tool / resource exposure. Once your CRM has an MCP server, any MCP-compatible client (Claude Desktop, Cursor, custom agents) can use it.'
          },
          {
            prompt: 'The agent should escalate to humans for ambiguous tickets. The right pattern is...',
            options: ['Hard threshold on a "confidence" output', 'Explicit refusal/escalation tool the agent invokes when uncertain', 'Random sampling', 'Always escalate'],
            correctIndex: 1,
            explanation: 'Give the agent an explicit escalation tool. The model decides; you can audit when and why escalation happened, refining the threshold over time.'
          },
          {
            prompt: 'You need to test agent quality across iterations. The right discipline is...',
            options: ['Manual testing only', 'Eval-driven development with frozen test scenarios', 'No testing; trust the model', 'Test only happy paths'],
            correctIndex: 1,
            explanation: 'Eval-driven development is the agent equivalent of TDD. Frozen scenarios let you catch regressions across prompt or model changes.'
          }
        ]
      },
      6: {
        module: 6,
        title: 'Voice & Multimodal capstone',
        scenario: 'You are building a voice agent for a customer-support line. End-to-end round-trip latency must stay under 800ms.',
        steps: [
          {
            prompt: 'For sub-200ms streaming transcription, the right vendor is...',
            options: ['Whisper batch mode', 'Deepgram streaming', 'Generic file upload to OpenAI', 'Manual transcription'],
            correctIndex: 1,
            explanation: 'Streaming STT with sub-200ms TTFT is what Deepgram Nova specializes in. Whisper batch is for offline workloads.'
          },
          {
            prompt: 'For sub-100ms time-to-first-audio TTS, the right vendor is...',
            options: ['ElevenLabs flagship', 'Cartesia Sonic streaming', 'Google Polly', 'Local Piper'],
            correctIndex: 1,
            explanation: 'Cartesia is purpose-built for ultra-low latency. ElevenLabs has higher quality but higher latency; pick by use case.'
          },
          {
            prompt: 'The user trails off mid-sentence; the agent answers prematurely. The fix is...',
            options: ['Faster STT', 'Tune the VAD end-of-speech threshold (300-500ms silence)', 'Slower TTS', 'Cancel the response'],
            correctIndex: 1,
            explanation: 'VAD threshold balances responsiveness vs interruption. Too tight cuts users off; too loose feels sluggish. Calibrate for your audio environment.'
          },
          {
            prompt: 'OpenAI Realtime API differs from STT+LLM+TTS pipelines because it...',
            options: ['Uses Whisper internally', 'Processes audio directly without explicit transcription', 'Is cheaper', 'Has more voices'],
            correctIndex: 1,
            explanation: 'Realtime collapses STT/LLM/TTS into one audio-to-audio model. Lower latency, less control over interim transcripts.'
          },
          {
            prompt: 'For accurate-but-flexible PDF extraction with tables and handwriting, the right tool in 2026 is...',
            options: ['Tesseract', 'Mistral OCR or Claude vision OCR', 'Manual extraction', 'Whisper'],
            correctIndex: 1,
            explanation: 'Modern VLM-based OCR (Mistral OCR, Claude vision) handles layout and tables natively. Tesseract is legacy for clean printed text only.'
          }
        ]
      },
      7: {
        module: 7,
        title: 'Local-First AI capstone',
        scenario: 'You want to run 70B-class models on personal hardware for daily use. Constraint: $5K-12K hardware budget; willingness to maintain ops.',
        steps: [
          {
            prompt: 'For loading a 70B model with 192GB+ memory at decent speed, the right consumer-tier hardware is...',
            options: ['Single RTX 4090 (24GB VRAM)', 'Mac Studio M3 Ultra with high unified RAM', 'Dual 3090s', 'CPU-only Threadripper'],
            correctIndex: 1,
            explanation: 'Consumer GPUs cap at 32GB. Apple Silicon unified memory architecture lets you load 100B+ models that no single consumer GPU can hold.'
          },
          {
            prompt: 'For local serving on Mac with native optimization, the right inference framework is...',
            options: ['vLLM', 'MLX-based runners (Ollama, LM Studio with MLX backend)', 'TensorRT-LLM', 'Hugging Face TGI'],
            correctIndex: 1,
            explanation: 'MLX is Apple-Silicon-native. vLLM and TensorRT-LLM are NVIDIA-only; both are faster on H100s but unavailable on Apple Silicon.'
          },
          {
            prompt: 'You want quantized open-weight models. For broad cross-platform compatibility, the right format is...',
            options: ['GGUF', 'PyTorch state dicts', 'ONNX', 'Raw FP32 checkpoints'],
            correctIndex: 0,
            explanation: 'GGUF is the de facto local quantized format. Supported by llama.cpp, Ollama, LM Studio, KoboldCpp on every platform.'
          },
          {
            prompt: 'For frontier-grade tasks (agentic coding) the local 70B model under-performs cloud frontier. The pragmatic answer is...',
            options: ['Try harder', 'Hybrid stack: local for routine, cloud frontier for hard tasks', 'Buy more GPUs', 'Stop using AI'],
            correctIndex: 1,
            explanation: 'The capability ceiling is real. Hybrid: local handles 80% of personal tasks; cloud frontier covers the hardest 20%. Best of both worlds.'
          },
          {
            prompt: 'Personal knowledge stack with vault + AI: for vault portability, the right format is...',
            options: ['Notion proprietary', 'Markdown files in a local directory (Obsidian, Logseq)', 'Encrypted database', 'Cloud-only docs'],
            correctIndex: 1,
            explanation: 'Markdown survives any tool change. Vault data outlives the application; no proprietary format lock-in.'
          }
        ]
      },
      8: {
        module: 8,
        title: 'Evals & Observability capstone',
        scenario: 'A product is shipping next month. You own evaluation. The team wants to release weekly without quality regressions.',
        steps: [
          {
            prompt: 'The first eval discipline to establish for a new product is...',
            options: ['Big public benchmarks', 'A small golden eval set drawn from real production traces', 'Self-play tournaments', 'No eval until v2'],
            correctIndex: 1,
            explanation: 'Hamel Husain framing: 50-200 production-derived examples beat any abstract benchmark. Real users send what they send; that is what matters.'
          },
          {
            prompt: 'For nuanced quality (helpfulness, tone, faithfulness), the right scoring approach is...',
            options: ['Substring match only', 'LLM-as-judge calibrated against human ratings', 'Word count', 'No scoring'],
            correctIndex: 1,
            explanation: 'LLM-as-judge captures subjective quality. Calibration against human ratings ensures the judge\'s scores correlate with what users care about.'
          },
          {
            prompt: 'For a RAG system, the most-important quality metric is...',
            options: ['Latency', 'Faithfulness (claims grounded in retrieved context)', 'Token cost', 'Model size'],
            correctIndex: 1,
            explanation: 'RAG\'s dangerous failure mode is unfaithful answers (confidently wrong). Faithfulness scoring catches this before users see it.'
          },
          {
            prompt: 'To prevent regressions across deploys, the right CI pattern is...',
            options: ['Manual testing only', 'Automated eval gate that blocks merges below a threshold', 'Trust authors', 'Production traffic A/B'],
            correctIndex: 1,
            explanation: 'Eval-as-CI-gate catches regressions before production. Promptfoo, Braintrust, LangSmith all support this.'
          },
          {
            prompt: 'A vendor silently rotates the underlying model snapshot. The right practice is...',
            options: ['Pin to dated snapshots and run regression evals on swap', 'Always use "latest"', 'Trust the vendor', 'Skip evals after pin'],
            correctIndex: 0,
            explanation: 'Drift detection. Pin snapshots; run a regression eval on every snapshot upgrade. Catches silent quality drops.'
          }
        ]
      },
      9: {
        module: 9,
        title: 'Deployment, Ops, and Gateways capstone',
        scenario: 'You are running an LLM-powered product at scale. Cost is climbing; reliability is shaky during peak hours.',
        steps: [
          {
            prompt: 'Cost-driven optimization: routine traffic should run on...',
            options: ['Frontier Opus tier always', 'Tier-appropriate models (Haiku for classification, Sonnet for chat, Opus for complex agents)', 'A single mid-tier model', 'Whatever is fastest'],
            correctIndex: 1,
            explanation: 'Model routing: classify the request, send it to the right tier. 3-5x cost savings on most workloads with imperceptible quality difference.'
          },
          {
            prompt: 'The product hits 429 rate-limit errors at peak hours. The right immediate response is...',
            options: ['Hammer retries', 'Exponential backoff with jitter and graceful degradation', 'Switch vendor permanently', 'Drop traffic silently'],
            correctIndex: 1,
            explanation: 'Backoff prevents the 429 storm from making things worse. Plan for vendor capacity headroom; request quota increases ahead of launch.'
          },
          {
            prompt: 'For non-real-time bulk classification of 10M tickets, the right approach is...',
            options: ['Synchronous API calls', 'Batch API at ~50% discount', 'Local CPU inference', 'Manual review'],
            correctIndex: 1,
            explanation: 'Batch APIs (Anthropic, OpenAI, Gemini) provide ~50% discount with 24-hour SLO. Perfect for non-real-time workloads.'
          },
          {
            prompt: 'For multi-vendor support and easy fallback routing, the right pattern is...',
            options: ['Hardcode each vendor SDK call separately', 'Unified gateway (LiteLLM, Portkey)', 'Self-host every model', 'Pick one vendor and stick'],
            correctIndex: 1,
            explanation: 'A gateway abstracts vendor APIs and adds fallback chains, observability, cost tracking. Switching vendors becomes config, not code.'
          },
          {
            prompt: 'For production logging without leaking PII, the right discipline is...',
            options: ['Log everything raw', 'Pre-storage redaction (Microsoft Presidio or vendor DLP) before persisting', 'No logs at all', 'Hash everything'],
            correctIndex: 1,
            explanation: 'Pre-storage redaction prevents the "PII in logs" incident before it happens. Required for regulated industries; sound practice everywhere.'
          }
        ]
      },
      10: {
        module: 10,
        title: 'Fine-tuning & Post-training capstone',
        scenario: 'You have 10K labeled tickets and want to fine-tune. The team will be ops for the result.',
        steps: [
          {
            prompt: 'Before fine-tuning, you should...',
            options: ['Skip prompting and RAG; go straight to fine-tuning', 'Exhaust prompting and RAG first', 'Fine-tune from scratch', 'Use computer vision instead'],
            correctIndex: 1,
            explanation: 'Hierarchy: prompting -> RAG -> fine-tuning. Most "we need fine-tuning" turns out to be "we need better prompts and retrieval."'
          },
          {
            prompt: 'For 10K labels, the right method is...',
            options: ['Full fine-tuning on a 70B model', 'LoRA / QLoRA on an open-weight 7B-30B base', 'Train from scratch', 'No fine-tune'],
            correctIndex: 1,
            explanation: 'PEFT (LoRA / QLoRA) is the 2026 default. Full FT only when LoRA plateaus or domain shift is huge.'
          },
          {
            prompt: 'Aligning model outputs to human preferences without explicit reward model: use...',
            options: ['Pure SFT', 'DPO (Direct Preference Optimization)', 'Random initialization', 'No alignment'],
            correctIndex: 1,
            explanation: 'DPO directly optimizes preference pairs without RLHF\'s instability. Default in 2026.'
          },
          {
            prompt: 'The fine-tune scores 96% on the target task but worse on general tasks. The cause is...',
            options: ['Bug in the trainer', 'Catastrophic forgetting from over-narrow training data', 'Random luck', 'Hardware issue'],
            correctIndex: 1,
            explanation: 'Mix general data into the training set. Pure task-specific data erodes general capability.'
          },
          {
            prompt: 'For consumer-GPU fine-tuning of 70B models, the right approach is...',
            options: ['Buy 8 H100s', 'QLoRA + Unsloth', 'Skip fine-tuning entirely', 'Run on CPU'],
            correctIndex: 1,
            explanation: 'QLoRA quantizes the base to 4-bit; Unsloth optimizes memory and speed. Together they enable 70B fine-tunes on a single 24GB GPU.'
          }
        ]
      },
      11: {
        module: 11,
        title: 'Enterprise Architecture & Governance capstone',
        scenario: 'Your bank is launching an AI customer-support agent. Compliance is heavy; regulators will audit.',
        steps: [
          {
            prompt: 'EU customers are in scope. Article 22 of GDPR plus the EU AI Act risk tier require...',
            options: ['Skip both because the bank is US-based', 'Classify the system, ensure human oversight for solely-automated decisions, conduct a FRIA', 'A simple privacy policy', 'No action'],
            correctIndex: 1,
            explanation: 'EU customers trigger EU obligations regardless of vendor location. Classify the system, design human oversight, conduct FRIA per high-risk requirements.'
          },
          {
            prompt: 'For AI compliance evidence consumed by regulators, the right artifact is...',
            options: ['Marketing materials', 'Model card + data card + AI BOM + AIIA', 'Code only', 'No documentation'],
            correctIndex: 1,
            explanation: 'These four documents are increasingly the regulatory minimum. Stack them once for ISO 42001, EU AI Act, NIST AI RMF.'
          },
          {
            prompt: 'For model risk in a US bank, the operational pattern is...',
            options: ['One person owns the model end-to-end', 'Three lines of defense (model owner, independent validation, internal audit)', 'No oversight', 'Model owner only'],
            correctIndex: 1,
            explanation: 'SR 11-7 mandates three lines of defense. Same applies to AI models in regulated US banking.'
          },
          {
            prompt: 'The vendor announces a model snapshot deprecation. The right response is...',
            options: ['Switch immediately', 'Run regression evals on the new snapshot before swap; pin if quality regresses', 'Trust the vendor', 'Disable AI'],
            correctIndex: 1,
            explanation: 'Drift detection in regulated context: pin snapshots, eval on swap, never trust silent vendor changes.'
          },
          {
            prompt: 'For procurement, the right vendor scorecard weighting in financial services is...',
            options: ['Lowest price wins', 'Data handling, compliance certifications, IP indemnification, model snapshot pinning', 'Brand recognition', 'API speed only'],
            correctIndex: 1,
            explanation: 'Regulated procurement emphasizes data handling, compliance, indemnification. Speed and price matter but are not the gating criteria.'
          }
        ]
      },
      12: {
        module: 12,
        title: 'Career & Job Market capstone',
        scenario: 'You are a senior engineer transitioning into an AI Solutions Engineer role. You want to maximize fit and comp.',
        steps: [
          {
            prompt: 'You see "AI Solutions Engineer" in four postings. They look similar. The right move is...',
            options: ['Apply to all four', 'Identify which KORE1 lane each is (pre-sales, FDE, post-sales, internal)', 'Pick the highest-paid', 'Pick the closest geographically'],
            correctIndex: 1,
            explanation: 'The lanes look identical in postings but the daily work and comp shape differ substantially. Lane analysis avoids unsuitable matches.'
          },
          {
            prompt: 'For inbound interest from hiring managers, the highest-leverage action is...',
            options: ['Polish your resume', 'Build 3 public AI demos with deploy URLs and write blog posts about them', 'Get more certifications', 'Apply to more roles'],
            correctIndex: 1,
            explanation: 'Public artifacts compound. Hiring managers screen on demos and writing, not on resume bullets.'
          },
          {
            prompt: 'Behavioral interviewers ask: "tell me about a time you used AI to..." The strongest answer includes...',
            options: ['Just success', 'Specific example with technical detail and reflection on what failed', 'Generic claims', 'Pure technical jargon'],
            correctIndex: 1,
            explanation: 'Senior interviewers want self-aware reflection. Concrete example + technical depth + lessons separates seniors from juniors.'
          },
          {
            prompt: 'For a take-home assignment ("build a RAG system in 48 hours"), the right delivery includes...',
            options: ['A README only', 'Deployed app at a public URL + eval set + 5-min Loom walkthrough', 'Source code only', 'Slide deck'],
            correctIndex: 1,
            explanation: 'Deploy to production; that is the test. Eval set proves you think about quality; Loom proves you can communicate.'
          },
          {
            prompt: 'For a Forward Deployed Engineer role, the comp band you should expect is...',
            options: ['$80K-$100K', 'Palantir $171K-$415K, AI labs $350K-$550K', '$50K-$70K', '$1M+'],
            correctIndex: 1,
            explanation: 'FDE comp is high because the role demands customer empathy, technical depth, autonomy. Heavy travel; corresponding pay.'
          }
        ]
      },
      13: {
        module: 13,
        title: 'Emerging Directions capstone',
        scenario: 'You are forecasting AI capability for the next 12-24 months to inform product strategy.',
        steps: [
          {
            prompt: 'Reasoning models (o-series, Claude with extended thinking) excel at...',
            options: ['Simple lookup', 'Math, multi-step logic, complex extraction', 'Image generation', 'Voice'],
            correctIndex: 1,
            explanation: 'Reasoning models trade thinking budget for quality on hard problems. For routine tasks, they are over-engineered.'
          },
          {
            prompt: 'The 280x cost reduction in 18 months for GPT-4-class capability comes from...',
            options: ['Hardware progress alone', 'Open-weight models catching up + better training methodology + serving efficiency', 'New algorithms', 'Vendor discounting'],
            correctIndex: 1,
            explanation: 'Multiple compounding causes. Open-weight catches the body of the distribution; serving optimizations cut per-token cost; training methodology improves quality per parameter.'
          },
          {
            prompt: 'Personal AI sovereignty (running 70B+ on personal hardware) is enabled by...',
            options: ['NVIDIA H100s only', 'Apple Silicon unified memory architecture and Project DIGITS-class hardware', 'Cloud-only', 'CPU-only inference'],
            correctIndex: 1,
            explanation: 'Unified memory lets you load models that no consumer GPU can fit. The 2026 hardware market made personal AI sovereignty practical.'
          },
          {
            prompt: 'For long-term planning, the right thesis on AI security is...',
            options: ['Defense improves to perfect prevention', 'Attacker moves second; assume defenses fail; design for blast-radius limitation', 'Security is solved', 'Ignore'],
            correctIndex: 1,
            explanation: 'Nasr et al. 2025: 12 published defenses bypassed >90%. Layer defenses; assume breaches; limit damage.'
          },
          {
            prompt: 'The ISO 42001, NIST AI RMF, and EU AI Act overlap is approximately...',
            options: ['Negligible', '70% documentation overlap; design once, map to all', 'Total overlap', 'Complete divergence'],
            correctIndex: 1,
            explanation: 'AI standards convergence: design once for the strictest framework (typically EU AI Act); map to others. Saves substantial program cost.'
          }
        ]
      },
      14: {
        module: 14,
        title: 'AI Coding Agents & IDE Integration capstone',
        scenario: 'You are leading AI-coding-tool adoption for a 50-person engineering team. Calibrate productivity, cost, and risk.',
        steps: [
          {
            prompt: 'For multi-file refactors with codebase-wide context, the right tool tier is...',
            options: ['Inline autocomplete', 'Collaborative agent (Cursor agent mode, Claude Code)', 'Manual coding', 'Copy-paste'],
            correctIndex: 1,
            explanation: 'Inline autocomplete is per-line; multi-file requires codebase-wide reasoning. Agent mode is the right tier.'
          },
          {
            prompt: 'For a senior engineer\'s daily workflow, the right mental model is...',
            options: ['AI as oracle (trust everything)', '"AI is junior dev" with review discipline', '"AI as senior" (override your judgment)', 'No AI'],
            correctIndex: 1,
            explanation: 'Read every diff. AI produces plausible wrong code; review intensity matches the change\'s stakes.'
          },
          {
            prompt: 'For routine bug fixes (failing tests, dependency updates), the right tier is...',
            options: ['Manual', 'Autonomous background agent (Devin, background agent)', 'Inline autocomplete', 'IDE chat'],
            correctIndex: 1,
            explanation: 'Bounded tasks with clear acceptance (tests pass) are exactly what autonomous agents handle well. Cost: $10-100 per task; payback obvious.'
          },
          {
            prompt: 'For maximum productivity per engineer dollar in 2026, the right subscription stack is...',
            options: ['Just Copilot', 'Cursor Pro + Claude Pro/Max + Claude Code API for heavy use', 'No AI tools', 'Custom build everything'],
            correctIndex: 1,
            explanation: 'Stacking 2-3 specialized tools (~$110/mo total) covers daily IDE + chat + agent work. Per-engineer ROI is well-documented.'
          },
          {
            prompt: 'To track AI coding tool ROI rigorously, the right framework is...',
            options: ['Self-reported productivity', 'DX Core 4 (PR throughput, hours saved, adoption)', 'Lines of code', 'Anecdotes'],
            correctIndex: 1,
            explanation: 'Survey-based ROI is systematically inflated. Booking.com\'s rigorous DX Core 4 measurement is the credible pattern.'
          }
        ]
      },
      15: {
        module: 15,
        title: 'AI Product Design Patterns capstone',
        scenario: 'You are designing an AI feature for a knowledge worker product. Pick patterns that maximize adoption and trust.',
        steps: [
          {
            prompt: 'For an enterprise knowledge-base Q-A product, the right autonomy ladder rung is...',
            options: ['Manual', 'Suggest', 'Assist with citation visibility for trust', 'Fully autonomous'],
            correctIndex: 2,
            explanation: 'Knowledge-base Q-A demands trust. Assist tier with explicit citations (trust-building loop) lets users verify; full autonomy without verification erodes trust.'
          },
          {
            prompt: 'For perceived responsiveness on long generations, the canonical UX pattern is...',
            options: ['Wait for full response', 'Streaming token-by-token', 'Progress bar only', 'Email when done'],
            correctIndex: 1,
            explanation: 'Streaming makes 30s responses feel instant (TTFT 200-500ms). The canonical chat UX pattern.'
          },
          {
            prompt: 'For trust-sensitive answers (legal Q-A, medical Q-A), the highest-leverage UX is...',
            options: ['Confident assertions', 'Cite sources at granular spans, allow refusal when context insufficient', 'Long disclaimers', 'No answers'],
            correctIndex: 1,
            explanation: 'The trust-building loop: cite sources, explain reasoning, allow refusal. Without these, trust never establishes.'
          },
          {
            prompt: 'AI feature pricing for high-COGS-per-call workflows: the right model is...',
            options: ['Pure per-seat', 'Hybrid: subscription with usage caps, overage at metered rates', 'Pure per-token', 'Free'],
            correctIndex: 1,
            explanation: 'Hybrid aligns COGS to revenue while keeping pricing predictable. Power users do not destroy unit economics; light users get predictable bills.'
          },
          {
            prompt: 'For maximum vendor flexibility, the right architectural pattern is...',
            options: ['Hardcode one vendor everywhere', 'Wrap calls in your own interface; route through unified gateway; isolate vendor-specific features', 'Avoid AI', 'Switch vendors weekly'],
            correctIndex: 1,
            explanation: 'Model swap architecture: abstract commodity calls; isolate features that earn lock-in. Strategic flexibility, not pure abstraction.'
          }
        ]
      },
      16: {
        module: 16,
        title: 'Data Engineering for AI capstone',
        scenario: 'You are building a document-processing pipeline for 100K legal contracts.',
        steps: [
          {
            prompt: 'For born-digital contract PDFs (text already extractable), the right approach is...',
            options: ['Run Tesseract OCR', 'Skip OCR; extract text directly via PDF parsers (Unstructured.io)', 'Manual transcription', 'Image conversion + OCR'],
            correctIndex: 1,
            explanation: 'OCR adds noise and cost when text is already there. Born-digital -> text extraction; scanned -> OCR.'
          },
          {
            prompt: 'For complex multi-column layouts and tables, the right tool tier is...',
            options: ['Tesseract', 'Mistral OCR or Claude vision OCR', 'Manual reformatting', 'Whisper'],
            correctIndex: 1,
            explanation: 'Modern VLM-based OCR handles complex layouts. Tesseract is for clean printed text only.'
          },
          {
            prompt: 'For structured field extraction (vendor, value, date), the right pattern is...',
            options: ['Regex over plain text', 'Pydantic schema + structured-output mode (tool use, JSON Schema)', 'Hand-rolled parser', 'Manual labeling'],
            correctIndex: 1,
            explanation: 'Constrained decoding via vendor-native structured output enforces schema. Validation downstream catches edge cases.'
          },
          {
            prompt: 'For datasets that drive fine-tuning and evaluation, the right discipline is...',
            options: ['Use latest data always', 'Version datasets like code (DVC, lakeFS) with metadata', 'No versioning', 'Snapshot once'],
            correctIndex: 1,
            explanation: 'Dataset versioning is what makes fine-tunes reproducible. Without it, "what did we train on three months ago" is unanswerable.'
          },
          {
            prompt: 'For production observability of training and inference, the right stack is...',
            options: ['Custom dashboards only', 'W&B / MLflow for tracking + Langfuse / LangSmith for inference observability', 'No observability', 'Email alerts'],
            correctIndex: 1,
            explanation: 'Different layers, different tools. Both are necessary; tracking is for runs, observability is for production behavior.'
          }
        ]
      },
      5: {
        module: 5,
        title: 'Anthropic Stack capstone',
        scenario: 'You are setting up Claude Code for a 4-engineer team that ships a TypeScript monorepo. Pick the right call at each step.',
        steps: [
          {
            prompt: 'Where should the team-wide CLAUDE.md live?',
            options: [
              'In each engineer\'s ~/.claude/CLAUDE.md (global)',
              'In .claude/CLAUDE.md at the repo root (project-level), checked into git',
              'In a private gist linked from the README',
              'In an environment variable injected by the build system'
            ],
            correctIndex: 1,
            explanation: 'Project-level CLAUDE.md at .claude/CLAUDE.md is checked into git so the constitution is shared across all engineers and survives onboarding.'
          },
          {
            prompt: 'Which Skill design pattern fits "build a new full-stack feature end-to-end"?',
            options: [
              'Generator pattern',
              'Inversion pattern',
              'Chained Inversion pattern',
              'No skill needed; default Claude is fine'
            ],
            correctIndex: 1,
            explanation: 'Inversion asks all required questions before execution. Best for full-stack feature builds where missing one field cascades into rework.'
          },
          {
            prompt: 'A PreToolUse hook is best used for...',
            options: [
              'Generating code suggestions inline',
              'Logging every tool call to a JSON file',
              'Blocking destructive commands like "rm -rf" before they run',
              'Replacing the model with a smaller one for cost savings'
            ],
            correctIndex: 2,
            explanation: 'PreToolUse fires before tool execution and can deny. Perfect for blocking destructive commands deterministically (git push --force, rm -rf, etc).'
          },
          {
            prompt: 'When does it make sense to delegate work to a subagent?',
            options: [
              'When the main session would run out of context window otherwise',
              'When you want a job to run while you work on something else',
              'Whenever the task takes more than 30 seconds',
              'Both A and B'
            ],
            correctIndex: 3,
            explanation: 'Subagents have their own context window AND run independently. They keep the main thread clean and let you parallelize.'
          },
          {
            prompt: 'A plugin.json bundles which of the following for distribution?',
            options: [
              'Only Skills',
              'Skills, agents, hooks, slash commands',
              'The entire .claude/ directory verbatim',
              'A list of recommended LLM providers'
            ],
            correctIndex: 1,
            explanation: 'Plugins bundle Skills, agents, hooks, and slash commands so a team can install a curated stack with one command.'
          }
        ]
      }
    };
