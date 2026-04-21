import { describe, it, expect } from 'vitest';
import { scoreResult } from '../../src/shared/utils/scoring.js';

describe('scoreResult', () => {
  const mockDoc = {
    title: 'Governance Resource Hub',
    description: 'A comprehensive guide to governance and public resources.'
  };

  it('calculates a higher score for title matches', () => {
    const scoreTitle = scoreResult(mockDoc, ['Governance']);
    const scoreBody = scoreResult(mockDoc, ['Comprehensive']);
    expect(scoreTitle).toBeGreaterThan(scoreBody);
  });

  it('weights common words less than specific keywords', () => {
    const commonScore = scoreResult(mockDoc, ['Governance']); // 'governance' is in COMMON_WORDS
    const specificScore = scoreResult(mockDoc, ['Guide']); // 'guide' is not in COMMON_WORDS
    
    // Title match for 'Governance' (100 * 0.5 = 50) + Body match (5 * 0.5 = 2.5) = 52.5
    // Title match for specific would be (100 * 2.5 = 250) but 'guide' is not in title.
    // If we assume a keyword that is in the title but not common:
    const specificMock = { title: 'Transparency Report', description: '' };
    const scoreCommon = scoreResult(specificMock, ['Report']); // common
    const scoreSpecific = scoreResult(specificMock, ['Transparency']); // specific
    expect(scoreSpecific).toBeGreaterThan(scoreCommon);
  });

  it('applies multipliers for multiple unique matches', () => {
    const multiScore = scoreResult(mockDoc, ['Governance', 'Resource']);
    const singleScore = scoreResult(mockDoc, ['Governance']);
    expect(multiScore).toBeGreaterThan(singleScore * 2);
  });

  it('handles empty inputs gracefully', () => {
    expect(scoreResult({}, ['test'])).toBe(0);
    expect(scoreResult({ title: 'test' }, [])).toBe(0);
  });
});
