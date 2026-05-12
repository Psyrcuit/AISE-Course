// Onboarding data: 12-question placement quiz + role-tailored path recipes.
// Quiz pulls from existing QUIZZES so we don't duplicate content.

import { QUIZZES } from './quizzes.js';
import { shuffleQuestion } from './shuffle.js';

// Slugs we want for the 12-question diagnostic.
// Mix: 4 from M1 (foundations), 4 from M3 (RAG), 3 from M4 (agents), 1 from M5.
const PLACEMENT_SLUGS = [
  'large-language-model-llm', 'token', 'context-window', 'embedding',
  'retrieval-augmented-generation-rag', 'vector-database', 'hybrid-search', 'reranking',
  'ai-agent', 'tool-use', 'mcp',
  'agent-development-kit'
];

/**
 * Returns the 12 placement questions, drawing from QUIZZES.
 * Each entry includes the original concept slug for adaptive scoring.
 */
export function getPlacementQuiz() {
  const out = [];
  for (const slug of PLACEMENT_SLUGS) {
    const qs = QUIZZES[slug];
    if (qs && qs.length) {
      // Shuffle option order per call so the placement quiz can't be
      // gamed by clicking position 1 every time (the source data has
      // 95% of correct answers at that position).
      out.push({ slug, ...shuffleQuestion(qs[0]) });
    }
  }
  return out;
}

/**
 * Score the placement quiz answers. Returns {score, total, level, recommendedModules}.
 * answers is an array of {slug, choice} aligned with getPlacementQuiz() ordering.
 */
export function scorePlacement(quiz, answers) {
  let correct = 0;
  for (let i = 0; i < quiz.length; i++) {
    const a = answers[i];
    if (a && a.choice === quiz[i].correctIndex) correct++;
  }
  const pct = correct / quiz.length;
  let level = 'beginner';
  if (pct >= 0.9) level = 'advanced';
  else if (pct >= 0.6) level = 'intermediate';
  return {
    score: correct,
    total: quiz.length,
    pct,
    level
  };
}

/**
 * Recommend a path (ordered list of module numbers) based on role + goal + level.
 * Heuristic; not personalized beyond these axes.
 */
export function recommendPath({ role, goal, level }) {
  const goalLower = String(goal || '').toLowerCase();

  // Goal keywords drive the dominant theme
  const goalThemes = [];
  if (/rag|retriev|search|vector/.test(goalLower)) goalThemes.push('rag');
  if (/agent|mcp|orchestr|tool/.test(goalLower)) goalThemes.push('agent');
  if (/eval|production|observ|reliab/.test(goalLower)) goalThemes.push('eval');
  if (/local|hosted|sovereign|own/.test(goalLower)) goalThemes.push('local');
  if (/voice|multimodal|audio/.test(goalLower)) goalThemes.push('voice');
  if (/job|interview|career|hire/.test(goalLower)) goalThemes.push('career');
  if (/govern|complian|regulat|enterprise/.test(goalLower)) goalThemes.push('gov');
  if (/cod|engineer|claude code|cursor/.test(goalLower)) goalThemes.push('coding');
  if (/product|design|ux|pattern/.test(goalLower)) goalThemes.push('product');

  // Level-driven baseline modules
  const baseline = level === 'advanced' ? [3, 4, 5, 8] :
                   level === 'intermediate' ? [1, 3, 4] :
                   [1, 2, 3];

  // Theme-driven additions
  const themeModules = [];
  for (const t of goalThemes) {
    if (t === 'rag') themeModules.push(3, 8);
    else if (t === 'agent') themeModules.push(4, 5);
    else if (t === 'eval') themeModules.push(8, 9);
    else if (t === 'local') themeModules.push(7);
    else if (t === 'voice') themeModules.push(6);
    else if (t === 'career') themeModules.push(12);
    else if (t === 'gov') themeModules.push(11);
    else if (t === 'coding') themeModules.push(14, 5);
    else if (t === 'product') themeModules.push(15);
  }

  // Role-driven additions
  if (role === 'leader') themeModules.push(11, 9);
  else if (role === 'career-changer') themeModules.push(12, 14);
  else if (role === 'engineer-leveling-up') themeModules.push(14, 8);

  // Combine, dedupe, preserve order
  const seen = new Set();
  const path = [];
  for (const n of [...baseline, ...themeModules]) {
    if (!seen.has(n) && n >= 1 && n <= 16) {
      seen.add(n);
      path.push(n);
    }
  }
  // Pad with sequential modules until we have at least 5
  for (let n = 1; n <= 16 && path.length < 5; n++) {
    if (!seen.has(n)) { seen.add(n); path.push(n); }
  }
  return path.slice(0, 8);
}

/**
 * Static role descriptions used in the wizard.
 */
export const ROLE_OPTIONS = [
  { value: 'engineer-leveling-up', label: 'Engineer leveling up', desc: 'Adding AI engineering to my existing toolkit.' },
  { value: 'career-changer', label: 'Pursuing AI Engineer / FDE / SE role', desc: 'Career trajectory focus; want interview prep + AI fluency.' },
  { value: 'leader', label: 'Engineering leader / architect', desc: 'Less coding, more decision-making; vocabulary, governance, vendor selection.' },
  { value: 'curious', label: 'Just exploring', desc: 'Gauging the field; no specific outcome yet.' }
];
export const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner', desc: 'New to LLMs.' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Comfortable with basics; built a thing or two.' },
  { value: 'advanced', label: 'Advanced', desc: 'Production experience with LLMs / agents / RAG.' }
];
export const GOAL_SUGGESTIONS = [
  'Ship a RAG system in 30 days',
  'Land an AI Engineer role',
  'Get fluent in agentic systems',
  'Build a personal local AI stack',
  'Architect AI for my enterprise',
  'Pass an AI/ML systems-design interview'
];
