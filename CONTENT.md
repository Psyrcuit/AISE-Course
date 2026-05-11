# Glossary Source of Truth

**The full ~390 concept glossary lives in `course_master_glossary.md`** in the project root. Read that file in full at session start. This document explains how to interpret it.

---

## Structure

`course_master_glossary.md` is organized into 16 modules. Each module section has the format:

```markdown
## Module N — Module Name (~X concepts)

Brief module intro paragraph.

### Optional subsection header

- **Concept Name** *(aliases)* — Stub one-line definition. → cross-refs.
```

Every concept becomes a per-concept page in `course.html`. The slug for each concept is derived from the concept name: lowercase, spaces to hyphens, alphanumeric only.

Examples:
- "Large Language Model (LLM)" → slug `large-language-model-llm`
- "RAG" → slug `rag`
- "ReAct" → slug `react`

---

## Cross-reference notation

Inside any stub, the pattern `→ Term` or `→ Module N` indicates a cross-reference. The cross-reference engine in `course.html` MUST:

1. Wrap the referenced term in a hyperlink to its home page anchor
2. Resolve the link at runtime
3. Fail loud (console.error + visual indicator in dev) if the target does not exist

The same logic applies to any glossary term mentioned anywhere in any module's prose, in playbooks, in toolkit content, etc. The cross-reference engine is universal.

---

## Module index

| # | Module | Concept count |
|---|---|---|
| 1 | Foundations | ~33 |
| 2 | Prompting Patterns | ~21 |
| 3 | Context Engineering & RAG | ~30 |
| 4 | Agents & MCP | ~25 |
| 5 | The Anthropic Stack | ~25 |
| 6 | Voice & Multimodal | ~14 |
| 7 | Local-First AI & Personal Knowledge Stacks | ~57 |
| 8 | Evals & Observability | ~20 |
| 9 | Deployment, Ops, and Gateways | ~18 |
| 10 | Fine-tuning & Post-training | ~14 |
| 11 | Enterprise Architecture & Governance | ~38 |
| 12 | Career & The Job Market | ~22 |
| 13 | Emerging Directions | ~12 |
| 14 | AI Coding Agents & IDE Integration | ~28 |
| 15 | AI Product Design Patterns | ~24 |
| 16 | Data Engineering for AI | ~25 |
| **Total** | | **~390** |

---

## Phase 1 fleshing priority

Phase 1 fully expands ~50 of the 390 concepts beyond their one-line stub. Pick from these foundational concepts (the rest stay as stub + `[expanding in module fill]` indicator):

### Module 1 (Foundations) — flesh these 12

1. Large Language Model (LLM)
2. Token
3. Tokenization
4. Embedding
5. Embedding model
6. Cosine similarity
7. Context window
8. Self-attention
9. Transformer architecture
10. Inference
11. Temperature
12. Quantization

### Module 3 (Context Engineering & RAG) — flesh these 10

1. Context Engineering
2. Retrieval-Augmented Generation (RAG)
3. Naive RAG vs Advanced RAG
4. Chunking
5. Chunk overlap
6. Vector database
7. HNSW
8. Hybrid search
9. Reranking
10. RRF (Reciprocal Rank Fusion)

### Module 4 (Agents & MCP) — flesh these 10

1. AI agent
2. Agent vs workflow distinction
3. Agentic loop
4. Tool use (function calling)
5. ReAct
6. MCP (Model Context Protocol)
7. MCP server
8. MCP client
9. LangGraph
10. Subagent

### Module 5 (The Anthropic Stack) — flesh these 10

1. Agent Development Kit (the 5-layer system)
2. CLAUDE.md (Memory Layer)
3. Claude Skills (Knowledge Layer)
4. SKILL.md
5. Progressive disclosure
6. Skill design pattern: Generator
7. Skill design pattern: Inversion
8. Hooks (Guardrail Layer)
9. Subagents (Delegation Layer in Anthropic stack)
10. Plugins (Distribution Layer)

### Module 8 (Evals & Observability) — flesh these 5

1. Evaluation (eval)
2. Golden set
3. LLM-as-judge
4. Aligning LLM-as-judge to human judgment
5. RAGAS

### Remaining 3 fleshings — pick from Module 14 (AI Coding Agents)

1. Cursor
2. Claude Code
3. The progressive autonomy ladder

---

## What "fleshed" means

A fleshed concept page contains:

- **Plain-language opener** (1-2 sentences, "what it actually is")
- **Architectural breakdown** (3-5 paragraphs, the deeper how/why)
- **Worked example or visual** (code snippet, diagram, or numbered walkthrough)
- **Cross-references** (auto-linked, plus an explicit "see also" section)
- **Common failures** subsection (1-2 anti-patterns where relevant)
- **Copy-paste deep-dive prompt** (a kickoff prompt for the user to paste into Claude/ChatGPT for further exploration)
- **Quiz placeholder** (structure wired, content `[expanding in module fill]`)
- **Flashcard placeholder** (structure wired, content `[expanding in module fill]`)
- **Notes textarea** (always functional)
- **Save-for-later flag** (always functional)
- **Completion checkbox** (always functional)

A stubbed concept page contains everything in the structure above but with `[expanding in module fill]` markers in place of the prose sections.

---

## Voice for fleshed content

Match `CLAUDE.md` voice exactly: crisp, technical, no em dashes, no filler praise, no "Let me explain..." preamble. Show, don't narrate. Plain hyphens only. Assume a systems-first reader who knows what a function is and has heard most of the buzzwords but is shaky on definitions.
