// Auto-extracted from course.html.legacy by build/extract.mjs.
// Do not edit by hand. Re-run the script to refresh.

export const TOOLKIT = {
      templates: [
        {
          slug: 'claude-md-solo',
          title: 'CLAUDE.md (solo dev)',
          description: 'A solo-developer constitution. Fork into your project at .claude/CLAUDE.md.',
          content: `# Project: {project name}

## Voice and style
- Crisp, technical. No filler praise. No "let me explain."
- Plain hyphens, never em dashes.
- Show, don't narrate.

## Tools available
- bash, git, npm
- pytest for Python tests, vitest for JS tests
- curl for HTTP probes, jq for JSON

## Naming conventions
- snake_case for Python identifiers, camelCase for JS/TS.
- Test files mirror source: src/foo.ts -> tests/foo.test.ts.
- Constants are SCREAMING_SNAKE_CASE.

## Test expectations
- TDD-strict on data-shape changes.
- Tests are required when the change touches user-facing logic.
- Skip tests for one-off scripts or migrations.

## Architecture rules
- Separation of concerns: data, logic, view stay in their lanes.
- Prefer composition over inheritance.
- No global state outside the configured store.
- Long functions are a smell; split when they cross 60 lines.

## Repo conventions
- src/ holds source; tests/ mirrors structure.
- docs/ holds longform notes; ADR.md tracks decisions.
- Build output is gitignored.

## Security rules
- Never commit secrets, .env, credentials, API keys.
- Never use eval() or new Function() on user input.
- Block destructive shell commands in PreToolUse hooks.

## Things future-you will forget
- The build system uses {tool}; don't ask Claude to migrate it.
- The {service} integration is fragile; test before refactoring.
- {project-specific gotcha}
`
        },
        {
          slug: 'skill-generator',
          title: 'SKILL.md (Generator pattern)',
          description: 'Generator pattern: skill outputs to a quality template. Best for code review, rubric-based output.',
          content: `---
name: code-security-review
description: Reviews staged code changes for OWASP Top 10 issues, secret leakage, and unsafe patterns. Outputs a structured review using the rubric in guide.md. Use when the user runs /security-review or asks for security feedback on staged changes.
---

# Code security review

## Rules
- Read every file the user staged in the current branch.
- Score against the rubric in guide.md without skipping categories.
- Quote line numbers for every flagged item.
- Do NOT modify code; review only.
- Do NOT use for green-field architecture review (use the architect skill).

## Steps
1. Run \`git diff --cached\` to identify staged changes.
2. For each file, walk through the rubric in guide.md.
3. Render output using the template in output_style.md.
4. End with a summary table: BLOCKERS / MAJOR / MINOR counts.

## Example
Input: A staged change to src/auth/session.ts that decodes a JWT.

Output:
\`\`\`
## src/auth/session.ts

[BLOCKER] line 14: jwt.verify uses the unverified algorithm field. Hard-code 'HS256'.
[MAJOR]   line 22: session token logged at info level. Move to debug or redact.
[MINOR]   line 7:  imports unused 'crypto-js'. Remove.

Summary: 1 BLOCKER, 1 MAJOR, 1 MINOR
\`\`\`
`
        },
        {
          slug: 'skill-inversion',
          title: 'SKILL.md (Inversion pattern)',
          description: 'Inversion pattern: ask all required questions BEFORE execution begins. Best for full-stack feature builds.',
          content: `---
name: full-stack-feature-build
description: Implements a new full-stack feature end-to-end. Asks all required questions before writing code so nothing is assumed. Use when the user says "build me a feature" or "add X to the app." Do NOT use for bug fixes (use the bugfix skill) or refactors (use the refactor skill).
---

# Full-stack feature build

## Rules
- ASK every question in the Steps list before writing any code.
- One question at a time. Wait for answer before next.
- If the user resists answering, restate why the question matters and ask once more before falling back to a defensible default.
- Do NOT proceed to implementation while any required question is unanswered.

## Steps
1. What does success look like? (One sentence, user-facing.)
2. Which existing files does this touch? (Paths, comma-separated.)
3. What new files are required? (Paths, comma-separated.)
4. Does this need a database migration? (Yes / No / Not sure)
5. What's the auth boundary? (Public / authenticated / role-gated)
6. What's the test bar? (Unit / unit + integration / unit + integration + e2e)
7. What's the rollback plan?

After all 7 are answered, output a one-page implementation plan and ask "Approve?" before any file writes.

## Example
User: "Build me a feature that lets logged-in users export their conversation history as JSON."

Skill asks:
- What does success look like? -> "User clicks a button on the settings page and downloads conversations.json containing all their threads."
- Which files touched? -> "src/routes/settings.tsx"
- New files? -> "src/api/export.ts"
- Migration? -> "No"
- Auth? -> "Authenticated"
- Test bar? -> "Unit + integration"
- Rollback? -> "Feature flag, revert if 5xx > 0.1%"

Then proposes the plan and waits for approval.
`
        },
        {
          slug: 'skill-chained-inversion',
          title: 'SKILL.md (Chained Inversion pattern)',
          description: 'Chained Inversion: ask, do, ask again. Best for refactors where each step depends on the prior outcome.',
          content: `---
name: large-refactor
description: Walks the user through a multi-step refactor where each step's plan depends on the previous step's outcome. Use for refactors crossing 5+ files or restructuring directory layouts. Do NOT use for one-shot edits (use the edit skill) or when the plan is fully known up front (use the inversion pattern instead).
---

# Large refactor

## Rules
- Each step has its own question. Do not jump ahead.
- After each step, restate the new state of the code before asking the next question.
- If the user changes mind mid-stream, accept it; do not lecture.

## Steps
1. ASK: What's the goal of this refactor in one sentence?
   DO:  Read the affected files. Summarize current state in 5 bullet points.

2. ASK: Of these 5 observations, which are the load-bearing ones to preserve?
   DO:  Identify 1-3 chunks that can move independently.

3. ASK: Which chunk do we move first?
   DO:  Make the move. Run tests. Report results.

4. ASK: Did the test results match expectations?
   DO:  If yes, commit and proceed to next chunk. If no, diagnose first.

Repeat steps 3-4 until all chunks are moved.

5. ASK: Final state matches goal?
   DO:  Final commit. Generate a one-paragraph summary for the PR description.

## Example
Goal: "Extract the auth middleware from monorepo-A into a shared package."

Step 1 surfaces 5 observations. User picks 2 as load-bearing. Step 2 identifies 3 chunks (interceptor, store, types). Step 3 moves the types first. Tests pass. Step 4 confirms. Loop continues until all 3 chunks are extracted.
`
        },
        {
          slug: 'plugin-json',
          title: 'plugin.json',
          description: 'Manifest for distributing skills, agents, hooks, and commands as a plugin.',
          content: `{
  "name": "@yourorg/your-plugin",
  "version": "0.1.0",
  "description": "What this plugin gives you in one sentence.",
  "license": "MIT",
  "author": "{your name} <{email}>",
  "homepage": "https://github.com/yourorg/your-plugin",
  "claude": {
    "skills": [
      "skills/code-security-review/SKILL.md",
      "skills/full-stack-feature-build/SKILL.md"
    ],
    "agents": [
      "agents/code-reviewer.md",
      "agents/test-runner.md"
    ],
    "hooks": {
      "PreToolUse": [
        ".claude/hooks/block-destructive.sh"
      ],
      "PostToolUse": [
        ".claude/hooks/lint-on-write.sh"
      ]
    },
    "commands": [
      "commands/security-review.md"
    ]
  },
  "engines": {
    "claude-code": ">=1.0.0"
  }
}
`
        }
      ],
      generators: [
        {
          slug: 'claude-md',
          title: 'CLAUDE.md generator',
          description: 'Paste this into Claude. It interviews you about your project and outputs a custom CLAUDE.md.',
          content: `You are an expert at writing CLAUDE.md files for Claude Code projects. A CLAUDE.md is a per-project constitution that Claude reads at the start of every session. Your job is to interview the user about their project and output a CLAUDE.md tailored to it.

INTERVIEW

Ask these questions one at a time. Wait for an answer before the next. If the user gives a vague answer, ask a clarifying follow-up before moving on.

1. What is the project? One sentence: what it is and who uses it.
2. What language(s) and runtime(s)? (e.g. TypeScript on Node 20, Python 3.12 on Linux.)
3. What is the architecture in one sentence? (e.g. "Next.js app with Postgres backend and a Redis cache.")
4. What are the absolute non-negotiable rules? (Code style, security, performance, conventions.)
5. What tools does Claude have access to? (bash, git, docker, pytest, npm, specific MCP servers.)
6. What are the test expectations? (TDD-strict, write tests when reasonable, skip tests on prototypes.)
7. What naming conventions? (snake_case, camelCase, kebab-case for which contexts.)
8. What architectural rules matter? (Separation of concerns, no global state, prefer composition, etc.)
9. What does the repo look like? (src/, tests/, docs/, etc.)
10. What security rules MUST never be violated? (No secrets, no eval, no destructive commands.)
11. What are 3 things future-you will forget about this project? (The hidden gotchas, the fragile parts, the "we tried X and it didn't work" lessons.)

OUTPUT

After all questions are answered, output a CLAUDE.md following this exact structure:

\`\`\`
# Project: {project name}

## Voice and style
{from question 4}

## Tools available
{from question 5}

## Naming conventions
{from question 7}

## Test expectations
{from question 6}

## Architecture rules
{from question 8}

## Repo conventions
{from question 9}

## Security rules
{from question 10}

## Things future-you will forget
{from question 11}
\`\`\`

CONSTRAINTS

- Plain hyphens only, never em dashes.
- Crisp, no filler praise.
- The output MUST be valid markdown the user can paste directly into .claude/CLAUDE.md.

Do NOT use this generator for: SKILL.md files (use the SKILL.md generator), plugin.json (use the plugin generator), or generic README files.

Begin by asking question 1.
`
        },
        {
          slug: 'skill-generator-pattern',
          title: 'SKILL.md generator (Generator pattern)',
          description: 'Generates a SKILL.md following the Generator pattern: skill outputs to a quality template.',
          content: `You are an expert at writing Claude Skills using the Generator pattern. A Generator skill produces output that conforms to a specific quality template. Best uses: code review, structured analysis, rubric-based assessment.

INTERVIEW

Ask these questions one at a time. Wait for each answer.

1. What is the skill's job in one sentence? (e.g. "Review staged code changes for security issues.")
2. What's the trigger? When should Claude auto-invoke this? (Phrasings the user might type.)
3. What's the negative trigger? When should this skill explicitly NOT fire?
4. What's the output template? Paste 1-2 examples of the ideal output.
5. What rules must the skill follow during execution? (Read these first, never modify these, score against this rubric.)
6. What inputs does the skill need? (Files, repo state, environment.)
7. Are there 1-2 worked examples we should include in the SKILL.md?

OUTPUT

After answers, output a SKILL.md following this structure:

\`\`\`
---
name: {kebab-case-id}
description: {one paragraph: what + when to invoke + when NOT to invoke; 2-3 sentences}
---

# {Title Case name}

## Rules
- {bullet from question 5}
- ...
- Do NOT use for {negative trigger from question 3}.

## Steps
1. {step 1}
2. {step 2}
...

## Example
{worked example from question 7}
\`\`\`

CONSTRAINTS

- The description in the YAML frontmatter is the most important field. It controls when Claude invokes the skill. Make it specific.
- Negative triggers ("Do NOT use for...") should be explicit.
- Plain hyphens only, never em dashes.

Do NOT use this generator for: Inversion-pattern skills (use the Inversion generator), Chained-Inversion skills (use the Chained Inversion generator).

Begin by asking question 1.
`
        },
        {
          slug: 'skill-generator-inversion',
          title: 'SKILL.md generator (Inversion pattern)',
          description: 'Generates a SKILL.md following the Inversion pattern: ask all required questions BEFORE execution.',
          content: `You are an expert at writing Claude Skills using the Inversion pattern. An Inversion skill asks every required question BEFORE execution begins, so nothing is assumed. Best uses: full-stack feature builds, app scaffolding, anything where missing one input cascades into rework.

INTERVIEW

Ask these questions one at a time. Wait for each answer.

1. What is the skill's job in one sentence?
2. What's the trigger? When should Claude auto-invoke this?
3. What's the negative trigger? When should this skill NOT fire?
4. What are the required inputs? List every question that MUST be answered before execution.
5. For each required input, what's a defensible default if the user resists answering?
6. What's the post-interview output? (A plan? A confirmation prompt? A direct execution?)
7. Are there 1-2 worked examples?

OUTPUT

\`\`\`
---
name: {kebab-case-id}
description: {when to invoke + when NOT to invoke; mention "asks all required questions before execution"}
---

# {Title Case name}

## Rules
- ASK every question in Steps before writing any code.
- One question at a time. Wait for answer.
- If the user resists, restate why the question matters and ask once more before falling back to a defensible default.
- Do NOT proceed while any required question is unanswered.
- Do NOT use for {negative trigger}.

## Steps
1. {required input #1}
2. {required input #2}
...

After all questions are answered, output {step 6 output} and ask "Approve?" before any file writes.

## Example
{worked example showing the question-then-answer flow}
\`\`\`

CONSTRAINTS

- One question per step. No combined "Q1 and also Q2" steps.
- The skill should be uncomfortably patient: better to ask one extra question than to assume.
- Plain hyphens only.

Do NOT use this generator for: Generator-pattern skills, Chained-Inversion-pattern skills.

Begin by asking question 1.
`
        },
        {
          slug: 'skill-generator-chained-inversion',
          title: 'SKILL.md generator (Chained Inversion pattern)',
          description: 'Generates a SKILL.md following the Chained Inversion pattern: ask, do, ask again, do again.',
          content: `You are an expert at writing Claude Skills using the Chained Inversion pattern. A Chained Inversion skill alternates between asking the user a question and doing work, where each step's plan depends on the previous step's outcome. Best uses: large refactors, migrations, multi-step research where the next move depends on what we just learned.

INTERVIEW

Ask these questions one at a time.

1. What is the skill's job in one sentence?
2. What's the trigger?
3. What's the negative trigger?
4. What's the loop structure? (Ask question, do work, ask follow-up question based on result, do work, etc.)
5. How does the skill know when to stop the loop? (User confirms goal met, or some other terminator.)
6. What's the final output? (A summary? A commit? A PR description?)
7. Are there 1-2 worked examples showing the loop in action?

OUTPUT

\`\`\`
---
name: {kebab-case-id}
description: {when to invoke; mention "alternates between asking and doing"}
---

# {Title Case name}

## Rules
- Each step has its own question. Do not jump ahead.
- After each step, restate the new state of the code/situation before asking the next question.
- If the user changes mind mid-stream, accept it; do not lecture.
- Do NOT use for {negative trigger}.

## Steps
1. ASK: {first question}
   DO:  {first action based on answer}
2. ASK: {follow-up based on step 1's outcome}
   DO:  {action}
...

Repeat steps {N}-{M} until {terminator from question 5}.

Final step:
ASK: {final confirmation question}
DO:  {final output from question 6}

## Example
{worked example showing the loop unrolled for a concrete scenario}
\`\`\`

CONSTRAINTS

- The asking and doing alternation is the whole point. If you can specify the plan up front, use the Inversion pattern instead.
- Plain hyphens only.

Do NOT use this generator for: Generator-pattern skills, Inversion-pattern skills.

Begin by asking question 1.
`
        }
      ]
    };

export const BUILDER_SECTIONS = [
      {
        key: 'voice',
        title: 'Voice and style',
        prompt: 'Pick the tone you want Claude to use.',
        kind: 'radio',
        options: [
          { value: 'minimalist', label: 'Minimalist', text: '- Crisp, technical. No filler praise.\n- Short answers when the question is short.\n- Plain hyphens, never em dashes.' },
          { value: 'verbose',    label: 'Verbose',    text: '- Explain reasoning step by step.\n- Quote relevant code when proposing changes.\n- Plain hyphens, never em dashes.' },
          { value: 'formal',     label: 'Formal',     text: '- Professional register; no slang.\n- Use full sentences in PR descriptions.\n- Plain hyphens, never em dashes.' },
          { value: 'casual',     label: 'Casual',     text: '- Talk like a peer engineer in a 1:1.\n- Use shorthand where it speeds the conversation.\n- Plain hyphens, never em dashes.' }
        ]
      },
      {
        key: 'tools',
        title: 'Tools available',
        prompt: 'Check every tool the agent should assume it can call.',
        kind: 'checkbox',
        options: [
          { value: 'bash', label: 'bash' },
          { value: 'git', label: 'git' },
          { value: 'docker', label: 'docker' },
          { value: 'npm', label: 'npm / pnpm / yarn' },
          { value: 'pytest', label: 'pytest' },
          { value: 'curl', label: 'curl' },
          { value: 'jq', label: 'jq' }
        ]
      },
      {
        key: 'naming',
        title: 'Naming conventions',
        prompt: 'Pick one. Override per-language in the custom field.',
        kind: 'radio',
        options: [
          { value: 'snake', label: 'snake_case (Python-style)', text: '- snake_case for identifiers, SCREAMING_SNAKE for constants.' },
          { value: 'camel', label: 'camelCase (JS/TS-style)', text: '- camelCase for identifiers, PascalCase for types.' },
          { value: 'kebab', label: 'kebab-case (file paths)', text: '- kebab-case for file paths and CLI flags.' },
          { value: 'mixed', label: 'mixed (per-language)', text: '- snake_case in Python, camelCase in JS/TS, kebab-case for file paths.' }
        ]
      },
      {
        key: 'tests',
        title: 'Test expectations',
        prompt: 'Pick how strict the test bar is.',
        kind: 'radio',
        options: [
          { value: 'tdd',     label: 'TDD-strict',     text: '- Write a failing test before any production change.\n- Tests are required even for trivial bug fixes.' },
          { value: 'pragma',  label: 'Tests when reasonable', text: '- Add tests when the change touches user-facing logic or data shape.\n- Skip tests for one-off scripts.' },
          { value: 'skip',    label: 'Skip tests on prototypes', text: '- Tests are required only after the feature graduates from prototype.' }
        ]
      },
      {
        key: 'architecture',
        title: 'Architecture rules',
        prompt: 'Check every rule that applies.',
        kind: 'checkbox',
        options: [
          { value: 'soc',     label: 'Separation of concerns: data, logic, view stay in their lanes.' },
          { value: 'compose', label: 'Prefer composition over inheritance.' },
          { value: 'noglobal', label: 'No global state outside the configured store.' },
          { value: 'shortfn', label: 'Long functions are a smell; split when they cross 60 lines.' },
          { value: 'single',  label: 'Single source of truth: derive, do not duplicate.' }
        ]
      },
      {
        key: 'repo',
        title: 'Repo conventions',
        prompt: 'Free-form. Document where things live.',
        kind: 'textarea',
        defaultText: '- src/ holds source; tests/ mirrors structure.\n- docs/ holds longform notes; ADR.md tracks decisions.\n- Build output is gitignored.'
      },
      {
        key: 'security',
        title: 'Security rules',
        prompt: 'Check every rule the agent must never violate.',
        kind: 'checkbox',
        options: [
          { value: 'nosecrets', label: 'Never commit secrets, .env, credentials, API keys.' },
          { value: 'noeval',    label: 'Never use eval() or new Function() on user input.' },
          { value: 'nodest',    label: 'Block destructive shell commands in PreToolUse hooks.' },
          { value: 'noforce',   label: 'Never git push --force without explicit confirmation.' },
          { value: 'noinjection', label: 'Sanitize all SQL inputs and never use string concatenation for queries.' }
        ]
      },
      {
        key: 'gotchas',
        title: 'Things future-you will forget',
        prompt: 'Project-specific reminders. The hidden gotchas, the fragile parts, "we tried X and it did not work."',
        kind: 'textarea',
        defaultText: '- The build system uses {tool}; do not migrate it without owner sign-off.\n- The {service} integration is fragile; test before refactoring.\n- {project-specific gotcha}'
      }
    ];
