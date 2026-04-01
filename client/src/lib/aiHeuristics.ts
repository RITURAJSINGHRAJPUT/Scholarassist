// Simplified Sentence-Averaged AI Detection Engine

const AI_TRANSITIONS = new Set([
    'however', 'moreover', 'furthermore', 'additionally', 'consequently',
    'nevertheless', 'nonetheless', 'therefore', 'thus', 'hence',
    'accordingly', 'subsequently', 'in addition', 'as a result',
    'notably', 'specifically', 'essentially', 'ultimately', 'overall',
    'delve', 'tapestry', 'multifaceted', 'nuanced', 'landscape'
]);

const AI_STARTERS = new Set([
    'this is', 'it is', 'there are', 'there is', 'in today',
    'one of', 'as we', 'in this', 'by understanding', 'however',
    'moreover', 'furthermore', 'additionally', 'ultimately', 'in conclusion'
]);

const HUMAN_CONTRACTIONS = new Set([
    "don't", "doesn't", "didn't", "can't", "couldn't", "won't", "wouldn't",
    "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't",
    "it's", "i'm", "you're", "we're", "they're", "i've", "i'll", "that's"
]);

export interface MetricData {
    score: number;
    label: string;
    [key: string]: any;
}

export interface SentenceAnalysis {
    text: string;
    score: number;
    label: 'Human' | 'Mixed' | 'AI';
    reasons: string[];
}

export interface AIResult {
    score: number; // 0-100 Average
    confidenceLevel: 'Low' | 'Medium' | 'High';
    verdict: 'Likely Human' | 'Mixed/Uncertain' | 'Likely AI';
    sentenceAnalysis: SentenceAnalysis[];
}

export function analyzeOfflineAI(text: string): AIResult | null {
    if (!text || text.trim().length < 50) return null;

    const cleaned = text.replace(/\s+/g, ' ').trim();
    // Rigorous sentence splitting
    const sentences = cleaned.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(s => s.length > 5) || [];
    
    if (sentences.length < 3) return null;

    // ─── Sentence-Level Analysis Loop ───
    const analysisList: SentenceAnalysis[] = [];
    const recentLengths: number[] = [];
    const recentWords: string[] = [];

    let totalScore = 0;

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const lower = sentence.toLowerCase();
        const words = lower.replace(/[^\w\s']/g, '').split(/\s+/).filter(w => w.length > 0);
        
        if (words.length < 3) continue;

        let sentenceScore = 50; // Neutral Baseline
        const reasons: string[] = [];

        // 1. Perplexity (Word Uniqueness Ratio inside the sentence)
        const uniqueWords = new Set(words).size;
        const uniquenessRatio = uniqueWords / words.length;
        if (uniquenessRatio > 0.9 && words.length > 10) {
            sentenceScore -= 15;
            reasons.push('High vocabulary uniqueness');
        } else if (uniquenessRatio < 0.6 && words.length > 15) {
            sentenceScore += 20;
            reasons.push('Low vocabulary uniqueness (Repetitive)');
        }

        // 2. Sentence Length Variation vs Preceding Average
        const currentLen = words.length;
        if (recentLengths.length > 0) {
            const avgRecentLen = recentLengths.reduce((a, b) => a + b, 0) / recentLengths.length;
            const diff = Math.abs(currentLen - avgRecentLen) / Math.max(avgRecentLen, 1);
            
            if (diff > 0.6) {
                // Highly varied length from previous sentences (Human)
                sentenceScore -= 20;
                reasons.push('Strong sentence length variation');
            } else if (diff < 0.1 && currentLen > 15) {
                // Almost identical length to previous sequences
                sentenceScore += 25;
                reasons.push('Highly uniform structure to surrounding text');
            }
        }
        recentLengths.push(currentLen);
        if (recentLengths.length > 4) recentLengths.shift(); // Keep window of last 4

        // 3. Human Signals (Contractions & Informal phrasing)
        let hasContraction = false;
        words.forEach(w => { if (HUMAN_CONTRACTIONS.has(w)) hasContraction = true; });
        if (hasContraction) {
            sentenceScore -= 35;
            reasons.push('Informal human signals detected');
        }

        // 4. Overused AI Transitions & Starters
        const firstTwo = words.slice(0, 2).join(' ');
        if (Array.from(AI_STARTERS).some(s => firstTwo.startsWith(s))) {
            sentenceScore += 30;
            reasons.push('Generic AI sentence opener');
        }

        let transHits = 0;
        Array.from(AI_TRANSITIONS).forEach(t => { if (lower.includes(t)) transHits++; });
        if (transHits >= 2) {
            sentenceScore += 30;
            reasons.push('High transition word density');
        }

        // Bound sentence score
        sentenceScore = Math.max(0, Math.min(100, Math.round(sentenceScore)));
        
        let label: 'Human' | 'Mixed' | 'AI';
        if (sentenceScore > 65) label = 'AI';
        else if (sentenceScore > 35) label = 'Mixed';
        else label = 'Human';

        if (reasons.length === 0) reasons.push('Neutral evaluation');

        analysisList.push({
            text: sentence,
            score: sentenceScore,
            label,
            reasons
        });

        totalScore += sentenceScore;
    }

    if (analysisList.length === 0) return null;

    // ─── Document Level Aggregation ───
    const averageScore = Math.round(totalScore / analysisList.length);

    // Confidence is distance from 50
    const distance = Math.abs(50 - averageScore);
    let confidenceLevel: 'Low' | 'Medium' | 'High';
    if (distance > 30) confidenceLevel = 'High';
    else if (distance > 15) confidenceLevel = 'Medium';
    else confidenceLevel = 'Low';

    let verdict: 'Likely Human' | 'Mixed/Uncertain' | 'Likely AI';
    if (averageScore >= 61) verdict = 'Likely AI';
    else if (averageScore >= 31) verdict = 'Mixed/Uncertain';
    else verdict = 'Likely Human';

    return {
        score: averageScore,
        confidenceLevel,
        verdict,
        sentenceAnalysis: analysisList
    };
}
