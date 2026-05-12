// Fisher-Yates shuffle for quiz options.
//
// The source data in js/quizzes.js, js/gam-data.js (capstones), and
// js/onboarding-data.js (placement quiz) has 95.5% of correct answers
// at position 1 - a pattern any user picks up after a couple of
// questions and exploits to score 95%+ without reading the prompt.
//
// This helper takes one question, shuffles its options, and remaps the
// correctIndex to the new position. Each call gets a fresh shuffle
// (Math.random based) so:
//   - Two users see different orderings.
//   - The same user re-taking a quiz sees a different ordering.
//   - Within one attempt, callers freeze the shuffled deck once at
//     quiz init so navigating between questions doesn't reshuffle
//     mid-attempt.
//
// Returns a NEW question object; never mutates the source.

export function shuffleQuestion(q) {
  if (!q || !Array.isArray(q.options) || typeof q.correctIndex !== 'number') return q;
  const n = q.options.length;
  // Build an index permutation and apply it to options.
  const indices = [];
  for (let i = 0; i < n; i++) indices.push(i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const newOptions = indices.map(i => q.options[i]);
  const newCorrectIndex = indices.indexOf(q.correctIndex);
  return { ...q, options: newOptions, correctIndex: newCorrectIndex };
}

/**
 * Shuffle a whole deck (array of question objects) AND shuffle each
 * question's options. The deck-level shuffle randomizes question
 * order; the option-level shuffle randomizes answer position. Both
 * are necessary because consecutive concept slugs in quizzes.js tend
 * to ship together and grouping by concept can cluster easy/hard
 * questions in predictable bands.
 */
export function shuffleDeck(questions) {
  const out = (questions || []).map(shuffleQuestion);
  // Fisher-Yates on the deck itself.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
