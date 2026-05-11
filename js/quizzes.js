// Per-concept quizzes. Keyed by concept slug.
// Value is an array of question objects:
// { prompt: string, options: string[], correctIndex: number, explanation: string }
//
// Coverage: high-traffic modules (M1, M2, M3, M4, M5, M14). Other modules
// fall back to no quiz section in the renderer; flashcards still render.

export const QUIZZES = {
  // ===== Module 1: Foundations =====
  'large-language-model-llm': [
    {
      prompt: 'Which best describes how an LLM produces output?',
      options: [
        'It looks up the answer in a structured database of facts.',
        'It samples the next token from a learned probability distribution conditioned on prior tokens.',
        'It runs a graph algorithm over a knowledge graph.',
        'It executes deterministic rules from its training data.'
      ],
      correctIndex: 1,
      explanation: 'Despite the marketing, an LLM is a probability distribution over next tokens, not a fact database. Capability emerges from sampling that distribution conditioned on context.'
    },
    {
      prompt: 'What is the purpose of post-training?',
      options: [
        'To increase the parameter count of a base model.',
        'To turn a base model that completes text into one that follows instructions.',
        'To compress weights for faster inference.',
        'To replace pre-training entirely.'
      ],
      correctIndex: 1,
      explanation: 'Post-training (SFT, RLHF / DPO, safety training) is what makes a base model behave like an assistant. Pre-training builds language capability; post-training shapes it into useful behavior.'
    }
  ],
  'foundation-model': [
    {
      prompt: 'What distinguishes a foundation model from a task-specific model?',
      options: [
        'Foundation models are always larger.',
        'Foundation models are trained on broad data and adapted to many downstream tasks.',
        'Foundation models always include vision capability.',
        'Foundation models cannot be fine-tuned.'
      ],
      correctIndex: 1,
      explanation: 'Foundation models are differentiated by versatility, not size. They are trained on broad data and adapted (via prompting, retrieval, or fine-tuning) to specific tasks.'
    }
  ],
  'frontier-model': [
    {
      prompt: 'Why does frontier capability matter even when most production runs on cheaper tiers?',
      options: [
        'Frontier models are always cheaper at scale.',
        'Frontier models have lower latency than smaller tiers.',
        'Frontier defines the capability ceiling: tasks that fail there will fail on smaller tiers too.',
        'Frontier models are open-weight by default.'
      ],
      correctIndex: 2,
      explanation: 'If a task does not work on frontier, it will not work on a smaller tier. Validate on frontier first, then optimize cost by stepping down once capability is proven.'
    }
  ],
  'open-weight-model': [
    {
      prompt: 'Which is true of open-weight models in 2026?',
      options: [
        'Their training data and code are always released.',
        'They are always cheaper than closed-weight APIs once self-hosted.',
        'Their weights are downloadable; training data and code are usually not released.',
        'They always exceed closed-frontier on hard reasoning.'
      ],
      correctIndex: 2,
      explanation: 'Open-weight means downloadable trained weights. It does not mean fully open source: training data and training code are usually withheld. Llama, Mistral, Qwen, DeepSeek follow this pattern.'
    }
  ],
  'parameters': [
    {
      prompt: 'What does parameter count primarily correlate with?',
      options: [
        'Inference latency only.',
        'Model accuracy on every task.',
        'Capability and inference cost, with diminishing returns.',
        'Tokenizer efficiency.'
      ],
      correctIndex: 2,
      explanation: 'More parameters generally means more capability and higher cost, but the relationship is sublinear. Training data quality, post-training methodology, and architecture matter as much as raw count.'
    }
  ],
  'pre-training': [
    {
      prompt: 'What is the objective of pre-training?',
      options: [
        'Match human preferences via reward modeling.',
        'Predict the next token given prior tokens, repeated over trillions of tokens.',
        'Build a knowledge graph from training data.',
        'Compress the training corpus.'
      ],
      correctIndex: 1,
      explanation: 'Pre-training is next-token prediction at scale. The model adjusts its parameters to minimize prediction error over internet-scale text. Output: a base model that completes text but does not yet follow instructions.'
    }
  ],
  'transformer-architecture': [
    {
      prompt: 'Which paper introduced the Transformer architecture?',
      options: [
        'Hochreiter and Schmidhuber 1997 (LSTM).',
        'Vaswani et al. 2017 ("Attention Is All You Need").',
        'Devlin et al. 2018 (BERT).',
        'Brown et al. 2020 (GPT-3).'
      ],
      correctIndex: 1,
      explanation: 'Vaswani et al. 2017 introduced the Transformer with self-attention plus feed-forward layers. Every modern frontier LLM is a descendant.'
    }
  ],
  'self-attention': [
    {
      prompt: 'Self-attention computes...',
      options: [
        'A fixed embedding for each token regardless of context.',
        'A weighted sum over all tokens in the context, with weights learned per query.',
        'The Levenshtein distance between input and training data.',
        'A hash of the input sequence.'
      ],
      correctIndex: 1,
      explanation: 'Self-attention computes weighted combinations of value vectors from every token in the context. Weights come from the dot product of queries and keys.'
    }
  ],
  'multi-head-attention': [
    {
      prompt: 'Why do transformers use multiple attention heads instead of one?',
      options: [
        'To reduce the parameter count.',
        'To capture different types of relationships in the same layer.',
        'To make training deterministic.',
        'To eliminate the need for positional encoding.'
      ],
      correctIndex: 1,
      explanation: 'Each head learns a different relevance pattern (syntactic, coreference, semantic, etc.). Concatenating their outputs gives richer per-layer representation than a single head.'
    }
  ],
  'positional-encoding': [
    {
      prompt: 'Why does a transformer need positional encoding?',
      options: [
        'To make attention computation faster.',
        'Because self-attention itself is order-blind.',
        'To compress the model.',
        'To handle multilingual input.'
      ],
      correctIndex: 1,
      explanation: 'Self-attention has no inherent notion of order: "cat sat" and "sat cat" produce identical attention without positional encoding. Position must be injected explicitly.'
    }
  ],
  'rope': [
    {
      prompt: 'What does RoPE encode positions by?',
      options: [
        'Adding learned position vectors to token embeddings.',
        'Rotating Q and K vectors by an angle proportional to position before the attention dot product.',
        'Concatenating one-hot position vectors.',
        'Storing positions in a separate lookup table.'
      ],
      correctIndex: 1,
      explanation: 'RoPE rotates Q and K. The resulting attention score depends on relative position, which generalizes better to long contexts than absolute position.'
    }
  ],
  'kv-cache': [
    {
      prompt: 'Why does the KV cache make streaming feel fast?',
      options: [
        'It precomputes the entire response before streaming starts.',
        'It avoids recomputing keys and values for tokens already seen.',
        'It caches the final output tokens.',
        'It runs the model on a faster GPU.'
      ],
      correctIndex: 1,
      explanation: 'Without KV cache, generating token N+1 reprojects K and V for all N prior tokens. The cache stores them, turning O(N) per-token work into O(1) for the cached portion.'
    }
  ],
  'mixture-of-experts-moe': [
    {
      prompt: 'In a Mixture of Experts model, what determines which experts run for a given token?',
      options: [
        'A round-robin schedule.',
        'A learned router that selects top-K experts per token.',
        'The token\'s position in the sequence.',
        'All experts run for every token; the outputs are averaged.'
      ],
      correctIndex: 1,
      explanation: 'A learned router picks the top-K experts (typically 1 or 2) per token. Total parameters can be 10-100x larger than active parameters, giving knowledge density of a larger model with cost of a smaller one.'
    }
  ],
  'context-window': [
    {
      prompt: 'A 200K-token context window can hold roughly...',
      options: [
        '15K English words.',
        '150K English words.',
        '2M English words.',
        '15M English words.'
      ],
      correctIndex: 1,
      explanation: 'Roughly 0.75 English words per token, so 200K tokens ~ 150K words. Non-Latin scripts and code change this ratio significantly.'
    }
  ],
  'logits': [
    {
      prompt: 'Logits are...',
      options: [
        'The model\'s final output tokens.',
        'Raw unnormalized scores per vocabulary token, pre-softmax.',
        'Softmax probabilities.',
        'Embedding vectors.'
      ],
      correctIndex: 1,
      explanation: 'Logits range over the real numbers. Softmax converts them into a probability distribution over the vocabulary. Higher logit means more likely.'
    }
  ],
  'softmax': [
    {
      prompt: 'Increasing temperature before softmax causes the output distribution to...',
      options: [
        'Become sharper (more peaked).',
        'Become flatter (more uniform).',
        'Stay identical.',
        'Switch from probabilistic to deterministic.'
      ],
      correctIndex: 1,
      explanation: 'Dividing logits by T > 1 reduces their magnitude relative to each other, flattening the distribution. T < 1 sharpens. T = 0 reduces to greedy argmax.'
    }
  ],
  'token': [
    {
      prompt: 'The string "tokenization" typically becomes how many tokens for a modern BPE tokenizer?',
      options: [
        'One token (whole word).',
        'Two or three tokens (subword fragments).',
        'Twelve tokens (one per character).',
        'Zero tokens (filtered as noise).'
      ],
      correctIndex: 1,
      explanation: 'BPE breaks "tokenization" into subwords like ["token", "ization"]. Whole-word tokens exist for common words; rare or compound terms get split.'
    }
  ],
  'tokenization': [
    {
      prompt: 'Why can the same prompt cost different amounts on Claude vs GPT?',
      options: [
        'Vendors charge different rates per character.',
        'Different tokenizers expand the same text into different token counts.',
        'Claude charges per request, GPT charges per second.',
        'Tokenization is free; the difference is network latency.'
      ],
      correctIndex: 1,
      explanation: 'Pricing is per-token. Different vendors\' tokenizers tokenize the same text differently; Claude inflates English by ~1.0-1.35x compared to GPT cl100k.'
    }
  ],
  'bpe': [
    {
      prompt: 'How does BPE build its vocabulary?',
      options: [
        'It uses a fixed dictionary shipped with the model.',
        'It iteratively merges the most-frequent adjacent token pairs in the training corpus.',
        'It runs a neural network over candidate splits.',
        'It uses regex patterns crafted by linguists.'
      ],
      correctIndex: 1,
      explanation: 'BPE starts with characters, finds the most-frequent adjacent pair, merges into a token, and repeats. The merge rules are frozen after training and applied greedily to new text.'
    }
  ],
  'sentencepiece': [
    {
      prompt: 'What makes SentencePiece a good fit for multilingual models?',
      options: [
        'It supports more vocabulary entries.',
        'It treats text as raw Unicode with no language-specific preprocessing.',
        'It produces shorter token sequences than BPE.',
        'It only works for non-English languages.'
      ],
      correctIndex: 1,
      explanation: 'SentencePiece avoids whitespace splitting and language-specific rules. This makes it robust across languages where tokenization conventions differ.'
    }
  ],
  'tiktoken': [
    {
      prompt: 'Tiktoken is...',
      options: [
        'OpenAI\'s embedding model.',
        'OpenAI\'s open-source byte-level BPE tokenizer.',
        'A latency benchmarking tool.',
        'A web framework.'
      ],
      correctIndex: 1,
      explanation: 'Tiktoken is OpenAI\'s open-source byte-level BPE implementation. The Rust-backed library tokenizes at millions of tokens per second.'
    }
  ],
  'vocabulary': [
    {
      prompt: 'Larger vocabulary means...',
      options: [
        'Each token represents fewer characters on average.',
        'Each token represents more characters on average; smaller embedding matrix.',
        'Each token represents more characters on average; larger embedding matrix.',
        'No effect on text length.'
      ],
      correctIndex: 2,
      explanation: 'Larger vocabulary lets each token cover more characters (better compression) at the cost of a larger embedding matrix (more parameters). Frontier models trended toward 128K-256K vocab in 2026.'
    }
  ],
  'tokenizer-as-pricing': [
    {
      prompt: 'How should you compare tokenization cost across vendors for production planning?',
      options: [
        'Use OpenAI\'s tokenizer count and apply a fixed multiplier.',
        'Tokenize a representative sample of your actual data with each vendor\'s tokenizer.',
        'Compare published average ratios from blog posts.',
        'Use word count as a stable proxy.'
      ],
      correctIndex: 1,
      explanation: 'Per-vendor variance depends heavily on your input distribution (English vs code vs non-Latin). The reliable approach is to tokenize 10K samples with each candidate tokenizer.'
    }
  ],
  'embedding': [
    {
      prompt: 'Two texts with similar meaning will have embeddings that...',
      options: [
        'Contain identical components.',
        'Land near each other in the embedding space (high cosine similarity).',
        'Sum to zero.',
        'Have orthogonal vectors.'
      ],
      correctIndex: 1,
      explanation: 'Embedding models are trained so that semantically similar texts produce vectors with high cosine similarity. The geometric closeness in high-dimensional space encodes the semantic relationship.'
    }
  ],
  'embedding-model': [
    {
      prompt: 'Modern embedding models typically use which architecture?',
      options: [
        'Cross-encoder (joint query-document scoring).',
        'Bi-encoder (independent encoding of each text).',
        'Decoder-only causal language model.',
        'Random projections.'
      ],
      correctIndex: 1,
      explanation: 'Bi-encoders encode each text independently into a vector. This is what makes vector search viable at scale: documents are encoded once at indexing, queries per request.'
    }
  ],
  'vector': [
    {
      prompt: 'In LLM context, vector dimensions for embeddings are typically...',
      options: [
        'Between 4 and 16.',
        'Between 384 and 4096.',
        'Always exactly 1024.',
        'Equal to the vocabulary size.'
      ],
      correctIndex: 1,
      explanation: 'Common embedding sizes: 384 (small open models), 768-1024 (mid), 1536-3072 (frontier). The number of dimensions trades expressiveness against storage and compute.'
    }
  ],
  'cosine-similarity': [
    {
      prompt: 'Cosine similarity equals dot product when...',
      options: [
        'The vectors are orthogonal.',
        'The vectors are unit-normalized (L2 norm = 1).',
        'The vectors are sparse.',
        'The vectors are integer-valued.'
      ],
      correctIndex: 1,
      explanation: 'For unit vectors, dot product equals the cosine of the angle between them. Most embedding models output normalized vectors, so cosine similarity and dot product are interchangeable.'
    }
  ],
  'dot-product': [
    {
      prompt: 'For two unit vectors a and b, what does the dot product measure?',
      options: [
        'The Euclidean distance between them.',
        'The cosine of the angle between them.',
        'The L1 norm of their difference.',
        'The Hamming distance.'
      ],
      correctIndex: 1,
      explanation: 'For unit vectors, a . b = cos(theta). Range: [-1, 1]. 1 means identical direction; 0 means orthogonal; -1 means opposite.'
    }
  ],
  'mrl': [
    {
      prompt: 'What is the practical benefit of an MRL-trained embedding model?',
      options: [
        'Embeddings can be losslessly truncated to shorter prefixes for fast tier-1 search.',
        'Embeddings are encrypted by default.',
        'Embeddings handle multimodal input automatically.',
        'Embeddings are 10x smaller than non-MRL models.'
      ],
      correctIndex: 0,
      explanation: 'Matryoshka Representation Learning trains embeddings whose first 64, 128, 256, 512 dimensions are also valid (lower-fidelity) embeddings. Enables tier-1 retrieval at small dim, rerank at full dim.'
    }
  ],
  'inference': [
    {
      prompt: 'LLM inference is typically bottlenecked by...',
      options: [
        'CPU clock speed.',
        'Memory bandwidth.',
        'Network latency to the model file.',
        'Disk I/O.'
      ],
      correctIndex: 1,
      explanation: 'Most LLM inference is memory-bandwidth-bound: GPUs spend most cycles waiting on weights to arrive from VRAM. This is why bandwidth (GB/s) often matters more than raw compute for inference throughput.'
    }
  ],
  'sampling': [
    {
      prompt: 'Greedy decoding selects the next token by...',
      options: [
        'Drawing from the full distribution at temperature 1.',
        'Always picking the argmax of the distribution.',
        'Picking the lowest-probability token.',
        'Voting across K parallel samples.'
      ],
      correctIndex: 1,
      explanation: 'Greedy decoding deterministically picks the most probable token. It produces consistent but often repetitive output. Temperature 0 is functionally equivalent.'
    }
  ],
  'temperature': [
    {
      prompt: 'Setting temperature to 0...',
      options: [
        'Maximizes randomness.',
        'Reduces sampling to deterministic argmax.',
        'Disables the model.',
        'Triggers chain-of-thought.'
      ],
      correctIndex: 1,
      explanation: 'T=0 sharpens the distribution to a delta function on the argmax. Output becomes deterministic (modulo any other sampling randomness). T=1 is unmodified; T>1 is more uniform.'
    }
  ],
  'top-p': [
    {
      prompt: 'How does top-p (nucleus) sampling adapt to model confidence?',
      options: [
        'It always samples from a fixed K tokens.',
        'It includes the smallest set of tokens whose cumulative probability >= P.',
        'It only samples the top-1 token.',
        'It scales with vocabulary size.'
      ],
      correctIndex: 1,
      explanation: 'Top-p picks the nucleus (smallest set of tokens summing to P probability). On confident predictions the nucleus shrinks; on uncertain ones it widens. Top-k always takes K regardless of confidence.'
    }
  ],
  'top-k': [
    {
      prompt: 'Top-k sampling differs from top-p in that...',
      options: [
        'Top-k always restricts sampling to a fixed K tokens.',
        'Top-k uses temperature; top-p does not.',
        'Top-k is deterministic.',
        'Top-k requires a special model.'
      ],
      correctIndex: 0,
      explanation: 'Top-k always considers exactly K tokens regardless of distribution shape. Top-p adapts to confidence. For most production work top-p is preferred.'
    }
  ],
  'latency': [
    {
      prompt: 'TTFT and ITL stand for...',
      options: [
        'Tokens to First Tag and Inter-Tag Latency.',
        'Time-To-First-Token and Inter-Token Latency.',
        'Total Time For Test and Iteration Time Limit.',
        'Throughput To First Tier and Idle Tail Latency.'
      ],
      correctIndex: 1,
      explanation: 'TTFT is the time until the first token arrives (dominated by prefill on long inputs). ITL is the time between subsequent tokens (dominated by per-token forward pass). Both matter for chat UX.'
    }
  ],
  'throughput': [
    {
      prompt: 'Why does aggregate throughput diverge from per-request throughput?',
      options: [
        'Different GPUs run different requests.',
        'Continuous batching processes multiple requests in parallel; each request gets less compute, but total throughput rises.',
        'The model becomes faster with more users.',
        'Network bandwidth is shared.'
      ],
      correctIndex: 1,
      explanation: 'Batching multiple requests amortizes weight-loading cost across them. Per-request throughput drops slightly; aggregate throughput rises substantially. This is the core innovation of vLLM and SGLang.'
    }
  ],
  'quantization': [
    {
      prompt: 'Quantizing a model from FP16 to INT4...',
      options: [
        'Increases model size 4x.',
        'Reduces memory and bandwidth by ~4x with some quality loss.',
        'Has no effect on inference speed.',
        'Always improves accuracy.'
      ],
      correctIndex: 1,
      explanation: 'INT4 stores each weight in 4 bits vs FP16\'s 16 bits, cutting memory ~4x. Modern quantization (AWQ, GGUF, MLX) preserves most quality; benchmark on your task to confirm.'
    }
  ],

  // ===== Module 2: Prompting Patterns =====
  'system-prompt': [
    {
      prompt: 'Where should the most important rule in a system prompt go?',
      options: [
        'Buried at the end after long context.',
        'Lead the system prompt with the critical rule.',
        'In a separate user message.',
        'In the model\'s temperature setting.'
      ],
      correctIndex: 1,
      explanation: 'Models attend more reliably to early system-prompt tokens. Lead with the critical rule; bury implementation detail at the end.'
    }
  ],
  'few-shot-prompting': [
    {
      prompt: 'Few-shot examples should be...',
      options: [
        'As different from the real input as possible to test generalization.',
        'Representative of the actual task: same format, edge cases, conventions.',
        'Always exactly 10 in number.',
        'Drawn only from the training corpus of the model.'
      ],
      correctIndex: 1,
      explanation: 'The model pattern-matches to your examples. If they are not representative, the output quality on real inputs degrades. 3-5 representative examples beat 10 random ones.'
    }
  ],
  'chain-of-thought-cot': [
    {
      prompt: 'CoT is most valuable for...',
      options: [
        'Simple lookup tasks.',
        'Multi-step reasoning, math, or extraction tasks.',
        'Reducing per-request cost.',
        'Replacing structured output.'
      ],
      correctIndex: 1,
      explanation: 'CoT pays off when the answer requires intermediate reasoning. For simple classification or lookup it adds tokens without quality gain.'
    }
  ],
  'self-consistency': [
    {
      prompt: 'Self-consistency improves accuracy by...',
      options: [
        'Running each prompt with a different model.',
        'Sampling K independent CoT responses and taking the majority answer.',
        'Caching the prompt prefix.',
        'Using top-k = 1.'
      ],
      correctIndex: 1,
      explanation: 'With non-zero temperature, each CoT path may go astray, but the correct answer tends to dominate the vote across K samples. Cost is K-times a single CoT.'
    }
  ],
  'prompt-chaining': [
    {
      prompt: 'When does prompt chaining beat a single mega-prompt?',
      options: [
        'When latency is the only concern.',
        'When the task has multiple sub-steps that benefit from focused context per step.',
        'When users want streaming output.',
        'Never; one prompt is always better.'
      ],
      correctIndex: 1,
      explanation: 'Chaining gives each step focused context and inspectable intermediate outputs. The cost is latency (multiple calls). Worth it for multi-step tasks where quality matters.'
    }
  ],
  'structured-output': [
    {
      prompt: 'The most reliable 2026 approach to enforcing JSON shape from an LLM is...',
      options: [
        'Asking nicely in the prompt and hoping for the best.',
        'Using vendor structured-output mode (constrained decoding) plus a Pydantic schema.',
        'Generating freeform text and using regex to extract.',
        'Restarting the request until it parses.'
      ],
      correctIndex: 1,
      explanation: 'Constrained decoding (Anthropic tool input_schema, OpenAI response_format json_schema) plus a Pydantic schema gives both the model and your code the same contract. Three layers of defense.'
    }
  ],
  'pydantic': [
    {
      prompt: 'In an LLM workflow, a single Pydantic class can be used to...',
      options: [
        'Document the shape, generate JSON Schema for the API, and validate the response.',
        'Replace the LLM call entirely.',
        'Encrypt prompts.',
        'Only validate; nothing else.'
      ],
      correctIndex: 0,
      explanation: 'Pydantic models serve triple duty: schema documentation, JSON Schema generation for the model API (via model_json_schema), and runtime validation of parsed output.'
    }
  ],
  'instructor': [
    {
      prompt: 'What does the Instructor library add to a vendor SDK call?',
      options: [
        'A faster network protocol.',
        'A response_model parameter that returns a typed Pydantic instance with validation retries.',
        'A new tokenizer.',
        'Local model serving.'
      ],
      correctIndex: 1,
      explanation: 'Instructor patches the SDK so you can pass response_model=YourPydanticClass and get back a validated instance. Validation failures trigger automatic retries with the error fed back to the model.'
    }
  ],
  'prompt-caching': [
    {
      prompt: 'Prompt caching gives you the biggest win when...',
      options: [
        'Each request has a unique system prompt.',
        'Many requests share a long stable prefix (system prompt, tools, document context).',
        'You use only Haiku-tier models.',
        'You batch requests asynchronously.'
      ],
      correctIndex: 1,
      explanation: 'The cache stores the K-V state of a stable prefix. Subsequent requests with the same prefix get up to 90% off the cached portion. Highest leverage on agents, customer support, code review.'
    }
  ],
  'prompt-injection': [
    {
      prompt: 'Indirect prompt injection occurs when...',
      options: [
        'A user types "Ignore previous instructions" directly.',
        'Instructions are embedded in tool output or retrieved documents that the model treats as data.',
        'The system prompt is encrypted.',
        'The temperature is set above 1.'
      ],
      correctIndex: 1,
      explanation: 'Indirect injection hides instructions in retrieved content (web pages, emails, PDFs). The model reads them as if from the user. Defense: treat all retrieved content as untrusted data; constrain agent capabilities.'
    }
  ],
  'jailbreak': [
    {
      prompt: 'How does a jailbreak differ from prompt injection?',
      options: [
        'They are the same thing.',
        'Jailbreaks target the model\'s safety policy; injections target the system prompt.',
        'Jailbreaks only work on open-weight models.',
        'Injections are always intentional.'
      ],
      correctIndex: 1,
      explanation: 'Jailbreak: bypass safety training to elicit forbidden output. Injection: override the system prompt with attacker-supplied instructions. Different attack surfaces; different defenses.'
    }
  ],

  // ===== Module 3: Context Engineering & RAG =====
  'retrieval-augmented-generation-rag': [
    {
      prompt: 'The core RAG loop is...',
      options: [
        'Train, evaluate, deploy.',
        'Embed query, retrieve top-K, inject into prompt, generate.',
        'Tokenize, sample, decode.',
        'Crawl, index, rank.'
      ],
      correctIndex: 1,
      explanation: 'RAG: turn the query into a vector, search a vector store for the K most similar chunks, stuff those chunks into the prompt, generate an answer. The model is grounded in the retrieved context.'
    }
  ],
  'naive-rag': [
    {
      prompt: 'Why do production RAG systems outgrow naive RAG?',
      options: [
        'Naive RAG is too expensive.',
        'Naive RAG misses queries that need rewriting, hybrid search, or reranking.',
        'Naive RAG cannot use embeddings.',
        'Naive RAG requires GPUs.'
      ],
      correctIndex: 1,
      explanation: 'Naive RAG (embed + top-K + stuff) plateaus at 50-65% answer accuracy on enterprise corpora. Adding query rewriting, hybrid search, and reranking pushes to 75-85%.'
    }
  ],
  'advanced-rag': [
    {
      prompt: 'Which is NOT typically part of Advanced RAG?',
      options: [
        'Query rewriting / expansion.',
        'Hybrid (vector + BM25) retrieval.',
        'Cross-encoder reranking.',
        'Always fine-tuning the base model.'
      ],
      correctIndex: 3,
      explanation: 'Advanced RAG layers query rewriting, hybrid retrieval, and reranking on top of basic vector search. Fine-tuning is a separate (and rarer) intervention; you usually try Advanced RAG first.'
    }
  ],
  'graphrag': [
    {
      prompt: 'GraphRAG is most useful for queries that...',
      options: [
        'Match a single document chunk.',
        'Require multi-hop reasoning across entity relationships.',
        'Need real-time data.',
        'Are written in non-English languages.'
      ],
      correctIndex: 1,
      explanation: 'Vector RAG returns semantically similar chunks. Graph RAG traces entity-relationship paths. Multi-hop questions ("who reported to Alice when she joined") favor graph approach.'
    }
  ],
  'agentic-rag': [
    {
      prompt: 'In agentic RAG, who decides what to retrieve and when?',
      options: [
        'The end user types each query.',
        'The model itself, via a search tool, decides per turn.',
        'A scheduled batch job.',
        'The vector database autonomously.'
      ],
      correctIndex: 1,
      explanation: 'Agentic RAG gives the model a search tool. It decides whether to retrieve, what query to issue, and whether the result is sufficient. Higher latency than fixed-pipeline RAG; better quality on complex multi-hop questions.'
    }
  ],
  'chunking': [
    {
      prompt: 'A chunking strategy that always cuts every 500 tokens regardless of content boundaries is called...',
      options: [
        'Semantic chunking.',
        'Late chunking.',
        'Naive (fixed-size) chunking.',
        'Hierarchical chunking.'
      ],
      correctIndex: 2,
      explanation: 'Naive fixed-size chunking is the simplest baseline. It produces uniform chunks but cuts mid-sentence and mid-section. Semantic chunking respects content boundaries; late chunking embeds the full doc first.'
    }
  ],
  'chunk-size': [
    {
      prompt: 'How should you pick chunk size for a new RAG system?',
      options: [
        'Always use 512 tokens (industry standard).',
        'Sweep 200-2000 on an eval set; pick the value that maximizes answer quality.',
        'Use the model\'s context window divided by 100.',
        'Make chunks as small as possible to maximize retrieval precision.'
      ],
      correctIndex: 1,
      explanation: 'Optimal chunk size is corpus-dependent and surprising. Build an eval set, sweep sizes, pick by quality. Picking by intuition usually misses the optimum by 2-3x.'
    }
  ],
  'semantic-chunking': [
    {
      prompt: 'Semantic chunking differs from fixed-size chunking by...',
      options: [
        'Producing larger chunks.',
        'Respecting content boundaries (sections, paragraphs, sentences) so chunks contain coherent meaning.',
        'Embedding each chunk twice.',
        'Running on GPU.'
      ],
      correctIndex: 1,
      explanation: 'Semantic chunking splits at natural boundaries (header -> paragraph -> sentence). Variable chunk sizes complicate budget math but improve retrieval recall by keeping coherent thoughts together.'
    }
  ],
  'late-chunking': [
    {
      prompt: 'Late chunking improves retrieval quality by...',
      options: [
        'Embedding the full document first, then pooling token embeddings into chunks.',
        'Chunking after retrieval.',
        'Skipping chunking entirely.',
        'Using larger embedding dimensions.'
      ],
      correctIndex: 0,
      explanation: 'Late chunking gives each chunk\'s embedding access to document-level context: pronoun references resolve, mid-document examples get context from the introduction. Requires a long-context embedding model.'
    }
  ],
  'vector-database': [
    {
      prompt: 'What does a vector database optimize for?',
      options: [
        'Exact-match keyword search.',
        'Approximate nearest-neighbor (ANN) search over high-dimensional vectors.',
        'Document parsing.',
        'Tokenization.'
      ],
      correctIndex: 1,
      explanation: 'Vector databases specialize in ANN search: given a query vector, find the K nearest stored vectors. HNSW, IVF, and IVF-PQ are the dominant index algorithms.'
    }
  ],
  'pinecone': [
    {
      prompt: 'Pinecone\'s primary trade-off vs self-hosted alternatives is...',
      options: [
        'Higher latency.',
        'Lower ops cost in exchange for higher per-vector cost at scale.',
        'No metadata filtering.',
        'No SDK support.'
      ],
      correctIndex: 1,
      explanation: 'Pinecone is fully managed: zero infra ops, mature SDKs, sub-100ms p95. The cost rises faster than self-hosted alternatives (Qdrant, Weaviate, pgvector) at large scale.'
    }
  ],
  'pgvector': [
    {
      prompt: 'When is pgvector the right choice?',
      options: [
        'When you need 1B+ vectors and submillisecond latency.',
        'When you already run Postgres and have moderate scale, and want SQL filtering plus vector search in one query.',
        'When you have no database experience.',
        'Only when you need GPU inference.'
      ],
      correctIndex: 1,
      explanation: 'pgvector turns Postgres into a vector DB. Best when transactional data and vectors live together, scale is moderate (under 10-50M vectors), and you want SQL-native filtering.'
    }
  ],
  'hnsw': [
    {
      prompt: 'HNSW achieves fast ANN search by...',
      options: [
        'Brute-force comparing the query to every vector.',
        'Building a multi-layer navigable graph and traversing from coarse to fine.',
        'Running quantum algorithms.',
        'Using a hash table.'
      ],
      correctIndex: 1,
      explanation: 'HNSW (Hierarchical Navigable Small World) builds a layered graph. Search starts at the top (sparse, long-range edges), descends through layers, lands at high recall with logarithmic-ish complexity.'
    }
  ],
  'ann': [
    {
      prompt: 'What recall-latency tradeoff is typical for HNSW vs exact search?',
      options: [
        'HNSW is slower with the same recall.',
        'HNSW gives 99% recall at 100-1000x speedup.',
        'HNSW has 10% recall but is faster.',
        'HNSW only works for small indexes.'
      ],
      correctIndex: 1,
      explanation: 'HNSW typically achieves >99% recall at 100-1000x the speed of exact (full-scan) search. The 1% recall loss is invisible to most production use cases; the speedup is what makes vector search viable.'
    }
  ],
  'hybrid-search': [
    {
      prompt: 'Hybrid search combines...',
      options: [
        'Two different vector models.',
        'Vector (semantic) and lexical (BM25) retrieval.',
        'Local and cloud serving.',
        'CPU and GPU inference.'
      ],
      correctIndex: 1,
      explanation: 'Vector search captures paraphrase / synonym matches; BM25 captures exact-term matches (codes, IDs, product names). Combining them via reciprocal rank fusion catches both kinds of relevance.'
    }
  ],
  'rrf': [
    {
      prompt: 'Reciprocal Rank Fusion combines ranked lists by...',
      options: [
        'Averaging the raw scores.',
        'Summing 1 / (k + rank_i) across lists for each document.',
        'Picking the union of top-1 from each list.',
        'Training a neural network.'
      ],
      correctIndex: 1,
      explanation: 'RRF: score(doc) = sum over lists of 1 / (k + rank). The k constant (typically 60) damps extreme ranks. Robust because it does not require score normalization across heterogeneous retrievers.'
    }
  ],
  'reranking': [
    {
      prompt: 'Reranking is typically done with a cross-encoder because...',
      options: [
        'Cross-encoders are cheaper than bi-encoders.',
        'A cross-encoder jointly attends to query and document, capturing interactions that vector similarity cannot.',
        'Cross-encoders run faster.',
        'Cross-encoders work without training.'
      ],
      correctIndex: 1,
      explanation: 'A cross-encoder takes (query, doc) as joint input and outputs a relevance score. Higher quality than vector similarity at the cost of O(K) per query. Used as a second-stage rerank over 50-100 candidates.'
    }
  ],
  'bm25': [
    {
      prompt: 'BM25 excels at queries containing...',
      options: [
        'Paraphrased natural language.',
        'Rare exact-match terms (acronyms, error codes, IDs, product names).',
        'Multilingual content.',
        'Visual content.'
      ],
      correctIndex: 1,
      explanation: 'BM25 weights documents by term frequency and inverse document frequency. Rare terms with multiple occurrences dominate; this is exactly the case for technical IDs and codes that vector search struggles with.'
    }
  ],
  'cross-encoder': [
    {
      prompt: 'Cross-encoders are used for reranking, not retrieval, because...',
      options: [
        'Their relevance scores are random.',
        'They need to score every (query, doc) pair, which is O(N) per query.',
        'They produce vectors, not scores.',
        'They only work on short text.'
      ],
      correctIndex: 1,
      explanation: 'A cross-encoder runs a transformer over the concatenated query-document text. Doing this for every doc in a million-doc corpus is infeasible. So: retrieve 50-100 candidates with vector + BM25, rerank with cross-encoder.'
    }
  ],
  'hyde': [
    {
      prompt: 'HyDE addresses what specific retrieval problem?',
      options: [
        'Slow retrieval latency.',
        'Query-document mismatch: short queries do not look like documents in embedding space.',
        'High API costs.',
        'Vector dimension mismatch.'
      ],
      correctIndex: 1,
      explanation: 'HyDE generates a hypothetical answer (which looks like a document), embeds it, and uses that as the retrieval vector. The hypothetical can be wrong; what matters is it lands closer to real relevant documents.'
    }
  ],

  // ===== Module 4: Agents & MCP =====
  'ai-agent': [
    {
      prompt: 'The defining loop of an AI agent is...',
      options: [
        'Tokenize, sample, decode.',
        'Plan, act (call tool), observe, reflect, repeat.',
        'Embed, retrieve, generate.',
        'Train, evaluate, deploy.'
      ],
      correctIndex: 1,
      explanation: 'An agent reasons toward a goal via repeated cycles of plan-act-observe. Each tool call returns observations; the model reflects and chooses the next step until the task is complete.'
    }
  ],
  'agent-vs-workflow-distinction': [
    {
      prompt: 'In Anthropic\'s framing, the difference between an agent and a workflow is...',
      options: [
        'Agents use Claude; workflows use GPT.',
        'In an agent, the model decides the next step. In a workflow, the developer hard-codes the sequence.',
        'Agents are stateless; workflows are stateful.',
        'There is no difference.'
      ],
      correctIndex: 1,
      explanation: 'Workflows are deterministic sequences; agents make runtime decisions about what to do next. Most production "agents" are actually workflows with model-flavored steps. True agents have higher variance but solve more open-ended tasks.'
    }
  ],
  'tool-use': [
    {
      prompt: 'When the model "uses a tool" in a 2026 API, it...',
      options: [
        'Executes Python code directly.',
        'Produces a structured tool-call message; the runtime executes the tool and returns the result for the model to continue.',
        'Sends an HTTP request itself.',
        'Modifies its own weights.'
      ],
      correctIndex: 1,
      explanation: 'The model produces a tool_use message (structured JSON with name + arguments). Your runtime executes the tool, packages the result as a tool_result message, and feeds it back. The model continues with the new context.'
    }
  ],
  'tool-definition-schema': [
    {
      prompt: 'The most-engineered field of a tool definition is typically...',
      options: [
        'The name.',
        'The description (especially when to use AND when NOT to use).',
        'The output schema.',
        'The tool ID.'
      ],
      correctIndex: 1,
      explanation: 'The model uses the description to decide whether to invoke the tool. Vague descriptions lead to misuse; precise descriptions with positive AND negative triggers ("Do NOT use for X") give reliable selection.'
    }
  ],
  'multi-agent-system': [
    {
      prompt: 'When does a multi-agent system outperform a single well-designed agent?',
      options: [
        'Always.',
        'When tasks are clearly separable and each specialist has a focused scope and tool surface.',
        'When you want lower latency.',
        'When you want lower cost.'
      ],
      correctIndex: 1,
      explanation: 'Multi-agent helps when tasks decompose into focused sub-tasks (research / analyze / write). Handoffs lose context and add latency; if the boundaries are weak, a single agent with all tools wins.'
    }
  ],
  'mcp': [
    {
      prompt: 'MCP is best described as...',
      options: [
        'A new model architecture.',
        'An open protocol for connecting LLMs to tools, data, and prompts ("USB-C of AI integrations").',
        'A vector database.',
        'A fine-tuning method.'
      ],
      correctIndex: 1,
      explanation: 'Model Context Protocol (Anthropic, late 2024). Standard interface so any client (Claude Desktop, Cursor, custom agents) can speak to any server (filesystem, GitHub, internal tools). Composable; vendor-agnostic.'
    }
  ],
  'mcp-server': [
    {
      prompt: 'An MCP server exposes which three things?',
      options: [
        'Models, embeddings, and weights.',
        'Tools, resources, and prompts.',
        'GPUs, RAM, and networks.',
        'Only tools.'
      ],
      correctIndex: 1,
      explanation: 'Tools (model invokes them), resources (passive context the client reads), and prompts (reusable templates the client can render). Most MCP usage is tools-driven; resources and prompts are less common.'
    }
  ],
  'subagent': [
    {
      prompt: 'A subagent differs from a tool call in that...',
      options: [
        'A subagent runs in its own context window with its own system prompt.',
        'A subagent is always synchronous.',
        'A subagent uses a smaller model.',
        'A subagent cannot use tools.'
      ],
      correctIndex: 0,
      explanation: 'Subagents have isolated context. The lead agent invokes them for a specific task; the subagent runs to completion and returns a summary. Keeps the lead\'s context clean during long tasks.'
    }
  ],
  'langchain': [
    {
      prompt: 'In 2026, the recommended path within LangChain for stateful agent orchestration is...',
      options: [
        'Raw LangChain agents.',
        'LangGraph (graph-based orchestration with explicit state).',
        'Pure prompt chaining.',
        'Switching to a non-LangChain framework.'
      ],
      correctIndex: 1,
      explanation: 'LangGraph (2024) is the production-recommended path. Graph nodes and explicit state replace the implicit AgentExecutor pattern, which is now considered legacy.'
    }
  ],
  'pydantic-ai': [
    {
      prompt: 'Pydantic AI\'s differentiating bet is...',
      options: [
        'Maximum flexibility via dynamic typing.',
        'End-to-end typing of agent input, output, and tool definitions, with errors caught at static-check time.',
        'Lowest cost per token.',
        'Largest model support.'
      ],
      correctIndex: 1,
      explanation: 'Pydantic AI types every boundary. For type-conscious Python teams, this catches errors before they reach production and makes refactoring safer. The 2026 rising default for greenfield Python work.'
    }
  ],
  'mastra': [
    {
      prompt: 'Mastra\'s primary audience is...',
      options: [
        'Python data scientists.',
        'TypeScript / Node teams building full-stack agent applications, especially on Vercel or Cloudflare.',
        'Mobile app developers.',
        'Embedded systems engineers.'
      ],
      correctIndex: 1,
      explanation: 'Mastra is TypeScript-first, deployable to Vercel and Cloudflare Workers, and aligned with the Vercel AI SDK. Cohesive package: agents, workflows, RAG, evals, observability.'
    }
  ],
  'claude-agent-sdk': [
    {
      prompt: 'Claude Agent SDK wraps which primitives?',
      options: [
        'Only Anthropic API messages.',
        'Subagents, hooks, skills, MCP - the same primitives that power Claude Code.',
        'Only LoRA fine-tuning.',
        'Only voice agents.'
      ],
      correctIndex: 1,
      explanation: 'The SDK exposes the full ADK as a programmable surface. Build long-running autonomous agents that share design DNA with Claude Code, with state management and observability built in.'
    }
  ],
  'durable-execution': [
    {
      prompt: 'Why is durable execution important for long-running agents?',
      options: [
        'It makes agents faster.',
        'It lets agents survive crashes by persisting state and resuming from the last checkpoint.',
        'It reduces token cost.',
        'It replaces fine-tuning.'
      ],
      correctIndex: 1,
      explanation: 'Without durability, every transient infra issue destroys an agent\'s work. Temporal / Inngest persist every step; on crash, a new worker resumes. Essential for agents that run for hours or days.'
    }
  ],

  // ===== Module 5: The Anthropic Stack =====
  'agent-development-kit': [
    {
      prompt: 'The five layers of the Anthropic Agent Development Kit are...',
      options: [
        'Prompts, vectors, indexes, agents, plugins.',
        'Memory (CLAUDE.md), Knowledge (Skills), Guardrails (Hooks), Delegation (Subagents), Distribution (Plugins).',
        'Train, evaluate, deploy, monitor, maintain.',
        'Frontend, backend, database, cache, queue.'
      ],
      correctIndex: 1,
      explanation: 'Each layer addresses a distinct concern. Memory: persistent context. Knowledge: reusable skills. Guardrails: safety. Delegation: subagents. Distribution: plugins. Compose them as needed.'
    }
  ],
  'claude-md': [
    {
      prompt: 'CLAUDE.md belongs to which ADK layer?',
      options: [
        'Knowledge.',
        'Memory.',
        'Guardrails.',
        'Distribution.'
      ],
      correctIndex: 1,
      explanation: 'CLAUDE.md is the Memory layer. It contains persistent instructions Claude reads on every session: voice, conventions, architecture rules, things future-you will forget.'
    }
  ],
  'claude-skills': [
    {
      prompt: 'Skills load in Claude\'s context via which mechanism?',
      options: [
        'All skills are loaded at session start.',
        'Progressive disclosure: only skills whose description matches the current context load.',
        'Skills are cached on disk.',
        'Skills are pre-compiled into the model weights.'
      ],
      correctIndex: 1,
      explanation: 'Progressive disclosure prevents context bloat. Each skill has a description; Claude pulls the matching skill into context on demand. Lets you have hundreds of skills without paying for them on every turn.'
    }
  ],
  'skill-md': [
    {
      prompt: 'A well-designed SKILL.md description includes...',
      options: [
        'Only positive triggers.',
        'Both positive triggers AND explicit "Do NOT use for..." negative triggers.',
        'A list of every word that should activate the skill.',
        'The user\'s API key.'
      ],
      correctIndex: 1,
      explanation: 'Negative triggers prevent misuse. Without them, the model invokes the skill on tangentially-related contexts. Always state what the skill is NOT for.'
    }
  ],
  'progressive-disclosure': [
    {
      prompt: 'Progressive disclosure solves what problem?',
      options: [
        'Slow inference.',
        'Context bloat from loading every available skill or document.',
        'Jailbreaks.',
        'Tokenization differences.'
      ],
      correctIndex: 1,
      explanation: 'Loading all skills and docs upfront fills the context window with irrelevant information, reducing model attention on the task. Progressive disclosure loads only what matches.'
    }
  ],
  'skill-design-pattern-generator': [
    {
      prompt: 'The Generator pattern produces output by...',
      options: [
        'Asking the user a series of questions first.',
        'Combining static knowledge with input to produce an artifact, no questions asked.',
        'Running a fine-tuned model.',
        'Chaining multiple skills.'
      ],
      correctIndex: 1,
      explanation: 'Generator: "given X, write Y". The skill encodes static knowledge; input drives output. No back-and-forth. Use when the task shape is clear from input alone.'
    }
  ],
  'skill-design-pattern-inversion': [
    {
      prompt: 'The Inversion pattern is appropriate when...',
      options: [
        'The task is a single deterministic transformation.',
        'The skill needs information from the user before it can produce the artifact.',
        'You want the skill to run silently.',
        'You need maximum tokens-per-second throughput.'
      ],
      correctIndex: 1,
      explanation: 'Inversion: skill asks the user for missing context, then produces. Best for full-stack feature builds where requirements need to be elicited before code can be written.'
    }
  ],
  'hooks': [
    {
      prompt: 'A PreToolUse hook can...',
      options: [
        'Modify the model\'s weights.',
        'Approve, block, or modify a tool invocation before it runs.',
        'Replace the model with a different one mid-session.',
        'Edit the user\'s system prompt.'
      ],
      correctIndex: 1,
      explanation: 'PreToolUse fires before tool execution. Common uses: forbid dangerous commands (rm in production paths), validate inputs, inject context. Hook scripts can return success or block the call.'
    }
  ],
  'subagents': [
    {
      prompt: 'Why use a subagent instead of putting everything in the lead agent\'s context?',
      options: [
        'Subagents are free.',
        'Subagents have isolated context, keeping the lead\'s context clean and focused.',
        'Subagents always run faster.',
        'Subagents do not need API keys.'
      ],
      correctIndex: 1,
      explanation: 'Long-running tasks bloat the lead\'s context. Subagents handle focused sub-tasks in their own context, return a summary. Lead stays uncluttered for the next decision.'
    }
  ],
  'plugins': [
    {
      prompt: 'A Claude plugin bundles which of the following?',
      options: [
        'Only skills.',
        'Skills, hooks, subagents, and MCP server configs as one installable artifact.',
        'Only fine-tuned model weights.',
        'Only documentation.'
      ],
      correctIndex: 1,
      explanation: 'Plugins are the Distribution layer. A team\'s "release-tooling" plugin can include a release-notes skill, a push-gating hook, a release-engineer subagent, and a deploy-tool MCP server. One install, full capability.'
    }
  ],
  'computer-use': [
    {
      prompt: 'When deploying computer-use, the most important safety practice is...',
      options: [
        'Run on the user\'s actual desktop for fidelity.',
        'Always run in a sandbox: VM, container, remote display server.',
        'Disable logging to reduce overhead.',
        'Skip user confirmation for routine actions.'
      ],
      correctIndex: 1,
      explanation: 'Computer use is the most powerful (and most dangerous) capability. A sandbox boundary limits the blast radius of prompt injection or model errors. Treat agent computer-use like running untrusted code.'
    }
  ],
  'extended-thinking': [
    {
      prompt: 'Extended thinking should be enabled when...',
      options: [
        'On every request for maximum quality.',
        'On hard reasoning, math, or planning tasks where the quality lift justifies the extra output cost.',
        'Only on classification tasks.',
        'Never.'
      ],
      correctIndex: 1,
      explanation: 'Thinking tokens are billed at output rate. On simple tasks they add cost without benefit. Run an eval: enable thinking, sweep budget, find the point where quality plateaus.'
    }
  ],
  'prompt-caching-anthropic': [
    {
      prompt: 'When does Anthropic prompt caching most reliably save money?',
      options: [
        'When every request has a unique system prompt.',
        'When many requests share the same long prefix (system prompt + tools + documents).',
        'On batch API requests.',
        'On streaming requests only.'
      ],
      correctIndex: 1,
      explanation: 'Cache hits require exact prefix match. The marker overhead is small but real, so per-request unique prefixes lose money. Stable agent prefixes save 80-90% on cached portions.'
    }
  ],
  'batch-api-anthropic': [
    {
      prompt: 'Anthropic Batch API is appropriate for...',
      options: [
        'User-facing chat.',
        'Voice agents.',
        'Offline classification, embeddings, eval runs, content moderation across a corpus.',
        'Real-time fraud detection.'
      ],
      correctIndex: 2,
      explanation: '50% discount, async, up to 24-hour SLO. Wrong for any workload that needs results in seconds. Right for nightly classification, eval-set runs, bulk embedding generation.'
    }
  ],
  'claude-opus-sonnet-haiku': [
    {
      prompt: 'A production stack handling high-volume routing plus occasional complex agentic tasks should...',
      options: [
        'Always use Opus for consistency.',
        'Route routine requests to Haiku, complex agentic tasks to Sonnet or Opus.',
        'Always use Haiku.',
        'Switch between vendors per request.'
      ],
      correctIndex: 1,
      explanation: 'Match tier to task. Haiku at 95% of routine traffic + Sonnet / Opus at the harder 5% saves 3-5x cost vs always-Opus, with imperceptible quality difference on the routine path.'
    }
  ],

  // ===== Module 14: AI Coding Agents & IDE Integration =====
  'claude-code': [
    {
      prompt: 'Claude Code\'s default execution model is...',
      options: [
        'Suggest only; user types every line.',
        'Plan-then-execute: agent proposes a plan, user approves, then execution.',
        'Fully autonomous; user reviews only the final PR.',
        'Background batch only.'
      ],
      correctIndex: 1,
      explanation: 'Plan-then-execute adds a review gate before action. Catches misunderstandings early and keeps you in the loop on complex changes. You can opt into more autonomy when appropriate.'
    }
  ],
  'cursor': [
    {
      prompt: 'Cursor\'s @-mention pattern lets you...',
      options: [
        'Mention other users in comments.',
        'Reference files, symbols, or docs explicitly to give the agent precise context.',
        'Forward messages to other tools.',
        'Tag PRs in chat.'
      ],
      correctIndex: 1,
      explanation: '@-mentions are the cleanest way to give an agent precise context: @file.py, @MyClass, @docs. Cleaner than pasting; the agent gets exactly what you reference, no more, no less.'
    }
  ],
  'aider': [
    {
      prompt: 'Aider\'s defining design choice is...',
      options: [
        'Cloud-only execution.',
        'Treating git as the source of truth: every change is a commit.',
        'Mobile-first UI.',
        'Visual programming.'
      ],
      correctIndex: 1,
      explanation: 'Aider commits each agent edit. You see the diff in git; you can revert with normal git commands. Tight loop between agent action and version-control state.'
    }
  ],
  'github-copilot': [
    {
      prompt: 'GitHub Copilot was the first major...',
      options: [
        'Coding agent (autonomous).',
        'AI code-suggestion tool (suggest pattern).',
        'Local LLM runner.',
        'Vector database.'
      ],
      correctIndex: 1,
      explanation: 'Copilot launched in 2021 with inline suggestions. The "suggest" pattern: AI proposes, you accept or reject. Set the template that every modern AI IDE refines.'
    }
  ],
  'devin': [
    {
      prompt: 'Devin is most accurately described as a...',
      options: [
        'Code-completion plugin.',
        'Background autonomous SWE agent: assign a task, return to a PR.',
        'Local-only chat tool.',
        'Code-review-only assistant.'
      ],
      correctIndex: 1,
      explanation: 'Devin (Cognition) pioneered the "background agent" pattern. You assign a task; Devin works asynchronously; you review a PR. Full SWE-style autonomy on bounded tasks.'
    }
  ],
  'background-agent-autonomous-coding': [
    {
      prompt: 'The "background agent" pattern is appropriate when...',
      options: [
        'You want to type every line yourself.',
        'The task is well-scoped, the spec is clear, and review of a final PR is the right interaction.',
        'You need real-time pair programming.',
        'Latency matters more than autonomy.'
      ],
      correctIndex: 1,
      explanation: 'Background agents (Devin, Codex, Replit Agent) need clear specs and bounded tasks. Open-ended exploration or ambiguous requirements still need human-in-the-loop coding.'
    }
  ],
  'plan-then-execute-pattern-claude-code': [
    {
      prompt: 'Plan-then-execute adds which gate to agentic coding?',
      options: [
        'No gate; the agent proceeds immediately.',
        'A user-approval review of the proposed plan before execution.',
        'A test-coverage gate.',
        'A latency budget.'
      ],
      correctIndex: 1,
      explanation: 'Claude Code\'s default: agent reads the request, proposes a plan, user approves (or edits), then execution. Catches misunderstandings before any file changes.'
    }
  ],
  'spec-driven-development-with-agents': [
    {
      prompt: 'Spec-driven development with agents pairs naturally with which Skill design pattern?',
      options: [
        'Generator.',
        'Inversion (skill elicits the spec from the user before building).',
        'Chained Inversion only.',
        'No skill pattern.'
      ],
      correctIndex: 1,
      explanation: 'Inversion: define inputs / outputs / acceptance criteria first; agent implements. Aligns with TDD and contract-first design. Cuts ambiguity that produces wasted PRs.'
    }
  ],
  'diff-based-vs-whole-file-editing': [
    {
      prompt: 'When does whole-file editing outperform diff-based?',
      options: [
        'On large refactors where context across the file matters.',
        'On single-line changes.',
        'When the agent has no codebase context.',
        'On classification tasks.'
      ],
      correctIndex: 0,
      explanation: 'Diff-based is faster and cheaper but can miss whole-file invariants on large refactors. Whole-file editing is more reliable when changes touch multiple parts of one file.'
    }
  ],
  'codebase-indexing': [
    {
      prompt: 'Modern AI IDEs index your codebase using...',
      options: [
        'A grep cache.',
        'Semantic embeddings of code chunks plus a symbol graph.',
        'Random sampling.',
        'Compiled binary diffs.'
      ],
      correctIndex: 1,
      explanation: 'Semantic embeddings let the agent find relevant code by meaning. Symbol graphs let it understand structure (which function calls which). Together they enable @-mention by symbol and codebase-aware suggestions.'
    }
  ],
  'the-ai-is-junior-dev-review-discipline': [
    {
      prompt: 'The "AI is junior dev" review discipline says...',
      options: [
        'Trust the AI; merge without reading.',
        'Always read what the agent produced before merging.',
        'Never use AI for production code.',
        'Only review on the second iteration.'
      ],
      correctIndex: 1,
      explanation: 'Treat AI output the way you would a junior engineer\'s PR: read it, understand it, push back when wrong, mentor on patterns. Bypass review only on bounded boilerplate where the cost of error is small.'
    }
  ],
  'swe-bench': [
    {
      prompt: 'SWE-bench measures...',
      options: [
        'Throughput in tokens-per-second.',
        'Pass rate on real GitHub issues from popular Python repos.',
        'Latency in milliseconds.',
        'Cost per million tokens.'
      ],
      correctIndex: 1,
      explanation: 'SWE-bench tests whether an agent can solve real-world software engineering tasks (resolve real bugs, implement real features). The headline benchmark for autonomous coding agents.'
    }
  ],
  'the-progressive-autonomy-ladder': [
    {
      prompt: 'The progressive autonomy ladder is...',
      options: [
        'A single-rung escalation when AI fails.',
        'Suggest -> Assist -> Automate -> Autonomous, picked per task.',
        'A pricing tier list.',
        'A list of model sizes.'
      ],
      correctIndex: 1,
      explanation: 'Pick the rung that matches the risk and the spec clarity. Routine boilerplate: Automate or Autonomous. Critical novel work: Suggest or Assist. The ladder is task-by-task, not a one-time choice.'
    }
  ],
  'token-cost-for-coding-agents': [
    {
      prompt: 'Personal coding-agent subscription cost in 2026 typically falls in which range?',
      options: [
        'Free.',
        '$20-200/month, depending on how aggressively you use background autonomous agents.',
        '$2-5/month.',
        '$5,000-10,000/month.'
      ],
      correctIndex: 1,
      explanation: 'Cursor Pro, Claude Pro / Max, GitHub Copilot Pro stack to $20-100/mo for moderate use. Background agents (Devin, Codex) push the high end as autonomous workloads burn tokens continuously.'
    }
  ],

  // ===== Module 6: Voice & Multimodal =====
  'multimodal-model': [
    {
      prompt: 'In 2026, the practical default assumption for frontier models is that they...',
      options: [
        'Only accept text.',
        'Accept text plus images natively, with audio and video support varying by vendor.',
        'Always accept video natively.',
        'Cannot accept images.'
      ],
      correctIndex: 1,
      explanation: 'Frontier 2026 models accept text + images natively. Audio is uneven (Gemini native, GPT via Realtime API, Claude often via Whisper preprocessing). Plan multimodal input by capability of the specific model.'
    }
  ],
  'vision-language-model-vlm': [
    {
      prompt: 'A VLM converts an image into context by...',
      options: [
        'Saving it to disk and re-reading.',
        'Encoding it into visual tokens that the language model attends to alongside text tokens.',
        'Converting it to ASCII art.',
        'Calling out to a separate OCR service.'
      ],
      correctIndex: 1,
      explanation: 'A vision encoder (typically a Vision Transformer) converts the image into a sequence of token-like representations. Those visual tokens get concatenated with text tokens; the language model attends across both.'
    }
  ],
  'text-to-speech-tts': [
    {
      prompt: 'For a real-time voice agent, which TTS characteristic matters most?',
      options: [
        'Maximum audio fidelity.',
        'Time-to-first-audio (latency).',
        'File size.',
        'Number of supported emojis.'
      ],
      correctIndex: 1,
      explanation: 'Conversational round-trip needs sub-800ms total. TTS time-to-first-audio dominates if you cannot stream early audio while later audio is still synthesizing. Cartesia optimizes for this; ElevenLabs optimizes for quality.'
    }
  ],
  'speech-to-text-stt': [
    {
      prompt: 'For a live voice agent you should use...',
      options: [
        'Offline batch transcription for accuracy.',
        'Streaming STT that emits partial transcripts within ~200ms.',
        'Manual transcription.',
        'A keyword spotter.'
      ],
      correctIndex: 1,
      explanation: 'Offline STT has 5-30s latency. Live conversations need streaming with sub-200ms first-token. Deepgram Nova 3 and OpenAI Realtime are the 2026 standards.'
    }
  ],
  'whisper': [
    {
      prompt: 'When streaming audio into Whisper, you typically also need...',
      options: [
        'A separate keyword spotter.',
        'A Voice Activity Detector to gate input; otherwise Whisper hallucinates on silence.',
        'Hardware audio compression.',
        'A reverse-DNS lookup.'
      ],
      correctIndex: 1,
      explanation: 'Whisper was trained on continuous speech and can fabricate words during silence ("thank you for watching" being the canonical example). VAD gates input so the model only sees actual speech.'
    }
  ],
  'realtime-api': [
    {
      prompt: 'OpenAI\'s Realtime API differs from a separate STT + LLM + TTS pipeline by...',
      options: [
        'Being slower.',
        'Letting the model accept audio in and produce audio out natively, with no explicit STT/TTS step.',
        'Requiring a manual transcription pass.',
        'Running only on edge devices.'
      ],
      correctIndex: 1,
      explanation: 'Realtime collapses the pipeline into one WebSocket. Sub-500ms round-trip; the model "thinks in audio." Tradeoff: less control over interim transcripts, harder to audit for compliance.'
    }
  ],
  'elevenlabs': [
    {
      prompt: 'ElevenLabs is best positioned for...',
      options: [
        'The lowest possible latency.',
        'Voice cloning and high-fidelity narration / brand voices.',
        'Free local-only deployment.',
        'Speech-to-text only.'
      ],
      correctIndex: 1,
      explanation: 'ElevenLabs leads on cloning quality and emotion control. For ultra-low-latency voice agents, Cartesia is the better fit. Often deployed together: Cartesia in conversation, ElevenLabs in marketing materials.'
    }
  ],
  'cartesia': [
    {
      prompt: 'Why do voice-agent teams pick Cartesia over ElevenLabs for the conversational path?',
      options: [
        'Better narration quality.',
        'Sub-100ms time-to-first-audio, which is what makes round-trip feel conversational.',
        'Free pricing tier.',
        'Built-in language translation.'
      ],
      correctIndex: 1,
      explanation: 'Cartesia\'s Sonic model is built for streaming voice. The latency advantage (sub-100ms TTFA vs 300-800ms elsewhere) is what makes voice agents feel like talking to a person.'
    }
  ],
  'deepgram': [
    {
      prompt: 'Deepgram\'s competitive edge for voice agents is...',
      options: [
        'Free pricing.',
        'Streaming-mode latency: sub-200ms first-final transcripts on conversational audio.',
        'Best offline batch quality.',
        'Built-in image generation.'
      ],
      correctIndex: 1,
      explanation: 'Deepgram\'s Nova 3 is purpose-built for streaming. Whisper is cheaper offline; Deepgram wins when every 100ms of latency matters in production voice agents.'
    }
  ],
  'voice-agent-architecture': [
    {
      prompt: 'A voice agent\'s comfortable round-trip latency budget is...',
      options: [
        'Under 100ms.',
        'Around 800ms (achievable in ~500ms with tight pipelines).',
        '5-10 seconds.',
        'It does not matter.'
      ],
      correctIndex: 1,
      explanation: 'Past ~800ms users perceive lag. The pipeline (VAD + STT + LLM + TTS + buffering) needs every component tuned. Adding a "moderator" or extra LLM call between STT and primary LLM almost always breaks the budget.'
    }
  ],
  'vad': [
    {
      prompt: 'The end-of-utterance threshold in a VAD is typically...',
      options: [
        '5 seconds of silence.',
        '200-500ms of silence; longer feels slow, shorter interrupts users.',
        'Random per request.',
        'Never set explicitly.'
      ],
      correctIndex: 1,
      explanation: 'Silero VAD and similar emit speech / non-speech signals. End-of-utterance threshold balances responsiveness and patience: 300-400ms is the typical compromise.'
    }
  ],
  'streaming-inference': [
    {
      prompt: 'Streaming a structured-output response to a client requires...',
      options: [
        'Buffering until the full response is ready.',
        'Partial-parse libraries (or accumulate-and-parse) to handle incomplete JSON.',
        'Disabling JSON mode.',
        'Switching to GET requests.'
      ],
      correctIndex: 1,
      explanation: 'Naive parsers crash on half-formed JSON. Use libraries that handle partial JSON, or buffer-and-parse on each chunk. Streaming UX gain only happens when the client can actually progressively render.'
    }
  ],
  'image-generation-models': [
    {
      prompt: 'Modern frontier image generators primarily use which architecture?',
      options: [
        'GANs.',
        'Diffusion (or rectified flow / DiT variants).',
        'Random projections.',
        'Hand-coded shaders.'
      ],
      correctIndex: 1,
      explanation: 'Diffusion models start from noise and iteratively denoise toward an image conditioned on text. Modern variants (Flux, Imagen 4) use rectified flow or DiT for better text-image alignment.'
    }
  ],
  'video-generation': [
    {
      prompt: 'In 2026, video-generation models reliably handle...',
      options: [
        'Hour-long single-shot scenes.',
        '5-30 second clips with complex motion; long single-shot scenes still degrade past ~10s.',
        'Only stock photos.',
        'Only black-and-white animation.'
      ],
      correctIndex: 1,
      explanation: 'Sora 2, Veo 3, Runway Gen-4 produce 5-30s clips with high quality. For longer scenes, chain shorter clips with consistent character / scene anchors; cinema-quality long-form is still beyond frontier.'
    }
  ],

  // ===== Module 8: Evals & Observability =====
  'evaluation-eval': [
    {
      prompt: 'In Hamel Husain / Shreya Shankar\'s framing, evals are...',
      options: [
        'A nice-to-have after launch.',
        'The new PRDs: the artifact that drives product decisions.',
        'Only useful for fine-tuning.',
        'Replaceable by user reviews.'
      ],
      correctIndex: 1,
      explanation: 'Evals encode what "working" means. Without them, you optimize on vibes; with them, every change is measurable. They become the primary artifact that guides prompt, retrieval, and model decisions.'
    }
  ],
  'golden-set': [
    {
      prompt: 'The best source of golden-set examples is...',
      options: [
        'Synthetic data only.',
        'Real production traces (good and failed) annotated with expected outputs.',
        'Public benchmarks copy-pasted.',
        'A random sample of training data.'
      ],
      correctIndex: 1,
      explanation: 'Golden sets must reflect your real input distribution. Pull from production traces, label expected behavior, version the set in git. Synthetic supplementation is fine for edge cases.'
    }
  ],
  'llm-as-judge': [
    {
      prompt: 'LLM-as-judge requires which prerequisite to be trustworthy?',
      options: [
        'Use the largest available model.',
        'Calibrate (align) judge scores against human ratings on a sample.',
        'Use temperature 1.5.',
        'Run only on weekends.'
      ],
      correctIndex: 1,
      explanation: 'Without alignment, the judge model scores what it cares about, not what users care about. Run a calibration set of 30-100 examples scored by both humans and the judge; tune judge prompt and rubric until correlation is high.'
    }
  ],
  'aligning-llm-as-judge-to-human-judgment': [
    {
      prompt: 'Aligning an LLM judge typically involves...',
      options: [
        'Training a custom embedding model.',
        'Iterating on the judge\'s prompt and rubric until its scores correlate with human ratings on a calibration set.',
        'Replacing the judge with classical metrics.',
        'Running the judge twice and averaging.'
      ],
      correctIndex: 1,
      explanation: 'Cohen\'s kappa or Spearman correlation against human ratings. Iterate the rubric (more concrete criteria, examples, anti-examples) until the judge\'s scores match what your humans actually reward.'
    }
  ],
  'ragas': [
    {
      prompt: 'RAGAS measures faithfulness, answer relevancy, context precision, and context recall. Why all four?',
      options: [
        'They are the same metric in different units.',
        'Each captures a different RAG failure mode; optimizing only one masks the others.',
        'They are required by ISO 42001.',
        'Three metrics are easier than two.'
      ],
      correctIndex: 1,
      explanation: 'Faithfulness: was the answer grounded? Relevancy: did it address the question? Context precision: was retrieval focused? Context recall: was retrieval complete? Different failure modes; need all four to localize problems.'
    }
  ],
  'error-analysis-axial-coding': [
    {
      prompt: 'Axial coding is the practice of...',
      options: [
        'Running automated metrics across all production traces.',
        'Reading 50-200 actual failures, tagging each with a one-line failure mode, then grouping and counting.',
        'Generating synthetic failures via prompt injection.',
        'Sampling traces uniformly.'
      ],
      correctIndex: 1,
      explanation: 'The Husain / Shankar framing: most teams skip qualitative read of failures and chase abstract metrics. Axial coding surfaces dominant failure modes that targeted fixes can address.'
    }
  ],
  'faithfulness': [
    {
      prompt: 'A faithfulness score of 0.75 on a customer-support RAG means...',
      options: [
        '75% of answers were relevant.',
        '75% of claims in answers were supported by the retrieved context; 25% were unfaithful.',
        '75% of users were satisfied.',
        '75% of retrievals were complete.'
      ],
      correctIndex: 1,
      explanation: 'Faithfulness measures the fraction of claims in the answer that trace back to retrieved context. 0.75 means a quarter of claims were ungrounded - the dangerous failure mode for trust-sensitive applications.'
    }
  ],
  'answer-relevancy': [
    {
      prompt: 'A faithful but irrelevant answer typically looks like...',
      options: [
        'A correct specific answer to the wrong question.',
        'A generic statement about the topic that does not engage the user\'s actual question.',
        'A hallucination.',
        'A blank string.'
      ],
      correctIndex: 1,
      explanation: 'When retrieved context is on-topic but lacks the specific answer, the model often paraphrases generic info instead of admitting the gap. Relevancy scoring catches this; faithfulness alone does not.'
    }
  ],
  'context-precision-recall': [
    {
      prompt: 'A retrieval pipeline returning 5 of 8 relevant chunks plus 3 irrelevant ones has...',
      options: [
        'Precision 8/8, recall 5/5.',
        'Precision 5/8, recall 5/8.',
        'Precision 5/(5+3) = 5/8, recall 5/8.',
        'Precision 0, recall 0.'
      ],
      correctIndex: 2,
      explanation: 'Precision = (relevant retrieved) / (total retrieved) = 5/8. Recall = (relevant retrieved) / (relevant in corpus) = 5/8. Both are 0.625 here.'
    }
  ],
  'beir': [
    {
      prompt: 'When picking an embedding model for a specialized domain, you should...',
      options: [
        'Take the BEIR aggregate top-1.',
        'Start with BEIR top-5 in your size class, then run a domain-specific eval to pick the winner.',
        'Always pick the cheapest.',
        'Use only commercial models.'
      ],
      correctIndex: 1,
      explanation: 'BEIR aggregates mask domain variance. The winner on Trec-COVID may underperform on FiQA. Use BEIR to filter; use your own data to pick.'
    }
  ],
  'mteb': [
    {
      prompt: 'MTEB extends BEIR by covering...',
      options: [
        'Only retrieval tasks.',
        'Retrieval plus clustering, classification, similarity, reranking, summarization across 50+ tasks.',
        'Only multilingual tasks.',
        'Only English tasks.'
      ],
      correctIndex: 1,
      explanation: 'MTEB is the canonical 2026 embedding leaderboard. Comprehensive coverage; aggregate ranks can mislead but per-task scores are useful for narrowing candidates.'
    }
  ],
  'promptfoo': [
    {
      prompt: 'Promptfoo\'s defining UX is...',
      options: [
        'A SaaS dashboard.',
        'A side-by-side comparison matrix across N prompt variations and M model variations.',
        'A vector database.',
        'A tokenizer.'
      ],
      correctIndex: 1,
      explanation: 'You see how a prompt change affects every eval case at once, across every model. The matrix view is what makes Promptfoo stick: comparison-driven evaluation as a first-class workflow.'
    }
  ],
  'langsmith': [
    {
      prompt: 'LangSmith\'s primary value for production LLM apps is...',
      options: [
        'Free hosting.',
        'Per-trace inspection of full chain executions, including tool calls and intermediate state.',
        'Local-only operation.',
        'Built-in fine-tuning.'
      ],
      correctIndex: 1,
      explanation: 'LangSmith captures the full trace tree: every LLM call, tool invocation, intermediate state. Production debugging of multi-step agents is guesswork without this kind of tracing.'
    }
  ],
  'langfuse': [
    {
      prompt: 'When does Langfuse beat LangSmith?',
      options: [
        'When you want managed simplicity.',
        'When you need self-hosted, OSS-conscious deployment with EU data residency and no vendor lock-in.',
        'When you only use OpenAI.',
        'When you need built-in CI.'
      ],
      correctIndex: 1,
      explanation: 'Langfuse is feature-comparable to LangSmith but self-hostable (Postgres, optional ClickHouse). Right call for compliance-heavy or vendor-independent stacks; trades the ops cost for control.'
    }
  ],
  'helicone': [
    {
      prompt: 'Helicone\'s integration model is...',
      options: [
        'A new SDK to learn.',
        'A drop-in proxy: change the base URL of your OpenAI / Anthropic client and traces flow automatically.',
        'A browser extension.',
        'A query language.'
      ],
      correctIndex: 1,
      explanation: 'Helicone routes requests through its proxy. One environment-variable change adds logging, cost tracking, caching. Trades a small latency hop for the lightest-touch instrumentation in the space.'
    }
  ],
  'arize-phoenix': [
    {
      prompt: 'Arize Phoenix is positioned as...',
      options: [
        'Closed-source SaaS only.',
        'Open-source LLM observability with strong tracing and built-in evaluators, OpenTelemetry-native.',
        'A model gateway.',
        'A vector database.'
      ],
      correctIndex: 1,
      explanation: 'Phoenix integrates with any OTel-emitting framework, ships pre-built evaluators (hallucination, relevance, toxicity), and is free / self-hosted. Pairs with Arize\'s commercial product (AX) for production scale.'
    }
  ],
  'braintrust': [
    {
      prompt: 'Braintrust\'s differentiating bet is...',
      options: [
        'Lowest cost per trace.',
        'Eval-first design: every change ships with a corresponding eval run; CI gates merges on eval scores.',
        'Largest model catalog.',
        'No-code UI for non-engineers.'
      ],
      correctIndex: 1,
      explanation: 'Braintrust treats evals as the primary noun. UI compares eval results across versions; CI integration blocks PRs that drop eval scores. Pays off for teams that already have an eval culture.'
    }
  ],
  'inspect': [
    {
      prompt: 'UK AISI\'s Inspect framework prioritizes...',
      options: [
        'Maximum throughput.',
        'Scientific rigor: deterministic test specification, separation of solver / dataset / scorer, reproducible metrics.',
        'No-code UI.',
        'Mobile evaluation.'
      ],
      correctIndex: 1,
      explanation: 'Inspect is built for audit-grade evidence. Heavier weight than Promptfoo but pays off when you need credibility with regulators or external auditors.'
    }
  ],
  'hallucination': [
    {
      prompt: 'The most reliable defense against RAG hallucinations is...',
      options: [
        'Trusting the model harder.',
        'Faithfulness scoring + prompt patterns that require citation and explicit "I do not know" fallback.',
        'Increasing temperature.',
        'Removing the retriever.'
      ],
      correctIndex: 1,
      explanation: 'Detect (faithfulness scoring) plus prevent (prompt patterns that require sourced claims and explicit gap acknowledgment). Hallucinations are a predictable failure mode of likelihood-based generation; design the system assuming they will happen.'
    }
  ],
  'drift-detection': [
    {
      prompt: 'Drift detection in 2026 is necessary because...',
      options: [
        'Models never change.',
        'Vendor model snapshots can rotate or deprecate within weeks; the same input can silently regress.',
        'Inputs are random.',
        'It is regulated by ISO 42001.'
      ],
      correctIndex: 1,
      explanation: 'Pin a fixed eval set and run it on every deploy or daily. A score drop with no code change usually means the underlying model snapshot rotated. Pin to specific snapshots for production stability.'
    }
  ],

  // ===== Module 9: Deployment, Ops, and Gateways =====
  'inference-serving': [
    {
      prompt: 'Self-hosted production inference of a 70B model typically uses which engine?',
      options: [
        'Raw HuggingFace Transformers.',
        'vLLM, SGLang, or TensorRT-LLM.',
        'A bash script wrapping pickle.',
        'In-browser JavaScript.'
      ],
      correctIndex: 1,
      explanation: 'Production inference engines deliver 5-30x throughput vs naive Transformers via continuous batching, paged attention, and CUDA-optimized kernels. Bare Transformers is for prototyping and research.'
    }
  ],
  'batch-api': [
    {
      prompt: 'Batch APIs (Anthropic, OpenAI, Gemini) are appropriate for...',
      options: [
        'Real-time chat.',
        'Offline workloads (eval runs, classifications, embeddings) where 1-24 hour SLO is acceptable.',
        'Voice agents.',
        'High-frequency trading.'
      ],
      correctIndex: 1,
      explanation: '50% discount; up to 24-hour SLO. Wrong for any user-facing latency. Right for nightly classification, eval-set runs, content moderation across a corpus.'
    }
  ],
  'streaming-responses': [
    {
      prompt: 'Streaming responses improve UX by...',
      options: [
        'Reducing total token count.',
        'Lowering perceived latency (first-token feels instant) even when total time is several seconds.',
        'Encrypting the response.',
        'Compressing tokens 10x.'
      ],
      correctIndex: 1,
      explanation: 'A 30-token response with streaming feels instant. A 1000-token response with streaming feels reasonable. Without streaming, both feel frozen until the full response arrives.'
    }
  ],
  'rate-limiting': [
    {
      prompt: 'When you hit a 429 rate-limit error, the right pattern is...',
      options: [
        'Retry immediately in a tight loop.',
        'Exponential backoff with jitter, plus per-user budget caps in the application layer.',
        'Switch to GET.',
        'Disable retries.'
      ],
      correctIndex: 1,
      explanation: 'Hammering retries makes the rate-limit storm worse. Exponential backoff with jitter spreads load; per-user budgets prevent one user from starving others; graceful degradation to a smaller model is the production fallback.'
    }
  ],
  'tpm-rpm': [
    {
      prompt: 'A workload that fits within TPM may still violate which limit?',
      options: [
        'Disk I/O.',
        'RPM (requests per minute) on high-frequency, short-call workloads like classification.',
        'TPM is the only limit.',
        'CPU cores.'
      ],
      correctIndex: 1,
      explanation: 'High-frequency short calls (classification, routing) hit RPM first; long-context calls hit TPM first. Calculate both for your traffic shape; the binding constraint is whichever comes first.'
    }
  ],
  'token-budgeting': [
    {
      prompt: 'Why are per-user token budgets necessary in production?',
      options: [
        'They are not necessary.',
        'A single buggy chain or abusive user can blow up the bill if there is no per-session cap.',
        'They reduce model accuracy.',
        'Vendors require them.'
      ],
      correctIndex: 1,
      explanation: 'max_tokens caps per request, but a session that loops or escalates can fire 100 requests. Per-session and per-feature budgets prevent surprise bills from edge cases.'
    }
  ],
  'cost-estimation': [
    {
      prompt: 'A reasonable monthly cost forecast formula is...',
      options: [
        'Daily peak cost x 30.',
        '(input tokens + output tokens) x calls per user per day x users x days x price per token, with discounts for caching and batch.',
        'Fixed-price seats only.',
        'Server cost x 1.5.'
      ],
      correctIndex: 1,
      explanation: 'Formula: avg input + avg output tokens per call x calls/user/day x users x days x price. Adjust for cache hits (90% off cached portions) and batch (50% off). Plan for power users hitting 100x average.'
    }
  ],
  'model-gateway': [
    {
      prompt: 'A model gateway adds value primarily by...',
      options: [
        'Replacing the model.',
        'Unifying multiple vendor APIs behind one interface, plus caching, retries, fallbacks, and observability.',
        'Doing fine-tuning.',
        'Generating embeddings.'
      ],
      correctIndex: 1,
      explanation: 'Single client, multi-vendor. Add observability, fallback chains, cost tracking, PII redaction. Avoid: gateways that hide vendor-specific features (extended thinking, prompt caching) - that costs more than it saves.'
    }
  ],
  'litellm': [
    {
      prompt: 'LiteLLM is...',
      options: [
        'A vector database.',
        'An open-source unified LLM client supporting 100+ vendor APIs.',
        'A fine-tuning library.',
        'A logging-only proxy.'
      ],
      correctIndex: 1,
      explanation: 'LiteLLM gives one Python or Node call signature for Claude / GPT / Gemini / open-weight. Default 2026 OSS gateway; use as library or standalone proxy. Pair with Helicone or Langfuse for observability.'
    }
  ],
  'portkey': [
    {
      prompt: 'When does Portkey beat LiteLLM as a gateway?',
      options: [
        'When you want it free.',
        'When you need enterprise governance: virtual keys per team with budgets, audit trails, SOC 2 / HIPAA-friendly deployment.',
        'When you only use one vendor.',
        'When you want offline-only operation.'
      ],
      correctIndex: 1,
      explanation: 'Portkey adds policy and audit on top of LiteLLM-style routing. Right call when compliance and team-level cost control matter more than DIY simplicity.'
    }
  ],
  'openrouter': [
    {
      prompt: 'OpenRouter\'s tradeoff for unified vendor access is...',
      options: [
        'No SDK support.',
        'A 30-100ms extra hop in the request path; matters for latency-sensitive workloads.',
        'No SLA.',
        'No API.'
      ],
      correctIndex: 1,
      explanation: 'OpenRouter aggregates 200+ models behind one API. Convenient for evaluation and consolidation, but the proxy hop adds latency. For voice agents, direct vendor APIs are better.'
    }
  ],
  'model-routing': [
    {
      prompt: 'A representative production workload routed across Opus / Sonnet / Haiku by complexity often costs...',
      options: [
        'The same as always-Opus.',
        '3-5x less than always-Opus, with imperceptible quality loss on routine traffic.',
        'More than always-Opus.',
        'Free.'
      ],
      correctIndex: 1,
      explanation: 'Routing by classification + complexity captures the typical 80 / 20 distribution: 80% routine traffic to Haiku-tier saves the bulk of cost. Match tier to task; do not default to Opus.'
    }
  ],
  'fallback-strategy': [
    {
      prompt: 'A reasonable fallback chain for a customer-facing app is...',
      options: [
        'Primary model only; show 500 on failure.',
        'Primary model -> on 429 / timeout, smaller-tier same vendor -> on outage, different vendor.',
        'Always switch vendors at random.',
        'Never fall back.'
      ],
      correctIndex: 1,
      explanation: 'Fallback chains protect against rate-limit spikes and vendor outages. Test the path under realistic conditions; do not assume it just works. Note voice / persona drift on cross-vendor fallback.'
    }
  ],
  'logging-best-practices-for-llms': [
    {
      prompt: 'Which field is non-negotiable in production LLM logs?',
      options: [
        'The user\'s plain-text email.',
        'The exact model snapshot version (e.g., claude-opus-4-7-20260415).',
        'A random emoji.',
        'A SQL query.'
      ],
      correctIndex: 1,
      explanation: 'Pinning to model snapshot in logs is essential for debugging regressions after vendor rotations. Pair with redacted prompt + response, latency breakdown, cost computed, and request ID.'
    }
  ],
  'pii-redaction': [
    {
      prompt: 'Where should PII redaction sit in the LLM pipeline?',
      options: [
        'Before storage in logs (and ideally before transmission to third-party services).',
        'After legal complaints.',
        'Only on weekends.',
        'Never; it slows things down.'
      ],
      correctIndex: 0,
      explanation: 'Redact at log time at minimum. For regulated data, also redact before sending to third-party model APIs. Microsoft Presidio, AWS Comprehend, and GCP DLP are common options.'
    }
  ],
  'microsoft-presidio': [
    {
      prompt: 'Presidio\'s analyzer-anonymizer pattern provides...',
      options: [
        'A vector index.',
        'Detection of PII spans and replacement / masking / encryption / hashing of those spans.',
        'A new tokenizer.',
        'Prompt caching.'
      ],
      correctIndex: 1,
      explanation: 'Presidio analyzers detect PII (PERSON, EMAIL, PHONE, etc.); anonymizers transform the detected spans. Open-source; extensible with custom recognizers for domain-specific identifiers.'
    }
  ],
  'agent-sandboxing': [
    {
      prompt: 'Code-executing agents should always run in...',
      options: [
        'The user\'s home directory unrestricted.',
        'A sandbox: container, microVM, language-level isolate, or capability-restricted runtime.',
        'A SQL terminal.',
        'A blockchain.'
      ],
      correctIndex: 1,
      explanation: 'Successful prompt injection on a code-running agent can chain into real damage. Sandbox boundaries (Docker, Firecracker, gVisor, Pyodide) limit blast radius. Develop in the same sandbox you deploy.'
    }
  ],
  'kubernetes-for-llm-serving': [
    {
      prompt: 'Why use taints / tolerations on GPU node pools?',
      options: [
        'To reduce K8s control-plane load.',
        'To prevent CPU-only workloads from scheduling onto scarce GPU nodes.',
        'For SOC 2 compliance.',
        'They are required by Kubernetes.'
      ],
      correctIndex: 1,
      explanation: 'Without taints, CPU pods land on GPU nodes when scheduler is pressured, blocking GPU workloads. Taint GPU pools so only GPU-tolerating pods can land.'
    }
  ],

  // ===== Module 10: Fine-tuning & Post-training =====
  'fine-tuning': [
    {
      prompt: 'In 2026, the right order to attempt before fine-tuning is...',
      options: [
        'Fine-tune first; everything else second.',
        'Prompt engineering, then RAG, then fine-tuning.',
        'Fine-tune and skip prompts.',
        'Pre-train your own model.'
      ],
      correctIndex: 1,
      explanation: 'Most "we need fine-tuning" turns out to be "we need better prompts plus retrieval". Earn fine-tuning by exhausting cheaper levers first; the maintenance burden is real.'
    }
  ],
  'full-fine-tuning': [
    {
      prompt: 'Full fine-tuning is justified when...',
      options: [
        'Always.',
        'Domain shift is large, abundant labeled data exists, and PEFT plateaus below required quality.',
        'You want to save money.',
        'Never.'
      ],
      correctIndex: 1,
      explanation: 'Full fine-tuning costs 10x more than LoRA for marginal quality gain on most tasks. Justified for medical, legal, or other domains where the shift is huge and the volume earns the engineering cost.'
    }
  ],
  'peft': [
    {
      prompt: 'PEFT methods like LoRA work because...',
      options: [
        'They train more parameters than full fine-tuning.',
        'A small set of trainable parameters can capture task-specific deltas; the base already knows most of what is needed.',
        'They run on quantum hardware.',
        'They use a different attention mechanism.'
      ],
      correctIndex: 1,
      explanation: 'Frozen base preserves general knowledge; small trainable adapters learn the task delta. Fewer trainable params, less memory, faster training, comparable quality on most tasks.'
    }
  ],
  'lora': [
    {
      prompt: 'A common starting LoRA rank is...',
      options: [
        'Rank 1.',
        'Rank 16-32.',
        'Rank 1024.',
        'Equal to the parameter count.'
      ],
      correctIndex: 1,
      explanation: 'Rank 16-32 is the typical starting point; sweep up to 64 if quality is short. Rank 4 may underfit; ranks past 64 rarely improve and slow training.'
    }
  ],
  'qlora': [
    {
      prompt: 'QLoRA enables fine-tuning a 70B-class model on a single 24GB GPU by...',
      options: [
        'Reducing the model size.',
        'Quantizing the frozen base to 4-bit (NF4) and training LoRA adapters at higher precision.',
        'Skipping backpropagation.',
        'Running training across the internet.'
      ],
      correctIndex: 1,
      explanation: 'NF4 quantization of the frozen base saves 4x memory; LoRA adapters at BF16 keep training stable. The dramatic memory reduction makes consumer-GPU fine-tuning of frontier-class models feasible.'
    }
  ],
  'rlhf': [
    {
      prompt: 'In 2026, most teams use which method instead of full RLHF?',
      options: [
        'Pure SFT.',
        'DPO (or KTO / IPO variants), which avoid the reward-model and PPO complexity.',
        'GRPO only.',
        'Random search.'
      ],
      correctIndex: 1,
      explanation: 'DPO frames preference learning as a classification problem on (chosen, rejected) pairs. No reward model, no PPO instability, no reward hacking. Comparable quality, far simpler infrastructure.'
    }
  ],
  'dpo': [
    {
      prompt: 'DPO\'s primary input is...',
      options: [
        'Raw text.',
        'Preference triples: (prompt, chosen completion, rejected completion).',
        'Reward labels.',
        'Embedding vectors.'
      ],
      correctIndex: 1,
      explanation: 'DPO trains directly on preferences. Quality of the preference data dominates outcomes; noisy or biased preferences ship straight to behavior.'
    }
  ],
  'grpo': [
    {
      prompt: 'GRPO requires which training signal to be effective?',
      options: [
        'Human preference comparisons.',
        'A verifiable per-completion reward (correct or incorrect, ideally automatic).',
        'Random rewards.',
        'Pre-trained adapters.'
      ],
      correctIndex: 1,
      explanation: 'GRPO scores group samples relative to one another. The reward must be reliable enough to differentiate completions; this is why GRPO shines on math / coding (deterministic correctness) but struggles on open-ended generation.'
    }
  ],
  'raft': [
    {
      prompt: 'RAFT improves a model\'s ability to...',
      options: [
        'Run faster.',
        'Use retrieved context faithfully: cite, ignore distractors, fall back gracefully when context is insufficient.',
        'Tokenize multilingual text.',
        'Generate images.'
      ],
      correctIndex: 1,
      explanation: 'RAFT mixes relevant and irrelevant retrieved passages in training. The model learns to weight them correctly and to admit gaps. Useful when general models drift on specialized RAG corpora.'
    }
  ],
  'synthetic-data-generation': [
    {
      prompt: 'A common 2026 fine-tuning pattern is...',
      options: [
        'Hand-label 1M examples.',
        'Use a frontier teacher model to generate training data, filter for quality, train a smaller / cheaper student model.',
        'Train from scratch.',
        'Use random data.'
      ],
      correctIndex: 1,
      explanation: 'Teacher-student distillation: Opus generates, smaller-model trains, deploys at 10-100x lower cost. Filtering is critical; without it the student inherits the teacher\'s mistakes.'
    }
  ],
  'catastrophic-forgetting': [
    {
      prompt: 'How do you detect catastrophic forgetting during fine-tuning?',
      options: [
        'Wait for users to complain.',
        'Run a broad-capability eval set during training; watch for regression on tasks outside the training distribution.',
        'Trust the loss curve.',
        'Use temperature 0.'
      ],
      correctIndex: 1,
      explanation: 'Target-task accuracy can rise while general capability erodes silently. Maintain a general-capability eval set; early-stop when it drops, or mix more diverse training data.'
    }
  ],
  'hugging-face-trl': [
    {
      prompt: 'Hugging Face TRL is...',
      options: [
        'A model registry.',
        'The default 2026 toolkit for SFT, DPO, RLHF, and GRPO post-training of open-weight models.',
        'A vector database.',
        'A serving runtime.'
      ],
      correctIndex: 1,
      explanation: 'TRL provides high-level Trainer classes (SFTTrainer, DPOTrainer, GRPOTrainer, etc.) plus integration with PEFT and Accelerate. Most published 2026 fine-tunes use TRL somewhere.'
    }
  ],
  'axolotl': [
    {
      prompt: 'Axolotl\'s value proposition is...',
      options: [
        'Maximum customization.',
        'YAML-driven CLI over TRL + Transformers + DeepSpeed; reproducible config-as-code fine-tunes.',
        'A new attention mechanism.',
        'Cloud-only training.'
      ],
      correctIndex: 1,
      explanation: 'Axolotl reduces fine-tuning to a YAML config in version control. CI runs the config; results land in a model registry. Drop down to raw TRL when you need novel methods.'
    }
  ],
  'unsloth': [
    {
      prompt: 'Unsloth\'s differentiator is...',
      options: [
        'Cloud distributed training.',
        'Custom Triton kernels and memory optimizations that halve VRAM and double speed for LoRA on consumer GPUs.',
        'A new model architecture.',
        'Free credits.'
      ],
      correctIndex: 1,
      explanation: 'Unsloth makes consumer-GPU fine-tuning of 70B-class models practical: ~3 hours instead of ~6 on a 4090; 24GB instead of 48GB for QLoRA. Pairs with TRL and Axolotl.'
    }
  ],

  // ===== Module 13: Emerging Directions =====
  'agentic-ai-growth': [
    {
      prompt: 'Stanford AI Index 2026 reports agentic-AI skills jumped from...',
      options: [
        'Negligible to dominant overnight.',
        '0.06% to 0.23% of job postings in 2025: the fastest-growing AI skill category.',
        'They have not grown.',
        'Out of fashion.'
      ],
      correctIndex: 1,
      explanation: '4x growth in one year of "agent" / "agentic" mentions in job postings. Reflects industry shift from generative-AI-as-feature to autonomous agent systems as primary product surface.'
    }
  ],
  'reasoning-models': [
    {
      prompt: 'Reasoning models differ from standard chat models in that they...',
      options: [
        'Use a different language.',
        'Pre-think before answering, often via long internal chain-of-thought.',
        'Skip the language model entirely.',
        'Use only embeddings.'
      ],
      correctIndex: 1,
      explanation: 'OpenAI o-series, DeepSeek R1, Claude with extended thinking, Gemini 2.5 Thinking. They allocate inference compute to reasoning before producing the user-facing answer; quality jumps on multi-step problems.'
    }
  ],
  'test-time-compute-scaling': [
    {
      prompt: 'The "test-time compute scaling" paradigm trades...',
      options: [
        'Training compute for inference compute on hard problems.',
        'Memory for latency.',
        'Cost for marketing.',
        'Tokens for pixels.'
      ],
      correctIndex: 0,
      explanation: 'Instead of larger models, allocate more compute at inference (longer thinking, more samples). 2024-2026 results show substantial quality gains on reasoning-heavy tasks; reshapes how teams budget compute.'
    }
  ],
  'state-space-models': [
    {
      prompt: 'State-space models like Mamba challenge transformers primarily on...',
      options: [
        'Image generation quality.',
        'Long-context efficiency: linear-time scaling vs transformer\'s quadratic.',
        'Voice cloning.',
        'Tokenization.'
      ],
      correctIndex: 1,
      explanation: 'Transformer attention is O(N^2) in context length. SSMs (Mamba, RWKV, Hyena) are O(N), making very long contexts cheaper. Quality is competitive on most tasks; transformers still lead on reasoning.'
    }
  ],
  'diffusion-language-models': [
    {
      prompt: 'Diffusion language models attempt to apply...',
      options: [
        'Image-generation diffusion techniques to text generation.',
        'Voice cloning to text.',
        'Random sampling to noise.',
        'Tokenization to images.'
      ],
      correctIndex: 0,
      explanation: 'Iterative denoising of text instead of left-to-right autoregressive generation. Potentially higher parallelism; emerging research direction with mixed early results vs autoregressive baselines.'
    }
  ],
  'multimodal-native-models': [
    {
      prompt: 'Multimodal-native models differ from "bolted-on" multimodal by...',
      options: [
        'Using a separate vision encoder per modality.',
        'Being trained from scratch on text + image + audio + video as one stream.',
        'Running only on edge devices.',
        'Not supporting text.'
      ],
      correctIndex: 1,
      explanation: 'Native training mixes modalities throughout pre-training, producing representations where modalities are first-class. Bolted-on approaches add a vision encoder post-hoc; quality on cross-modal reasoning differs.'
    }
  ],
  'open-weight-catching-up': [
    {
      prompt: 'In 2026, open-weight models...',
      options: [
        'Have surpassed closed-frontier on every task.',
        'Reach GPT-4-class capability at near-zero marginal cost; the gap to closed-frontier on hardest tasks has narrowed but not closed.',
        'Are no longer being developed.',
        'Only run on Apple Silicon.'
      ],
      correctIndex: 1,
      explanation: 'Llama, Qwen, DeepSeek, Mistral approach 2023-era closed frontier on most tasks. Closed-frontier still leads on the hardest reasoning by 10-15 points. The ecosystem is increasingly hybrid.'
    }
  ],
  'personal-ai-sovereignty': [
    {
      prompt: 'The "personal AI sovereignty" movement is enabled by...',
      options: [
        'Cloud-only providers.',
        'Capable open-weight models running on consumer hardware (Mac Studio, multi-GPU rigs, Project DIGITS).',
        'Mandatory regulation.',
        'Web3.'
      ],
      correctIndex: 1,
      explanation: 'Open-weight models that fit on personal hardware enable privacy, ownership, and offline operation as features. Mac Studio M3 Ultra 512GB and similar make 100B-class models personally hostable.'
    }
  ],
  'sovereign-ai-nation-state-deployments': [
    {
      prompt: 'Sovereign AI deployments are characterized by...',
      options: [
        'Public-cloud SaaS.',
        'Full data residency and operational independence: on-prem or sovereign-cloud frontier model access.',
        'Free open access.',
        'Twitter integration.'
      ],
      correctIndex: 1,
      explanation: 'Anthropic Sovereign, Azure Government, AWS GovCloud. EU, India, Saudi Arabia, UK leading. Required for regulated industries and public sector; trades convenience for control.'
    }
  ],
  'ai-standards-convergence': [
    {
      prompt: 'ISO 42001 + NIST AI RMF + EU AI Act in 2026 are increasingly...',
      options: [
        'Mutually exclusive.',
        'Stackable: ~70% of documentation overlaps; cross-mappings emerging.',
        'Replaced by ISO 9001.',
        'Identical.'
      ],
      correctIndex: 1,
      explanation: 'Common artifacts (model cards, risk assessments, audit trails, monitoring) satisfy multiple frameworks. Mature compliance programs build once and map to each regime, rather than treating them as separate efforts.'
    }
  ],
  'the-ai-productivity-paradox': [
    {
      prompt: 'Brynjolfsson\'s research on AI productivity finds that...',
      options: [
        'Productivity gains are immediate.',
        'Productivity gains lag adoption by 1-3 years; perceived productivity precedes measured productivity.',
        'AI never improves productivity.',
        'Only senior workers benefit.'
      ],
      correctIndex: 1,
      explanation: 'Workflow redesign, training, and complementary investments take time to pay off. Workforces feel productivity gains before instrumented metrics catch them; expect 12-36 months for measurable EBIT impact.'
    }
  ],
  'ai-incident-sharing': [
    {
      prompt: 'AI Incident Sharing (MITRE 2024+) and AVID exist to...',
      options: [
        'Sell incident-response insurance.',
        'Share AI failure modes across organizations so the field learns from each other\'s mistakes.',
        'Promote specific vendors.',
        'Replace bug trackers.'
      ],
      correctIndex: 1,
      explanation: 'Aviation-style incident sharing for AI: anonymized records of failures, root causes, mitigations. Helps the field avoid repeating the same mistakes; complements ATLAS and OWASP LLM Top 10.'
    }
  ],

  // ===== Module 11: Enterprise Architecture & Governance =====
  'eu-ai-act': [
    {
      prompt: 'Penalties under the EU AI Act can reach...',
      options: [
        '1% of global revenue.',
        '7% of global revenue or EUR 35M, whichever is higher.',
        'EUR 10K flat.',
        'No financial penalty.'
      ],
      correctIndex: 1,
      explanation: '7% of global annual revenue or EUR 35M (whichever is higher) for the most serious violations. Comparable to GDPR levels; high-risk AI obligations applicable from August 2 2026.'
    }
  ],
  'eu-ai-act-risk-tiers': [
    {
      prompt: 'Which EU AI Act risk tier is outright prohibited?',
      options: [
        'Limited risk.',
        'Minimal risk.',
        'Unacceptable risk (e.g., social scoring, manipulative subliminal techniques).',
        'High risk.'
      ],
      correctIndex: 2,
      explanation: 'Unacceptable risk: banned. High risk: heavy obligations. Limited risk: transparency only. Minimal risk: unregulated. Tier determines obligations and timelines.'
    }
  ],
  'gpai': [
    {
      prompt: 'GPAI (General-Purpose AI) systemic-risk threshold is set at...',
      options: [
        '10^15 FLOPs.',
        '10^25 FLOPs of training compute.',
        '10^40 FLOPs.',
        'No threshold.'
      ],
      correctIndex: 1,
      explanation: 'Models above 10^25 FLOPs are presumed to pose systemic risk and incur additional obligations: model evaluations, adversarial testing, incident reporting. Most 2026 frontier models meet this.'
    }
  ],
  'provider-deployer-importer-distributor': [
    {
      prompt: 'Under EU AI Act, who has primary obligation for the system\'s underlying design?',
      options: [
        'The Deployer.',
        'The Provider (the entity that develops and places the system on the market).',
        'The Distributor.',
        'The end user.'
      ],
      correctIndex: 1,
      explanation: 'Provider builds. Deployer uses. Importer brings foreign systems into the EU. Distributor makes available. Each role has distinct obligations; misclassification is a common compliance error.'
    }
  ],
  'ai-literacy-obligation-art-4': [
    {
      prompt: 'EU AI Act Article 4 (AI literacy) requires...',
      options: [
        'A formal university degree for every employee.',
        'AI literacy proportional to role; documented since February 2 2025.',
        'Annual external certification.',
        'Nothing; it is voluntary.'
      ],
      correctIndex: 1,
      explanation: 'Organizations must ensure staff understand AI relevant to their role. Live since Feb 2025; documentation expected (training records, role-mapped curricula). Often the first regulator-checked obligation.'
    }
  ],
  'fria': [
    {
      prompt: 'FRIA (Fundamental Rights Impact Assessment) is mandatory for...',
      options: [
        'All AI systems.',
        'High-risk AI in public sector and certain private sectors under EU AI Act.',
        'Image-generation models only.',
        'Voluntary always.'
      ],
      correctIndex: 1,
      explanation: 'FRIA assesses impact on fundamental rights (privacy, dignity, non-discrimination). Pairs with DPIA (data protection) and AIIA (AI impact). The unified high-risk assessment in mature compliance programs.'
    }
  ],
  'nist-ai-rmf': [
    {
      prompt: 'NIST AI RMF\'s four functions are...',
      options: [
        'Build, ship, scale, retire.',
        'GOVERN, MAP, MEASURE, MANAGE.',
        'Plan, do, check, act.',
        'Identify, protect, detect, respond.'
      ],
      correctIndex: 1,
      explanation: 'GOVERN (organizational policy), MAP (context and risks), MEASURE (assessment), MANAGE (response and treatment). Voluntary US framework; de facto reference for most US federal contractors.'
    }
  ],
  'nist-ai-600-1': [
    {
      prompt: 'NIST AI 600-1 catalogs how many GenAI risk categories?',
      options: [
        '3.',
        '12 categories with 400+ mitigation actions.',
        '50.',
        'It does not catalog risks.'
      ],
      correctIndex: 1,
      explanation: 'NIST AI 600-1 (July 2024) is the GenAI-specific addendum to AI RMF. 12 categories: confabulation, harmful bias, dangerous content, environmental, etc. 400+ suggested mitigations.'
    }
  ],
  'iso-iec-42001': [
    {
      prompt: 'ISO/IEC 42001 is...',
      options: [
        'A model card template.',
        'The first certifiable AI Management System standard, modeled on ISO 27001 / 9001.',
        'A free open-source project.',
        'Mandatory in the EU.'
      ],
      correctIndex: 1,
      explanation: 'AWS, Microsoft, Synthesia among early certified organizations. Provides a credible third-party-attested AI governance program; pairs cleanly with NIST AI RMF and EU AI Act obligations.'
    }
  ],
  'aims': [
    {
      prompt: 'An AIMS (AI Management System) is...',
      options: [
        'A specific software product.',
        'The organization-wide system of policies, processes, and controls for AI; what ISO 42001 certifies.',
        'A vector database.',
        'A training dataset.'
      ],
      correctIndex: 1,
      explanation: 'AIMS is the durable governance scaffolding: roles, processes, risk register, controls, audit trail. ISO 42001 certifies the AIMS, not individual AI products.'
    }
  ],
  'iso-iec-23894-23053-22989-5338': [
    {
      prompt: 'These ISO companion standards address, respectively...',
      options: [
        'Network security.',
        'AI risk (23894), framework (23053), terminology (22989), lifecycle (5338).',
        'Image generation.',
        'Data labeling.'
      ],
      correctIndex: 1,
      explanation: 'Companion standards to ISO 42001. Use 22989 for shared vocabulary, 23053 for framework, 23894 for risk methodology, 5338 for lifecycle processes.'
    }
  ],
  'colorado-ai-act-texas-traiga-nyc-ll-144-california-sb-53': [
    {
      prompt: 'Major US sub-federal AI laws in 2026 include...',
      options: [
        'Only HIPAA.',
        'Colorado AI Act, Texas TRAIGA, NYC LL 144 (bias audits), California SB 53 (frontier safety).',
        'No US laws exist.',
        'GDPR.'
      ],
      correctIndex: 1,
      explanation: 'States have moved faster than federal Congress. Multi-state operations face a patchwork; California SB 53 specifically targets frontier-model safety practices.'
    }
  ],
  'gdpr-article-22': [
    {
      prompt: 'GDPR Article 22 establishes the right...',
      options: [
        'To free internet.',
        'Not to be subject to solely automated decisions producing legal or significant effects.',
        'To delete all data.',
        'To free model API access.'
      ],
      correctIndex: 1,
      explanation: 'Foundation for automated-decision regulation. Most consumer AI systems must offer human review or be designed to avoid solely-automated significant decisions.'
    }
  ],
  'dpia': [
    {
      prompt: 'A DPIA is required under GDPR when...',
      options: [
        'Always.',
        'Processing personal data presents high risk to data subjects (often: AI systems, profiling, large-scale processing).',
        'Never.',
        'Only on Tuesdays.'
      ],
      correctIndex: 1,
      explanation: 'Data Protection Impact Assessment. Documented risk analysis of processing personal data. Often combined with FRIA and AIIA into a unified high-risk assessment for AI systems.'
    }
  ],
  'aiia': [
    {
      prompt: 'AIIA (AI Impact Assessment) is generally...',
      options: [
        'A regulatory mandate everywhere.',
        'A generic AI risk assessment combinable with DPIA and FRIA into the unified high-risk assessment.',
        'A trade journal.',
        'A type of model.'
      ],
      correctIndex: 1,
      explanation: 'AIIA covers AI-specific risks beyond data protection. Mature compliance programs run AIIA + DPIA + FRIA as one workflow; output feeds into model registry, risk register, governance reviews.'
    }
  ],
  'sr-11-7': [
    {
      prompt: 'SR 11-7 is...',
      options: [
        'A consumer credit law.',
        'The Federal Reserve / OCC supervisory letter on model risk management; applied by most large US banks to AI / ML.',
        'An AI vendor.',
        'A research paper.'
      ],
      correctIndex: 1,
      explanation: 'SR 11-7 (2011) predates modern AI but is the operating template for model risk in US banking. Three-lines-of-defense, model inventory, validation, ongoing monitoring all trace to it.'
    }
  ],
  'three-lines-of-defense': [
    {
      prompt: 'In SR 11-7\'s three-lines model, who owns independent validation?',
      options: [
        'The model owner.',
        'A second line of defense, independent of the model owner.',
        'External regulators.',
        'The vendor.'
      ],
      correctIndex: 1,
      explanation: 'First line: model owner. Second line: independent validation. Third line: internal audit. Independence of the second line is what gives the framework its credibility.'
    }
  ],
  'model-inventory-and-tiering': [
    {
      prompt: 'Tier-1 vs tier-3 model treatment differs primarily in...',
      options: [
        'Color of the badge.',
        'Validation rigor: tier-1 gets full independent validation; tier-3 gets lighter controls.',
        'Hosting region.',
        'Tokenizer.'
      ],
      correctIndex: 1,
      explanation: 'Tiering by criticality avoids treating every model with the same heavy process. Customer-facing high-impact models get tier-1; internal experiments get tier-3. Documentation and testing scale accordingly.'
    }
  ],
  'model-card': [
    {
      prompt: 'A model card documents...',
      options: [
        'Only the model\'s name.',
        'Training, capabilities, limitations, intended use, evaluation results.',
        'Network architecture only.',
        'Pricing.'
      ],
      correctIndex: 1,
      explanation: 'Mitchell et al. 2019 introduced the format. Now standard practice for vendors and regulated industries; cross-referenced from compliance documentation.'
    }
  ],
  'system-card': [
    {
      prompt: 'A system card differs from a model card by also covering...',
      options: [
        'Only marketing copy.',
        'Evaluations, safety measures, known issues for the deployed system (model + deployment context).',
        'Network architecture.',
        'CSS styling.'
      ],
      correctIndex: 1,
      explanation: 'Anthropic and OpenAI evolution of the model card. Includes deployment-specific info: system prompts, safeguards, red-team findings, monitoring practices.'
    }
  ],
  'data-card': [
    {
      prompt: 'A data card documents...',
      options: [
        'Hardware specifications.',
        'A dataset\'s provenance, composition, intended use, biases, limitations.',
        'GPU usage.',
        'Tokens per second.'
      ],
      correctIndex: 1,
      explanation: 'Data analog of the model card. Critical for fine-tuning datasets and eval sets. Lets future users understand what is in the data and what it should be used for.'
    }
  ],
  'ai-bom': [
    {
      prompt: 'An AI Bill of Materials is...',
      options: [
        'A vendor invoice.',
        'A manifest of all models, training data, fine-tunes, tools, and dependencies in an AI system.',
        'A pricing menu.',
        'A type of LoRA adapter.'
      ],
      correctIndex: 1,
      explanation: 'AI BOM (OWASP, IBM driving standards) is the AI analog of SBOM. Required for supply-chain auditing and incident response; surfaces dependency graphs that procurement misses.'
    }
  ],
  'aws-well-architected-genai-lens': [
    {
      prompt: 'AWS Well-Architected GenAI Lens provides...',
      options: [
        'A new model.',
        'A reference architecture for GenAI workloads on AWS, with the Responsible AI Lens added at re:Invent 2025.',
        'A vector database.',
        'Only marketing material.'
      ],
      correctIndex: 1,
      explanation: 'AWS Well-Architected\'s GenAI lens: pillars for operational excellence, security, reliability, performance, cost, sustainability applied to LLM systems. Practical reference even outside AWS.'
    }
  ],
  'build-vs-buy-framework': [
    {
      prompt: 'In the build-vs-buy spectrum for AI, the most common 2026 default is...',
      options: [
        'Train from scratch.',
        'RAG over a vendor API or fine-tune open-weight; full custom is rare.',
        'Buy a SaaS for everything.',
        'Hybrid with three vendors.'
      ],
      correctIndex: 1,
      explanation: 'Spectrum: full custom (rare), fine-tune open-weight (specialized), RAG over API (most common), vendor SaaS (when domain fit), hybrid. The first architectural decision in any AI project.'
    }
  ],
  'tco-for-ai-systems': [
    {
      prompt: 'Total Cost of Ownership for an AI system typically includes...',
      options: [
        'Only API costs.',
        'API or inference + storage + observability + headcount + change management; hidden costs (engineering, ops) often dominate.',
        'Only hardware.',
        'Only labels.'
      ],
      correctIndex: 1,
      explanation: 'API spend is often a small fraction of TCO. Engineering time, ops, eval / observability, change management, training, and ongoing maintenance dominate over multi-year horizons.'
    }
  ],
  'vendor-scorecard': [
    {
      prompt: 'A weighted vendor scorecard for AI typically includes...',
      options: [
        'Only price.',
        'Data handling, security certifications, compliance, SLAs, pricing, API stability, audit logs, IP indemnification.',
        'Only model size.',
        'Only marketing reputation.'
      ],
      correctIndex: 1,
      explanation: 'Multi-dimensional weighting prevents picking on price alone. Data handling and IP indemnification often dominate the weight in regulated industries.'
    }
  ],
  'vendor-lock-in': [
    {
      prompt: 'Vendor lock-in is mitigated by...',
      options: [
        'Picking only one vendor.',
        'API portability (LiteLLM-style gateway), embedding choice, prompt portability, dual-vendor deployment.',
        'Avoiding fine-tuning.',
        'Using only Claude.'
      ],
      correctIndex: 1,
      explanation: 'Some lock-in is intentional (you chose a vendor for its capability). Mitigation focuses on the parts you want to keep flexible: model swap, embedding swap, prompt portability via templates.'
    }
  ],
  'klarna-case-study': [
    {
      prompt: 'The Klarna case study illustrates...',
      options: [
        'A flawless AI rollout.',
        '700-FTE-equivalent AI assistant in 2024, then quiet rehiring of humans by mid-2025 for customer-experience reasons.',
        'How to skip evals.',
        'A new pricing model.'
      ],
      correctIndex: 1,
      explanation: 'Canonical cautionary tale: economic substitution worked on paper but customer experience needs hybrid design. Lesson: AI substitution must consider end-user trust, not just throughput math.'
    }
  ],
  'jpmorgan-coin-llm-suite': [
    {
      prompt: 'JPMorgan\'s COIN and LLM Suite together are estimated to deliver...',
      options: [
        'No measurable value.',
        '~$1.5-2.5B annual value; 360K legal hours saved per year (COIN); 250K employees on LLM Suite by mid-2025.',
        '$10M annually.',
        'Pure regulatory cost.'
      ],
      correctIndex: 1,
      explanation: 'Reference deployments showing institutional-scale value capture from AI. COIN automates contract review; LLM Suite is the firm\'s general-purpose AI for staff. Both regulated, audited, governed.'
    }
  ],
  'wells-fargo-fargo': [
    {
      prompt: 'Wells Fargo\'s Fargo assistant achieved 1B cumulative interactions by March 2026 with what architectural choice?',
      options: [
        'Sending PII to the LLM and human handoff on every escalation.',
        'Zero PII to the LLM and zero human handoffs in the standard path.',
        'No structured logging.',
        'Free open access.'
      ],
      correctIndex: 1,
      explanation: 'Architecture: deterministic CRM layer handles PII; LLM only sees redacted intent. Removes the trust and compliance risks that block most banking AI deployments. 245M interactions in 2024 alone.'
    }
  ],
  'walmart-4m-developer-hours': [
    {
      prompt: 'Walmart\'s reported 4M developer hours saved in FY24 was attributed to...',
      options: [
        'A new database.',
        'AI coding tools across 30K+ engineers; ~5% per-engineer savings aggregating to material business outcome.',
        'Replacing engineers.',
        'A reorganization.'
      ],
      correctIndex: 1,
      explanation: 'Doug McMillon disclosed the figure. The arithmetic: small per-engineer percentage gains compound at fleet scale into the largest single line of value capture from AI tooling at Walmart.'
    }
  ],
  'booking-com-16-pr-uplift': [
    {
      prompt: 'Booking.com\'s 16% PR uplift from AI coding tools was measured via...',
      options: [
        'Self-report surveys.',
        'DX Core 4 instrumentation; 150K dev hours saved year one with 65% adoption.',
        'A press release.',
        'Vendor-supplied metrics.'
      ],
      correctIndex: 1,
      explanation: 'Rigorous instrumentation rather than surveys. The DX Core 4 framework provides comparable signals across organizations; 65% adoption is unusually high and explains the magnitude.'
    }
  ],
  'kaiser-tpmg-ambient-ai': [
    {
      prompt: 'Kaiser TPMG\'s ambient AI scribing saved...',
      options: [
        'Nothing measurable.',
        '15,791 documentation hours in 63 weeks per NEJM Catalyst June 2025.',
        '5 hours total.',
        'Only marketing time.'
      ],
      correctIndex: 1,
      explanation: 'Ambient scribing transcribes and structures clinical encounters. Healthcare AI value is often proven via documentation-time reduction; clinician burnout is the secondary metric that drives adoption.'
    }
  ],
  'ai-center-of-excellence-coe': [
    {
      prompt: 'An AI Center of Excellence typically...',
      options: [
        'Replaces all engineering teams.',
        'Centralizes standards, builds shared platforms, supports business units.',
        'Owns nothing.',
        'Reports to legal only.'
      ],
      correctIndex: 1,
      explanation: 'Dominant 2026 AI org pattern. CoE provides shared infrastructure (model gateway, observability, eval platform) and policy; BUs own outcomes. Avoids re-implementation in each team.'
    }
  ],
  'hub-and-spoke-federated-centralized': [
    {
      prompt: 'The dominant 2026 CoE operating model is...',
      options: [
        'Fully decentralized.',
        'Hub-and-spoke: central CoE plus embedded specialists in business units.',
        'Fully centralized.',
        'Outsourced.'
      ],
      correctIndex: 1,
      explanation: 'Federated for very large orgs with high BU autonomy; centralized for small / early-stage. Hub-and-spoke balances standardization with proximity to business problems.'
    }
  ],
  'workflow-redesign': [
    {
      prompt: 'McKinsey 2025 found the largest single correlate of EBIT impact from GenAI is...',
      options: [
        'Hiring more data scientists.',
        'Workflow redesign; only 21% of organizations have done it.',
        'Buying more compute.',
        'Switching to open-weight.'
      ],
      correctIndex: 1,
      explanation: 'Tools alone do not deliver outsized returns. Redesigning workflows around AI capability does. Most orgs leave value on the table by bolting AI onto unchanged processes.'
    }
  ],
  'ai-red-teaming': [
    {
      prompt: 'AI red-teaming is the practice of...',
      options: [
        'Testing for crashes only.',
        'Adversarial testing for safety, security, policy violations across model and system layers.',
        'Marketing.',
        'Quarterly reviews.'
      ],
      correctIndex: 1,
      explanation: 'Empirical adversarial probing: jailbreaks, prompt injection, harmful-content elicitation, PII extraction. Increasingly required for high-risk deployments and frontier model releases.'
    }
  ],
  'pyrit': [
    {
      prompt: 'Microsoft\'s PyRIT is...',
      options: [
        'A prompt logger.',
        'An open-source AI red-teaming framework providing systematic adversarial testing tooling.',
        'A SaaS observability platform.',
        'A vector database.'
      ],
      correctIndex: 1,
      explanation: 'PyRIT (Python Risk Identification Toolkit). Reference toolkit for systematic AI red-teaming: scorers, attack patterns, automated probing. Freely available; widely adopted.'
    }
  ],
  'mitre-atlas': [
    {
      prompt: 'MITRE ATLAS v5.1 (Nov 2025) catalogs...',
      options: [
        'Web vulnerabilities only.',
        '16 tactics and 84 techniques targeting AI systems; the AI analog of MITRE ATT&CK.',
        'Models only.',
        'GPU attacks only.'
      ],
      correctIndex: 1,
      explanation: 'Adversarial threat landscape for AI. Used to structure threat models, red-team plans, and defense roadmaps. Pairs with OWASP LLM Top 10 for application-level coverage.'
    }
  ],
  'owasp-llm-top-10-2025': [
    {
      prompt: 'OWASP LLM Top 10 (2025) covers vulnerabilities like...',
      options: [
        'Buffer overflows only.',
        'Prompt injection, insecure output handling, training data poisoning, excessive agency, supply chain.',
        'Only physical security.',
        'Only password rules.'
      ],
      correctIndex: 1,
      explanation: 'Industry-standard reference for LLM application vulnerabilities. Use to structure security reviews, threat models, eval gates. Pair with MITRE ATLAS for the threat-attacker view.'
    }
  ],
  'project-glasswing': [
    {
      prompt: 'Project Glasswing is...',
      options: [
        'A pricing initiative.',
        'An Anthropic-led defensive cybersecurity consortium (April 2026) with members including AWS, Apple, Google, Microsoft, JPMorgan, NVIDIA.',
        'An open-weight model.',
        'A coffee chain.'
      ],
      correctIndex: 1,
      explanation: 'Industry-wide defensive coalition for AI security. Shares threat intelligence, coordinates incident response, develops shared defensive tooling.'
    }
  ],
  'the-attacker-moves-second-thesis': [
    {
      prompt: 'Nasr et al. 2025 ("attacker moves second") showed that...',
      options: [
        'Defenses are now bulletproof.',
        'Adaptive attackers bypass 12 published LLM defenses with >90% success rate.',
        'Attackers no longer exist.',
        'Random sampling defeats all attacks.'
      ],
      correctIndex: 1,
      explanation: 'Lesson: design for blast-radius limitation, not perfect prevention. Layer defenses, monitor for compromise, constrain agent capabilities so a successful attack cannot do much.'
    }
  ],
  'differential-privacy-federated-learning-homomorphic-encryption-confidential-computing': [
    {
      prompt: 'Confidential computing uses...',
      options: [
        'Homomorphic encryption only.',
        'Hardware enclaves (TDX, SEV, Nitro) so data is processed without being visible to the host.',
        'Just regular encryption.',
        'Plaintext compute.'
      ],
      correctIndex: 1,
      explanation: 'Different privacy-preserving ML primitives: differential privacy (output noise), federated learning (on-device training), homomorphic encryption (compute on encrypted data), confidential computing (hardware enclaves).'
    }
  ],
  'ip-indemnification': [
    {
      prompt: 'Vendor IP indemnification typically requires...',
      options: [
        'Nothing.',
        'Customer to use specific vendor safety features (e.g., output filters, eligible regions).',
        'Switching vendors yearly.',
        'Open-sourcing your stack.'
      ],
      correctIndex: 1,
      explanation: 'Microsoft, OpenAI, Anthropic, Google all offer IP indemnification with conditions. Read the conditions carefully: missing a required safety feature can void the protection.'
    }
  ],
  'sovereign-ai': [
    {
      prompt: 'Sovereign AI deployments offer...',
      options: [
        'Only consumer pricing.',
        'Full data residency and operational independence: Anthropic Sovereign, Azure Government, AWS GovCloud.',
        'Free tier access.',
        'Only chat interfaces.'
      ],
      correctIndex: 1,
      explanation: 'For regulated industries and public sector. Trades convenience for control. Often required for defense, intelligence, healthcare, finance in specific jurisdictions.'
    }
  ],

  // ===== Module 12: Career & The Job Market =====
  'ai-solutions-engineer': [
    {
      prompt: 'AI Solutions Engineer is most analogous to...',
      options: [
        'A research scientist.',
        'A pre-sales engineer paired with an account executive: consultative, customer-facing, technical.',
        'A site reliability engineer.',
        'A finance analyst.'
      ],
      correctIndex: 1,
      explanation: 'Vendor-side role partnering with sales. Demos, technical objection handling, integration scoping. KORE1 lane comp $130K-$215K base typical for the SE archetype.'
    }
  ],
  'ai-solutions-architect': [
    {
      prompt: 'AI Solutions Architect differs from AI Solutions Engineer in that the architect...',
      options: [
        'Writes more code.',
        'Designs how an organization integrates AI across its product portfolio (broader scope, longer horizon).',
        'Only does pre-sales demos.',
        'Reports to legal.'
      ],
      correctIndex: 1,
      explanation: 'Architect spans models, infrastructure, governance, business outcomes. SE focuses on individual deals; architect on enterprise-wide design. Same vendor universe, different scope.'
    }
  ],
  'ai-engineer-chip-huyen-framing': [
    {
      prompt: 'Chip Huyen\'s "AI Engineer" framing emphasizes...',
      options: [
        'Top-down work: start from the model API, build production systems on top.',
        'Pure research.',
        'Only data labeling.',
        'Only sales.'
      ],
      correctIndex: 0,
      explanation: 'AI Engineer is top-down (start from API, layer abstractions); ML Engineer is bottom-up (collect data, train, deploy). Different mental model and toolchain; same broad domain.'
    }
  ],
  'applied-ai-engineer': [
    {
      prompt: 'Applied AI Engineer at AI-native vendors typically...',
      options: [
        'Only writes papers.',
        'Embeds with customers to implement the vendor\'s product end-to-end.',
        'Manages legal contracts.',
        'Does no coding.'
      ],
      correctIndex: 1,
      explanation: 'AI-native vendor\'s title for embedded customer-implementation engineer. Closer to FDE than to a research role; high coding velocity, high customer empathy.'
    }
  ],
  'ai-native-software-engineer': [
    {
      prompt: 'Accenture\'s "AI Native Software Engineer" category is best described as...',
      options: [
        'A pure research scientist.',
        'A cloud-native engineer with hands-on agentic systems experience.',
        'A finance manager.',
        'A salesperson.'
      ],
      correctIndex: 1,
      explanation: 'Accenture\'s emerging category. Cloud-native + AI-agentic; the new generalist that production AI systems require. Replaces some "full-stack" hires.'
    }
  ],
  'ai-product-manager': [
    {
      prompt: 'AI PM differs from a generalist PM by owning...',
      options: [
        'Marketing copy.',
        'The eval-driven feedback loop, model-vs-product tradeoffs, customer trust dimensions of AI features.',
        'Office layouts.',
        'Sales quotas.'
      ],
      correctIndex: 1,
      explanation: 'AI PM owns the discipline of measuring AI quality, deciding when to swap models or invest in fine-tuning, and managing trust patterns (citations, fallbacks, user agency).'
    }
  ],
  'ml-engineer-vs-ai-engineer': [
    {
      prompt: 'The fundamental difference between ML Engineer and AI Engineer is...',
      options: [
        'Salary only.',
        'ML Engineering is bottom-up (data + training); AI Engineering is top-down (API + production).',
        'Office location.',
        'Programming language.'
      ],
      correctIndex: 1,
      explanation: 'Different starting points produce different toolchains and skills. Both still exist; AI Engineering grew faster post-ChatGPT because foundation models commoditized model building.'
    }
  ],
  'ai-evaluation-engineer': [
    {
      prompt: 'AI Evaluation Engineer is best described as...',
      options: [
        'QA only.',
        'An eval-focused role owning error analysis, LLM-as-judge alignment, CI / CD eval gating.',
        'Pure DevOps.',
        'A marketing role.'
      ],
      correctIndex: 1,
      explanation: 'New 2025+ specialization. Owns the discipline that turns "it works on the demo" into "it works in production." Eval-driven development is the underlying methodology.'
    }
  ],
  'agent-engineer': [
    {
      prompt: 'Agent Engineer designs which artifacts?',
      options: [
        'Only chat UIs.',
        'Tool catalogs, MCP servers, memory architectures, multi-agent orchestration, durable execution.',
        'Frontend only.',
        'Database schemas only.'
      ],
      correctIndex: 1,
      explanation: '2026 specialization. Hybrid of API engineer + protocol designer + workflow architect. Spans MCP, LangGraph / Mastra orchestration, memory systems, agent observability.'
    }
  ],
  'ai-red-team-security-engineer': [
    {
      prompt: 'AI Red Team / Security Engineer probes for...',
      options: [
        'Only marketing copy errors.',
        'Prompt injection, jailbreaks, data leakage, model-policy violations.',
        'CSS bugs.',
        'Vendor pricing changes.'
      ],
      correctIndex: 1,
      explanation: 'Security engineer specialized for AI systems. Uses MITRE ATLAS, PyRIT, OWASP LLM Top 10. Increasingly required for high-risk deployments and frontier model releases.'
    }
  ],
  'ai-implementation-consultant': [
    {
      prompt: 'AI Implementation Consultants typically work for...',
      options: [
        'Only model labs.',
        'Big Four / consulting firms: Deloitte AI&D, PwC AI, EY.ai, KPMG AI, Accenture Data & AI.',
        'Government only.',
        'Education only.'
      ],
      correctIndex: 1,
      explanation: 'Customer-side advisory and implementation. Compensation lower than AI labs but career path can pivot to senior CTO / CAIO roles via diverse industry exposure.'
    }
  ],
  'forward-deployed-engineer-fde': [
    {
      prompt: 'FDE (Forward Deployed Engineer) is the archetype of...',
      options: [
        'Pure research.',
        'Embedded customer engineer who lives at customer sites; Palantir\'s pattern, now standard at AI labs.',
        'Pure data labeling.',
        'A traditional consulting role.'
      ],
      correctIndex: 1,
      explanation: 'Hybrid of engineer + consultant + product manager. Compensation among the highest in the industry: Palantir $171K-$415K; AI labs $350K-$550K typical bands.'
    }
  ],
  'chief-ai-officer-caio': [
    {
      prompt: 'By 2026, what fraction of large organizations have a Chief AI Officer?',
      options: [
        'Under 5%.',
        'Roughly 60%.',
        'Exactly 25%.',
        'None.'
      ],
      correctIndex: 1,
      explanation: 'CAIO became standard at large enterprises through 2024-2026. Owns enterprise AI strategy, governance, and the cross-BU operating model. Reports to CEO or CTO depending on org maturity.'
    }
  ],
  'levels-fyi': [
    {
      prompt: 'Levels.fyi\'s primary contribution to AI compensation transparency is...',
      options: [
        'A list of CEO emails.',
        'Crowd-sourced compensation data with role-level granularity for top labs.',
        'Free interview practice.',
        'Job referrals.'
      ],
      correctIndex: 1,
      explanation: 'Canonical reference for AI lab compensation. Tracks medians at OpenAI, Anthropic, Google, Meta, Palantir, Glean, etc. by level and role. Reduces information asymmetry in offer negotiations.'
    }
  ],
  'built-in': [
    {
      prompt: 'Built In is most useful as...',
      options: [
        'A coding tutorial site.',
        'The dominant US AI-specific job board with concentrated salary and role data.',
        'A vector database.',
        'A model registry.'
      ],
      correctIndex: 1,
      explanation: 'Concentrated focus on AI-native and AI-adopting companies. Salary disclosures and role descriptions cluster well; useful for benchmarking offers and target roles.'
    }
  ],
  'ai-premium': [
    {
      prompt: 'The "AI premium" in 2026 compensation is approximately...',
      options: [
        'Negative.',
        '15-40% above equivalent generalist roles, compressing as supply grows.',
        '500%.',
        'Zero.'
      ],
      correctIndex: 1,
      explanation: 'Supply-demand imbalance favors AI specialization. Premium compresses as universities and bootcamps catch up; expect narrower spread by 2027-2028.'
    }
  ],
  'kore1-four-lane-breakdown': [
    {
      prompt: 'KORE1\'s four-lane comp breakdown for 2026 lists which range for FDE at AI labs?',
      options: [
        '$50K-$80K.',
        '$350K-$550K base typical at AI labs.',
        '$5M+.',
        'No data.'
      ],
      correctIndex: 1,
      explanation: 'Pre-sales SE: $130K-$215K base. FDE Palantir: $171K-$415K. FDE AI labs: $350K-$550K. AI / ML lab researcher: $400K-$700K. Big Four consultant: $130K-$300K. Reference for offer benchmarking.'
    }
  ],
  'top-lab-medians-levels-fyi-may-2026': [
    {
      prompt: 'Per Levels.fyi May 2026, OpenAI SWE total compensation median is...',
      options: [
        '$100K.',
        'Approximately $795K.',
        '$50K.',
        '$2M.'
      ],
      correctIndex: 1,
      explanation: 'OpenAI SWE $795K, Anthropic SWE $600K, Palantir FDSE $215K, Glean $207K. The frontier-lab tier has separated meaningfully from broader software engineering compensation.'
    }
  ],
  'big-four-bands': [
    {
      prompt: 'Big Four AI consulting Senior Consultant base bands typically run...',
      options: [
        '$50K-$70K.',
        '$130K-$170K base; Manager $145K-$218K; Director $200K-$300K+ plus performance.',
        '$500K-$1M.',
        'No data.'
      ],
      correctIndex: 1,
      explanation: 'Big Four bases lower than AI labs but partner / director path can outpace lab senior IC over decade horizons; performance compensation and pension differ substantially.'
    }
  ],
  'anthropic-london-salaries': [
    {
      prompt: 'Anthropic London base salary range disclosed by 2026 is...',
      options: [
        'GBP 30K-50K.',
        'GBP 225K-630K depending on level; the new European AI compensation ceiling.',
        'GBP 1M flat.',
        'No public data.'
      ],
      correctIndex: 1,
      explanation: 'Public job postings disclose ranges. Reference data for European AI offers; anchored against San Francisco bands. Reshapes UK / EU compensation expectations.'
    }
  ],
  'hiring-manager-rubric': [
    {
      prompt: 'A 2026 AI hiring manager\'s implicit rubric usually includes...',
      options: [
        'Only LeetCode.',
        'Tradeoff fluency, eval methodology, customer empathy, agent design judgment, real production stories.',
        'Only paper count.',
        'Only GitHub stars.'
      ],
      correctIndex: 1,
      explanation: 'Tradeoffs (model size vs cost vs latency, RAG vs fine-tune vs prompt) are the primary signal. Eval discipline separates senior from junior. Real production stories demonstrate end-to-end ownership.'
    }
  ],
  'ai-ml-systems-design-interview': [
    {
      prompt: 'The dominant 2026 systems-design round prompt is...',
      options: [
        'Design a URL shortener.',
        'Design a RAG system, an agent, or an eval pipeline for a given use case.',
        'Design a database from scratch.',
        'Design a video game.'
      ],
      correctIndex: 1,
      explanation: 'Replaced classical web-scale system design at most AI-native vendors. Tests architectural fluency in retrieval, agents, evals, observability, cost, latency, security trade-offs.'
    }
  ],
  'behavioral-tell-me-about-a-time-you-used-ai-to': [
    {
      prompt: 'The behavioral question "Tell me about a time you used AI to..." is best answered with...',
      options: [
        'A surface-level anecdote.',
        'A specific story demonstrating agentic fluency: tool selection, eval, iteration, tradeoff awareness.',
        'A quote from a press release.',
        'Nothing.'
      ],
      correctIndex: 1,
      explanation: 'Hiring managers test for hands-on experience and methodology. Surface answers ("I asked ChatGPT") fail; specific tradeoff-rich stories signal real practitioner.'
    }
  ],
  'take-home-assignment': [
    {
      prompt: 'A typical 2026 AI take-home expectation is...',
      options: [
        '8 hours of pure code.',
        '48-72 hour build of a RAG / agent / eval pipeline; deploy to public URL; 5-10 hour expected effort.',
        'A 200-page report.',
        'No deliverable.'
      ],
      correctIndex: 1,
      explanation: 'Take-homes evaluate end-to-end delivery, not just code. Expect deployed URL, eval harness, README explaining tradeoffs. Many candidates fail on deployment and eval steps despite strong code.'
    }
  ],
  'demo-round-solutions-engineer': [
    {
      prompt: 'A typical SE demo round is...',
      options: [
        'A 5-minute slide deck.',
        '30-45 minute live demo against a customer scenario plus objection handling.',
        'A pure whiteboard problem.',
        'A take-home only.'
      ],
      correctIndex: 1,
      explanation: 'Tests narrative fluency, technical depth, and on-the-fly adaptation. Common failure: candidates over-prepare the happy path and freeze on hard objections.'
    }
  ],
  'the-mirror-pattern': [
    {
      prompt: 'Pieter Levels\'s "Mirror" pattern is...',
      options: [
        'Mimicking a competitor.',
        'Public AI demos that compound: each demo is a reusable asset that surfaces the next opportunity.',
        'A workout routine.',
        'A SaaS pricing model.'
      ],
      correctIndex: 1,
      explanation: 'Build in public, ship demos, reuse them as portfolio + sales artifacts + opportunity sources. Career-compounding pattern; each demo is both proof and pipeline.'
    }
  ],
  'ai-tinkerers': [
    {
      prompt: 'AI Tinkerers is...',
      options: [
        'A children\'s show.',
        'A global meetup network (220 cities, 103K+ members) with live-demo-only events.',
        'A SaaS product.',
        'A vector database.'
      ],
      correctIndex: 1,
      explanation: 'High-signal AI engineering community. Live-demo-only format filters out theory; in-person rooms compound the network effect. Often the first place new AI engineering patterns surface.'
    }
  ],
  'ai-engineer-world-s-fair-summit': [
    {
      prompt: 'AI Engineer World\'s Fair / Summit is associated with...',
      options: [
        'Apple.',
        'swyx and the AI Engineer Foundation; flagship industry conferences.',
        'GDC.',
        'CES.'
      ],
      correctIndex: 1,
      explanation: '2026\'s hub for AI engineering practice. Talks, workshops, networking. Pairs with AI Tinkerers as the conference + community pillars of the AI Engineer scene.'
    }
  ],
  'recruiting-channels': [
    {
      prompt: 'Best 2026 recruiting channels for AI engineering roles include...',
      options: [
        'Only LinkedIn.',
        'Built In, AIJobs.io, Wellfound, Y Combinator Work at a Startup, Pallet, NextNext.AI, AI-specialized recruiters.',
        'Only Twitter.',
        'Only employee referrals.'
      ],
      correctIndex: 1,
      explanation: 'Multiple AI-concentrated channels reduce noise vs LinkedIn\'s broad firehose. AI-specialized recruiters (KORE1, others) provide market intelligence and warm intros to specific lanes.'
    }
  ],
  'hacker-news-who-s-hiring': [
    {
      prompt: 'Hacker News "Who\'s Hiring" thread is high-signal because...',
      options: [
        'It is run by Apple.',
        'Engineer-to-engineer signal: founders / engineers post directly without recruiter noise.',
        'It is mandatory.',
        'It is paywalled.'
      ],
      correctIndex: 1,
      explanation: 'Monthly thread; concentrated AI startup roles. Founders often post directly. Match rate higher than generic boards because the audience self-selects technical.'
    }
  ],

  // ===== Module 15: AI Product Design Patterns =====
  'manual': [
    {
      prompt: 'On the autonomy ladder, "Manual" is the rung where...',
      options: [
        'AI runs unsupervised.',
        'Humans do everything; AI is not involved.',
        'AI suggests every step.',
        'AI runs background tasks.'
      ],
      correctIndex: 1,
      explanation: 'Baseline against which AI features are measured. Often the right answer for novel, ambiguous, or high-stakes work; not every workflow benefits from AI.'
    }
  ],
  'suggest': [
    {
      prompt: '"Suggest" pattern keeps the user as the protagonist by...',
      options: [
        'Hiding AI output entirely.',
        'Having AI propose, while the human accepts or rejects each suggestion.',
        'Acting autonomously.',
        'Skipping review.'
      ],
      correctIndex: 1,
      explanation: 'Copilot, Grammarly. Lowest autonomy on the ladder; user steers, AI offers options. Right call when output quality is mixed and review cost is low.'
    }
  ],
  'assist': [
    {
      prompt: '"Assist" rung has the AI...',
      options: [
        'Doing nothing.',
        'Doing the work while the human supervises (e.g., Cursor agent mode).',
        'Asking permission per token.',
        'Running offline only.'
      ],
      correctIndex: 1,
      explanation: 'Mid-autonomy: human still owns each step but does not type each line. Cursor agent mode, Claude Code plan-then-execute. The 2026 default for skilled engineers.'
    }
  ],
  'automate': [
    {
      prompt: '"Automate" handles defined workflows...',
      options: [
        'Without ever involving humans.',
        'End-to-end with humans in the loop on exceptions and edge cases.',
        'Only on Tuesdays.',
        'Only via voice.'
      ],
      correctIndex: 1,
      explanation: 'Operations-grade autonomy. Routine path is fully automated; humans handle the long tail. Most production agentic systems land here, not at full autonomous.'
    }
  ],
  'autonomous': [
    {
      prompt: 'On the autonomy ladder, fully "Autonomous" means...',
      options: [
        'No humans ever involved.',
        'AI runs without per-step human review; humans own outcomes and meta-level oversight.',
        'AI replaces all engineering.',
        'AI is unsupervised forever.'
      ],
      correctIndex: 1,
      explanation: 'Devin, Replit Agent, autonomous research agents. Humans set goals and review final results, not every step. Reserved for well-bounded tasks where blast radius is manageable.'
    }
  ],
  'copilot-pattern': [
    {
      prompt: 'In the Copilot pattern, the user is...',
      options: [
        'A passive observer.',
        'The protagonist; AI offers suggestions inline.',
        'The opponent.',
        'Replaced.'
      ],
      correctIndex: 1,
      explanation: 'GitHub Copilot, Microsoft Copilot. User does the steering; AI augments. Trust is built incrementally because user accepts or rejects each suggestion.'
    }
  ],
  'autopilot-pattern': [
    {
      prompt: 'The Autopilot pattern places review at...',
      options: [
        'Every token.',
        'Defined boundaries (end of task, on PR creation, on deploy).',
        'Never.',
        'Random intervals.'
      ],
      correctIndex: 1,
      explanation: 'Replit Agent, Devin. AI does the steering between checkpoints; humans review at boundaries. Better fit than Copilot for autonomous coding tasks; weaker for ambiguous work.'
    }
  ],
  'generator-pattern': [
    {
      prompt: 'The Generator product pattern is exemplified by...',
      options: [
        'Search engines.',
        'Midjourney, Suno, Sora: the output is the product.',
        'Code review.',
        'Database admin.'
      ],
      correctIndex: 1,
      explanation: 'User iterates to a satisfying artifact. Trust is built by reuse and editing rather than citation. Different success metrics: time-to-acceptable-output, iteration cost.'
    }
  ],
  'rewriter-pattern': [
    {
      prompt: 'A Rewriter takes...',
      options: [
        'A prompt and produces an image.',
        'Existing input and transforms it (improve, fix, change tone).',
        'No input.',
        'A search query.'
      ],
      correctIndex: 1,
      explanation: 'Grammarly rewrite, ChatGPT "improve this." Input + transformation = output. Output should usually be edit-friendly so the user can refine.'
    }
  ],
  'summarizer-pattern': [
    {
      prompt: 'For a summarizer product, the success criterion is...',
      options: [
        'Maximum length.',
        'Faithful compression: the summary preserves meaning without inventing claims.',
        'Random selection.',
        'Length matching the input.'
      ],
      correctIndex: 1,
      explanation: 'Hallucinated summaries are the dominant failure mode. Pair with faithfulness scoring or LLM-as-judge against the source. Length compression is secondary to faithfulness.'
    }
  ],
  'classifier-pattern': [
    {
      prompt: 'A classifier product typically tolerates which model size?',
      options: [
        'Always frontier-tier.',
        'Often Haiku-tier or smaller fine-tuned models; the task is bounded enough.',
        'Only research-grade.',
        'Only open-weight.'
      ],
      correctIndex: 1,
      explanation: 'Classification has clear ground truth; small models often suffice. Saves 10-30x cost vs frontier; quality usually within 1-2 points of frontier on well-scoped tasks.'
    }
  ],
  'extractor-pattern': [
    {
      prompt: 'Extractor pattern pairs naturally with...',
      options: [
        'Free-text output.',
        'Pydantic schemas + structured output for typed records.',
        'No schema.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Invoice fields, contract clauses, document records. Define the target shape as Pydantic; use structured-output mode; validate. Three layers of defense against malformed extractions.'
    }
  ],
  'conversational-interface-pattern': [
    {
      prompt: 'Conversational interfaces require which engineering surface area?',
      options: [
        'Only a chat box.',
        'Memory, context-management, fallback handling, citation, tone, latency budget.',
        'Only a prompt.',
        'Nothing.'
      ],
      correctIndex: 1,
      explanation: 'ChatGPT, Claude.ai. The chat input is small; everything around it is the product. Memory and context-management complexity dominates engineering work for serious deployments.'
    }
  ],
  'embedded-suggest-pattern': [
    {
      prompt: 'Embedded Suggest is exemplified by...',
      options: [
        'A separate full-screen tool.',
        'Inline suggestions inside another tool: Grammarly in Gmail, Copilot in VSCode.',
        'A command palette only.',
        'Voice agents.'
      ],
      correctIndex: 1,
      explanation: 'Lowest-friction AI surfacing: AI shows up where the work happens. Hardest part is non-intrusive UX; intrusive embeddings are quickly disabled by users.'
    }
  ],
  'agent-pattern': [
    {
      prompt: 'The Agent product pattern is...',
      options: [
        'Single-shot generation.',
        'Multi-step autonomous task completion: agent plans, acts, observes, iterates.',
        'Pure search.',
        'Database CRUD.'
      ],
      correctIndex: 1,
      explanation: 'Devin, customer-support agents, Replit Agent, internal automation agents. Higher engineering surface area than chat: tools, memory, durability, observability.'
    }
  ],
  'search-pattern': [
    {
      prompt: 'AI Search products like Glean, Hebbia, AlphaSense are essentially...',
      options: [
        'Replacements for chat.',
        'RAG productized: enterprise search over private corpora with citation and trust patterns.',
        'Just Google.',
        'Pure embeddings UI.'
      ],
      correctIndex: 1,
      explanation: 'Search has been the most successful AI product category at enterprise. Citations, source visibility, permission-aware retrieval are table stakes.'
    }
  ],
  'q-a-pattern': [
    {
      prompt: 'Q&A products against documents (legal, support) succeed when...',
      options: [
        'They look like ChatGPT.',
        'They show citations, permit corrections, fall back gracefully on missing context.',
        'They never cite.',
        'They use only one model.'
      ],
      correctIndex: 1,
      explanation: 'Trust hinges on faithful citation. Without it, users cannot verify; faithfulness becomes a vibe rather than a verifiable property.'
    }
  ],
  'knowledge-worker-copilot': [
    {
      prompt: 'Knowledge worker copilots are best embodied by...',
      options: [
        'Standalone chat apps only.',
        'Productivity-suite-resident AI: M365 Copilot, Workspace Gemini.',
        'Pure search engines.',
        'Voice assistants only.'
      ],
      correctIndex: 1,
      explanation: 'AI that lives where the work lives (email, docs, sheets, slides). Highest enterprise leverage because users do not have to context-switch into a separate tool.'
    }
  ],
  'vertical-ai-assistant': [
    {
      prompt: 'Vertical AI assistants like Harvey, Abridge, Ambient AI are characterized by...',
      options: [
        'Horizontal generality.',
        'Domain-specific workflows that integrate deeply with the practitioner\'s existing software and processes.',
        'Pure SaaS dashboards.',
        'Free pricing.'
      ],
      correctIndex: 1,
      explanation: 'Defensibility from workflow integration, not from model capability alone. Vertical depth (legal precedent corpus, clinical record format, medical billing rules) is the moat.'
    }
  ],
  'ai-as-feature-vs-ai-as-product': [
    {
      prompt: 'The "AI as feature vs AI as product" distinction matters because...',
      options: [
        'It does not matter.',
        'Defensibility, GTM, and design differ: features extend an existing product; products live or die by the AI.',
        'Only pricing differs.',
        'Branding only.'
      ],
      correctIndex: 1,
      explanation: 'AI-as-feature: existing distribution and workflows give you incumbency. AI-as-product: every metric depends on the AI quality. Different design constraints, different fundraising story.'
    }
  ],
  'the-trust-building-loop': [
    {
      prompt: 'Trust-building in AI products typically involves...',
      options: [
        'Maximum confidence, no uncertainty signaling.',
        'Citing sources, explaining reasoning, allowing correction.',
        'Aggressive auto-action.',
        'Nothing.'
      ],
      correctIndex: 1,
      explanation: 'Three pillars of trust UX: where did this come from, why was this chosen, how do I fix it if wrong. Skipping any one corrodes user trust over time.'
    }
  ],
  'the-fallback-pattern': [
    {
      prompt: 'The Fallback pattern determines how a product behaves when...',
      options: [
        'Everything is great.',
        'AI fails (low confidence, refusal, or outage): graceful degradation, human handoff, or explicit "I do not know."',
        'Users complain.',
        'Vendors raise prices.'
      ],
      correctIndex: 1,
      explanation: 'Crisis-day UX. Determines whether one bad day breaks user trust or just feels like a normal hiccup. Design the fallback path before the happy path is shipped.'
    }
  ],
  'cost-shape-of-product': [
    {
      prompt: 'Choosing per-seat vs per-token pricing should align with...',
      options: [
        'The vendor\'s preference.',
        'The shape of usage: per-seat for predictable workflows; per-token / hybrid for high-variance usage.',
        'A coin flip.',
        'The cheapest option.'
      ],
      correctIndex: 1,
      explanation: 'Mismatched pricing kills unit economics: per-seat with heavy power users loses money; per-token with light users feels expensive. Hybrid (seat + metered usage above threshold) is increasingly common.'
    }
  ],
  'the-model-swap-architecture': [
    {
      prompt: 'A "model swap" architecture is built by...',
      options: [
        'Hardcoding one vendor everywhere.',
        'Using gateway abstractions, vendor-agnostic prompts, and tested fallback chains so you can swap providers without rebuilding.',
        'Forking the model.',
        'Skipping evals.'
      ],
      correctIndex: 1,
      explanation: 'Hedge against vendor lock-in and capability shifts. Total flexibility is hard; pragmatic architectures preserve swap-ability for the parts that matter (model, embedding, sometimes vector DB).'
    }
  ],
  'latency-budgets-per-pattern': [
    {
      prompt: 'Typical latency targets per pattern are...',
      options: [
        'All under 100ms.',
        'Voice < 800ms; conversational chat < 2s perceived; autocomplete < 100ms.',
        'All over 5s.',
        'Random.'
      ],
      correctIndex: 1,
      explanation: 'Different patterns, different latency tolerance. Design choices (streaming, prompt caching, model tier, retrieval depth) flow from the budget. Miss it and the product feels broken.'
    }
  ],
  'streaming-as-ux': [
    {
      prompt: 'Streaming as a UX pattern works because...',
      options: [
        'It speeds up generation.',
        'It collapses perceived latency: first-token feels instant even when total time is several seconds.',
        'It compresses output.',
        'It is required by browsers.'
      ],
      correctIndex: 1,
      explanation: 'Without streaming, a 30s generation is a 30s pause. With streaming, the user reads as it generates and never feels frozen. Canonical pattern; expected on chat-style products.'
    }
  ],
  'citation-and-source-visibility': [
    {
      prompt: 'Citations in RAG products serve two purposes...',
      options: [
        'Decoration and decoration.',
        'Verifiability for users and faithfulness signal for evaluators.',
        'Padding and padding.',
        'They serve no purpose.'
      ],
      correctIndex: 1,
      explanation: 'Users use citations to verify; evaluators use them to score faithfulness. Both tighten the feedback loop on RAG quality. Faithful citations (link back to actual source) > pretend citations.'
    }
  ],
  'edit-friendly-outputs': [
    {
      prompt: 'Edit-friendly outputs outperform locked outputs because...',
      options: [
        'They are cheaper.',
        'Editing is the trust-building act: users invest, refine, and adopt.',
        'They are bigger.',
        'They are smaller.'
      ],
      correctIndex: 1,
      explanation: 'Rich text, structured fields, in-place edits. Lower commitment-to-try; higher long-term retention. "Read-only AI output" rarely outperforms "draft I can fix."'
    }
  ],
  'the-undo-regenerate-pattern': [
    {
      prompt: 'Undo / regenerate is a foundation of trust because it lowers...',
      options: [
        'Server cost.',
        'The commitment-to-try barrier: users will try AI suggestions if they can dismiss or rerun easily.',
        'Latency.',
        'Token count.'
      ],
      correctIndex: 1,
      explanation: 'Without easy dismissal, users avoid invoking AI on important content. Undo + regenerate is the minimum trust foundation; without it, AI features feel risky and adoption stalls.'
    }
  ],

  // ===== Module 16: Data Engineering for AI =====
  'document-processing-pipeline': [
    {
      prompt: 'The canonical document-processing pipeline order is...',
      options: [
        'Embed -> chunk -> ingest -> extract -> parse -> index.',
        'Ingest -> parse -> extract -> chunk -> embed -> index.',
        'Random order.',
        'Skip parsing.'
      ],
      correctIndex: 1,
      explanation: 'Linear stages; each consumes the previous step\'s output. Errors compound: bad parsing produces bad chunks; bad chunks produce bad embeddings. Test each stage in isolation.'
    }
  ],
  'ocr': [
    {
      prompt: 'OCR is now often replaced or supplemented by...',
      options: [
        'Manual data entry.',
        'Vision-language models (Claude vision, GPT-4o, Gemini) that handle layout reasoning inline.',
        'Random sampling.',
        'Audio transcription.'
      ],
      correctIndex: 1,
      explanation: 'Classical OCR still wins on dense scanned text. VLMs win when layout reasoning matters (tables, forms, mixed columns). 2026 default: try VLM first, fall back to OCR for OCR-heavy specialized cases.'
    }
  ],
  'mistral-ocr': [
    {
      prompt: 'Mistral OCR is positioned against...',
      options: [
        'Only Tesseract.',
        'Google Document AI / Azure / AWS Textract on layout and table quality, often at lower cost.',
        'Voice transcription.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Mistral\'s 2025 OCR API: strong on layout and tables, competitive pricing. Useful when the data shape (tables, forms) outweighs the need for one-stop platform integration.'
    }
  ],
  'anthropic-vision-ocr': [
    {
      prompt: 'Anthropic vision is best at...',
      options: [
        'Pure dense OCR text.',
        'Layout-aware extraction with reasoning over the document inline.',
        'Voice transcription.',
        'Audio classification.'
      ],
      correctIndex: 1,
      explanation: 'Claude can read the document and reason about it in the same call. Less tuned for raw OCR; better when downstream task involves understanding plus extraction.'
    }
  ],
  'google-document-ai': [
    {
      prompt: 'Google Document AI ships pre-trained processors for...',
      options: [
        'Only English text.',
        'Forms, invoices, contracts, US tax documents, identity documents.',
        'Only handwriting.',
        'Only audio.'
      ],
      correctIndex: 1,
      explanation: 'Pre-trained processors avoid building from scratch for common document classes. Strong fit for GCP-aligned stacks; integrates with BigQuery and Vertex AI naturally.'
    }
  ],
  'azure-document-intelligence': [
    {
      prompt: 'Azure Document Intelligence (formerly Form Recognizer) is closest to...',
      options: [
        'Only PDF parser.',
        'Microsoft\'s competing service to Google Document AI / AWS Textract; tight Microsoft ecosystem fit.',
        'A music app.',
        'A vector database.'
      ],
      correctIndex: 1,
      explanation: 'Pre-built models for invoices, receipts, contracts, identity documents. Pairs cleanly with Microsoft 365 and Azure pipelines. Form Recognizer evolution.'
    }
  ],
  'aws-textract': [
    {
      prompt: 'AWS Textract is the natural choice when...',
      options: [
        'You run nothing on AWS.',
        'Your stack is AWS-heavy (S3 source, Lambda processing, downstream RDS / Bedrock).',
        'You only use GCP.',
        'You need image generation.'
      ],
      correctIndex: 1,
      explanation: 'Native S3 integration; pairs with Comprehend for downstream NLP. Lower friction in AWS-aligned stacks vs cross-cloud document services.'
    }
  ],
  'tesseract': [
    {
      prompt: 'Tesseract is best used for...',
      options: [
        'Layout-heavy modern documents.',
        'Simple text-on-image cases where free, fully-local, classical OCR suffices.',
        'Voice transcription.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Open-source, free, runs on CPU. Outclassed by VLM-based approaches on layout but still useful for simple receipt-style or screenshot-text cases without cloud egress.'
    }
  ],
  'layoutlm': [
    {
      prompt: 'LayoutLM\'s architectural distinction is...',
      options: [
        'Vision-only.',
        'Joint embedding of text + position + image features for layout-aware understanding.',
        'Pure audio.',
        'Pure tokenizer.'
      ],
      correctIndex: 1,
      explanation: 'Microsoft\'s LayoutLM family. Foundational for document AI; trained models surface in many enterprise document-extraction stacks. Successors: LayoutLMv3, LayoutXLM (multilingual).'
    }
  ],
  'multimodal-extraction': [
    {
      prompt: 'Multimodal extraction (using VLMs) replaces classical pipelines for...',
      options: [
        'Pure linear text.',
        'Tables, forms, handwriting, charts where layout reasoning matters.',
        'Audio.',
        'Network packets.'
      ],
      correctIndex: 1,
      explanation: 'The 2026 frontier. VLMs handle layout, visual structures, and natural-language reasoning over documents in one call. Reduces glue code; sometimes loses on dense pure-OCR throughput.'
    }
  ],
  'entity-extraction': [
    {
      prompt: 'Entity extraction is the foundation for...',
      options: [
        'Only summarization.',
        'Knowledge graph construction, structured records, and many downstream RAG features.',
        'Only voice agents.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Entities (people, places, organizations, dates) are the nodes. Without reliable entity extraction, downstream graph-RAG and structured-data work falls apart.'
    }
  ],
  'relation-extraction': [
    {
      prompt: 'Relation extraction provides the...',
      options: [
        'Nodes of a knowledge graph.',
        'Edges of a knowledge graph: subject-predicate-object triples.',
        'Pure embeddings.',
        'Tokenization.'
      ],
      correctIndex: 1,
      explanation: 'Entity extraction gives nodes; relation extraction gives edges. Both required for graph construction. Modern frontier models can do both in one pass with structured-output prompting.'
    }
  ],
  'knowledge-graph-construction': [
    {
      prompt: 'Knowledge graph construction is the foundation of...',
      options: [
        'Naive RAG only.',
        'GraphRAG and other multi-hop reasoning patterns.',
        'Image generation.',
        'Voice agents only.'
      ],
      correctIndex: 1,
      explanation: 'GraphRAG queries the graph; RAG over the graph augments retrieval with relationship paths. Building reliable graphs requires good entity + relation extraction plus deduplication.'
    }
  ],
  'structured-data-extraction': [
    {
      prompt: 'For structured data extraction, the right pairing is...',
      options: [
        'Free-text output and regex.',
        'Pydantic schema + structured output mode + post-validation.',
        'Manual entry.',
        'Voice transcription.'
      ],
      correctIndex: 1,
      explanation: 'Define the target shape as Pydantic; constrain decoding to valid JSON; validate. Three layers of defense. Same pattern as the prompting "Structured output" topic.'
    }
  ],
  'unstructured-io': [
    {
      prompt: 'Unstructured.io is best described as...',
      options: [
        'A vector database.',
        'Open-source library + commercial product for document parsing across 25+ formats.',
        'A model gateway.',
        'A vector store only.'
      ],
      correctIndex: 1,
      explanation: 'Default 2026 ingestion layer in many RAG pipelines. Handles PDFs, Word, HTML, email, and many more. Output is normalized chunks with metadata for downstream embedding.'
    }
  ],
  'web-scraping-for-ai': [
    {
      prompt: 'When scraping the web for AI training or retrieval, the most important non-technical consideration is...',
      options: [
        'CSS selectors.',
        'Legal and ethical: copyright, ToS, rate limits, robots.txt.',
        'Tabs vs spaces.',
        'Markdown vs HTML.'
      ],
      correctIndex: 1,
      explanation: 'Scraping at scale invites cease-and-desists and lawsuits. Respect robots.txt and rate limits; understand fair use and ToS. Many production RAG systems use vendor APIs or licensed feeds instead.'
    }
  ],
  'firecrawl': [
    {
      prompt: 'Firecrawl is positioned as...',
      options: [
        'A pure browser.',
        'AI-friendly web scraper with markdown output and structured extraction.',
        'A vector database.',
        'A code editor.'
      ],
      correctIndex: 1,
      explanation: 'Output formats are designed for downstream LLM consumption. Reduces the glue code between scraping and RAG ingestion compared to raw HTML scrapers.'
    }
  ],
  'crawl4ai': [
    {
      prompt: 'Crawl4AI is...',
      options: [
        'A SaaS-only product.',
        'Open-source AI-optimized scraper with LLM-ready output formats.',
        'A vector database.',
        'A model.'
      ],
      correctIndex: 1,
      explanation: 'Growing 2026 OSS choice. Self-hostable, configurable, output formats designed for downstream LLM ingestion. Pairs with Unstructured.io style normalization.'
    }
  ],
  'browse-ai': [
    {
      prompt: 'Browse.ai targets which audience?',
      options: [
        'Pure backend engineers.',
        'No-code users via AI-assisted setup; lowers barrier for non-engineers to build scrapers.',
        'Embedded systems.',
        'Mobile gaming.'
      ],
      correctIndex: 1,
      explanation: 'No-code scraping with AI-assisted setup. Useful when business teams need data feeds without engineering involvement.'
    }
  ],
  'scrapingbee': [
    {
      prompt: 'ScrapingBee is most useful for...',
      options: [
        'Easy targets with no JS.',
        'Harder targets needing JS rendering, proxies, or captcha handling, exposed as a managed API.',
        'Email parsing.',
        'Voice transcription.'
      ],
      correctIndex: 1,
      explanation: 'Managed API. Trades cost for the ops headache of running headless browsers and proxy pools yourself. Right call when scraping is incidental to your core product.'
    }
  ],
  'data-labeling-platforms': [
    {
      prompt: 'Modern AI data-labeling platforms (Scale, Surge, Pareto.AI) are used for...',
      options: [
        'Only image labeling.',
        'Fine-tuning training data and eval-set ground truth at scale, often with expert reviewers.',
        'Only translation.',
        'Only audio.'
      ],
      correctIndex: 1,
      explanation: 'Quality of labels caps quality of fine-tunes and evals. Expert-tier labeling (PhDs, professionals) is the differentiator at frontier; volume-tier labeling commoditized.'
    }
  ],
  'dataset-versioning': [
    {
      prompt: 'Dataset versioning tools (DVC, Pachyderm) treat datasets...',
      options: [
        'As random files.',
        'As code: every training run pinned to a hashed dataset version.',
        'As legacy artifacts.',
        'As temporary scratch.'
      ],
      correctIndex: 1,
      explanation: 'Without versioning, "we trained on the dataset" is meaningless. Versioning enables reproducibility, audit, and clean comparison of model versions trained on different data slices.'
    }
  ],
  'data-validation': [
    {
      prompt: 'Data validation tools (Great Expectations, Soda) catch corruption...',
      options: [
        'After model deployment.',
        'Before it reaches training or inference, via assertions about data shape.',
        'Only manually.',
        'Never.'
      ],
      correctIndex: 1,
      explanation: 'Assertions: column types, value ranges, null counts, schema invariants. Run in CI / scheduled; catch upstream data drift before it silently breaks downstream models.'
    }
  ],
  'apache-spark-for-ai-workloads': [
    {
      prompt: 'Apache Spark in AI workloads is...',
      options: [
        'Dominant in 2026.',
        'Common at enterprise scale for data prep but less dominant than five years ago.',
        'Replaced by SQL.',
        'Only for streaming.'
      ],
      correctIndex: 1,
      explanation: 'Distributed compute for large-scale ETL. Still common at very large enterprises; lighter alternatives (dlt, DuckDB, Polars) win for moderate scale.'
    }
  ],
  'dlt': [
    {
      prompt: 'dlt (data load tool) is...',
      options: [
        'A SQL dialect.',
        'An open-source Python library for declarative ETL pipelines into AI stacks.',
        'A model gateway.',
        'A graphics tool.'
      ],
      correctIndex: 1,
      explanation: 'Rising 2026 choice for lightweight ETL into AI systems. Declarative source / destination definitions; auto-handles schema evolution; lower friction than Spark for moderate scale.'
    }
  ],
  'feature-stores': [
    {
      prompt: 'Feature stores (Feast, Tecton) solve which problem?',
      options: [
        'Tokenization.',
        'Train-serve skew: same features served consistently to training and inference.',
        'Model gateway routing.',
        'PII redaction only.'
      ],
      correctIndex: 1,
      explanation: 'Without a feature store, training data and inference data drift. Same logic, different implementations. Feature stores centralize the definition; both training and inference consume identically.'
    }
  ],
  'experiment-tracking': [
    {
      prompt: 'Experiment tracking tools (W&B, MLflow, Comet) capture...',
      options: [
        'Only weights.',
        'Runs, hyperparameters, metrics, artifacts; the lab notebook for any non-trivial fine-tune.',
        'Only logs.',
        'Only PR comments.'
      ],
      correctIndex: 1,
      explanation: 'Without tracking, "what produced this model" is lost. Standard for any non-trivial fine-tuning workflow; pairs with dataset versioning for full reproducibility.'
    }
  ],
  'weights-biases-w-b': [
    {
      prompt: 'Weights & Biases is...',
      options: [
        'A vector database.',
        'The dominant 2026 experiment-tracking platform; broad adoption at AI labs.',
        'A coding agent.',
        'A model itself.'
      ],
      correctIndex: 1,
      explanation: 'W&B SaaS or self-hosted. Strongest brand in experiment tracking; also offers Sweeps (hyperparameter search), Reports, and lightweight model registries.'
    }
  ],
  'mlflow': [
    {
      prompt: 'MLflow vs W&B differs in that MLflow...',
      options: [
        'Is closed-source SaaS only.',
        'Is open-source and pairs naturally with Databricks / Spark stacks.',
        'Has no model registry.',
        'Is identical to W&B.'
      ],
      correctIndex: 1,
      explanation: 'MLflow ships open-source. Tracking + Model Registry + Projects. Common at enterprises with Databricks footprint. Less polish than W&B but more flexible deployment.'
    }
  ],

  // ===== Module 7: Local-First AI & Personal Knowledge Stacks =====
  'local-first-ai': [
    {
      prompt: 'The strongest reason to run AI locally is...',
      options: [
        'Lower latency than cloud frontier.',
        'Privacy, data sovereignty, and predictable cost at heavy use.',
        'Higher capability than cloud.',
        'Required by law.'
      ],
      correctIndex: 1,
      explanation: 'Local trades cloud frontier capability for privacy, ownership, and unbounded usage. Capability gap is real but narrowing; pick local where data sensitivity or volume justifies the engineering cost.'
    }
  ],
  'the-capability-ceiling': [
    {
      prompt: 'In 2026, the capability ceiling for local 70B models vs cloud frontier is...',
      options: [
        'Local has caught up entirely.',
        'Local handles most personal tasks; cloud frontier still leads on hardest reasoning, coding agents, complex multi-step.',
        'Local is always better.',
        'Local never works.'
      ],
      correctIndex: 1,
      explanation: 'Most personal tasks fit comfortably on a 70B local model. Frontier still wins on the hardest 5-10% (long-horizon agents, novel reasoning). Hybrid stacks route appropriately.'
    }
  ],
  'the-case-for-local': [
    {
      prompt: 'Common case-for-local arguments include...',
      options: [
        'Lower upfront cost.',
        'Privacy, no rate limits, no token costs at heavy use, sovereignty, learning by running.',
        'Higher quality on every task.',
        'Vendor required.'
      ],
      correctIndex: 1,
      explanation: 'Local is good for privacy-sensitive workflows (NDA work, regulated data), heavy continuous use that exceeds API budgets, and engineers who learn by running models themselves.'
    }
  ],
  'the-case-against-local': [
    {
      prompt: 'Common case-against-local arguments include...',
      options: [
        'No options exist.',
        'Capability ceiling, hardware cost, electricity, maintenance overhead, time cost of becoming a sysadmin.',
        'Local is always slower.',
        'Local has no models.'
      ],
      correctIndex: 1,
      explanation: 'Real ops burden: BIOS, drivers, firmware, memory pressure, noisy fans, GPU upgrades. Time you spend tuning is time you do not spend building. For most builders, hybrid (cloud + targeted local) is the sweet spot.'
    }
  ],
  'the-hybrid-stack-pattern': [
    {
      prompt: 'The dominant 2026 hybrid stack pattern is...',
      options: [
        'Always cloud.',
        'Local for personal / sensitive work, cloud frontier for hard reasoning, gateway in between.',
        'Always local.',
        'Always offline.'
      ],
      correctIndex: 1,
      explanation: 'Pragmatic: route by task. Sensitive data and routine work stay local; hard problems route to cloud frontier. A model gateway makes the routing transparent to applications.'
    }
  ],
  'apple-silicon-unified-memory-architecture': [
    {
      prompt: 'Apple Silicon\'s unified memory advantage for LLMs is...',
      options: [
        'Faster CPU.',
        'CPU and GPU share one memory pool, letting you load 100B+ models that would not fit in any consumer GPU\'s VRAM.',
        'No advantage.',
        'Lower power only.'
      ],
      correctIndex: 1,
      explanation: 'Mac Studio M3 Ultra 512GB lets you run 100B+ models that consumer NVIDIA GPUs cannot hold. Bandwidth is lower than top-end GPUs, but the capacity is what unlocks bigger models.'
    }
  ],
  'memory-bandwidth': [
    {
      prompt: 'For LLM inference, memory bandwidth often matters more than VRAM size because...',
      options: [
        'Models are small.',
        'Inference is bandwidth-bound: GPU spends most cycles waiting for weights from VRAM.',
        'Bandwidth equals latency.',
        'It does not matter.'
      ],
      correctIndex: 1,
      explanation: 'Most LLM inference is bandwidth-bound, not compute-bound. M3 Ultra: 819GB/s. RTX 4090: 1008GB/s. RTX 5090: ~1700GB/s. Higher bandwidth = higher tokens-per-second on the same model size.'
    }
  ],
  'vram-vs-unified-memory-tradeoff': [
    {
      prompt: 'VRAM vs unified memory is a tradeoff between...',
      options: [
        'Cost only.',
        'Bandwidth (VRAM faster per byte) vs capacity (unified lets you fit bigger models).',
        'Capacity only.',
        'They are identical.'
      ],
      correctIndex: 1,
      explanation: 'Dedicated VRAM: faster, capped low. Unified memory: slower per byte, fits bigger models. The right choice depends on whether your bottleneck is model size or generation speed.'
    }
  ],
  'mac-studio-m3-ultra-512gb': [
    {
      prompt: 'Mac Studio M3 Ultra 512GB is the 2026 reference local AI workstation because...',
      options: [
        'It runs Windows.',
        'It can run 100B+ models with MLX at ~$12K configured.',
        'It is free.',
        'It is the smallest Mac.'
      ],
      correctIndex: 1,
      explanation: 'Closest thing to a personal frontier-model machine: 512GB unified, MLX-optimized, single quiet box. Trade-off vs multi-GPU: lower bandwidth (slower per-token) but unmatched capacity.'
    }
  ],
  'mac-mini-m4-pro': [
    {
      prompt: 'Mac Mini M4 Pro fits in the local AI stack as...',
      options: [
        'A 70B+ workstation.',
        'An entry-point machine that runs 7B-30B models comfortably at ~$2K-3K with 64GB ceiling.',
        'A server cluster.',
        'A mobile device.'
      ],
      correctIndex: 1,
      explanation: 'Cheapest credible local AI machine. 64GB unified memory ceiling caps model size; small fans keep it quiet on a desk. Right entry point for "is local AI for me?" without committing $12K.'
    }
  ],
  'nvidia-rtx-5090': [
    {
      prompt: 'RTX 5090 (late 2025) provides...',
      options: [
        'Same specs as 4090.',
        '~32GB VRAM and ~1700GB/s bandwidth; consumer GPU choice for local serving in 2026.',
        '8GB VRAM only.',
        'Server-only deployment.'
      ],
      correctIndex: 1,
      explanation: 'Substantial bandwidth jump over 4090. Pairs with vLLM or SGLang for local serving. Capacity (32GB) limits to 30B-70B models with quantization; multi-GPU rigs needed past that.'
    }
  ],
  'nvidia-rtx-4090': [
    {
      prompt: 'RTX 4090\'s 24GB VRAM and 1008GB/s bandwidth made it...',
      options: [
        'Useless for AI.',
        'The previous-generation workhorse for personal AI rigs; common in multi-GPU stacks.',
        'A pure gaming card.',
        'Slower than 4070.'
      ],
      correctIndex: 1,
      explanation: 'Strong bandwidth and a usable VRAM size. Easily paired in 2x or 4x rigs for 70B-class models. Used 4090s remain valuable for local AI builders even after 5090 launch.'
    }
  ],
  'multi-gpu-rigs': [
    {
      prompt: 'Multi-GPU rigs (2x or 4x 4090, dual H100) split the model via...',
      options: [
        'Random sharding.',
        'Tensor / pipeline / expert parallelism depending on architecture.',
        'Single-thread serial execution.',
        'Network-only RPC.'
      ],
      correctIndex: 1,
      explanation: 'Tensor: split each layer across GPUs. Pipeline: split layers across GPUs. Expert: split MoE experts. Choice depends on model architecture and bandwidth between GPUs.'
    }
  ],
  'threadripper-epyc-for-hosting': [
    {
      prompt: 'Threadripper / EPYC are paired with multi-GPU rigs because...',
      options: [
        'They have the most cores.',
        'High PCIe lane count (128 on Threadripper Pro) lets multiple GPUs run at full bandwidth.',
        'They are cheaper.',
        'They run faster single-thread.'
      ],
      correctIndex: 1,
      explanation: 'Consumer CPUs have 24-28 PCIe lanes; not enough to feed multiple GPUs at full speed. Threadripper Pro / EPYC unlock real multi-GPU bandwidth without bottlenecking.'
    }
  ],
  'nvidia-project-digits': [
    {
      prompt: 'NVIDIA Project DIGITS (announced CES 2025) targets...',
      options: [
        'Cloud servers only.',
        'Personal AI: ~$3K, 128GB unified memory; runs 200B-class models.',
        'Phones only.',
        'Cars.'
      ],
      correctIndex: 1,
      explanation: 'NVIDIA\'s answer to Mac Studio for local AI. Personal-scale price, server-scale capability. Reshaped what "personal AI workstation" means; many builders waiting on it through 2026.'
    }
  ],
  'framework-desktop-with-amd-ryzen-ai-max-395': [
    {
      prompt: 'Framework Desktop (AMD AI Max+ 395) provides...',
      options: [
        'Cloud-only access.',
        '128GB unified memory in a small form factor; AMD\'s answer to Mac Studio for local AI.',
        'No GPU.',
        '8GB only.'
      ],
      correctIndex: 1,
      explanation: '2026 release. Brings unified-memory architecture to the x86 / Linux ecosystem. Useful for builders who need Linux-first workflow but want the Mac Studio capacity advantage.'
    }
  ],
  'tinybox-tinygrad': [
    {
      prompt: 'TinyBox / tinygrad is associated with...',
      options: [
        'Microsoft.',
        'George Hotz\'s pre-built multi-GPU AI workstations and underlying minimal ML framework.',
        'Google.',
        'Apple.'
      ],
      correctIndex: 1,
      explanation: 'TinyBox: pre-built workstation with 6x or 8x GPUs. tinygrad: underlying minimal ML framework competing with PyTorch on simplicity. Niche but influential in the local AI scene.'
    }
  ],
  'gguf': [
    {
      prompt: 'GGUF is...',
      options: [
        'A vector database.',
        'llama.cpp\'s native quantized model format; widely supported across CPU, Apple Metal, CUDA.',
        'A cloud API.',
        'A new programming language.'
      ],
      correctIndex: 1,
      explanation: 'Most-used local model format in 2026. Single-file packaging; runs on any backend llama.cpp supports. Quantization options from Q2 to Q8 with quality / size tradeoffs.'
    }
  ],
  'awq': [
    {
      prompt: 'AWQ stands for...',
      options: [
        'Average Weight Quality.',
        'Activation-aware Weight Quantization: efficient INT4 preserving important weight magnitudes.',
        'A vendor name.',
        'A benchmark.'
      ],
      correctIndex: 1,
      explanation: 'Popular for serving open-weight models on consumer GPUs. INT4 with quality close to FP16 on most tasks; faster than GPTQ in many cases.'
    }
  ],
  'gptq': [
    {
      prompt: 'GPTQ in 2026 is...',
      options: [
        'The dominant quantization format.',
        'An older post-training quantization method largely superseded by AWQ for INT4.',
        'Apple\'s default.',
        'Required by ISO 42001.'
      ],
      correctIndex: 1,
      explanation: 'GPTQ was popular in 2023-2024. AWQ now wins on most benchmarks; GPTQ-quantized models still circulate but new fine-tunes typically ship AWQ or GGUF.'
    }
  ],
  'mlx': [
    {
      prompt: 'MLX is...',
      options: [
        'Microsoft\'s framework.',
        'Apple\'s NumPy-like quantization format and inference framework optimized for Apple Silicon.',
        'A vector database.',
        'A web browser.'
      ],
      correctIndex: 1,
      explanation: 'MLX uses unified-memory architecture natively. Strong fit for Mac Studio / Mac Mini local AI. Pairs with Apple\'s research models and the wider Hugging Face ecosystem via converters.'
    }
  ],
  'exl2': [
    {
      prompt: 'EXL2 is...',
      options: [
        'A SaaS product.',
        'A quantization format popular for serving on consumer NVIDIA GPUs; mixed-precision.',
        'A model architecture.',
        'A hosting platform.'
      ],
      correctIndex: 1,
      explanation: 'Mixed-precision quantization. Good quality at low bit-widths; popular for personal-rig serving via TabbyAPI / ExLlama. Less common in production serving than AWQ or GGUF.'
    }
  ],
  'hqq': [
    {
      prompt: 'HQQ (Half-Quadratic Quantization) advantages include...',
      options: [
        'It is slow.',
        'Strong quality at low bit-width and faster computation than GPTQ.',
        'Only 8-bit.',
        'Apple-only.'
      ],
      correctIndex: 1,
      explanation: 'HQQ trades a slight quality cost vs AWQ for substantially faster quantization compute. Useful when you need to quantize many model checkpoints quickly.'
    }
  ],
  'fp16-bf16-fp8-mixed-precision': [
    {
      prompt: 'FP8 in 2026 is...',
      options: [
        'A research curiosity.',
        'The new datacenter standard, supported on H100 and B200.',
        'Pure CPU only.',
        'Apple-only.'
      ],
      correctIndex: 1,
      explanation: 'FP8 cuts memory and bandwidth ~2x vs BF16 with minimal quality loss on inference. Hardware support arrived with H100; B200 and successors continue. BF16 still common for training.'
    }
  ],
  'int8-vs-int4-tradeoffs': [
    {
      prompt: 'INT8 vs INT4 quantization typically trades...',
      options: [
        'Identical quality and size.',
        'INT8 near-lossless; INT4 2x more memory savings at noticeable quality cost on hard tasks.',
        'INT4 always wins.',
        'INT8 always wins.'
      ],
      correctIndex: 1,
      explanation: 'INT8 produces near-original quality at half the memory of FP16. INT4 halves memory again but degrades on hard reasoning. Run an eval to confirm the tradeoff for your task.'
    }
  ],
  'activation-vs-weight-quantization': [
    {
      prompt: 'Quantizing activations is harder than quantizing weights because...',
      options: [
        'Activations are static.',
        'Activations are dynamic per-input; weights are fixed after training.',
        'Activations are not quantizable.',
        'Activations are larger.'
      ],
      correctIndex: 1,
      explanation: 'Static weight quantization is straightforward. Activation quantization requires tracking distributions across inputs; the recent FP8 hardware support enables more aggressive activation quantization.'
    }
  ],
  'ollama': [
    {
      prompt: 'Ollama\'s position in the 2026 local AI stack is...',
      options: [
        'A cloud SaaS.',
        'De facto local model server: CLI-first, REST API at localhost:11434.',
        'A vector database.',
        'A frontend only.'
      ],
      correctIndex: 1,
      explanation: 'Default 2026 entry point for local AI. Pulls models from a registry, serves them via API. Most local-AI tools assume Ollama-compatible endpoints exist somewhere on the user\'s machine.'
    }
  ],
  'lm-studio': [
    {
      prompt: 'LM Studio\'s differentiator vs Ollama is...',
      options: [
        'Open-source license.',
        'GUI-first polished desktop application; OpenAI-compatible API endpoint.',
        'CLI-only.',
        'Cloud-hosted.'
      ],
      correctIndex: 1,
      explanation: 'Desktop app with model browser, chat UI, and built-in server. Better for users who prefer GUI; pairs naturally with OpenAI-compatible client code.'
    }
  ],
  'jan': [
    {
      prompt: 'Jan is positioned as...',
      options: [
        'A fork of ChatGPT.',
        'Apache 2.0 open-source ChatGPT alternative; no telemetry; privacy-focused.',
        'A SaaS product.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Privacy-focused desktop app for local LLMs. Plays well with Ollama and other local servers. Default for users who want a polished UI without telemetry concerns.'
    }
  ],
  'gpt4all': [
    {
      prompt: 'GPT4All is associated with...',
      options: [
        'OpenAI.',
        'Nomic; cross-platform local LLM runner with built-in document Q-A.',
        'Anthropic.',
        'Google.'
      ],
      correctIndex: 1,
      explanation: 'Mature UI; pre-built local RAG over documents. Default for users who want chat + private RAG without configuring a separate vector DB.'
    }
  ],
  'llama-cpp': [
    {
      prompt: 'llama.cpp\'s role in the local AI stack is...',
      options: [
        'A cloud API.',
        'C++ inference engine powering most local LLM tools (Ollama, LM Studio); introduced GGUF.',
        'A frontend.',
        'A vector database.'
      ],
      correctIndex: 1,
      explanation: 'Foundational layer of the local AI ecosystem. Introduced GGUF and many of the optimization patterns still in use. Most "user-friendly" local tools wrap it.'
    }
  ],
  'vllm': [
    {
      prompt: 'vLLM\'s headline innovations are...',
      options: [
        'A new model.',
        'Continuous batching and PagedAttention; default for serving open-weight at scale.',
        'A cloud SaaS.',
        'A frontend UI.'
      ],
      correctIndex: 1,
      explanation: '5-30x throughput vs naive Transformers. Continuous batching processes requests at varying generation stages; PagedAttention manages KV cache like OS virtual memory.'
    }
  ],
  'sglang': [
    {
      prompt: 'SGLang\'s differentiating innovation over vLLM is...',
      options: [
        'Lower quality.',
        'RadixAttention: sharing KV cache across requests with common prefixes.',
        'No batching.',
        'CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'Strong fit for agent workloads where many requests share a long system prompt. Deployed on 400K+ GPUs by 2026. Pairs with vLLM as the two-horse race for high-throughput open-weight serving.'
    }
  ],
  'tensorrt-llm': [
    {
      prompt: 'TensorRT-LLM is...',
      options: [
        'Open-source agnostic.',
        'NVIDIA\'s optimized inference; best raw H100 / B200 performance, NVIDIA-locked.',
        'Apple-only.',
        'CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'Highest performance on NVIDIA hardware; downside is the lock-in. vLLM and SGLang are catching up; TensorRT-LLM still wins on bleeding-edge optimization for the latest NVIDIA generations.'
    }
  ],
  'hugging-face-tgi': [
    {
      prompt: 'Hugging Face TGI in 2026 is in...',
      options: [
        'Active development as the default.',
        'Maintenance mode; HF recommends migration to vLLM or SGLang for new deployments.',
        'Cloud SaaS only.',
        'CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'Entered maintenance Dec 2025. Existing TGI deployments still work; new builds go to vLLM or SGLang. Reflects the consolidation of the open-weight serving ecosystem.'
    }
  ],
  'mistral-rs': [
    {
      prompt: 'mistral.rs is gaining traction in 2026 because of...',
      options: [
        'Sales discounts.',
        'Rust-based inference: memory safety and concurrency advantages over C++ engines.',
        'Cloud-only.',
        'Apple-only.'
      ],
      correctIndex: 1,
      explanation: 'Rust ecosystem benefits: memory safety, easier concurrency, package management. Niche but growing among teams that prefer Rust over C++ for production infrastructure.'
    }
  ],
  'llamafile': [
    {
      prompt: 'llamafile is...',
      options: [
        'Mozilla\'s single-file deployable model.',
        'A cloud SaaS.',
        'A vector database.',
        'A coding agent.'
      ],
      correctIndex: 0,
      explanation: 'Bundles model + runtime into one cross-platform executable. Zero install; copy and run on any major OS. Useful for distribution where users cannot install other tooling.'
    }
  ],
  'koboldcpp': [
    {
      prompt: 'KoboldCpp is most popular for...',
      options: [
        'Pure scientific computing.',
        'Creative writing and roleplay: long-context generation, character cards.',
        'Production batch jobs.',
        'Embedded devices only.'
      ],
      correctIndex: 1,
      explanation: 'Niche but mature in the writing community. Built-in features for long stories, character continuity, narrative consistency. Less common in production stacks; thriving in creative.'
    }
  ],
  'text-generation-webui': [
    {
      prompt: 'text-generation-webui (oobabooga) is...',
      options: [
        'A SaaS-only product.',
        'Veteran web UI for local LLMs; supports many backends; heavy customization; many extensions.',
        'A pure CLI.',
        'Mobile-only.'
      ],
      correctIndex: 1,
      explanation: 'One of the earliest local LLM web UIs. Many community extensions; heavy power-user features. Less polished than LM Studio or Open WebUI but more configurable for tinkering.'
    }
  ],
  'localai': [
    {
      prompt: 'LocalAI\'s value proposition is...',
      options: [
        'A new model.',
        'Open-source drop-in replacement for the OpenAI API served from local models; existing OpenAI code works with a base URL change.',
        'Cloud SaaS.',
        'A vector database.'
      ],
      correctIndex: 1,
      explanation: 'OpenAI API compatibility lets you swap in local models without code changes. Useful for teams who want to migrate from OpenAI to local without rewriting client integrations.'
    }
  ],
  'continuous-batching': [
    {
      prompt: 'Continuous batching beats static batching by...',
      options: [
        'Using only one request.',
        'Processing multiple requests at varying generation stages simultaneously rather than waiting for the longest to finish.',
        'Disabling parallelism.',
        'Skipping the KV cache.'
      ],
      correctIndex: 1,
      explanation: 'Static batching is bottlenecked by the longest request. Continuous batching keeps the GPU saturated by replacing finished requests immediately. 5-15x throughput gain in vLLM.'
    }
  ],
  'pagedattention': [
    {
      prompt: 'PagedAttention is borrowed conceptually from...',
      options: [
        'Database joins.',
        'OS virtual memory: KV cache allocated in fixed-size pages.',
        'Streaming protocols.',
        'CPU instruction sets.'
      ],
      correctIndex: 1,
      explanation: 'Eliminates KV cache fragmentation. The OS analogy: pages instead of monolithic allocations means more concurrent requests fit into the same VRAM. vLLM\'s defining innovation.'
    }
  ],
  'radixattention': [
    {
      prompt: 'RadixAttention provides the biggest throughput wins on...',
      options: [
        'Random one-off queries.',
        'Agent workloads where many requests share long system prompts and tool definitions.',
        'Pure embeddings.',
        'Voice synthesis.'
      ],
      correctIndex: 1,
      explanation: 'KV cache is shared across requests with common prefixes via a radix-tree structure. Agent-style workloads (large stable system prompt + per-turn input) benefit dramatically.'
    }
  ],
  'tensor-pipeline-expert-parallelism': [
    {
      prompt: 'Pipeline parallelism splits...',
      options: [
        'Each layer across GPUs.',
        'Layers across GPUs (each GPU runs a subset of layers).',
        'MoE experts across GPUs.',
        'Embeddings across GPUs.'
      ],
      correctIndex: 1,
      explanation: 'Three flavors of parallelism. Tensor: split each layer\'s matmul across GPUs (high inter-GPU bandwidth). Pipeline: split layers across GPUs. Expert: for MoE, split experts. Choice depends on architecture and interconnect.'
    }
  ],
  'llama-family': [
    {
      prompt: 'Meta\'s Llama family in 2026 is...',
      options: [
        'Closed-weight only.',
        'Most-deployed open base; commercial-friendly license with restrictions for very large platforms.',
        'Apache 2.0 unrestricted.',
        'Discontinued.'
      ],
      correctIndex: 1,
      explanation: 'Llama 3.x and 4 anchor the open-weight ecosystem. Read the license: usable by most companies but contains specific carve-outs for very large platforms competing with Meta.'
    }
  ],
  'mistral-family': [
    {
      prompt: 'Mistral AI\'s open-weight models (Mistral 7B, Mixtral, Mistral Large) ship under...',
      options: [
        'Closed license only.',
        'Apache 2.0 (for the open-weight portion); some models are commercial.',
        'GPL.',
        'No license.'
      ],
      correctIndex: 1,
      explanation: 'Apache 2.0 for the open-weight tier. Strong on European languages and code. Mistral also offers closed commercial models (Le Chat tier) alongside the open ones.'
    }
  ],
  'qwen-family': [
    {
      prompt: 'Alibaba\'s Qwen family\'s notable strengths include...',
      options: [
        'Only English.',
        'Multilingual (especially Chinese), reasoning, broad open-weight licensing (Apache 2.0).',
        'Closed weights.',
        'Voice only.'
      ],
      correctIndex: 1,
      explanation: 'Qwen 2.5 and Qwen 3 are top-tier open-weight choices. Strong on multilingual benchmarks; Apache 2.0 license; competitive with frontier on many reasoning tasks.'
    }
  ],
  'deepseek-family': [
    {
      prompt: 'DeepSeek family in 2026 is notable for...',
      options: [
        'Closed weights.',
        'MIT license (most permissive among major open-weight) and the R1 reasoning models.',
        'Voice agents only.',
        'Image generation only.'
      ],
      correctIndex: 1,
      explanation: 'MIT licensing removes most legal friction for commercial use. R1 demonstrated GRPO-driven reasoning on math and coding; influenced the broader reasoning-model wave.'
    }
  ],
  'gemma-family': [
    {
      prompt: 'Google\'s Gemma family is...',
      options: [
        'Cloud-only.',
        'Open-weight derived from Gemini methodology; strong on smaller-scale deployments.',
        'A SaaS product only.',
        'Discontinued.'
      ],
      correctIndex: 1,
      explanation: 'Custom commercial-friendly license. Strong per-parameter capability at smaller sizes (2B, 7B). Useful for edge / mobile / constrained-budget deployments.'
    }
  ],
  'granite-family': [
    {
      prompt: 'IBM\'s Granite family targets...',
      options: [
        'Consumer chat only.',
        'Enterprise and code use cases under Apache 2.0 license.',
        'Voice only.',
        'Education only.'
      ],
      correctIndex: 1,
      explanation: 'Granite 3.x and Granite Code. Apache 2.0; enterprise-friendly defaults; tight integration with IBM watsonx and Red Hat OpenShift AI. Common at IBM-aligned enterprises.'
    }
  ],
  'phi-family': [
    {
      prompt: 'Microsoft\'s Phi family\'s defining characteristic is...',
      options: [
        'Largest models.',
        'Strong quality per parameter; aimed at smaller and edge deployments.',
        'Voice only.',
        'Closed weights.'
      ],
      correctIndex: 1,
      explanation: 'Phi models punch above their weight class on benchmarks. Useful for edge (mobile, embedded) and budget-constrained scenarios where 70B is overkill.'
    }
  ],
  'command-r-family': [
    {
      prompt: 'Cohere\'s Command R family is optimized for...',
      options: [
        'Image generation.',
        'RAG and tool use; CC-BY-NC for non-commercial; commercial requires Cohere licensing.',
        'Voice transcription only.',
        'Pure chat.'
      ],
      correctIndex: 1,
      explanation: 'Targeted at retrieval-heavy workloads. The non-commercial / commercial license split is a friction point for some startups; weigh capability against licensing for production.'
    }
  ],
  'capture-layer': [
    {
      prompt: 'In a personal knowledge stack, the Capture layer is...',
      options: [
        'The retrieval engine.',
        'Frictionless input: Apple Notes, Drafts, voice memos. Speed beats perfection here.',
        'The vault.',
        'The agent runtime.'
      ],
      correctIndex: 1,
      explanation: 'If capture is slow, you lose the thought. Optimize for "tap, type, done" rather than careful organization. The Vault layer handles long-term structure.'
    }
  ],
  'vault-layer': [
    {
      prompt: 'The Vault layer holds...',
      options: [
        'Random scratch files.',
        'Long-term knowledge graph: Obsidian, Logseq, Notion. Markdown-based vaults outlive the tool.',
        'Daily quests.',
        'Voice memos only.'
      ],
      correctIndex: 1,
      explanation: 'Where ideas go to mature. Bidirectional links, atomic notes, evergreen revision. Markdown portability is the long-term hedge against tool churn.'
    }
  ],
  'local-model-layer': [
    {
      prompt: 'The Local Model layer is...',
      options: [
        'Cloud-only.',
        'Where local AI lives: Ollama, LM Studio, MLX. Pairs with the vault via retrieval.',
        'A vector store only.',
        'Pure SaaS.'
      ],
      correctIndex: 1,
      explanation: 'Foundation for the rest of the personal AI stack. Without a local model server, downstream layers (retrieval, agent automation) degrade or require cloud calls.'
    }
  ],
  'local-retrieval-rag-layer': [
    {
      prompt: 'The Local Retrieval / RAG layer is exemplified by...',
      options: [
        'Pinecone cloud.',
        'AnythingLLM, Khoj, Onyx, Smart Connections plugin.',
        'A coding agent.',
        'A vector database vendor.'
      ],
      correctIndex: 1,
      explanation: 'Personal RAG over your own data: notes, files, emails. Several mature 2026 options; Smart Connections is plugin-style for Obsidian, AnythingLLM is a fuller workspace.'
    }
  ],
  'agent-automation-layer': [
    {
      prompt: 'The Agent Automation layer in a personal knowledge stack typically includes...',
      options: [
        'Only cloud Zapier.',
        'Local automations and agents: Raycast scripts, Hammerspoon, Keyboard Maestro.',
        'Just one app.',
        'A vector DB only.'
      ],
      correctIndex: 1,
      explanation: 'Personal-scale automation. Pair with local models to perform tasks without cloud calls (transcribe, classify, route). Lower polish than enterprise agent platforms but tightly integrated with your daily tools.'
    }
  ],
  'orchestration-front-end-layer': [
    {
      prompt: 'The Orchestration / Front-end layer is...',
      options: [
        'A cloud SaaS only.',
        'Open WebUI, LibreChat, LobeChat: the interaction surface for the local AI stack.',
        'A vector DB.',
        'A model file format.'
      ],
      correctIndex: 1,
      explanation: 'Where you actually talk to your stack. These tools provide chat UI, multi-model routing, conversation history. Pairs with Ollama / LM Studio backends seamlessly.'
    }
  ],
  'memory-layer': [
    {
      prompt: 'The Memory layer of the personal stack provides...',
      options: [
        'In-process RAM only.',
        'Persistent memory across agent sessions: Mem0, Zep, Letta, Cognee.',
        'Vector embeddings only.',
        'Image storage.'
      ],
      correctIndex: 1,
      explanation: 'Sessions without memory restart from scratch. Memory layer captures preferences, context, prior decisions; agents become more personal and effective with it.'
    }
  ],
  'capture-to-knowledge-pipelines': [
    {
      prompt: 'A capture-to-knowledge pipeline typically chains...',
      options: [
        'A single static prompt.',
        'Voice memo -> Whisper -> classification -> Obsidian -> embedding -> retrieval.',
        'Random.',
        'Manual transcription.'
      ],
      correctIndex: 1,
      explanation: 'End-to-end pipelines turn raw capture into organized retrievable knowledge. Each stage is replaceable; tight integration matters more than perfect tools at any single stage.'
    }
  ],
  'apple-notes': [
    {
      prompt: 'Apple Notes\' role in the capture layer is...',
      options: [
        'Long-term vault.',
        'Frictionless cross-device capture; less suited for long-term knowledge organization.',
        'Vector database.',
        'Voice transcription.'
      ],
      correctIndex: 1,
      explanation: 'Excellent at "I have a thought, capture it now." Limited at "organize 10K notes with bidirectional links." Pair with Obsidian or similar for the vault layer.'
    }
  ],
  'drafts': [
    {
      prompt: 'Drafts (Mac / iOS) is differentiated by...',
      options: [
        'Built-in vault.',
        'Opens to a blank input; downstream actions are scriptable.',
        'A vector store.',
        'Voice transcription.'
      ],
      correctIndex: 1,
      explanation: 'Pure capture surface that scripts where the text goes (email, Obsidian, Slack, etc.). Power users build elaborate routing pipelines on top of the empty-input principle.'
    }
  ],
  'google-keep': [
    {
      prompt: 'Google Keep fits in the capture layer for...',
      options: [
        'Long-term knowledge.',
        'Lightweight cross-platform capture in the Google ecosystem.',
        'Vector retrieval.',
        'Voice agent.'
      ],
      correctIndex: 1,
      explanation: 'Minimal but reliable. Cross-platform (iOS, Android, web). Limited by Google account dependency; not local-first.'
    }
  ],
  'bear': [
    {
      prompt: 'Bear sits between...',
      options: [
        'Apple Notes and Obsidian on the Mac / iOS axis.',
        'Cloud and on-prem.',
        'Local model and cloud.',
        'Embeddings and vectors.'
      ],
      correctIndex: 0,
      explanation: 'More polished than Apple Notes; less feature-rich than Obsidian. Markdown support; subscription model; common choice for users who like Apple aesthetics with Markdown discipline.'
    }
  ],
  'day-one': [
    {
      prompt: 'Day One is structured around...',
      options: [
        'Meeting notes only.',
        'Date-driven journaling with rich entries (photos, location, weather).',
        'Vector retrieval.',
        'Code search.'
      ],
      correctIndex: 1,
      explanation: 'Dedicated journal app. Encrypted long-term storage; specialized for personal reflection rather than knowledge organization. Different surface from a vault.'
    }
  ],
  'reflect': [
    {
      prompt: 'Reflect notes app integrates...',
      options: [
        'No AI features.',
        'Built-in AI search and summarization across your notes.',
        'Only Markdown.',
        'Only iOS.'
      ],
      correctIndex: 1,
      explanation: 'AI-native notes; cross-device sync; integrated AI features as primary differentiator. Trades local-first for AI-feature integration.'
    }
  ],
  'mem-ai': [
    {
      prompt: 'Mem.ai\'s core thesis is...',
      options: [
        'Manual organization.',
        'AI auto-organizes captures via generated tags and summaries; capture is friction-free.',
        'No AI.',
        'Cloud-free.'
      ],
      correctIndex: 1,
      explanation: 'Inverts the traditional vault discipline: dump everything in, AI organizes. Works best for users who hate organizing; trades some control for less friction.'
    }
  ],
  'obsidian': [
    {
      prompt: 'Obsidian\'s position in 2026 is...',
      options: [
        'Cloud-only SaaS.',
        'Default for power-user PKM: Markdown, local files, bidirectional links, plugin ecosystem.',
        'Voice agent.',
        'Vector database.'
      ],
      correctIndex: 1,
      explanation: 'Local-first by design; Markdown vault; bidirectional links; large plugin ecosystem (Smart Connections, Templater, Dataview, Bases). Strongest fit for vault layer.'
    }
  ],
  'logseq': [
    {
      prompt: 'Logseq\'s structural primitive is...',
      options: [
        'Long-form pages.',
        'Outliner: bullet hierarchy as primary structure; daily notes first.',
        'A spreadsheet.',
        'Voice memos.'
      ],
      correctIndex: 1,
      explanation: 'Outliner UX with Markdown / Org-mode files. Different mental model from Obsidian: bullets first, pages second. Strong fit for users who think in nested lists.'
    }
  ],
  'notion': [
    {
      prompt: 'Notion vs Obsidian for the vault layer differs in...',
      options: [
        'License only.',
        'Cloud-based, database-driven, team-friendly; less local-first; export-to-Markdown is functional but lossy.',
        'No difference.',
        'Pricing only.'
      ],
      correctIndex: 1,
      explanation: 'Notion wins on collaboration and database features; loses on local-first portability. Pick by your team needs and lock-in tolerance.'
    }
  ],
  'roam-research': [
    {
      prompt: 'Roam Research in 2026 is...',
      options: [
        'The dominant tool.',
        'Less popular vs Obsidian / Logseq; the bidirectional-link pioneer (2019-2020) lost share to local-first alternatives.',
        'Cloud-free.',
        'Discontinued.'
      ],
      correctIndex: 1,
      explanation: 'Pioneered bidirectional links in modern PKM. Lost ground to Obsidian / Logseq because of pricing, local-first concerns, and ecosystem velocity. Still active community though.'
    }
  ],
  'capacities': [
    {
      prompt: 'Capacities organizes notes around...',
      options: [
        'Pages only.',
        'Typed objects (book, person, project) with structured relationships.',
        'Random links.',
        'Spreadsheets.'
      ],
      correctIndex: 1,
      explanation: 'Object-based PKM. Different from Obsidian\'s page-link model. Strong fit for users who want explicit object types rather than free-form notes.'
    }
  ],
  'tana': [
    {
      prompt: 'Tana\'s differentiator is...',
      options: [
        'Pure Markdown.',
        'Block-based outliner with structured queryable supertags.',
        'Voice memos.',
        'Local files.'
      ],
      correctIndex: 1,
      explanation: 'Outliner UX plus database-style queries via supertags. Growing in 2026 with users who want the outliner mental model and structured data both.'
    }
  ],
  'anytype': [
    {
      prompt: 'Anytype is differentiated by...',
      options: [
        'Cloud SaaS only.',
        'Decentralized, end-to-end encrypted; object-based data model; local-first peer-to-peer.',
        'Pure Markdown.',
        'iOS-only.'
      ],
      correctIndex: 1,
      explanation: 'Strongest privacy story among PKM tools. Object-based data model similar to Notion but P2P-syncing. Trades polish for privacy and ownership.'
    }
  ],
  'standard-notes': [
    {
      prompt: 'Standard Notes is built around...',
      options: [
        'AI auto-organization.',
        'End-to-end encryption with a deliberately minimal feature set.',
        'Outliner UX.',
        'Vector search.'
      ],
      correctIndex: 1,
      explanation: 'Security-focused; minimal features by design to reduce attack surface. Default for users where confidentiality matters more than feature richness.'
    }
  ],
  'heptabase': [
    {
      prompt: 'Heptabase\'s primary surface is...',
      options: [
        'A search box.',
        'A visual canvas: whiteboard-first, spatial arrangement, explicit links.',
        'A spreadsheet.',
        'A voice agent.'
      ],
      correctIndex: 1,
      explanation: 'Strong fit for visual thinkers. Spatial relationships between notes carry meaning. Different mental model from list / page-based PKM tools.'
    }
  ],
  'joplin': [
    {
      prompt: 'Joplin\'s differentiator is...',
      options: [
        'Closed source.',
        'Open-source notes alternative with sync flexibility (local, Dropbox, Nextcloud, OneDrive).',
        'Cloud-only.',
        'iOS-only.'
      ],
      correctIndex: 1,
      explanation: 'OSS-conscious; bring-your-own-sync. Self-hosted-friendly; reasonable for users who want OSS + Markdown + sync flexibility.'
    }
  ],
  'para': [
    {
      prompt: 'PARA stands for...',
      options: [
        'Photo, Article, Resource, Archive.',
        'Projects, Areas, Resources, Archive.',
        'Plan, Act, Reflect, Adjust.',
        'Pages, Atoms, Resources, Anchors.'
      ],
      correctIndex: 1,
      explanation: 'Tiago Forte\'s organizational scheme. Notes flow between buckets as priorities shift; the buckets themselves are stable across years.'
    }
  ],
  'code': [
    {
      prompt: 'In Tiago Forte\'s scheme, CODE stands for...',
      options: [
        'Capture, Organize, Distill, Express.',
        'Click, Open, Drag, Export.',
        'Compile, Optimize, Deploy, Edit.',
        'Catch, Order, Drop, Erase.'
      ],
      correctIndex: 0,
      explanation: 'Lifecycle of a note across multiple revisits. Capture broadly, organize via PARA, distill on each revisit, express as the final reuse.'
    }
  ],
  'basb': [
    {
      prompt: 'BASB stands for...',
      options: [
        'Build A Strong Brand.',
        'Building a Second Brain (Tiago Forte\'s 2022 book; PARA + CODE method).',
        'Backup A Standard Box.',
        'Branch After Sync Bias.'
      ],
      correctIndex: 1,
      explanation: 'BASB: Forte\'s formalization of his PARA + CODE method. Most-influential modern PKM book; reshaped how a generation of knowledge workers think about notes.'
    }
  ],
  'zettelkasten': [
    {
      prompt: 'Zettelkasten\'s defining principles are...',
      options: [
        'Page-based capture.',
        'Atomic notes, networked links, unique IDs (predates digital tools; popularized by Niklas Luhmann).',
        'Spreadsheet rows.',
        'Voice memos only.'
      ],
      correctIndex: 1,
      explanation: 'Pre-digital method that anticipated bidirectional links. Atomic notes plus dense linking creates an emergent network of ideas; the modern PKM movement is its descendant.'
    }
  ],
  'smart-notes': [
    {
      prompt: 'Sönke Ahrens\'s "Smart Notes" (2017) is...',
      options: [
        'A SaaS app.',
        'A practical adaptation of Zettelkasten for the digital age.',
        'A vector database.',
        'A coding tutorial.'
      ],
      correctIndex: 1,
      explanation: 'Step-by-step adaptation of Luhmann\'s method to modern note tools. Foundational text for users adopting Obsidian, Logseq, or Roam with the Zettelkasten mindset.'
    }
  ],
  'atomic-notes': [
    {
      prompt: 'An atomic note expresses...',
      options: [
        'A page of mixed ideas.',
        'One idea, fully self-contained, so it can be linked and recombined.',
        'Multiple unrelated topics.',
        'A spreadsheet table.'
      ],
      correctIndex: 1,
      explanation: 'The atomicity principle. Each note can stand alone and be reused in many contexts. Enables the network effect of bidirectional linking.'
    }
  ],
  'evergreen-notes': [
    {
      prompt: 'Andy Matuschak\'s "evergreen notes" are characterized by...',
      options: [
        'Single-write capture.',
        'Refinement over time: atomic, concept-oriented, density grows with revisits.',
        'Random scratch.',
        'Voice memos only.'
      ],
      correctIndex: 1,
      explanation: 'Notes get better with revisits. Each pass distills; the note becomes a durable reusable artifact. Different mindset from "capture once and forget."'
    }
  ],
  'bidirectional-links': [
    {
      prompt: 'Bidirectional links automatically create...',
      options: [
        'Forward links only.',
        'Backlinks: reverse references that surface context the explicit search would miss.',
        'Email threads.',
        'Spreadsheet rows.'
      ],
      correctIndex: 1,
      explanation: 'Network effect of a vault. A single forward link creates a backlink; the graph grows in both directions from each edit. Enables emergent retrieval patterns.'
    }
  ],
  'backlinks': [
    {
      prompt: 'Backlinks help knowledge work by...',
      options: [
        'Replacing notes.',
        'Surfacing what links to the current note, revealing connections you would not search for explicitly.',
        'Reducing capture.',
        'Compressing files.'
      ],
      correctIndex: 1,
      explanation: 'Hover the backlinks panel to see "where else have I thought about this." Often surfaces connections that explicit search misses; the lazy retrieval channel.'
    }
  ],
  'daily-notes': [
    {
      prompt: 'Daily notes are useful primarily as...',
      options: [
        'A spreadsheet template.',
        'Primary capture surface: pre-populated date and template; everything starts here.',
        'A vector store.',
        'A search tool.'
      ],
      correctIndex: 1,
      explanation: 'Lowers capture friction: open the daily note, type. Logseq and Roam center on this; Obsidian supports it via the Daily Notes plugin or core feature.'
    }
  ],
  'markdown-as-universal-format': [
    {
      prompt: 'The strongest argument for Markdown vault formats is...',
      options: [
        'They are most popular today.',
        'Plain text that survives any tool change; long-term portability.',
        'Built-in encryption.',
        'Best UI.'
      ],
      correctIndex: 1,
      explanation: 'Tools come and go; Markdown files outlive them. Choose Markdown-based tools when you care about long-term knowledge that you want to keep regardless of which software wins.'
    }
  ],
  'obsidian-sync': [
    {
      prompt: 'Obsidian Sync is...',
      options: [
        'A vector database.',
        'First-party encrypted sync service (~$4-5/mo); end-to-end encrypted across installations.',
        'A coding agent.',
        'A model.'
      ],
      correctIndex: 1,
      explanation: 'E2E encrypted; pays the Obsidian team directly. Alternatives: iCloud, Syncthing, git. Trades cost for the simplest path that respects encryption.'
    }
  ],
  'obsidian-publish': [
    {
      prompt: 'Obsidian Publish is...',
      options: [
        'Free.',
        'First-party publishing of vault contents to the web (~$8-10/mo per site); bidirectional links preserved.',
        'A vector database.',
        'A model gateway.'
      ],
      correctIndex: 1,
      explanation: 'Static-site export that keeps the vault\'s graph navigation. Used by Andy Matuschak\'s notes, Maggie Appleton, many evergreen-notes practitioners. First-party path; alternatives exist (Quartz, Jekyll plugins).'
    }
  ],
  'smart-connections-plugin': [
    {
      prompt: 'Smart Connections plugin brings to Obsidian...',
      options: [
        'A vector database server.',
        'RAG over your vault using local or cloud embeddings; AI search inside the vault.',
        'Voice transcription.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Embeds your notes; surfaces semantically similar content as you type. The closest thing to a personal RAG without leaving Obsidian.'
    }
  ],
  'copilot-for-obsidian': [
    {
      prompt: 'Copilot for Obsidian is...',
      options: [
        'GitHub Copilot ported.',
        'Plugin bringing LLM chat into Obsidian with vault-aware context (OpenAI, Claude, Ollama, etc.).',
        'A vector store.',
        'Pure Markdown editor.'
      ],
      correctIndex: 1,
      explanation: 'Configurable to multiple model providers including local (Ollama). Pairs with Smart Connections for fully-local Obsidian RAG without cloud calls.'
    }
  ],
  'templater-plugin': [
    {
      prompt: 'Templater is differentiated from Obsidian core templates by...',
      options: [
        'Same features.',
        'Programmable templates with JavaScript execution; power tool for vault automation.',
        'Pure Markdown only.',
        'iOS only.'
      ],
      correctIndex: 1,
      explanation: 'Run JS within templates: query other notes, fetch dates, fill metadata. Power-user automation; transforms Obsidian from a notes app into a personal scripting environment.'
    }
  ],
  'dataview-plugin': [
    {
      prompt: 'Dataview\'s value to an Obsidian vault is...',
      options: [
        'Random sampling.',
        'Treat the vault as a database; query notes by metadata via SQL-like or DQL syntax.',
        'Voice transcription.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Structured queries over unstructured notes. Build dashboards, weekly reviews, project trackers without leaving the vault. Pairs with Templater for dynamic content.'
    }
  ],
  'bases': [
    {
      prompt: 'Obsidian\'s native Bases (shipped 2026 in v1.5+) provide...',
      options: [
        'Voice transcription.',
        'Database views (tables, kanban, calendar) over typed properties.',
        'Vector search.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'First-party answer to Notion\'s database view. Power-user feature without needing Dataview plus several other plugins. Significant 2026 release.'
    }
  ],
  'excalidraw-plugin': [
    {
      prompt: 'Excalidraw plugin brings to Obsidian...',
      options: [
        'A vector database.',
        'Visual diagramming with hand-drawn aesthetic; embeddable in notes.',
        'Voice transcription.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Diagrams that live alongside your notes. Hand-drawn aesthetic preserves "thinking sketch" feel rather than overly-polished diagrams that imply false precision.'
    }
  ],
  'canvas': [
    {
      prompt: 'Obsidian Canvas is...',
      options: [
        'A pure Markdown editor.',
        'Native infinite-surface whiteboard; embedded notes remain live.',
        'A vector store.',
        'Pure file browser.'
      ],
      correctIndex: 1,
      explanation: 'First-party visual canvas. Drag notes spatially; embeds remain in sync with their source files. Useful for project planning, mind-mapping, retrospectives.'
    }
  ],
  'anythingllm': [
    {
      prompt: 'AnythingLLM\'s position is...',
      options: [
        'Pure cloud SaaS.',
        'Workspace-based local RAG with no-code agent builder; 53K+ stars; polished UI.',
        'Voice transcription.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Default 2026 personal RAG choice for many users. Pairs with Ollama or cloud APIs; multi-workspace lets you separate projects with different document scopes and policies.'
    }
  ],
  'open-webui': [
    {
      prompt: 'Open WebUI in 2026 is...',
      options: [
        'A pure CLI.',
        'Most-popular self-hosted ChatGPT alternative (124K+ stars); polished chat against any OpenAI-compatible endpoint.',
        'Discontinued.',
        'Cloud-only.'
      ],
      correctIndex: 1,
      explanation: 'Default front-end for self-hosted local AI stacks. Multi-user, multi-model, RAG-enabled. Pairs with Ollama or any OpenAI-compatible backend.'
    }
  ],
  'khoj': [
    {
      prompt: 'Khoj\'s differentiator is...',
      options: [
        'Single-platform.',
        'Multi-platform personal AI: Obsidian, Emacs, browser, mobile, WhatsApp.',
        'Voice transcription only.',
        'Image generation only.'
      ],
      correctIndex: 1,
      explanation: 'Self-hostable; cross-surface access to your personal AI. Wherever you work, Khoj surfaces the same personal RAG and chat. Useful for users who switch between many tools.'
    }
  ],
  'onyx': [
    {
      prompt: 'Onyx (formerly Danswer) targets...',
      options: [
        'Personal-only use.',
        'Self-hosted enterprise-style RAG with 40+ connectors (GitHub, Confluence, Slack, Notion, Drive).',
        'Pure consumer chat.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Strongest open-source enterprise RAG. Connectors are the differentiator: hooks into the tools where work actually happens. Self-hostable for compliance-conscious teams.'
    }
  ],
  'librechat': [
    {
      prompt: 'LibreChat is...',
      options: [
        'A vector store.',
        'Privacy-focused multi-provider chat unifier; one interface against multiple AI providers; self-hostable.',
        'A pure CLI.',
        'iOS-only.'
      ],
      correctIndex: 1,
      explanation: 'Self-hostable chat with multiple model providers behind one UI. Useful when teams want a privacy-friendly alternative to ChatGPT but still leverage cloud frontier models.'
    }
  ],
  'lobechat': [
    {
      prompt: 'LobeChat differentiates with...',
      options: [
        'No agent features.',
        'Multi-agent chat with Agent Groups and 10K+ MCP skills.',
        'Pure search.',
        'Voice-only.'
      ],
      correctIndex: 1,
      explanation: 'Power-user chat with agentic capabilities. Strong fit for users who want to compose multiple agents in one workflow.'
    }
  ],
  'mem0': [
    {
      prompt: 'Mem0 is positioned as...',
      options: [
        'A vector database.',
        'Framework-agnostic memory layer; drop-in for LangChain, CrewAI, AutoGen.',
        'A coding agent.',
        'A model.'
      ],
      correctIndex: 1,
      explanation: '48K+ stars in 2026. Stands alone or plugs into existing agent frameworks. Common first choice when adding memory to a previously memory-less agent.'
    }
  ],
  'zep': [
    {
      prompt: 'Zep\'s differentiator is...',
      options: [
        'Pure vector store.',
        'Production-grade hybrid vector + graph memory; Graphiti for temporal facts.',
        'Voice transcription.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Hybrid retrieval: vector embeddings plus a temporal graph. Strong fit for agents that reason about how facts change over time (CRM, healthcare, project state).'
    }
  ],
  'cognee': [
    {
      prompt: 'Cognee uses which approach for memory?',
      options: [
        'Pure vectors.',
        'Deep knowledge retrieval over graph + vector representations; builds knowledge graphs from documents.',
        'No memory.',
        'Random retrieval.'
      ],
      correctIndex: 1,
      explanation: 'Graph + vector hybrid. Strong recall on multi-hop reasoning. More complex to set up than Mem0 but pays off when your domain is graph-shaped (people, organizations, events).'
    }
  ],
  'langchain-memory': [
    {
      prompt: 'LangChain Memory abstractions include...',
      options: [
        'Only one type.',
        'ConversationBufferMemory, ConversationSummaryMemory, VectorStoreRetrieverMemory.',
        'Pure embeddings.',
        'Voice memos.'
      ],
      correctIndex: 1,
      explanation: 'Multiple memory strategies built into LangChain. Useful as the first-party path; many production agents use Mem0 or Zep on top for richer memory semantics.'
    }
  ],
  'llamaindex-memory': [
    {
      prompt: 'LlamaIndex Memory is...',
      options: [
        'Disabled by default.',
        'First-party memory abstractions integrated with retrieval and agent layers.',
        'Cloud-only.',
        'Discontinued.'
      ],
      correctIndex: 1,
      explanation: 'Tightly integrated with LlamaIndex retrieval and agents. Useful when you build the rest of your stack on LlamaIndex; less compelling as a standalone choice.'
    }
  ],
  'letta': [
    {
      prompt: 'Letta (formerly MemGPT) provides...',
      options: [
        'Pure prompts.',
        'Agent runtime with OS-style tiered memory: Core (in-context), Recall (searchable), Archival (cold storage).',
        'Image generation.',
        'Voice transcription.'
      ],
      correctIndex: 1,
      explanation: 'Inspired by OS memory hierarchies. Useful when context window is the binding constraint and you need explicit tiers; agents see only Core in-context but can promote / demote across tiers.'
    }
  ],
  'granola': [
    {
      prompt: 'Granola is built around...',
      options: [
        'Image generation.',
        'AI-native meeting notes: records, transcribes, structures (TL;DR, decisions, action items).',
        'Coding agents.',
        'Voice cloning.'
      ],
      correctIndex: 1,
      explanation: 'Replaces "type meeting notes" with "let AI structure them." Common 2026 personal-productivity tool; rapid traction in product / engineering / consulting roles.'
    }
  ],
  'otter-ai': [
    {
      prompt: 'Otter.ai is...',
      options: [
        'A new entrant.',
        'Veteran transcription / meeting notes service (since 2016) with broad enterprise adoption.',
        'A vector database.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Long history; broad integration with Zoom, Google Meet, MS Teams. Less AI-native polish than Granola but stronger enterprise SSO and compliance footprint.'
    }
  ],
  'fireflies': [
    {
      prompt: 'Fireflies\' core strength is...',
      options: [
        'Image generation.',
        'AI meeting recorder with searchable transcripts; strong on the transcript-search use case.',
        'Voice cloning.',
        'Pure typing.'
      ],
      correctIndex: 1,
      explanation: 'Indexes transcripts; lets you find moments by keyword later. Pairs with CRMs and project tools for downstream workflow integration.'
    }
  ],
  'limitless': [
    {
      prompt: 'Limitless (formerly Rewind) is built around...',
      options: [
        'Pure search.',
        'Always-on capture: continuous recording for searchable lifelog.',
        'Image generation.',
        'A vector database only.'
      ],
      correctIndex: 1,
      explanation: 'Wearable + app. Captures everything; AI structures it. Privacy-conscious by design (local-first); polarizing because of the always-on premise.'
    }
  ],
  'personal-ai': [
    {
      prompt: 'Personal.ai trains models...',
      options: [
        'Generically.',
        'On your captured data so the AI speaks "in your voice" and recalls your context.',
        'On random text.',
        'On marketing copy.'
      ],
      correctIndex: 1,
      explanation: 'Persistent personalized model. Different from prompting a generic model with your data; the model itself is fine-tuned. Privacy implications worth weighing.'
    }
  ],
  'whisper-cpp': [
    {
      prompt: 'whisper.cpp is...',
      options: [
        'A SaaS.',
        'C++ port of OpenAI Whisper for local transcription; CPU-friendly with optional Metal / CUDA acceleration.',
        'A coding agent.',
        'Discontinued.'
      ],
      correctIndex: 1,
      explanation: 'Default for local transcription. Lightweight enough to run on a laptop without a dedicated GPU. Pairs with VAD for live-style streaming use cases.'
    }
  ],
  'whisperx': [
    {
      prompt: 'WhisperX adds to Whisper...',
      options: [
        'Image generation.',
        'Faster inference, word-level timestamps, optional speaker diarization.',
        'Pure text only.',
        'Voice cloning.'
      ],
      correctIndex: 1,
      explanation: 'Useful when downstream tasks need precise timing (subtitles, alignment) or speaker labels (multi-party transcripts).'
    }
  ],
  'vosk': [
    {
      prompt: 'Vosk is...',
      options: [
        'Faster than Whisper on every metric.',
        'Offline ASR engine; smaller than Whisper but faster on commodity hardware (20+ languages).',
        'Cloud-only.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Pre-Whisper-era OSS choice. Still useful where Whisper is too heavy (embedded devices, CPU-only constrained hardware). Trades quality for speed.'
    }
  ],
  'piper': [
    {
      prompt: 'Piper is...',
      options: [
        'A vector database.',
        'Local TTS: fast, lightweight, runs on Raspberry Pi and modest CPUs.',
        'Image generation.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Strong fit for embedded / edge deployments. Lower quality than ElevenLabs but free and runs anywhere. Common in self-hosted voice agent projects.'
    }
  ],
  'bark': [
    {
      prompt: 'Bark is...',
      options: [
        'Pure text only.',
        'Open-source generative TTS with voice presets; speech, music, and sound effects from text.',
        'Image generation.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Suno research. More creative than Piper; less polished than ElevenLabs. Useful for content creation experiments and voice agent prototyping.'
    }
  ],
  'melotts': [
    {
      prompt: 'MeloTTS\' strength is...',
      options: [
        'Single-language only.',
        'Multilingual local TTS from a single model; strong cross-language capability.',
        'Image generation.',
        'Pure CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'One model, many languages. Useful for multilingual voice agents without juggling multiple language-specific TTS engines.'
    }
  ],
  'r-localllama': [
    {
      prompt: 'r/LocalLLaMA is...',
      options: [
        'A discontinued forum.',
        'Canonical Reddit community for local LLM hardware, quantization, serving; hub for the local-AI movement.',
        'Apple-only.',
        'Cloud-only.'
      ],
      correctIndex: 1,
      explanation: 'Where new quantization formats, hardware reviews, and serving optimizations get debated first. High-signal community for builders adopting local AI.'
    }
  ],
  'hugging-face-spaces': [
    {
      prompt: 'Hugging Face Spaces is best used as...',
      options: [
        'Production hosting only.',
        'Public model deployment showcase; try community models in seconds via free Gradio / Streamlit UIs.',
        'A vector database.',
        'A coding agent.'
      ],
      correctIndex: 1,
      explanation: 'Lowest-friction way to try a new model. Useful for evaluation before downloading or self-hosting. Production deployments typically move off Spaces to dedicated infra.'
    }
  ],

  // ===== Gap fills =====

  // M1 gaps
  'model-family-generation': [
    {
      prompt: 'Pinning to a dated model snapshot (e.g., claude-opus-4-7-20260415) protects against...',
      options: [
        'Network outages.',
        'Silent regressions when the vendor rotates the underlying model.',
        'Jailbreaks.',
        'Tokenizer changes only.'
      ],
      correctIndex: 1,
      explanation: 'Generation transitions can shift behavior subtly. Pinned snapshots give reproducibility; rotate them deliberately after re-running your eval set.'
    }
  ],
  'closed-weight-model': [
    {
      prompt: 'Closed-weight models in 2026 typically beat open-weight on...',
      options: [
        'Always-on offline use.',
        'Hardest reasoning benchmarks (gap of ~10-15 points narrowed but not closed).',
        'Self-hosting cost.',
        'License flexibility.'
      ],
      correctIndex: 1,
      explanation: 'Closed-frontier (Claude Opus, GPT-5.5, Gemini Pro) leads on hardest tasks. For specialized fine-tuning and cost-predictable heavy workloads, open-weight wins.'
    }
  ],
  'post-training': [
    {
      prompt: 'Tool-use reliability in 2026 frontier models comes primarily from...',
      options: [
        'Pre-training scale.',
        'Tool-use training in post-training: SFT and RLHF that teaches when and how to invoke tools.',
        'Random sampling.',
        'Vector databases.'
      ],
      correctIndex: 1,
      explanation: 'A base model knows language. Post-training (instruction + tool-use + safety) is what makes function calling feel native rather than bolted-on.'
    }
  ],
  'euclidean-distance': [
    {
      prompt: 'For text embeddings, Euclidean distance is usually inferior to cosine because...',
      options: [
        'It cannot handle high dimensions.',
        'It is sensitive to vector magnitude; semantic similarity should depend on direction, not norm.',
        'It is slower.',
        'It is harder to compute.'
      ],
      correctIndex: 1,
      explanation: 'Two vectors pointing the same direction with different lengths are far in Euclidean but identical in cosine. Embedding norms carry no semantic content for most models.'
    }
  ],

  // M2 gaps
  'user-prompt': [
    {
      prompt: 'For programmatic user prompts, the safer pattern is...',
      options: [
        'Concatenate untrusted user data directly.',
        'Use a templated user prompt with clear delimiters and consider injection defense.',
        'Always use freeform text.',
        'Pass strings unsanitized.'
      ],
      correctIndex: 1,
      explanation: 'Templates separate the engineered instruction from runtime variables. Add delimiters around untrusted content; treat retrieved data as data rather than instructions.'
    }
  ],
  'assistant-message': [
    {
      prompt: 'Anthropic\'s prefill technique constrains output by...',
      options: [
        'Editing the system prompt mid-stream.',
        'Passing a partial assistant message; the model continues from there.',
        'Modifying the tokenizer.',
        'Disabling sampling.'
      ],
      correctIndex: 1,
      explanation: 'Prefill an opening "{" to force JSON, or "Sure, here is" to force a tone. The model continues from the partial assistant message rather than starting fresh.'
    }
  ],
  'prompt-template': [
    {
      prompt: 'Templates should be treated as code because...',
      options: [
        'They are always written in Python.',
        'A "small wording tweak" can shift output quality on edge cases; version-control and regression-test them.',
        'They are confidential.',
        'They affect tokenization only.'
      ],
      correctIndex: 1,
      explanation: 'Production-grade prompt engineering treats templates like first-class artifacts. Version, test, and roll out changes deliberately; do not hand-edit in production code.'
    }
  ],
  'zero-shot-prompting': [
    {
      prompt: 'In 2026, zero-shot is usually enough for...',
      options: [
        'Tasks with non-obvious custom conventions.',
        'Common tasks where a precise instruction and explicit output format suffice.',
        'Rare structured-extraction edge cases.',
        'Complex multi-step reasoning.'
      ],
      correctIndex: 1,
      explanation: 'Frontier models handle most common tasks zero-shot. Reaching for examples first wastes prompt budget; spend the time on a precise instruction instead.'
    }
  ],
  'tree-of-thoughts-tot': [
    {
      prompt: 'ToT pays off compared to CoT primarily on...',
      options: [
        'Simple lookup tasks.',
        'Hard reasoning problems where a single chain often dead-ends and search helps.',
        'High-throughput classification.',
        'Voice synthesis.'
      ],
      correctIndex: 1,
      explanation: 'ToT explores multiple reasoning branches and prunes weak ones. Costs 5-20x CoT. Worth it for genuinely hard reasoning; overkill for most production tasks.'
    }
  ],
  'react': [
    {
      prompt: 'The ReAct pattern alternates between...',
      options: [
        'Two random tools.',
        'Reasoning steps and tool actions until task completion.',
        'Always pure code.',
        'Voice and text.'
      ],
      correctIndex: 1,
      explanation: 'Yao et al. 2022. The model thinks ("Reason"), takes a tool action ("Act"), observes the result, repeats. Foundation for modern agentic loops.'
    }
  ],
  'json-mode': [
    {
      prompt: 'JSON mode without a schema enforces...',
      options: [
        'A specific keyset.',
        'Only JSON validity; the model can still invent any keys.',
        'Schema validation.',
        'Type enforcement.'
      ],
      correctIndex: 1,
      explanation: 'Pair JSON mode with a JSON Schema (or Anthropic tool-use input_schema) for both validity AND specific shape. Validity alone leaves room for hallucinated keys.'
    }
  ],
  'constrained-decoding': [
    {
      prompt: 'Constrained decoding works by...',
      options: [
        'Editing the model\'s weights.',
        'Masking grammatically invalid tokens to logit -infinity at each generation step.',
        'Disabling sampling entirely.',
        'Replacing the tokenizer.'
      ],
      correctIndex: 1,
      explanation: 'A grammar parser determines valid next tokens; invalid ones get -inf logit. Outlines, vLLM grammar mode, OpenAI structured-output, Anthropic tool-use all implement this.'
    }
  ],
  'negative-triggers-do-not-use-for': [
    {
      prompt: 'Negative triggers in a Skill or tool description prevent...',
      options: [
        'Faster inference.',
        'Misuse: invoking the wrong skill / tool when a closer-fit option exists or none is appropriate.',
        'Tokenization issues.',
        'Latency.'
      ],
      correctIndex: 1,
      explanation: 'Without "Do NOT use for X", the model picks based only on positive signals and over-uses tools. Always pair positive with negative triggers.'
    }
  ],
  'inverse-scaling-at-test-time-compute': [
    {
      prompt: 'The practical implication of inverse scaling at test-time compute is...',
      options: [
        'Always use maximum thinking budget.',
        'Run an eval with thinking budget swept; pick where quality plateaus, not the maximum.',
        'Disable thinking entirely.',
        'Use temperature 2.0.'
      ],
      correctIndex: 1,
      explanation: 'For most tasks, more thinking helps. For some, it hurts (model overthinks intuitive answers into elaborate wrong ones). Empirically determine the right budget.'
    }
  ],

  // M3 gaps
  'context-engineering': [
    {
      prompt: 'Context engineering reframes prompt engineering as...',
      options: [
        'Pure prompt tweaking.',
        'Everything about getting the right information into the context window: retrieval, system prompt, examples, tool output.',
        'Pure tokenizer choice.',
        'Vector dimension tuning.'
      ],
      correctIndex: 1,
      explanation: 'The 2026 framing. Prompt is one variable; retrieval, history, tool output, examples all share the context window. Engineering the full context is the new discipline.'
    }
  ],
  'modular-rag': [
    {
      prompt: 'Modular RAG\'s primary engineering benefit is...',
      options: [
        'Lower latency.',
        'Composable swappable retrieval modules with typed contracts; easier A/B testing and untangling spaghetti pipelines.',
        'Free hosting.',
        'Smaller indexes.'
      ],
      correctIndex: 1,
      explanation: 'Frameworks like LangGraph and Mastra make this explicit. Module boundaries should match real seams; avoid over-decomposition into trivial five-line modules.'
    }
  ],
  'chunk-overlap': [
    {
      prompt: 'Chunk overlap mitigates...',
      options: [
        'Latency.',
        'Boundary-cut problems: relevant content spanning two adjacent chunks is preserved in at least one.',
        'Tokenization variance.',
        'Embedding drift.'
      ],
      correctIndex: 1,
      explanation: 'Typical overlap: 10-20% of chunk size. Trade-off: more overlap means more retrieval candidates and more storage; less overlap risks splitting relevant context.'
    }
  ],
  'weaviate': [
    {
      prompt: 'Weaviate\'s design opinion is strongest on...',
      options: [
        'Pure vector-only.',
        'Built-in hybrid search (vector + BM25), modular embedding generation, GraphQL or REST API.',
        'CPU-only inference.',
        'Single-node deployments.'
      ],
      correctIndex: 1,
      explanation: 'Schema-first; native hybrid search; module system for embeddings. Strong fit when hybrid search and rich filtering are core; trades simplicity for capability.'
    }
  ],
  'qdrant': [
    {
      prompt: 'Qdrant\'s defining tradeoff vs Weaviate is...',
      options: [
        'No filtering.',
        'Simpler API and faster single-node Rust performance vs Weaviate\'s broader feature surface.',
        'Cloud-only.',
        'No SDK.'
      ],
      correctIndex: 1,
      explanation: 'Smaller engineering team, easier ops, leading single-node throughput. Pick Qdrant when you want self-hosted vector DB without paying complexity for features you do not need.'
    }
  ],
  'chroma': [
    {
      prompt: 'Chroma\'s sweet spot is...',
      options: [
        'Multi-region SaaS.',
        'Prototyping, notebooks, local-first apps, small SaaS tier with up to ~10M vectors.',
        'Billion-scale workloads.',
        'CPU-only batch.'
      ],
      correctIndex: 1,
      explanation: 'Embedded-friendly; SQLite-style ergonomics. Past 10M vectors and high concurrency, dedicated stacks (Qdrant, Weaviate) outscale.'
    }
  ],
  'lancedb': [
    {
      prompt: 'LanceDB shines when...',
      options: [
        'You need high write rates.',
        'Workload mixes analytical SQL queries with vector retrieval over the same data.',
        'You only need pure ANN.',
        'You need no filters.'
      ],
      correctIndex: 1,
      explanation: 'Columnar Lance format enables fast filter-then-search and analytical scans. Single-file portability is a side benefit. For pure vector search at scale, Qdrant is still faster.'
    }
  ],
  'milvus': [
    {
      prompt: 'Milvus is the right call when...',
      options: [
        'You have 5M vectors.',
        'You have 500M+ vectors and on-prem requirements; willing to pay the Kubernetes complexity.',
        'You want zero-config.',
        'You only need 100 vectors.'
      ],
      correctIndex: 1,
      explanation: 'Compute / storage separation enables billion-scale. Operationally complex; Zilliz Cloud reduces the burden. Below 100M vectors the complexity rarely pays off.'
    }
  ],
  'ivf': [
    {
      prompt: 'IVF\'s typical search complexity for N vectors is...',
      options: [
        'O(N) like exact search.',
        'O(sqrt(N)) when K = sqrt(N) clusters with a few probes.',
        'O(N^2).',
        'O(1).'
      ],
      correctIndex: 1,
      explanation: 'Partition into ~sqrt(N) clusters; probe a few. Drops from N comparisons to sqrt(N) at modest recall cost. Pure IVF is rare in 2026; IVF-PQ wins for billion-scale memory savings.'
    }
  ],
  'ivf-pq': [
    {
      prompt: 'IVF-PQ enables billion-scale ANN by...',
      options: [
        'Larger GPUs.',
        'Compressing vectors via Product Quantization (e.g., 6KB -> 96 bytes) plus IVF clustering.',
        'Skipping retrieval.',
        'Removing the index.'
      ],
      correctIndex: 1,
      explanation: 'PQ splits each vector into M sub-vectors, each in a 256-entry codebook. Memory drops 60x with 5-10% recall cost. Workhorse for web-scale recommendation and image retrieval.'
    }
  ],
  'diskann': [
    {
      prompt: 'DiskANN\'s tradeoff vs in-memory HNSW is...',
      options: [
        'Same memory.',
        'Higher latency (10-50ms vs 1-5ms) but billion-scale capability without keeping the full index in RAM.',
        'Higher memory.',
        'CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'SSD-backed graph traversal. Indexes that would need 6TB RAM fit on 200GB cache + 60TB SSD. Cost differential is 10-30x at billion scale.'
    }
  ],
  'bi-encoder': [
    {
      prompt: 'Bi-encoders make vector search viable at scale because...',
      options: [
        'They are slower.',
        'Documents encoded once at indexing; queries encoded per request; relevance is just a dot product.',
        'They use more memory.',
        'They require GPUs.'
      ],
      correctIndex: 1,
      explanation: 'Asymmetric cost: documents encoded once, queries per request. Cross-encoders cannot scale to retrieval over millions of docs because they would need to run per-doc-per-query.'
    }
  ],
  'query-expansion-rewriting': [
    {
      prompt: 'Query expansion improves recall by...',
      options: [
        'Skipping retrieval.',
        'Generating 3-5 query variants; each retrieves candidates; results are fused.',
        'Removing the index.',
        'Disabling embeddings.'
      ],
      correctIndex: 1,
      explanation: 'Costs 1-2 extra LLM calls before retrieval. 5-15% recall gain on long-tail queries. Watch for over-expansion: past 5-7 variants the candidate pool dilutes.'
    }
  ],

  // M4 gaps
  'agentic-loop': [
    {
      prompt: 'A standard agentic loop terminates when...',
      options: [
        'The model runs out of tokens.',
        'The model decides the goal is met (or a hard iteration / cost cap is hit).',
        'The user types "stop".',
        'A timer fires.'
      ],
      correctIndex: 1,
      explanation: 'Goal-driven termination plus safety caps. Always set a hard maximum iteration count to prevent runaway loops on adversarial or ambiguous inputs.'
    }
  ],
  'agent-orchestration': [
    {
      prompt: 'Explicit orchestration (LangGraph, Temporal) beats implicit orchestration when...',
      options: [
        'You want minimal setup.',
        'Workflows are complex enough that explicit graphs are easier to debug and reason about.',
        'You only have one step.',
        'You only call one model.'
      ],
      correctIndex: 1,
      explanation: 'Implicit (model-decides) is faster to prototype. Explicit (developer-defined graph) wins when the workflow is non-trivial: clearer state, easier debugging, durable execution.'
    }
  ],
  'handoff-delegation': [
    {
      prompt: 'A clean handoff between agents requires passing...',
      options: [
        'Only the conversation history.',
        'Conversational context, constraints, and goal - explicitly summarized rather than dumped.',
        'No information.',
        'Only the tool list.'
      ],
      correctIndex: 1,
      explanation: 'Dumping the full prior history overwhelms the next agent. Summarize the relevant slice, restate the goal, list constraints. Handoffs are a design surface, not just a routing call.'
    }
  ],
  'mcp-client': [
    {
      prompt: 'An MCP client\'s job is to...',
      options: [
        'Only run the model.',
        'Discover available MCP servers, route tool calls to them, return results to the model.',
        'Pure CLI.',
        'Vector store.'
      ],
      correctIndex: 1,
      explanation: 'Claude Desktop, Cursor, custom agents act as MCP clients. They handle the protocol mechanics so the model just sees the standard tool-use interface.'
    }
  ],
  'mcp-transport': [
    {
      prompt: 'For local desktop MCP servers, the default transport is...',
      options: [
        'HTTPS.',
        'stdio: client launches the server as a subprocess; messages flow over stdin / stdout.',
        'WebSocket.',
        'gRPC.'
      ],
      correctIndex: 1,
      explanation: 'No network exposure, no auth needed for local trust. SSE for remote streaming; HTTP for stateless remote. stdio is the simplest and most-used.'
    }
  ],
  'mcp-resource': [
    {
      prompt: 'MCP resources differ from tools in that resources are...',
      options: [
        'Always remote.',
        'Read passively by the client (file, document, DB row); tools are invoked actively by the model.',
        'Identical.',
        'Always local files.'
      ],
      correctIndex: 1,
      explanation: 'Resources surface context for the model to read; tools execute actions on the model\'s decision. Pick resources for "model should know about this passively"; tools for "model should do something."'
    }
  ],
  'mcp-prompt': [
    {
      prompt: 'MCP prompts let server authors ship...',
      options: [
        'Pre-engineered prompt templates that clients can render with arguments.',
        'Pure embeddings.',
        'Database schemas.',
        'Audio files.'
      ],
      correctIndex: 0,
      explanation: 'Slash-command analog. Less common than tools and resources; useful for highly-templated workflows (code review, doc generation).'
    }
  ],
  'langgraph': [
    {
      prompt: 'LangGraph\'s primary mental model is...',
      options: [
        'A linear chain.',
        'A typed state graph: nodes are steps, edges are transitions, state is explicit.',
        'A vector database.',
        'A purely declarative DSL.'
      ],
      correctIndex: 1,
      explanation: 'Replaces the implicit AgentExecutor with explicit graph traversal. Easier to debug, easier to add durability, easier to reason about state. The 2026 LangChain default for agents.'
    }
  ],
  'llamaindex': [
    {
      prompt: 'LlamaIndex\'s strongest surface vs LangChain is...',
      options: [
        'Pure agent orchestration.',
        'Data ingestion and retrieval: loaders, chunking, embedding orchestration, metadata-aware retrieval.',
        'Voice transcription.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'LlamaIndex is the strongest opinionated stack for production RAG. Many stacks use LlamaIndex for ingestion and LangGraph for orchestration; they compose.'
    }
  ],
  'crewai': [
    {
      prompt: 'CrewAI\'s defining design choice is...',
      options: [
        'Pure typing.',
        'Role-based agent personas (role, goal, backstory) with task delegation; fast scaffolding for multi-agent flows.',
        'Single-agent only.',
        'Cloud-only.'
      ],
      correctIndex: 1,
      explanation: 'Friendly for non-engineers, fast prototyping. Migrate to LangGraph or Mastra when production complexity outgrows the persona model.'
    }
  ],
  'openai-agents-sdk': [
    {
      prompt: 'OpenAI Agents SDK\'s defining primitive is...',
      options: [
        'Random sampling.',
        'Handoffs: each agent declares its possible handoff targets; framework manages context transfer.',
        'Pure prompt chains.',
        'Vector search.'
      ],
      correctIndex: 1,
      explanation: '2025 replacement for Swarm. Handoff-based architecture with built-in tracing and guardrails. Strong fit for OpenAI-stack teams; competes with LangGraph for the OpenAI share.'
    }
  ],
  'google-adk': [
    {
      prompt: 'Google ADK is best fit for...',
      options: [
        'OpenAI-only stacks.',
        'GCP-heavy stacks where Gemini is the primary model and Vertex AI services integrate tightly.',
        'Apple-only.',
        'Microsoft-only.'
      ],
      correctIndex: 1,
      explanation: 'Native fit with Vertex AI Search, Vertex AI RAG Engine, BigQuery. Less compelling outside the Google ecosystem. Note: distinct from Anthropic\'s ADK pattern despite the acronym overlap.'
    }
  ],
  'microsoft-agent-framework': [
    {
      prompt: 'Microsoft Agent Framework\'s differentiator is...',
      options: [
        'Apple Silicon optimization.',
        'Deep Microsoft Graph (Outlook, Teams, SharePoint), Entra ID auth, Azure observability integration.',
        'Vector store.',
        'Voice cloning.'
      ],
      correctIndex: 1,
      explanation: 'Successor to AutoGen and Semantic Kernel. For Microsoft-shop deployments, no other framework integrates as cleanly with the M365 / Azure tooling.'
    }
  ],
  'smolagents': [
    {
      prompt: 'Smolagents bets on which approach to tools?',
      options: [
        'Pure JSON tool calls.',
        'Code-as-tool: agents write Python code that calls primitives directly.',
        'Voice synthesis.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'More expressive than JSON tool calls; better on complex tasks. Cost: code-execution security (run in a sandbox) and harder observability.'
    }
  ],

  // M5 gaps
  'skill-design-pattern-chained-inversion': [
    {
      prompt: 'Chained Inversion is appropriate when...',
      options: [
        'A single question gives enough context.',
        'A chain of 3-7 focused questions is needed before the artifact can be produced.',
        'No questions are needed.',
        'You want a one-shot generation.'
      ],
      correctIndex: 1,
      explanation: 'Pattern combines Inversion (asks user) and Generator (produces artifact) across multiple turns. Used by claude-md-builder and similar interview-driven workflows.'
    }
  ],
  'skill-creator': [
    {
      prompt: 'skill-creator is best invoked when...',
      options: [
        'A workflow runs once a year.',
        'You catch yourself doing the same prompt-and-action sequence in Claude more than 3 times.',
        'You want a one-off completion.',
        'Never.'
      ],
      correctIndex: 1,
      explanation: 'Skills earn their place by being reused. Spot the repeated pattern; codify it once via skill-creator; reap the compounding benefit across future sessions.'
    }
  ],
  'pretooluse-posttooluse-sessionstart-stop-subagentstop': [
    {
      prompt: 'A PostToolUse hook on Edit / Write tools is commonly used to...',
      options: [
        'Block all edits.',
        'Auto-format code (Prettier, gofmt) immediately after the agent saves a file.',
        'Disable the agent.',
        'Replay tool calls.'
      ],
      correctIndex: 1,
      explanation: 'PostToolUse fires after the tool returns. Common uses: formatting, linting, auto-running tests, structured logging. Keep hooks fast; they are blocking.'
    }
  ],
  'plugin-marketplace': [
    {
      prompt: 'A plugin\'s value to a team is that it...',
      options: [
        'Replaces the model.',
        'Bundles skills, hooks, subagents, and MCP server configs as one installable artifact.',
        'Replaces git.',
        'Adds GPUs.'
      ],
      correctIndex: 1,
      explanation: 'Closes the distribution gap: a senior engineer builds a "release-checklist" plugin once; teammates install and gain the workflow. New hires get the team\'s patterns on day one.'
    }
  ],
  'cowork': [
    {
      prompt: 'Cowork is the right Anthropic surface for...',
      options: [
        'Repository-scale coding.',
        'Document-heavy non-code work: reports, presentations, document analysis, custom Skills.',
        'Voice transcription.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Chat-plus-canvas interface where Skills and skill-creator live. Different surface from Claude Code (terminal-resident); same agent runtime under the hood.'
    }
  ],
  'claude-in-excel': [
    {
      prompt: 'Claude in Excel\'s most powerful pattern is...',
      options: [
        'Single-cell formulas only.',
        '=CLAUDE() in-cell formulas dragged across thousands of rows for bulk classification, extraction, rewrite.',
        'Pure pivot tables.',
        'Voice transcription.'
      ],
      correctIndex: 1,
      explanation: 'Collapses common analyst workflows: clean a column of feedback, classify tickets, extract entities. Tasks that took 30 minutes of formulas become single-cell.'
    }
  ],
  'claude-in-chrome': [
    {
      prompt: 'Claude in Chrome enables agents to...',
      options: [
        'Only read the title.',
        'See the active tab\'s DOM, click elements, fill forms, navigate, extract data, and operate across multiple tabs.',
        'Block ads.',
        'Pure search.'
      ],
      correctIndex: 1,
      explanation: 'Browser-resident agent. Use cases: summarize current page, extract from web forms, automate repetitive workflows. Always require explicit user confirmation for destructive actions.'
    }
  ],
  'claude-desktop': [
    {
      prompt: 'For repository-scale coding work, Claude Desktop is...',
      options: [
        'The right tool.',
        'Less capable than terminal-resident Claude Code; use Code for that.',
        'Not available.',
        'Identical to Claude Code.'
      ],
      correctIndex: 1,
      explanation: 'Claude Desktop excels at chat-first workflows, file analysis, image / document processing. Claude Code (terminal) is more powerful for editing across many files in a repository.'
    }
  ],
  'anthropic-api': [
    {
      prompt: 'For production deployments, model snapshot pinning is...',
      options: [
        'Optional and unimportant.',
        'Strongly recommended: pin to dated snapshots like claude-opus-4-7-20260415 to avoid silent regressions.',
        'Forbidden.',
        'Done by random sampling.'
      ],
      correctIndex: 1,
      explanation: 'Without pinning, vendor model rotation can shift behavior silently. Pin in production; rotate deliberately after re-running your eval set.'
    }
  ],
  'constitutional-ai': [
    {
      prompt: 'Constitutional AI replaces some human-RLHF labor with...',
      options: [
        'Random rewards.',
        'A critic model that evaluates outputs against a written constitution and produces feedback the trained model learns from.',
        'Voice cloning.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Anthropic\'s differentiating training methodology. The constitution articulates principles; the model internalizes them. Many of Claude\'s recognizable behaviors trace to specific principles.'
    }
  ],

  // M7 gap
  'ollama-community': [
    {
      prompt: 'The Ollama community on Discord and Reddit is most useful for...',
      options: [
        'Cloud SaaS support.',
        'Hardware tuning, model troubleshooting, integration patterns specific to the local AI stack.',
        'Marketing.',
        'Image generation tutorials.'
      ],
      correctIndex: 1,
      explanation: 'Active support hub for the dominant local model server. High-signal community when you hit Mac vs Linux quirks, weird quantization issues, or unusual deployment setups.'
    }
  ],

  // M14 gaps
  'ai-coding-agent': [
    {
      prompt: 'The AI coding agent landscape spans from...',
      options: [
        'A single product only.',
        'Inline autocomplete (Copilot) to autonomous background agents (Devin, Codex).',
        'Pure prompt-only tools.',
        'Voice agents only.'
      ],
      correctIndex: 1,
      explanation: 'Different rungs of the autonomy ladder. Pick by the task: novel architecture wants Suggest / Assist; bounded boilerplate tolerates Automate / Autonomous.'
    }
  ],
  'pair-programming-with-ai': [
    {
      prompt: 'In the "AI as partner" mental model, your job is to...',
      options: [
        'Type every line.',
        'Steer (set direction), let AI execute, then verify the result.',
        'Manage the AI.',
        'Replace the AI.'
      ],
      correctIndex: 1,
      explanation: 'You provide intent and judgment; AI provides bandwidth. Trust comes from review and iteration rather than blind acceptance.'
    }
  ],
  'ai-as-junior-dev': [
    {
      prompt: 'The "AI is junior dev" mental model implies your role becomes...',
      options: [
        'A solo coder.',
        'A tech lead: scope work, assign, review, mentor.',
        'A pure observer.',
        'A QA tester only.'
      ],
      correctIndex: 1,
      explanation: 'AI handles bounded tasks under review. You scope, the AI executes, you review and push back when wrong. The skill is reviewing AI output critically and quickly.'
    }
  ],
  'ai-as-rubber-duck': [
    {
      prompt: '"AI as rubber duck" is most useful when...',
      options: [
        'You need code shipped.',
        'You need help thinking through a problem; the output may not be used directly.',
        'You want pure autocomplete.',
        'You need a vector database.'
      ],
      correctIndex: 1,
      explanation: 'Value lives in the conversation, not the artifact. Useful for debugging your own thinking before writing the actual code. Lowest-stakes AI usage; high learning ROI.'
    }
  ],
  'continue-dev': [
    {
      prompt: 'Continue.dev\'s position is...',
      options: [
        'Closed SaaS.',
        'Open-source IDE extension; multi-provider, local-friendly.',
        'Apple-only.',
        'Mobile-only.'
      ],
      correctIndex: 1,
      explanation: 'Strong choice for OSS-conscious teams. Pairs with local Ollama for fully-local dev workflow; switches to cloud frontier when capability demands it.'
    }
  ],
  'cline': [
    {
      prompt: 'Cline\'s defining feature is...',
      options: [
        'Pure autocomplete.',
        'Explicit act-mode for autonomous edits inside VSCode.',
        'A coding tutorial.',
        'A vector store.'
      ],
      correctIndex: 1,
      explanation: 'Tight loop between plan and execution. More autonomous than Copilot; less autonomous than Devin. Useful for users who want explicit control over when AI takes action.'
    }
  ],
  'copilot-workspace': [
    {
      prompt: 'GitHub Copilot Workspace fits naturally with which workflow?',
      options: [
        'Pure terminal coding.',
        'Spec-driven development inside GitHub: issue -> Workspace plan -> PR.',
        'Voice transcription.',
        'Vector retrieval.'
      ],
      correctIndex: 1,
      explanation: 'GitHub-native agent mode. Tight integration with issues, PRs, branches. Strong fit for teams already centered on GitHub for development workflow.'
    }
  ],
  'windsurf': [
    {
      prompt: 'Windsurf positions against Cursor by...',
      options: [
        'Pure read-only.',
        'Codeium-developed IDE with agent mode and tight codebase indexing; direct Cursor competitor.',
        'Apple-only.',
        'CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'Codeium\'s entry into the AI IDE category. Similar feature surface to Cursor; pick by which team\'s pricing, capability roadmap, or UX you prefer.'
    }
  ],
  'codex-cli': [
    {
      prompt: 'OpenAI\'s Codex CLI is...',
      options: [
        'A vector database.',
        'OpenAI\'s command-line coding agent; competes with Claude Code.',
        'A SaaS chat app.',
        'A model.'
      ],
      correctIndex: 1,
      explanation: 'Terminal-resident coding agent. OpenAI-specific tooling and conventions. For teams already in the OpenAI ecosystem who prefer terminal over IDE.'
    }
  ],
  'gemini-cli': [
    {
      prompt: 'Gemini CLI is best fit for...',
      options: [
        'OpenAI-only stacks.',
        'GCP-aligned teams using Gemini as primary model with Google Cloud services integration.',
        'Apple-only.',
        'Discontinued.'
      ],
      correctIndex: 1,
      explanation: 'Google\'s command-line coding agent. Gemini-native; tightest GCP integration. Useful for teams whose AI infrastructure is already Vertex AI / BigQuery.'
    }
  ],
  'qwen-code': [
    {
      prompt: 'Qwen Code is most useful when...',
      options: [
        'You require closed weights.',
        'You want self-hosted coding workflows on open-weight models.',
        'You need cloud-only.',
        'You only use English.'
      ],
      correctIndex: 1,
      explanation: 'Alibaba\'s open-weight coding agent. Strong fit for self-hosted, open-source, or non-English-heavy coding workflows where Qwen models are already in use.'
    }
  ],
  'opencode': [
    {
      prompt: 'OpenCode positions itself as...',
      options: [
        'A pure cloud SaaS.',
        'Open-source alternative to Claude Code; community-driven; rapid iteration.',
        'A vector database.',
        'A coding tutorial.'
      ],
      correctIndex: 1,
      explanation: 'For teams that want Claude-Code-style ergonomics with OSS license and provider flexibility. Active community; trade-off vs first-party Claude Code is polish and stability.'
    }
  ],
  'replit-agent': [
    {
      prompt: 'Replit Agent is differentiated by...',
      options: [
        'Pure desktop.',
        'Building entire apps from prompts and deploying on Replit infrastructure end-to-end.',
        'Mobile-only.',
        'CPU-only.'
      ],
      correctIndex: 1,
      explanation: 'Tight coupling to Replit\'s hosting and dev environment. Useful for prototyping and shipping small apps quickly; less suited for production-grade multi-engineer workflows.'
    }
  ],
  'openai-codex-the-agent-not-the-cli': [
    {
      prompt: 'OpenAI Codex (the agent service) operates as...',
      options: [
        'Pure autocomplete.',
        'Background autonomous coding agent: assign tasks, return to PRs.',
        'A CLI only.',
        'A voice agent.'
      ],
      correctIndex: 1,
      explanation: 'Distinct from the Codex CLI. Server-side autonomous agent on real repositories. Background-agent pattern; competes with Devin and Replit Agent in the autonomous tier.'
    }
  ],
  'mention-pattern-cursor': [
    {
      prompt: 'The @-mention pattern in Cursor is best used to...',
      options: [
        'Mention coworkers.',
        'Reference specific files, symbols, or docs to give the agent precise context.',
        'Tag PRs in chat.',
        'Send emails.'
      ],
      correctIndex: 1,
      explanation: 'Cleanest way to provide precise context. The agent gets exactly what you reference; eliminates noise from broader codebase indexing on focused tasks.'
    }
  ],
  'test-driven-development-with-agents': [
    {
      prompt: 'TDD with agents pairs naturally because...',
      options: [
        'Tests are slow.',
        'Tests double as the spec; the agent makes failing tests pass; tight feedback loop.',
        'Tests prevent any AI use.',
        'Tests are deprecated.'
      ],
      correctIndex: 1,
      explanation: 'Spec-driven flavor of agentic coding. Write tests first, agent implements; failures give the agent precise correction signals. Faster than open-ended prompting on bounded features.'
    }
  ],
  'terminal-bench': [
    {
      prompt: 'Terminal-bench measures...',
      options: [
        'Pure latency.',
        'Pass rate on command-line agentic tasks; success jumped from 20% (early 2025) to 70%+ (2026 frontier).',
        'Voice synthesis.',
        'Image generation.'
      ],
      correctIndex: 1,
      explanation: 'Companion to SWE-bench focusing on shell tasks. Strong proxy for "can my agent operate in a real terminal." Frontier progress visible across this benchmark over the past year.'
    }
  ],
  'the-capability-frontier': [
    {
      prompt: 'In mid-2026, AI coding agents reliably handle...',
      options: [
        'Every conceivable task.',
        'Most well-scoped tasks autonomously; novel architecture and ambiguous specs still need humans.',
        'Nothing.',
        'Only autocomplete.'
      ],
      correctIndex: 1,
      explanation: 'Frontier is real but bounded. Background agents (Devin, Codex) handle clear specs end-to-end; ambiguous specifications and novel architectures still benefit from human design judgment.'
    }
  ],
  'personal-subscription-tier-landscape': [
    {
      prompt: 'A common 2026 personal coding-agent subscription stack is...',
      options: [
        'No subscription.',
        'Cursor Pro + Claude Pro / Max + GitHub Copilot Pro stacked, sometimes Continue free + paid.',
        'A single $5/month plan.',
        'Free for everything.'
      ],
      correctIndex: 1,
      explanation: 'Most working AI engineers stack 2-3 tools. Total: $50-150/mo for moderate use; background-agent usage (Devin, Codex) pushes higher. Compares well to per-engineer productivity gains for most teams.'
    }
  ]
};
