// Custom client-side heuristic analyzer for AI detection

// ─── Common AI transition words / phrases ───
const AI_TRANSITIONS = [
    'however', 'moreover', 'furthermore', 'additionally', 'consequently',
    'nevertheless', 'nonetheless', 'in conclusion', 'in summary', 'therefore',
    'thus', 'hence', 'accordingly', 'subsequently', 'in addition',
    'as a result', 'on the other hand', 'in contrast', 'similarly',
    'notably', 'specifically', 'essentially', 'ultimately', 'overall',
    'it is important to note', 'it is worth noting', 'in other words',
    'for instance', 'for example', 'in particular', 'as mentioned',
    'delve', 'tapestry', 'multifaceted', 'nuanced', 'landscape',
    'leverage', 'utilize', 'facilitate', 'encompass', 'underscore',
];

const AI_STARTERS = [
    'this is', 'it is', 'there are', 'there is', 'in today',
    'in the', 'one of', 'the importance', 'when it comes',
    'as we', 'in this', 'by understanding', 'by leveraging',
    'with the', 'from the', 'through the', 'understanding the',
    'however', 'moreover', 'furthermore', 'additionally', 'consequently',
    'nevertheless', 'nonetheless', 'therefore', 'thus', 'hence',
    'accordingly', 'subsequently', 'similarly', 'notably', 'specifically',
    'essentially', 'ultimately', 'overall', 'in conclusion', 'in summary',
    'in addition', 'as a result', 'on the other',
];

export interface FlaggedSentence {
    text: string;
    confidence: number;
    reasons: string[];
}

export interface MetricData {
    score: number;
    [key: string]: any;
}

export interface AIResult {
    score: number;
    verdict: 'human' | 'mixed' | 'ai';
    verdictLabel: string;
    metrics: Record<string, MetricData>;
    highlightedSentences: FlaggedSentence[];
}

export function analyzeOfflineAI(text: string): AIResult | null {
    if (!text || text.length < 100) return null;

    const cleaned = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    // Improved sentence regex that handles punctuation better
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [];
    
    // Require at least 3 sentences
    if (sentences.length < 3) return null;

    const burstiness = analyzeBurstiness(sentences);
    const vocabulary = analyzeVocabularyRichness(text);
    const openers = analyzeSentenceOpeners(sentences);
    const wordLength = analyzeWordLengthUniformity(text);

    // Weighted average
    const weights = { burstiness: 0.40, vocabulary: 0.20, openers: 0.25, wordLength: 0.15 };
    
    let overallScore = Math.round(
        (burstiness.score * weights.burstiness) +
        (vocabulary.score * weights.vocabulary) +
        (openers.score * weights.openers) +
        (wordLength.score * weights.wordLength)
    );

    // Hard override if structure is too robotic
    if (burstiness.score >= 85) {
        overallScore = Math.max(overallScore, 75);
    }

    let verdict: 'human' | 'mixed' | 'ai';
    let verdictLabel: string;
    
    if (overallScore >= 60) {
        verdict = 'ai';
        verdictLabel = 'Likely AI';
    } else if (overallScore >= 30) {
        verdict = 'mixed';
        verdictLabel = 'Mixed';
    } else {
        verdict = 'human';
        verdictLabel = 'Likely Human';
    }

    const flagged = highlightSuspiciousSentences(sentences);

    return {
        score: overallScore,
        verdict,
        verdictLabel,
        metrics: {
            burstiness,
            vocabulary,
            openers,
            wordLength
        },
        highlightedSentences: flagged
    };
}

function analyzeBurstiness(sentences: string[]): MetricData {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const currentCoV = mean > 0 ? (stdDev / mean) : 0;

    let aiScore = 15;
    if (currentCoV < 0.15) aiScore = 95;
    else if (currentCoV < 0.25) aiScore = 80;
    else if (currentCoV < 0.35) aiScore = 60;
    else if (currentCoV < 0.50) aiScore = 35;

    return { score: aiScore, coeffOfVariation: currentCoV };
}

function analyzeVocabularyRichness(text: string): MetricData {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (words.length < 20) return { score: 50 };

    const uniqueWords = new Set(words);
    const ttr = uniqueWords.size / words.length;
    const correctedTTR = ttr * Math.sqrt(words.length / 100);
    const normalizedTTR = Math.min(correctedTTR, 1);

    let aiScore = 15;
    if (normalizedTTR < 0.35) aiScore = 85;
    else if (normalizedTTR < 0.45) aiScore = 70;
    else if (normalizedTTR < 0.55) aiScore = 50;
    else if (normalizedTTR < 0.65) aiScore = 30;

    return { score: aiScore, ttr: normalizedTTR };
}

function analyzeSentenceOpeners(sentences: string[]): MetricData {
    const firstWords = sentences.map(s => s.split(/\s+/)[0]?.toLowerCase() || '');
    const firstTwoWords = sentences.map(s => s.split(/\s+/).slice(0, 2).join(' ').toLowerCase());

    const uniqueFirstWords = new Set(firstWords);
    const openerDiversity = uniqueFirstWords.size / Math.max(1, firstWords.length);

    let aiStarterCount = 0;
    for (const starter of firstTwoWords) {
        if (AI_STARTERS.some(as => starter.startsWith(as))) aiStarterCount++;
    }
    const aiStarterRatio = aiStarterCount / Math.max(1, sentences.length);

    let aiScore = 15;
    if (openerDiversity < 0.3 || aiStarterRatio > 0.6) aiScore = 90;
    else if (openerDiversity < 0.45 || aiStarterRatio > 0.4) aiScore = 70;
    else if (openerDiversity < 0.6 || aiStarterRatio > 0.25) aiScore = 50;
    else if (openerDiversity < 0.75) aiScore = 30;

    return { score: aiScore, openerDiversity, aiStarterRatio };
}

function analyzeWordLengthUniformity(text: string): MetricData {
    const words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    if (words.length < 30) return { score: 50 };

    const lengths = words.map(w => w.length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const cov = mean > 0 ? stdDev / mean : 0;

    let aiScore = 15;
    if (cov < 0.35) aiScore = 85;
    else if (cov < 0.42) aiScore = 65;
    else if (cov < 0.50) aiScore = 45;
    else if (cov < 0.60) aiScore = 30;

    return { score: aiScore, cov };
}

function highlightSuspiciousSentences(sentences: string[]): FlaggedSentence[] {
    const flagged: FlaggedSentence[] = [];

    for (const sentence of sentences) {
        const lower = sentence.toLowerCase();
        let suspiciousness = 0;
        const reasons: string[] = [];

        // Transition check
        let transInSentence = 0;
        for (const t of AI_TRANSITIONS) {
            if (lower.includes(t)) transInSentence++;
        }
        
        if (transInSentence >= 2) {
            suspiciousness += 40;
            reasons.push('High density of transition words');
        } else if (transInSentence === 1) {
            suspiciousness += 10;
        }

        // Sentence opener
        const firstTwo = lower.split(/\s+/).slice(0, 2).join(' ');
        if (AI_STARTERS.some(s => firstTwo.startsWith(s))) {
            suspiciousness += 25;
            reasons.push('Common AI sentence starter pattern');
        }

        // Long sentences with overly stable structure
        const wordCount = sentence.split(/\s+/).length;
        if (wordCount > 25 && (!sentence.includes(',') && !sentence.includes('?'))) {
            suspiciousness += 20;
            reasons.push('Unusually stable long structure');
        }
        
        // Repetitive structure or vocabulary
        const words = lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
        const unique = new Set(words);
        if (words.length > 10 && (unique.size / words.length) < 0.5) {
            suspiciousness += 20;
            reasons.push('Repetitive vocabulary mapping');
        }

        if (suspiciousness >= 45) {
            flagged.push({
                text: sentence,
                confidence: Math.min(suspiciousness, 95),
                reasons
            });
        }
    }

    return flagged.sort((a, b) => b.confidence - a.confidence);
}
