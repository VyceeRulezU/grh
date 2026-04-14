
const COMMON_WORDS = new Set(['governance', 'public', 'resource', 'hub', 'report', 'document', 'framework', 'policy', 'strategy']);

function scoreResult(result, queryKeywords) {
  const title = (result.title || "").toLowerCase();
  const body = (result.description || result.summary || "").toLowerCase();
  
  let score = 0;
  let uniqueMatches = 0;

  queryKeywords.forEach(keyword => {
    const kw = keyword.toLowerCase();
    let kwMatched = false;
    
    const weightMulti = COMMON_WORDS.has(kw) ? 0.5 : 2.5;

    const titleRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const titleOccurrences = (title.match(titleRegex) || []).length;
    if (titleOccurrences > 0) {
      score += titleOccurrences * 100 * weightMulti;
      kwMatched = true;
    }

    const bodyRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const bodyOccurrences = (body.match(bodyRegex) || []).length;
    if (bodyOccurrences > 0) {
      score += bodyOccurrences * 5 * weightMulti;
      kwMatched = true;
    }

    if (kwMatched) uniqueMatches++;
  });

  const combinedKeywords = queryKeywords.join(' ').toLowerCase();
  if (title.includes(combinedKeywords)) {
    score += 500;
  }

  if (uniqueMatches > 1) {
    score *= (uniqueMatches * 1.5);
  }

  if (uniqueMatches === queryKeywords.length && queryKeywords.length > 1) {
    score += 300;
  }

  return score;
}

const docs = [
  { id: 1, title: "Key Principles of Good Governance", description: "This document outlines the core principles including accountability and transparency." },
  { id: 2, title: "SDN-FOSTER_Gas_FlareTracker Governance Report", description: "Technical report on gas flaring governance in the oil sector." },
  { id: 3, title: "Kaduna Primary Health Care Reforms", description: "A study on governance in the health sector of Kaduna state." }
];

const query = ["Principles", "Governance"];

console.log(`Query: ${query.join(' ')}`);
docs.forEach(doc => {
  const score = scoreResult(doc, query);
  console.log(`Doc ID: ${doc.id} | Score: ${score.toFixed(0)} | Title: ${doc.title}`);
});
