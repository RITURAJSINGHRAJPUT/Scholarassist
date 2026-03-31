# Ultra-Accuracy Upgrade for Plagiarism Checker

This plan details the steps to transition from "Basic" to "High-Accuracy" (>85%) plagiarism detection for large documents (up to 5,000 words).

## User Review Required

> [!IMPORTANT]
> To achieve 85%+ accuracy, we will increase the scan coverage to approximately 50-60% of the entire document. This means a 5,000-word document will have up to **150 segments checked**. While concurrent processing handles this efficiently, the scan time for very large documents may increase to ~45-60 seconds.

## Proposed Changes

### [Component] Backend: Plagiarism Logic (`plagiarismRoutes.js`)

1.  **Stop-Word Preprocessing**:
    *   Implement a comprehensive list of English stop-words (common words like 'the', 'is', 'at').
    *   Strip these words before similarity calculation to focus on "content signal" rather than grammatical structure. This drastically improves detection of slightly reworded (paraphrased) content.
2.  **Intelligent Selection Heuristic**:
    *   Instead of a simple "step" sampling, I will implement a **Density Ranking**.
    *   Rank all sentences by length and "Information Density" (ratio of unique/long words).
    *   Select the top `maxSentencesToCheck` segments based on this rank. This ensures we are always checking the most likely-to-be-flagged sections.
3.  **High-Coverage Scaling**:
    *   Scaling `maxSentencesToCheck` for 5,000 words to **150 segments**.
    *   Increase concurrency limit from 6 to **10** to maintain performance despite the deeper scan.
4.  **Improved N-Gram Algorithm**:
    *   Tune N-gram size (`n=4` or `n=3`) to better catch fuzzy matches and synonym replacement.

### [Component] Frontend: Analysis UI (`page.tsx`)

1.  **Visual Depth Indicator**: Add a sub-text in the results showing "Scan Depth: Deep (150 segments / 60% coverage)" to build user trust in the accuracy.
2.  **Accuracy Badge**: Add an "85%+ Accuracy Guaranteed" tooltip explaining the concurrent deep-scanning methodology.

## Open Questions

- Should we offer a "Fast VS Deep" toggle? Or should we stay with the "Deep" scan as the default to ensure accuracy as requested? I recommend **Deep as default** for simplicity.

## Verification Plan

### Automated Tests
- Run browser subagent with various "paraphrased" inputs to verify the new similarity threshold works correctly.
- Compare result scores before and after the update for a known plagiarized 5,000-word sample.

### Manual Verification
- Verify the terminal logs reflect the high-concurrency (batches of 10) and correct sampling depth.
