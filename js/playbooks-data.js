// Auto-extracted from course.html.legacy by build/extract.mjs.
// Do not edit by hand. Re-run the script to refresh.

export const PLAYBOOKS = {
      'set-up-claude-code': {
        slug: 'set-up-claude-code',
        title: 'Set up your Claude Code environment from zero in 30 minutes',
        outcome: 'A fully wired Claude Code environment: global CLAUDE.md, project CLAUDE.md, your first Skill, your first PreToolUse hook, your first subagent, packaged as a plugin you can share.',
        prereqs: [
          'macOS, Linux, or Windows with WSL2',
          'Node 20+ installed (`node -v` should show v20 or higher)',
          'Active Claude Code account on a Pro or Max plan',
          'A terminal you actually use (Warp, iTerm, Windows Terminal)',
          'A GitHub account if you plan to publish the plugin'
        ],
        timeEstimate: '30 minutes',
        conceptsTouched: ['claude-md', 'skill-md', 'hooks', 'subagents', 'plugins', 'progressive-disclosure'],
        steps: [
          {
            n: 1,
            title: 'Install Claude Code',
            body: [
              'Run the installer:',
              { code: 'npm install -g @anthropic-ai/claude-code' },
              'Verify the install:',
              { code: 'claude --version' },
              'You should see something like `claude-code 1.x.x`. If the command is not found, your npm global bin directory is not on PATH; either fix PATH or use `npx @anthropic-ai/claude-code` for the rest of this playbook.'
            ],
            checkpoint: '`claude --version` prints a version number.'
          },
          {
            n: 2,
            title: 'Write your first global CLAUDE.md',
            body: [
              'Global CLAUDE.md applies to every project on your machine. Use it for personal preferences (voice, default tools, secrets you NEVER want sent).',
              'Create it:',
              { code: 'mkdir -p ~/.claude && $EDITOR ~/.claude/CLAUDE.md' },
              'Paste a starting template (the Toolkit ships a polished one at #/toolkit/template/claude-md-solo). At minimum:',
              { code: '# Personal Claude config\n\n## Voice and style\n- Crisp, technical. Plain hyphens, never em dashes.\n- Show, do not narrate.\n\n## Security rules\n- Never print API keys or tokens to stdout.\n- Block destructive shell commands without explicit confirmation.\n' },
              'Save the file. Claude reads it on every new session.'
            ],
            checkpoint: '`~/.claude/CLAUDE.md` exists with at least one rule per section.'
          },
          {
            n: 3,
            title: 'Create your first project CLAUDE.md',
            body: [
              'Project-level CLAUDE.md lives in your repo and ships with the code. It is the project constitution every engineer (and every Claude session) reads first.',
              'In any project root:',
              { code: 'mkdir -p .claude && $EDITOR .claude/CLAUDE.md' },
              'Document the rules that are non-negotiable for this project: language/runtime, naming conventions, test bar, repo conventions, security rules, things future-you will forget. The CLAUDE.md builder at #/toolkit/builder/claude-md walks you through every section.',
              'Commit it: `git add .claude/CLAUDE.md && git commit -m "add project constitution"`. Now everyone on the team gets the same context.'
            ],
            checkpoint: '`.claude/CLAUDE.md` exists, is committed, and reflects this project (not a generic template).'
          },
          {
            n: 4,
            title: 'Build your first Skill via skill-creator',
            body: [
              'Skills are modular, on-demand context that loads when its description matches what you are doing. The skill-creator is a meta-skill that interviews you to scaffold a new one.',
              'Open Cowork. Pick the skill-creator. Choose Opus 4.7 with Extended Thinking.',
              'Be specific in the interview: vague skills do not fire. The most important field is the description in the YAML frontmatter, which Claude pattern-matches against your prompts.',
              'After the interview produces a SKILL.md, install it:',
              { code: 'mkdir -p ~/.claude/skills/<skill-name> && $EDITOR ~/.claude/skills/<skill-name>/SKILL.md' },
              'Paste the generated content. Add bundled assets (scripts/, templates/, output_style.md) if your skill needs them.',
              'Always include a "Do NOT use for..." line. Negative triggers matter more than positive ones.'
            ],
            checkpoint: 'A SKILL.md sits in `~/.claude/skills/<your-skill>/`, and Claude invokes it on a relevant trigger phrase.'
          },
          {
            n: 5,
            title: 'Write your first PreToolUse hook',
            body: [
              'Hooks are deterministic shell scripts that run on agent events. PreToolUse fires before a tool call and can deny it. Perfect for blocking destructive commands.',
              'Create a hook:',
              { code: 'mkdir -p .claude/hooks && cat > .claude/hooks/block-destructive.sh <<\'EOF\'\n#!/usr/bin/env bash\nset -euo pipefail\ncmd="${1-}"\ncase "$cmd" in\n  *"rm -rf /"*|*"git push --force"*|*"chmod -R 777"*)\n    echo "blocked: $cmd"\n    exit 2\n    ;;\nesac\nEOF\nchmod +x .claude/hooks/block-destructive.sh' },
              'Wire it in `.claude/settings.json`:',
              { code: '{\n  "hooks": {\n    "PreToolUse": [\n      { "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/block-destructive.sh" }] }\n    ]\n  }\n}' },
              'Test it: ask Claude to run `rm -rf /tmp/something`. The hook should block.'
            ],
            checkpoint: 'A destructive command is denied by the hook with a visible "blocked" message.'
          },
          {
            n: 6,
            title: 'Spawn your first subagent',
            body: [
              'Subagents have their own context window. Use them for focused work that would otherwise pollute your main session: code review, test running, exploration.',
              'Create one:',
              { code: 'mkdir -p .claude/agents && $EDITOR .claude/agents/code-reviewer.md' },
              'Minimal content:',
              { code: '---\nname: code-reviewer\ndescription: Reviews staged code for bugs, security issues, and style violations. Returns a structured report.\ntools: Read, Grep, Bash\nmodel: claude-sonnet-4-6\n---\n\nYou are a senior code reviewer. When invoked, run `git diff --cached`, then walk through every changed file and report issues by severity (BLOCKER, MAJOR, MINOR). End with a one-line PASS or FAIL.' },
              'Invoke it from the main session: "Have the code-reviewer subagent look at my staged changes." Claude spawns it, the subagent runs in its own context, and returns one summary message.'
            ],
            checkpoint: 'The code-reviewer subagent returns a report after running on a staged diff.'
          },
          {
            n: 7,
            title: 'Package the whole stack as a plugin',
            body: [
              'Plugins bundle skills, agents, hooks, and slash commands so others can install your stack with one command.',
              'Create the manifest:',
              { code: '$EDITOR plugin.json' },
              'Use the Toolkit template at #/toolkit/template/plugin-json as a starting point. Reference each artifact you built in steps 4-6.',
              'Publish to npm or to a private registry, or just share the repo. To install in another project:',
              { code: 'claude plugin install <package-name>' },
              'Now the team levels up together.'
            ],
            checkpoint: '`plugin.json` is valid JSON, references your skills/agents/hooks, and a fresh install picks them up.'
          }
        ],
        whatNext: 'You have a working agent stack. Next: write your first eval suite using the build-evals playbook so you can measure whether changes to your CLAUDE.md and Skills actually improve outputs.',
        commonFailures: [
          { issue: 'Skill never fires.', fix: 'The description in the YAML frontmatter is too vague. Add 5 phrasings the user might type. Test with "When would you use this skill?"' },
          { issue: 'Hook does not run.', fix: 'Check `chmod +x` on the script and verify the matcher in settings.json matches the tool name exactly (case-sensitive). Run `claude --debug-hooks` to see firing events.' },
          { issue: 'Subagent context overflows on large repos.', fix: 'Subagents have their own context window but it is not infinite. Restrict the agent\'s `tools:` to read-only and limit the scope of what it explores.' },
          { issue: 'Plugin install fails on Windows.', fix: 'Hooks that use bash shebangs do not run on Windows without WSL. Provide PowerShell variants or document WSL as a prereq.' }
        ]
      },

      'build-evals': {
        slug: 'build-evals',
        title: 'Build evals for your AI app in one session',
        outcome: 'A CI-gated eval pipeline that scores your AI feature on a golden set, fails the build on regressions, and exposes a clear path to improving prompts/models without flying blind.',
        prereqs: [
          'A working AI feature with at least one prompt or chain in production',
          'Node 20+ or Python 3.12+',
          'A few hours of pair-coding with someone who has used the feature with users',
          'Access to your CI provider (GitHub Actions, GitLab CI, etc.)'
        ],
        timeEstimate: '90 minutes (longer than the title suggests; do not skip the alignment step)',
        conceptsTouched: ['evaluation-eval', 'golden-set', 'llm-as-judge', 'aligning-llm-as-judge-to-human-judgment', 'ragas'],
        steps: [
          {
            n: 1,
            title: 'Identify the eval target',
            body: [
              'Pick ONE behavior to evaluate. Not the entire app; one feature, one prompt, one chain.',
              'Examples that work: "Does the support classifier route tickets to the correct queue?" / "Does the RAG answer cite the right document?" / "Does the summary match key facts in the source?"',
              'Examples that do not work: "Is the app good?" (too vague) / "How does the model perform?" (too broad) / "Does it feel right?" (not measurable).',
              'Write the target as a one-sentence question. Tape it to your monitor.'
            ],
            checkpoint: 'You have a single sentence that names the behavior and the success criterion.'
          },
          {
            n: 2,
            title: 'Build the golden set',
            body: [
              'A golden set is 20-50 input/expected-output pairs you trust. Skip this step and the rest is theater.',
              'Source examples from production logs or real customer data. If you do not have those, generate from interviews with the people who actually use the feature.',
              'Each entry needs: input, expected output (or expected criteria, for open-ended tasks), and a one-line note about why this case matters.',
              'Store in a structured format your eval runner can read:',
              { code: '[\n  {\n    "id": "billing-vs-support-1",\n    "input": "I was charged twice this month, please refund.",\n    "expected_queue": "billing",\n    "note": "double-charge complaints are billing, not generic support"\n  },\n  ...\n]' },
              'Aim for diversity: easy cases, hard cases, edge cases, adversarial cases. 5 of each is a fine starting set.'
            ],
            checkpoint: 'A `golden-set.json` (or similar) holds 20+ entries you trust. Each has input, expected, and a note.'
          },
          {
            n: 3,
            title: 'Choose your eval methodology',
            body: [
              'For deterministic outputs (classification, structured extraction): exact match or fuzzy match against expected.',
              'For open-ended outputs (summaries, answers): LLM-as-judge. Use a strong model with a rubric; do NOT trust a single score.',
              'For RAG: faithfulness, answer relevancy, context precision. RAGAS gives you these out of the box.',
              'Pick one methodology per target. Do not mix in a single run; you will not be able to interpret the score.'
            ],
            checkpoint: 'You have written down the methodology and the rubric. The rubric has 3-5 dimensions, each with a 0-3 score scale.'
          },
          {
            n: 4,
            title: 'Wire up Promptfoo (or your runner of choice)',
            body: [
              'Promptfoo is a CLI for prompt and RAG evaluation. Install:',
              { code: 'npm install -g promptfoo' },
              'Create `promptfooconfig.yaml`:',
              { code: 'description: Support classifier eval\nproviders:\n  - openai:gpt-4o\n  - anthropic:messages:claude-sonnet-4-6\nprompts:\n  - file://prompts/classify.txt\ntests: file://golden-set.json\ndefaultTest:\n  assert:\n    - type: equals\n      value: "{{expected_queue}}"' },
              'Run:',
              { code: 'promptfoo eval' },
              'You get a per-case pass/fail and an overall score. Read every failure; do not skip to the aggregate number.'
            ],
            checkpoint: '`promptfoo eval` runs end-to-end and produces a score for at least 2 providers.'
          },
          {
            n: 5,
            title: 'Align the LLM-as-judge to human judgment',
            body: [
              'If you used an LLM judge in step 3, validate that its scores correlate with humans before you trust them.',
              'Sample 30 cases from your golden set. Score each yourself. Compare to the judge.',
              'If correlation is below 0.8 (Spearman or Pearson), the judge is unreliable. Fix the rubric, then re-test. Common fixes: tighten the rubric scale (3 levels not 5), give the judge concrete examples per level, ask the judge to explain its score before producing it.',
              'Per Shankar et al, judges that have not been aligned routinely produce confident but wrong scores.'
            ],
            checkpoint: 'You have a correlation number between judge and human scores. It is above 0.8 OR you are NOT using LLM-as-judge.'
          },
          {
            n: 6,
            title: 'Iterate on the score',
            body: [
              'Now you can iterate without flying blind. Make a prompt change. Re-run. See whether the score moved up.',
              'Read the cases that newly failed. They tell you what your prompt change broke.',
              'Make small changes. Big rewrites are uninterpretable; you cannot tell which knob mattered.',
              'Track scores over time in a CSV or your CI artifacts. The slope matters more than the absolute number.'
            ],
            checkpoint: 'You have run the eval at least 3 times after 3 prompt changes. You can name which change improved the score and which broke a case.'
          },
          {
            n: 7,
            title: 'Add to CI as a quality gate',
            body: [
              'Wire the eval into your CI pipeline so PRs that drop the score below threshold get blocked.',
              'GitHub Actions example:',
              { code: 'name: eval\non: pull_request\njobs:\n  eval:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n      - run: npm install -g promptfoo\n      - run: promptfoo eval --output json > eval.json\n      - run: |\n          score=$(jq \'.results.stats.successes / .results.stats.tests * 100\' eval.json)\n          echo "score: $score"\n          (( $(echo "$score >= 85" | bc -l) )) || exit 1\n      - uses: actions/upload-artifact@v4\n        with:\n          name: eval-results\n          path: eval.json' },
              'Now every PR runs the eval. Drops below 85% block the merge.'
            ],
            checkpoint: 'A pull request fails CI when the eval score drops below threshold; passing changes merge cleanly.'
          }
        ],
        whatNext: 'You can now ship prompt and model changes with confidence. Next: build the same kind of pipeline for hallucination detection (faithfulness scoring) and for adversarial inputs (red-teaming).',
        commonFailures: [
          { issue: 'Score is high but the feature feels broken.', fix: 'Your golden set is too easy or unrepresentative. Sample 20 cases from production logs that you have NOT seen before; score them; if those drop, your golden set was the problem.' },
          { issue: 'Judge gives every case a 5/5.', fix: 'Reanchor the rubric. Add explicit "what 1/5 looks like" and "what 3/5 looks like" examples. Judges fail open without anchors.' },
          { issue: 'Eval costs are absurd.', fix: 'Use Promptfoo prompt caching, run the eval on a 10-case smoke set per PR, and run the full set nightly. Most pre-merge signals come from the smoke set anyway.' },
          { issue: 'CI flakes intermittently.', fix: 'You probably have temperature > 0 on the model under test. Either set temperature to 0 for evaluation runs OR run the eval N times and use the median score.' }
        ]
      },

      'ship-rag-system': {
        slug: 'ship-rag-system',
        title: 'Ship a production RAG system in one weekend',
        outcome: 'A working RAG system over your own corpus: chunking, hybrid retrieval, reranking, deployment. Eval-gated; ready for users on Monday.',
        prereqs: [
          'A corpus of 100-100,000 documents (PDFs, Markdown, HTML)',
          'API keys for an LLM (Anthropic / OpenAI / Gemini) and an embedding model (Cohere / OpenAI)',
          'A vector database (pgvector for simple, Qdrant for self-hosted, Pinecone for managed)',
          'Python 3.11+ environment with poetry or uv'
        ],
        timeEstimate: '6-8 hours over a weekend',
        conceptsTouched: ['retrieval-augmented-generation-rag', 'chunking', 'semantic-chunking', 'hybrid-search', 'cross-encoder', 'rrf', 'faithfulness', 'evaluation-eval'],
        steps: [
          {
            n: 1,
            title: 'Parse and chunk the corpus',
            body: [
              'Use Unstructured.io for broad format support:',
              { code: 'from unstructured.partition.auto import partition\nelements = partition(filename=path)\ntext_blocks = [el.text for el in elements if el.text.strip()]' },
              'Apply semantic chunking. Markdown files: split at headers; PDFs: split at section boundaries with 50-token overlap.',
              'Aim for 400-600 tokens per chunk. Run a quick eval later to tune.'
            ],
            checkpoint: 'You have a list of clean text chunks with source metadata (file, page, section).'
          },
          {
            n: 2,
            title: 'Embed and index',
            body: [
              'Pick a strong embedding model. In 2026, Cohere embed-v3 or OpenAI text-embedding-3-large are reasonable defaults:',
              { code: 'from cohere import Client\nco = Client()\nembeddings = co.embed(texts=[c.text for c in chunks], model="embed-v3.0", input_type="search_document").embeddings' },
              'Index in pgvector for simplicity:',
              { code: 'CREATE TABLE chunks (id SERIAL PRIMARY KEY, content TEXT, metadata JSONB, embedding vector(1024));\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);' },
              'Bulk insert; verify via a sample query.'
            ],
            checkpoint: 'A query embedding returns plausibly-relevant chunks.'
          },
          {
            n: 3,
            title: 'Add hybrid search',
            body: [
              'Vector search alone misses exact-match queries (codes, names, IDs). Add BM25.',
              'For pgvector: pair with PostgreSQL full-text search:',
              { code: 'ALTER TABLE chunks ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector(\'english\', content)) STORED;\nCREATE INDEX ON chunks USING GIN (tsv);' },
              'Run both queries; combine via Reciprocal Rank Fusion:',
              { code: 'def rrf(rank_lists, k=60):\n    scores = {}\n    for rl in rank_lists:\n        for rank, doc_id in enumerate(rl):\n            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank)\n    return sorted(scores.items(), key=lambda x: -x[1])' }
            ],
            checkpoint: 'Hybrid retrieval returns at least one good chunk for every test query, including ones with rare exact-match terms.'
          },
          {
            n: 4,
            title: 'Add a reranker',
            body: [
              'Retrieval gives you 50 candidates; the model needs the top 5. Use a cross-encoder reranker:',
              { code: 'from cohere import Client\nco = Client()\nresults = co.rerank(model="rerank-3.5", query=query, documents=[c.text for c in candidates], top_n=5)' },
              'Or use bge-reranker-large open-weight if you want to self-host. Reranking gives 5-15 point quality improvement on hard queries.'
            ],
            checkpoint: 'For 10 test questions, the top-5 reranked chunks are clearly the right context.'
          },
          {
            n: 5,
            title: 'Generate answers with citations',
            body: [
              'Pass the top-5 chunks to the LLM with explicit instructions to cite:',
              { code: 'system = """Answer the question using only the provided context. Cite each claim as [source].\nIf the context does not contain the answer, say so explicitly."""\n\ncontext = "\\n\\n".join(f"[{i+1}] {c.text}" for i, c in enumerate(top_chunks))\nuser = f"Context:\\n{context}\\n\\nQuestion: {query}"' },
              'Use structured output mode for parseable answer + citations if your downstream needs structured data.'
            ],
            checkpoint: 'Answer includes inline [N] citations that match the actual sources.'
          },
          {
            n: 6,
            title: 'Build a 50-question eval set',
            body: [
              'Pull 50 representative queries from real or expected production traffic. For each, document the expected answer and the source chunks that should be retrieved.',
              'Score with two LLM-as-judge metrics: faithfulness (is every claim in the answer grounded?) and answer relevancy (does it address the question?).',
              'Use Promptfoo to wire this into a CI gate. Pass threshold: faithfulness >= 0.92, answer relevancy >= 0.85 on the eval set.'
            ],
            checkpoint: 'Promptfoo eval runs in under 5 minutes; you have a baseline score; CI fails if either threshold drops.'
          },
          {
            n: 7,
            title: 'Deploy',
            body: [
              'Wrap the pipeline in FastAPI or a similar framework. Stream responses for UX. Add request logging (with PII redaction) to a Postgres or ClickHouse table for later analysis.',
              'Deploy to Fly.io, Render, or your existing platform. Configure environment variables for API keys; never commit them.',
              'Add a small frontend (Next.js, Streamlit) that streams answers with citation links. Citations should link back to source PDFs or documents.'
            ],
            checkpoint: 'Live URL accepts queries and returns streamed answers with clickable citations.'
          }
        ],
        whatNext: 'Iterate on chunking and the eval set as users send real queries. Add agentic RAG for multi-hop questions. Layer in user feedback (thumbs up/down) and feed it into a curated eval growth process.',
        commonFailures: [
          { issue: 'Faithfulness is high but answer relevancy is low.', fix: 'Your retrieval is precise but missing context. Increase top-K before reranking, or add query expansion to broaden the candidate pool.' },
          { issue: 'Faithfulness is low; the model invents claims.', fix: 'Make the no-answer path explicit in the system prompt: "If the context does not contain the answer, respond: The context does not contain this information." Most hallucinations come from the model not knowing what to do when context is insufficient.' },
          { issue: 'Costs are high.', fix: 'Cache long static prompts, use Haiku-tier for routine queries, only escalate to Opus on complex multi-hop questions. Combine with batch API for offline processing.' },
          { issue: 'Reranker is the latency bottleneck.', fix: 'Reduce candidates from 50 to 30; use a smaller rerank model; or skip reranking when retrieval scores are very confident.' }
        ]
      },

      'ai-coding-tool-team-rollout': {
        slug: 'ai-coding-tool-team-rollout',
        title: 'Roll out AI coding tools to a 50-person engineering team',
        outcome: 'A working AI-coding stack adopted across the team, measured productivity outcomes, and governance that satisfies security and compliance.',
        prereqs: [
          'Engineering team of ~10-200 people',
          'Buy-in from engineering leadership and security',
          'Budget for tools (~$40-80/seat/month for Cursor or equivalent)',
          'Existing CI/CD and code-review infrastructure'
        ],
        timeEstimate: '6-8 weeks from kickoff to broad adoption',
        conceptsTouched: ['ai-coding-agent', 'pair-programming-with-ai', 'cursor', 'claude-code', 'github-copilot', 'the-ai-is-junior-dev-review-discipline', 'token-cost-for-coding-agents'],
        steps: [
          {
            n: 1,
            title: 'Pilot with 5-10 senior engineers',
            body: [
              'Pick engineers who are AI-curious but skeptical. Give them Cursor Pro, Claude Code, and Claude Pro for 4 weeks. Bi-weekly check-ins.',
              'Have each pilot engineer track: hours saved per week (rough self-report), example wins, example failures. Capture verbatim quotes for later use.',
              'After 4 weeks, the pilot engineers either become advocates or vetoes. Trust their judgment; do not roll out tools that the most-respected engineers reject.'
            ],
            checkpoint: 'Pilot engineers can answer "would you keep using this if we took it away?" with informed yes or no.'
          },
          {
            n: 2,
            title: 'Establish the review discipline',
            body: [
              'Document the "AI is junior dev" rule: every AI-generated diff gets reviewed before merge. No exceptions, even for trivial changes.',
              'Add a CONTRIBUTING.md note: "If your PR description includes AI-generated content, mark it with [AI-assisted]. Reviewers apply standard scrutiny." This sets norms without prohibiting use.',
              'Train reviewers on common AI failure modes: invented APIs, mishandled edge cases, fabricated tests. Include specific examples from your codebase.'
            ],
            checkpoint: 'Every engineer can articulate: "I review AI-generated code; I catch wrong code more often than I expect to."'
          },
          {
            n: 3,
            title: 'Set up shared infrastructure',
            body: [
              'For Cursor/Claude Code: ship a project-level CLAUDE.md to every active repo. It encodes voice, style, security rules, architecture conventions. Engineers inherit it on every session.',
              'Sample CLAUDE.md headings: "Voice / style", "Tools available", "Naming conventions", "Test expectations", "Architecture rules", "Security rules", "Things future-you will forget".',
              'For shared Skills: create .claude/skills/ in repos for team-specific patterns (test generation, migration scripts, deploy procedures). Skills compound over time.'
            ],
            checkpoint: 'A new engineer joining gets the team CLAUDE.md and shared Skills automatically; ramp-up time drops measurably.'
          },
          {
            n: 4,
            title: 'Wire security and governance',
            body: [
              'Add PreToolUse hooks for safety: block destructive commands (rm -rf, force-push to main) unless explicitly approved. Hook scripts live in .claude/hooks/ and run on every tool invocation.',
              'Configure Cursor Privacy Mode for sensitive repos: prevents code from being used in vendor training. For Anthropic API: enterprise tier has no-training defaults.',
              'Review the vendor\'s data handling: where does code go, how long is it stored, who can access it? Document for the security review pack.'
            ],
            checkpoint: 'Security has reviewed and approved; governance docs exist; no engineer is bypassing controls.'
          },
          {
            n: 5,
            title: 'Roll out to the broader team',
            body: [
              'Launch with a 30-minute onboarding session: how to install, the team CLAUDE.md, the review rule, common failure modes, where to ask for help.',
              'Provide tier choices: Cursor Pro for IDE-resident, Claude Code for terminal/agentic work, Claude Pro for general assistance. Most engineers want 1-2 tools; do not force one.',
              'Pair new adopters with pilot engineers for the first week. The pilot engineers become the local SMEs; informal mentoring beats formal training.'
            ],
            checkpoint: '70%+ of the team active in tooling within 4 weeks of broad rollout. Adoption rate is the leading indicator.'
          },
          {
            n: 6,
            title: 'Measure and iterate',
            body: [
              'Adopt DX Core 4 measurement: track PR throughput, time to first commit on new work, hours estimated saved (calibrated). Compare to the prior 6-month baseline.',
              'Run quarterly retrospectives with the team. What is working? What is not? Which workflows are AI-driven, which stay manual?',
              'Expect the productivity curve to ramp over 6-9 months as workflows redesign around AI. Per McKinsey: workflow redesign is the largest correlate of EBIT impact.'
            ],
            checkpoint: 'You can present quantitative ROI to leadership: PR throughput up X%, hours saved Y per engineer per week.'
          }
        ],
        whatNext: 'Expand to autonomous background agents (Devin, background coding agent) for routine bug fixes and dependency updates. Build internal Skills libraries that compound across teams.',
        commonFailures: [
          { issue: 'Adoption stalls at 30%.', fix: 'Investigate. Often the holdouts have legitimate concerns (poor performance on their stack, security worries). Address specifically; do not push.' },
          { issue: 'AI-assisted PRs get rubber-stamped.', fix: 'Reinforce review discipline. Audit a sample of merged AI PRs; surface real bugs you find back to the team. Visibility creates rigor.' },
          { issue: 'Costs balloon.', fix: 'Audit per-engineer usage. Power users may be running unbounded autonomous agents; cap their daily spend. Most heavy use is legitimate; the 1-2 outliers are usually the issue.' },
          { issue: 'Team complains AI suggestions are bad on our codebase.', fix: 'Improve the project CLAUDE.md. Vague CLAUDE.md produces vague suggestions; specific rules and examples produce specific helpful suggestions.' }
        ]
      },

      'local-first-personal-knowledge-stack': {
        slug: 'local-first-personal-knowledge-stack',
        title: 'Build a local-first personal knowledge stack',
        outcome: 'A privacy-respecting personal AI stack: vault + local model + retrieval + capture pipeline. Compounds over years; portable across tool changes.',
        prereqs: [
          'Personal Mac, Linux desktop, or Windows machine',
          'Willingness to invest 2-4 hours setup and ongoing 30 min/week maintenance',
          'Optional: hardware budget $1K-12K depending on scale',
          'Existing notes (optional; the stack works for new users too)'
        ],
        timeEstimate: '4 hours initial setup; productive within a week',
        conceptsTouched: ['local-first-ai', 'vault-layer', 'obsidian', 'ollama', 'smart-connections-plugin', 'markdown-as-universal-format', 'capture-layer', 'the-hybrid-stack-pattern'],
        steps: [
          {
            n: 1,
            title: 'Create your Obsidian vault',
            body: [
              'Install Obsidian (free, cross-platform). Create a new vault on local disk: ~/Documents/Vault or similar.',
              'Choose folder structure (PARA is a good default): Projects, Areas, Resources, Archive. Add Inbox for new captures.',
              'Set up bidirectional links and the graph view in core settings. Markdown files live on disk; you can always migrate to another tool later.'
            ],
            checkpoint: 'You can create a note, link to another note, see the link as a backlink on the linked note.'
          },
          {
            n: 2,
            title: 'Set up capture flow',
            body: [
              'On phone: use Apple Notes or Drafts as quick-capture; sync to Obsidian via iCloud Drive or Drafts actions.',
              'On Mac: use Obsidian directly, or Drafts with an action sending to Obsidian Inbox.',
              'For voice memos: capture on phone, transcribe with Whisper.cpp on Mac later. Save transcripts to Obsidian Inbox.',
              'The principle: capture must be friction-free. Filing happens in weekly review, not at capture time.'
            ],
            checkpoint: 'Capture-to-vault round trip works; you have notes accumulating in Inbox.'
          },
          {
            n: 3,
            title: 'Install Ollama for local AI',
            body: [
              'Download Ollama (one-click installer for Mac, Windows, Linux). Pull a model that fits your hardware:',
              { code: '# Mac with 32GB unified memory:\nollama pull qwen2.5:32b\n\n# Mac Studio M3 Ultra:\nollama pull qwen2.5:72b\n\n# Mac Mini M4 Pro 64GB:\nollama pull qwen2.5:14b' },
              'Test it:',
              { code: 'ollama run qwen2.5:32b "What is the capital of France?"' },
              'Ollama exposes a REST API at localhost:11434; other tools connect to it.'
            ],
            checkpoint: 'Local model responds to prompts in reasonable time (5-50 tok/s depending on hardware).'
          },
          {
            n: 4,
            title: 'Add Smart Connections to Obsidian',
            body: [
              'Install Smart Connections plugin in Obsidian. Configure it to use Ollama as the local LLM and a local embedding model (nomic-embed-text or similar).',
              'Index your vault. For 1000 notes, expect 5-10 minutes; for 10000+, plan for an hour.',
              'Test the AI search: "summarize my notes on X." The plugin retrieves relevant notes and the local model synthesizes.',
              'Privacy posture: nothing leaves your machine. Embeddings, retrieval, generation all local.'
            ],
            checkpoint: 'You can ask vault-grounded questions and get coherent answers from your own data.'
          },
          {
            n: 5,
            title: 'Establish weekly review',
            body: [
              'Set a recurring 30-minute weekly review. Process Inbox: file each note into PARA folders, link to related notes, archive obsolete material.',
              'Distill: pick 1-3 notes that have accumulated context across the week. Refine them into evergreen notes (Andy Matuschak\'s term): atomic, concept-oriented, refined over time.',
              'Use the AI assistant during review: "what did I think about X last month?" Surface forgotten material; integrate it into current notes.'
            ],
            checkpoint: 'After 4 weekly reviews, the vault feels organized; the AI search returns useful results because of compounding structure.'
          },
          {
            n: 6,
            title: 'Add hybrid stack for hard tasks',
            body: [
              'Local handles 80% of knowledge work. For frontier-grade tasks (complex synthesis, novel research, agentic coding), route to Claude or GPT.',
              'Pattern: a manual flag. If the task involves sensitive data, stay local. If it does not and needs frontier capability, copy-paste to Claude / Cursor / Claude Code.',
              'Optional: install LiteLLM gateway with explicit per-task routing. Most users do not need this complexity.'
            ],
            checkpoint: 'You know when to use local (private, routine) vs cloud (frontier, sensitive-OK).'
          }
        ],
        whatNext: 'Expand to always-on capture (Granola for meetings, voice memos for ideas). Add Khoj or AnythingLLM for richer cross-platform access. Eventually: build personal Skills and automations that compound your knowledge work.',
        commonFailures: [
          { issue: 'Vault becomes a graveyard.', fix: 'You are filing too aggressively. Capture in Inbox; only file when you know what bucket it belongs in. Most notes do not deserve files; they deserve archive or delete.' },
          { issue: 'AI search returns mostly noise.', fix: 'Your vault is too sparse or too noisy. Either build it up via consistent capture for 4-6 weeks, or trim aggressively to high-signal notes.' },
          { issue: 'Local model is too slow.', fix: 'Your model is too big for your hardware. Drop one tier (32B -> 14B; 72B -> 32B). Quality is still good; latency improves.' },
          { issue: 'Your vault gets disorganized.', fix: 'PARA is a starting structure, not a religion. Adjust it to your workflow. The system that works is the one you actually use.' }
        ]
      },

      'enterprise-ai-governance-program': {
        slug: 'enterprise-ai-governance-program',
        title: 'Stand up an enterprise AI governance program',
        outcome: 'An auditable AI governance program meeting EU AI Act, NIST AI RMF, and ISO 42001 requirements. Aligned across compliance, security, engineering, and product.',
        prereqs: [
          'Enterprise organization with material AI deployments',
          'Sponsor at the executive level (CIO, CTO, CAIO, or Chief Compliance Officer)',
          'Compliance team with regulatory experience',
          'Engineering team with AI-system delivery expertise'
        ],
        timeEstimate: '12-18 months from kickoff to certification',
        conceptsTouched: ['eu-ai-act', 'nist-ai-rmf', 'iso-iec-42001', 'aims', 'ai-bom', 'model-card', 'three-lines-of-defense', 'workflow-redesign', 'sovereign-ai'],
        steps: [
          {
            n: 1,
            title: 'Identify the in-scope AI inventory',
            body: [
              'Catalog every AI system in production: customer-facing, internal-facing, agentic. Include shadow IT (departmental Copilot deployments, ChatGPT-via-personal-account use).',
              'Classify each by EU AI Act risk tier: Unacceptable (banned), High-risk (heavy obligations), Limited-risk (transparency only), Minimal-risk (unregulated).',
              'Estimate effort per tier: high-risk systems will dominate the program. Most enterprise AI lands in high-risk (employment, customer decisions, lending, etc.) or limited-risk (chatbots).'
            ],
            checkpoint: 'You have a complete AI inventory with risk-tier classification and rough effort estimates per system.'
          },
          {
            n: 2,
            title: 'Stand up the AI Center of Excellence',
            body: [
              'Hub-and-spoke is the dominant 2026 model: central CoE owns standards, infrastructure, governance; embedded engineers in BUs build products on the CoE\'s platform.',
              'Sizing: 15-50 person CoE for a 5K-50K-person enterprise. Roles: platform engineering, governance, eval/safety, advisory. The CoE does not build all AI products; it enables BUs to build correctly.',
              'Hire or designate a Chief AI Officer reporting to CEO/COO with authority over policy, vendor selection, and major deployments. Without authority, the CoE becomes symbolic.'
            ],
            checkpoint: 'Reporting structure, hiring plan, and budget approved. CoE has authority to set policy and approve / block deployments.'
          },
          {
            n: 3,
            title: 'Author the AIMS (AI management system)',
            body: [
              'An AIMS is the documented system that ISO 42001 certifies: AI policy, risk management, lifecycle controls, competence, incident management, audit.',
              'Most large organizations extend their existing ISO 27001/9001 system rather than building a parallel AIMS. The overlap is substantial.',
              'Output: AI policy document (10-30 pages), risk management procedure, lifecycle controls (data, model, deployment, monitoring), training records, incident response plan, audit and review schedule.'
            ],
            checkpoint: 'AIMS documents reviewed and signed by leadership; ready for ISO 42001 readiness assessment.'
          },
          {
            n: 4,
            title: 'Build the documentation factory',
            body: [
              'For every high-risk system: model card (training, capabilities, limitations), data card (provenance, composition, biases), AIIA (AI impact assessment), DPIA (where personal data is processed), FRIA (where high-risk per EU AI Act).',
              'Tooling: maintain these as Markdown in a documentation repo, version-controlled. Auto-generate AI BOMs from CI pipelines.',
              'For vendor-provided models: cite vendor system cards in your own AIIA. Many obligations can be satisfied via vendor documentation; you supplement with deployment-specific material.'
            ],
            checkpoint: 'Every in-scope production AI system has the four required documents. New deployments cannot ship without the documentation pack.'
          },
          {
            n: 5,
            title: 'Deploy three lines of defense',
            body: [
              'Line 1: model owners. Each model has a documented owner who maintains it operationally. Daily monitoring, change management, performance management.',
              'Line 2: independent validation. A separate team reviews methodology, tests assumptions, signs off before deployment and at defined intervals (annually for high-risk; quarterly for tier-1).',
              'Line 3: internal audit. Reviews whether the validation process operates effectively. Not always a separate team; often a quarterly or annual sample audit.',
              'Operational pattern from SR 11-7 (banking model risk): now applied to AI systems in regulated industries.'
            ],
            checkpoint: 'High-risk models have documented owners, validation reports, and audit trails. Operating cadence is established.'
          },
          {
            n: 6,
            title: 'Establish AI literacy',
            body: [
              'EU AI Act Article 4 requires staff AI literacy proportional to role. Live since February 2025; non-trivial enforcement risk if missing.',
              'Tiered training: 30 min general awareness for all staff, 4 hours for product teams using AI, 2 days deep for engineers building AI. Document who took what; refresh annually.',
              'Practical content: what AI is and is not, the company\'s AI policy, common failure modes, when to escalate, where to find support.'
            ],
            checkpoint: 'Training program ships, all staff have completed at least baseline, records demonstrate compliance.'
          },
          {
            n: 7,
            title: 'Wire procurement and vendor management',
            body: [
              'Standardize vendor assessment: data handling, security certifications, compliance, SLAs, IP indemnification, model snapshot pinning, computer-use / agent permissions.',
              'For multi-vendor strategy: deploy a unified gateway (LiteLLM, Portkey) so vendor swaps are config changes, not rewrites.',
              'For sensitive workloads: evaluate sovereign options (Anthropic Sovereign, Azure Government, on-prem deployments). Procurement runs years; start sovereign discussions early if your sector requires it.'
            ],
            checkpoint: 'Standard vendor scorecard, gateway in place, sovereign deployments scoped if needed.'
          },
          {
            n: 8,
            title: 'Audit and certify',
            body: [
              'Internal readiness assessment: walk every requirement of ISO 42001, EU AI Act, NIST AI RMF (or your governing frameworks). Identify gaps; close them in priority order.',
              'External certification: engage an accredited certification body for ISO 42001. Initial audit takes 3-6 months from engagement to certification.',
              'EU AI Act: conformity assessment (self-assessment for most; third-party for high-risk in safety-critical sectors). Document; submit to EU database where required.',
              'Annual maintenance: surveillance audits, regulatory updates, internal audit cycle. AI governance is an ongoing program, not a one-shot.'
            ],
            checkpoint: 'ISO 42001 certified; EU AI Act conformity assessed; annual cycle established.'
          }
        ],
        whatNext: 'Once mature, the program becomes a competitive advantage in B2B procurement: customers ask for ISO 42001 evidence, you have it. Expand to industry-specific certifications (HITRUST for healthcare, FedRAMP for government).',
        commonFailures: [
          { issue: 'CoE has no authority.', fix: 'Stop everything. A symbolic CoE produces theatre and frustration. Get the executive sponsor to formally delegate decision-making, or do not stand it up.' },
          { issue: 'Documentation drifts from reality.', fix: 'Auto-generate where possible (AI BOM from CI). Manual docs need quarterly review; without it, they decay into compliance theatre.' },
          { issue: 'Engineers bypass governance.', fix: 'Make the governance path easier than the bypass. If filing the AIIA takes 4 hours and the bypass takes 5 minutes, engineers will bypass.' },
          { issue: 'Regulators ask questions you cannot answer.', fix: 'Run mock audits annually. The first time a regulator asks is not the time to discover gaps.' }
        ]
      },

      'ship-a-voice-agent': {
        slug: 'ship-a-voice-agent',
        title: 'Ship a voice agent in one weekend',
        outcome: 'A working voice-agent prototype with sub-800ms round-trip, deployable to a public URL, handling a bounded task end-to-end.',
        prereqs: ['Basic JavaScript / Node', 'Anthropic API key', 'Deepgram API key (free tier)', 'Cartesia API key (free tier)'],
        conceptsTouched: ['voice-agent-architecture', 'vad', 'speech-to-text-stt', 'text-to-speech-tts', 'deepgram', 'cartesia', 'latency'],
        timeEstimate: '6-10 hours over a weekend',
        steps: [
          { n: 1, title: 'Define the bounded task', body: 'Voice agents fail when scope is unbounded. Pick something specific: book a haircut, take a pizza order, schedule a 30-minute meeting. Write the happy-path script first. List 3-5 fallback cases. The narrower the task, the better the agent.', checkpoint: 'Script + fallback list in a doc.' },
          { n: 2, title: 'Wire VAD + STT first', body: 'Use Silero VAD in the browser (or Deepgram\'s native endpointing). Stream microphone audio to Deepgram. Verify you get partial transcripts within ~200ms and final transcripts on end-of-utterance.', checkpoint: 'Console-log a real-time transcript as you speak.' },
          { n: 3, title: 'Add Claude in the middle', body: 'On each final transcript, call Claude Haiku 4.5 with a tight system prompt (the script from step 1) and a small conversation history. Stream the response. Set max_tokens low (~200) for speed.', checkpoint: 'Print the Claude response to console for each user utterance.' },
          { n: 4, title: 'Add TTS', body: 'Pipe the Claude streamed response into Cartesia\'s streaming TTS. Play audio chunks as they arrive. End-to-end round-trip should be ~500-700ms now.', checkpoint: 'You speak; agent responds out loud; both feel snappy.' },
          { n: 5, title: 'Handle barge-in', body: 'If the user starts speaking while the agent is talking, cancel the TTS playback. Cartesia supports stream cancellation; wire VAD to detect user speech during agent output.', checkpoint: 'Speak over the agent; the agent stops mid-sentence.' },
          { n: 6, title: 'Add a state machine', body: 'For the bounded task, build a tiny state machine: greeting > gather info > confirm > action. Use Claude tool-use to populate slots; track which slots are filled in app state. When all filled, take the action.', checkpoint: 'Demo run booking the haircut / placing the order.' },
          { n: 7, title: 'Deploy + share', body: 'Deploy to Vercel or Cloudflare Pages. Add a one-button public demo. Record a 30s screen capture; post on Twitter / Hacker News / r/LocalLLaMA. Watch the failure modes; iterate.', checkpoint: 'Public demo URL + first 5 real users.' }
        ],
        whatNext: 'Add multi-turn memory (Mem0), add a CRM lookup tool, add transcript audit logs, add a human-handoff path. Or pick a new bounded task and ship a second one.',
        commonFailures: [
          { issue: 'Latency feels off.', fix: 'Profile per-stage. The leak is usually LLM (use Haiku + prompt caching), TTS (Cartesia streaming), or network buffering (region-pin everything).' },
          { issue: 'Hallucinations on slot values.', fix: 'Use Claude tool-use to extract slots into a typed Pydantic-like schema; never extract from free text in your code.' },
          { issue: 'Agent talks over itself.', fix: 'Implement true streaming TTS cancellation; do not let two utterances overlap.' },
          { issue: 'Edge cases break the script.', fix: 'Add 3-5 explicit fallback prompts in the system message. "If the user is angry, transfer to human" is a slot.' }
        ]
      },

      'spin-up-a-personal-evals-pipeline': {
        slug: 'spin-up-a-personal-evals-pipeline',
        title: 'Spin up a personal evals pipeline in 4 hours',
        outcome: 'A working eval pipeline against any LLM prompt you care about, with golden set, LLM-as-judge alignment, and CI gating.',
        prereqs: ['Python or Node', 'Anthropic or OpenAI API key', 'A specific prompt you want to improve'],
        conceptsTouched: ['evaluation-eval', 'golden-set', 'llm-as-judge', 'aligning-llm-as-judge-to-human-judgment', 'faithfulness', 'promptfoo', 'error-analysis-axial-coding'],
        timeEstimate: '4 hours, one sitting',
        steps: [
          { n: 1, title: 'Pick one prompt, one task', body: 'Pick the most-used prompt in your workflow. Examples: "classify customer support tickets," "summarize a meeting transcript," "extract invoice fields." Write down the input/output contract in one sentence.', checkpoint: 'One-sentence task definition.' },
          { n: 2, title: 'Build a golden set of 30', body: 'Pull 30 real input examples from production logs (or generate them carefully if no logs yet). For each, write the ideal output. 30 is the floor; 50-100 is better. Save as CSV or JSON.', checkpoint: 'golden-set.csv with 30 input -> expected-output pairs.' },
          { n: 3, title: 'Install Promptfoo', body: 'npm install -g promptfoo. Write a promptfooconfig.yaml with your prompt template, your model, and your golden set as test cases. Use deterministic assertions first (substring, regex, equals).', checkpoint: 'npx promptfoo eval runs without error; passes baseline cases.' },
          { n: 4, title: 'Run baseline', body: 'See your pass rate. Usually it surprises you. Spend 20 minutes reading the failures (axial coding). Tag each failure mode in a column ("missed sarcasm", "wrong category", "fabricated field").', checkpoint: 'Pass rate + 1-line tag per failure.' },
          { n: 5, title: 'Add LLM-as-judge for fuzzy cases', body: 'For subjective outputs (summaries, rewrites), substring matching is too rigid. Add a Promptfoo llm-rubric assertion. Use Claude Opus as the judge model with an explicit rubric (1-5 scale, criteria spelled out).', checkpoint: 'LLM-as-judge scores on subjective cases.' },
          { n: 6, title: 'Align the judge', body: 'On 20 cases, score yourself (1-5) AND ask the judge to score. Compute correlation. If correlation is poor, iterate the rubric (more concrete criteria, examples, anti-examples). Re-run until human-judge agreement is high.', checkpoint: 'Spearman correlation 0.7+ on the alignment set.' },
          { n: 7, title: 'Wire CI gating', body: 'In your repo, add a GitHub Action that runs Promptfoo on every PR. Fail the build if pass rate drops more than 5% vs the deployed baseline. Now every prompt edit goes through evals before merging.', checkpoint: 'A PR that breaks pass rate fails CI.' }
        ],
        whatNext: 'Expand the golden set to 100+. Add second-opinion judge (a smaller model voting). Add drift detection: run evals daily; alert on regression. Migrate to Braintrust if you outgrow Promptfoo\'s UX.',
        commonFailures: [
          { issue: 'Golden set is synthetic, not real.', fix: 'Pull from production traces. Synthetic seeds the bias; production reveals the long tail.' },
          { issue: 'Judge agrees with itself, not the user.', fix: 'Always calibrate. Compute correlation against human scores; iterate the rubric until correlation is high.' },
          { issue: 'CI gates flake.', fix: 'LLM-as-judge has variance. Run each case 3x and take the mode; or use temperature-0 deterministic judges.' },
          { issue: 'Team treats evals as theater.', fix: 'Make the gate matter: failed evals block merges. If the gate is suggestion-only, it becomes wallpaper.' }
        ]
      }

    };
