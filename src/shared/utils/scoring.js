/**
 * Weighted scoring algorithm to prioritize relevant documents based on keyword matching.
 * 
 * @param {Object} result - The document or resource object (expects title and description).
 * @param {Array} queryKeywords - List of keywords from the user's search query.
 * @returns {number} The calculated relevance score.
 */
export function scoreResult(result, queryKeywords) {
  if (!result || !queryKeywords || queryKeywords.length === 0) return 0;

  // Words that appear frequently and should be weighted less to prioritize specific terms
  const COMMON_WORDS = new Set(['governance', 'policy', 'resource', 'hub', 'nigeria', 'report', 'reform']);
  
  let score = 0;
  let matchesFound = 0;

  const title = (result.title || '').toLowerCase();
  const description = (result.description || '').toLowerCase();

  queryKeywords.forEach(kw => {
    const keyword = kw.toLowerCase();
    if (!keyword) return;

    const isCommon = COMMON_WORDS.has(keyword);
    const weight = isCommon ? 0.5 : 2.5;

    // Strategic weight for Title matches (highly significant)
    if (title.includes(keyword)) {
      score += 100 * weight;
      matchesFound++;
    }

    // Body weight (supporting context)
    if (description.includes(keyword)) {
      score += 5 * weight;
      matchesFound++;
    }
  });

  // Multipliers for variety: If multiple terms match, the document is likely highly relevant
  if (matchesFound > 1) {
    score *= (1 + (matchesFound * 0.2));
  }

  return score;
}
