const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Hugging Face Inference API config
const { HfInference } = require('@huggingface/inference');
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const hf = new HfInference(HF_TOKEN);

// File upload config (in-memory for text extraction)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    },
});

// ─── Helper: Extract text from uploaded file ───
async function extractTextFromFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.txt') return file.buffer.toString('utf-8');
    if (ext === '.pdf') {
        const pdfParse = require('pdf-parse');
        return (await pdfParse(file.buffer)).text;
    }
    if (ext === '.docx') {
        const mammoth = require('mammoth');
        return (await mammoth.extractRawText({ buffer: file.buffer })).value;
    }
    throw new Error('Unsupported file type');
}

// ─── Helper: Split text into sentences ───
function splitIntoSentences(text) {
    const cleaned = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned.split(/(?<=[.!?])\s+/).filter(s => s.split(/\s+/).length >= 5);
}

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

// ─── Common AI sentence starters ───
const AI_STARTERS = [
    'this is', 'it is', 'there are', 'there is', 'in today',
    'in the', 'one of', 'the importance', 'when it comes',
    'as we', 'in this', 'by understanding', 'by leveraging',
    'with the', 'from the', 'through the', 'understanding the',
    // Transition starters (strong AI signal)
    'however', 'moreover', 'furthermore', 'additionally', 'consequently',
    'nevertheless', 'nonetheless', 'therefore', 'thus', 'hence',
    'accordingly', 'subsequently', 'similarly', 'notably', 'specifically',
    'essentially', 'ultimately', 'overall', 'in conclusion', 'in summary',
    'in addition', 'as a result', 'on the other',
];

// ════════════════════════════════════════════════════
// METRIC 1: Burstiness (sentence length variation)
// Human writing: high variance in sentence lengths
// AI writing: very uniform sentence lengths
// ════════════════════════════════════════════════════
function analyzeBurstiness(sentences) {
    if (sentences.length < 3) return { score: 50, label: 'Insufficient data' };

    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = mean > 0 ? stdDev / mean : 0;

    // CoV < 0.25 → very uniform (AI-like), CoV > 0.5 → varied (human-like)
    let aiScore;
    if (coeffOfVariation < 0.15) aiScore = 95;
    else if (coeffOfVariation < 0.25) aiScore = 80;
    else if (coeffOfVariation < 0.35) aiScore = 60;
    else if (coeffOfVariation < 0.50) aiScore = 35;
    else aiScore = 15;

    return {
        score: aiScore,
        coeffOfVariation: Math.round(coeffOfVariation * 100) / 100,
        avgSentenceLength: Math.round(mean),
        stdDev: Math.round(stdDev * 10) / 10,
    };
}

// ════════════════════════════════════════════════════
// METRIC 2: Vocabulary Richness (Type-Token Ratio)
// Human writing: richer, more diverse vocabulary
// AI writing: tends to reuse common words
// ════════════════════════════════════════════════════
function analyzeVocabularyRichness(text) {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (words.length < 20) return { score: 50, label: 'Insufficient data' };

    const uniqueWords = new Set(words);
    const ttr = uniqueWords.size / words.length;

    // Corrected TTR (for longer texts, TTR naturally decreases)
    const correctedTTR = ttr * Math.sqrt(words.length / 100);
    const normalizedTTR = Math.min(correctedTTR, 1);

    // Low TTR → AI-like, High TTR → human-like
    let aiScore;
    if (normalizedTTR < 0.35) aiScore = 85;
    else if (normalizedTTR < 0.45) aiScore = 70;
    else if (normalizedTTR < 0.55) aiScore = 50;
    else if (normalizedTTR < 0.65) aiScore = 30;
    else aiScore = 15;

    return {
        score: aiScore,
        ttr: Math.round(ttr * 100) / 100,
        uniqueWords: uniqueWords.size,
        totalWords: words.length,
    };
}

// ════════════════════════════════════════════════════
// METRIC 3: Sentence Opener Diversity
// Human: varied sentence beginnings
// AI: repetitive starters like "The", "It is", "This"
// ════════════════════════════════════════════════════
function analyzeSentenceOpeners(sentences) {
    if (sentences.length < 3) return { score: 50, label: 'Insufficient data' };

    const firstWords = sentences.map(s => s.split(/\s+/)[0]?.toLowerCase());
    const firstTwoWords = sentences.map(s => s.split(/\s+/).slice(0, 2).join(' ').toLowerCase());

    // Count unique first words
    const uniqueFirstWords = new Set(firstWords);
    const openerDiversity = uniqueFirstWords.size / firstWords.length;

    // Check for AI-style starters
    let aiStarterCount = 0;
    for (const starter of firstTwoWords) {
        if (AI_STARTERS.some(as => starter.startsWith(as))) aiStarterCount++;
    }
    const aiStarterRatio = aiStarterCount / sentences.length;

    // Combine signals
    let aiScore;
    if (openerDiversity < 0.3 || aiStarterRatio > 0.6) aiScore = 90;
    else if (openerDiversity < 0.45 || aiStarterRatio > 0.4) aiScore = 70;
    else if (openerDiversity < 0.6 || aiStarterRatio > 0.25) aiScore = 50;
    else if (openerDiversity < 0.75) aiScore = 30;
    else aiScore = 15;

    return {
        score: aiScore,
        openerDiversity: Math.round(openerDiversity * 100) / 100,
        aiStarterRatio: Math.round(aiStarterRatio * 100) / 100,
    };
}

// ════════════════════════════════════════════════════
// METRIC 4: Transition Word Density
// AI over-uses transition words like "However", "Moreover"
// ════════════════════════════════════════════════════
function analyzeTransitionDensity(text) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 30) return { score: 50, label: 'Insufficient data' };

    let transitionCount = 0;
    const foundTransitions = [];

    for (const transition of AI_TRANSITIONS) {
        const regex = new RegExp(`\\b${transition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lower.match(regex);
        if (matches) {
            transitionCount += matches.length;
            foundTransitions.push({ word: transition, count: matches.length });
        }
    }

    const density = transitionCount / (words.length / 100); // per 100 words

    let aiScore;
    if (density > 8) aiScore = 95;
    else if (density > 5) aiScore = 80;
    else if (density > 3) aiScore = 60;
    else if (density > 1.5) aiScore = 35;
    else aiScore = 15;

    return {
        score: aiScore,
        density: Math.round(density * 10) / 10,
        transitionCount,
        topTransitions: foundTransitions.sort((a, b) => b.count - a.count).slice(0, 5),
    };
}

// ════════════════════════════════════════════════════
// METRIC 5: Punctuation Variety
// Human: uses diverse punctuation (?, !, —, ;, :, etc.)
// AI: mostly periods and commas
// ════════════════════════════════════════════════════
function analyzePunctuationVariety(text) {
    if (text.length < 100) return { score: 50, label: 'Insufficient data' };

    const punctuationTypes = {
        periods: (text.match(/\./g) || []).length,
        commas: (text.match(/,/g) || []).length,
        questions: (text.match(/\?/g) || []).length,
        exclamations: (text.match(/!/g) || []).length,
        semicolons: (text.match(/;/g) || []).length,
        colons: (text.match(/:/g) || []).length,
        dashes: (text.match(/[—–-]{2,}|—|–/g) || []).length,
        parentheses: (text.match(/[()]/g) || []).length,
    };

    const totalPunctuation = Object.values(punctuationTypes).reduce((a, b) => a + b, 0);
    const typesUsed = Object.values(punctuationTypes).filter(v => v > 0).length;

    // If almost all punctuation is periods+commas, it's AI-like
    const periodsCommasRatio = totalPunctuation > 0
        ? (punctuationTypes.periods + punctuationTypes.commas) / totalPunctuation
        : 1;

    let aiScore;
    if (typesUsed <= 2 && periodsCommasRatio > 0.95) aiScore = 85;
    else if (typesUsed <= 3 && periodsCommasRatio > 0.9) aiScore = 70;
    else if (typesUsed <= 4) aiScore = 50;
    else if (typesUsed <= 5) aiScore = 30;
    else aiScore = 15;

    return {
        score: aiScore,
        typesUsed,
        periodsCommasRatio: Math.round(periodsCommasRatio * 100) / 100,
    };
}

// ════════════════════════════════════════════════════
// METRIC 6: Word Length Uniformity
// AI produces more uniform word lengths
// Human writing has more variance in word complexity
// ════════════════════════════════════════════════════
function analyzeWordLengthUniformity(text) {
    const words = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    if (words.length < 30) return { score: 50, label: 'Insufficient data' };

    const lengths = words.map(w => w.length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = mean > 0 ? stdDev / mean : 0;

    let aiScore;
    if (coeffOfVariation < 0.35) aiScore = 85;
    else if (coeffOfVariation < 0.42) aiScore = 65;
    else if (coeffOfVariation < 0.50) aiScore = 45;
    else if (coeffOfVariation < 0.60) aiScore = 30;
    else aiScore = 15;

    return {
        score: aiScore,
        avgWordLength: Math.round(mean * 10) / 10,
        coeffOfVariation: Math.round(coeffOfVariation * 100) / 100,
    };
}

// ─── Highlight AI-likely sentences ───
function highlightSuspiciousSentences(sentences) {
    const highlighted = [];

    for (const sentence of sentences.slice(0, 30)) {
        const lower = sentence.toLowerCase();
        let suspiciousness = 0;
        const reasons = [];

        // Check for AI transition overuse within this sentence
        let transInSentence = 0;
        for (const t of AI_TRANSITIONS) {
            if (lower.includes(t)) transInSentence++;
        }
        if (transInSentence >= 2) {
            suspiciousness += 30;
            reasons.push('Multiple AI-typical transitions');
        } else if (transInSentence === 1) {
            suspiciousness += 10;
        }

        // Check for AI starter pattern
        const firstTwo = lower.split(/\s+/).slice(0, 2).join(' ');
        if (AI_STARTERS.some(s => firstTwo.startsWith(s))) {
            suspiciousness += 15;
            reasons.push('Common AI sentence opener');
        }

        // Check for overly long, well-structured sentence (AI tends to write these)
        const wordCount = sentence.split(/\s+/).length;
        if (wordCount > 30 && !sentence.includes('?') && !sentence.includes('!')) {
            suspiciousness += 20;
            reasons.push('Unusually structured long sentence');
        }

        // Check for generic qualifying statements
        const genericPatterns = [
            /it is (important|essential|crucial|vital|worth)/i,
            /plays a (key|crucial|vital|important|significant) role/i,
            /in today's (world|society|digital|modern)/i,
            /it's (important|essential|crucial) to (note|understand|recognize)/i,
            /has become (increasingly|more and more)/i,
        ];
        for (const pattern of genericPatterns) {
            if (pattern.test(sentence)) {
                suspiciousness += 25;
                reasons.push('Generic AI phrasing');
                break;
            }
        }

        if (suspiciousness >= 25) {
            highlighted.push({
                text: sentence,
                confidence: Math.min(suspiciousness, 98),
                reasons,
            });
        }
    }

    return highlighted.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
}

// ─── POST /check — Main AI detection endpoint ───
router.post('/check', upload.single('file'), async (req, res) => {
    try {
        let text = '';

        if (req.file) {
            text = await extractTextFromFile(req.file);
        } else if (req.body.text && req.body.text.trim()) {
            text = req.body.text.trim();
        } else {
            return res.status(400).json({ error: 'Please provide text or upload a file to check.' });
        }

        if (text.length < 100) {
            return res.status(400).json({ error: 'Text is too short. Please provide at least 100 characters for accurate analysis.' });
        }

        // Basic stats
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const sentences = splitIntoSentences(text);

        if (sentences.length < 3) {
            return res.status(400).json({ error: 'Not enough sentences for analysis. Please provide at least 3 complete sentences.' });
        }

        // Run all heuristic analyzers
        const burstiness = analyzeBurstiness(sentences);
        const vocabulary = analyzeVocabularyRichness(text);
        const openers = analyzeSentenceOpeners(sentences);
        const transitions = analyzeTransitionDensity(text);
        const punctuation = analyzePunctuationVariety(text);
        const wordLength = analyzeWordLengthUniformity(text);

        // ─── RoBERTa ML model via Hugging Face API ───
        let roberta = { score: null, label: 'Not available' };
        let useML = false;

        if (HF_TOKEN) {
            try {
                // Split text into chunks (model max ~512 tokens)
                const chunks = [];
                for (let i = 0; i < text.length; i += 512) {
                    chunks.push(text.slice(i, i + 512));
                }
                const chunksToCheck = chunks.slice(0, 5); // max 5 chunks

                const chunkScores = [];
                for (const chunk of chunksToCheck) {
                    const data = await hf.textClassification({
                        model: 'roberta-base-openai-detector',
                        inputs: chunk
                    });

                    if (Array.isArray(data)) {
                        const fakeEntry = data.find(d => d.label === 'LABEL_1' || d.label === 'Fake');
                        if (fakeEntry) {
                            chunkScores.push(Math.round(fakeEntry.score * 100));
                        }
                    }
                }

                if (chunkScores.length > 0) {
                    const avgScore = Math.round(chunkScores.reduce((a, b) => a + b, 0) / chunkScores.length);
                    roberta = { score: avgScore, chunksAnalyzed: chunkScores.length };
                    useML = true;
                    console.log(`[AI Detector] RoBERTa ML score: ${avgScore}% (from ${chunkScores.length} chunks)`);
                }
            } catch (err) {
                console.error('[AI Detector] Hugging Face API error:', err.message);
            }
        }

        // Weighted average — prioritize Burstiness as the strongest indicator of modern AI models
        let weights, overallScore;

        if (useML) {
            weights = {
                roberta: 0.15,
                burstiness: 0.30,
                vocabulary: 0.10,
                openers: 0.15,
                transitions: 0.10,
                punctuation: 0.10,
                wordLength: 0.10,
            };
            overallScore = Math.round(
                roberta.score * weights.roberta +
                burstiness.score * weights.burstiness +
                vocabulary.score * weights.vocabulary +
                openers.score * weights.openers +
                transitions.score * weights.transitions +
                punctuation.score * weights.punctuation +
                wordLength.score * weights.wordLength
            );
        } else {
            weights = {
                burstiness: 0.35,
                vocabulary: 0.10,
                openers: 0.20,
                transitions: 0.10,
                punctuation: 0.15,
                wordLength: 0.10,
            };
            overallScore = Math.round(
                burstiness.score * weights.burstiness +
                vocabulary.score * weights.vocabulary +
                openers.score * weights.openers +
                transitions.score * weights.transitions +
                punctuation.score * weights.punctuation +
                wordLength.score * weights.wordLength
            );
        }

        // Apply critical signal overrides (Modern LLMs like ChatGPT often defeat vocabulary checks but fail burstiness entirely)
        if (burstiness.score >= 90 && punctuation.score >= 80) {
            overallScore = Math.max(overallScore, 88); // Highly robotic structure
        } else if (burstiness.score >= 80) {
            overallScore = Math.max(overallScore, 75); // Moderately robotic structure
        } else if (roberta.score >= 85) {
            overallScore = Math.max(overallScore, 85); // If ML is extremely confident it's fake
        }

        // Determine verdict
        let verdict, verdictLabel;
        if (overallScore >= 75) {
            verdict = 'ai';
            verdictLabel = 'Likely AI-Generated';
        } else if (overallScore >= 55) {
            verdict = 'mixed';
            verdictLabel = 'Mixed — Possibly AI-Assisted';
        } else if (overallScore >= 35) {
            verdict = 'uncertain';
            verdictLabel = 'Uncertain — Needs Review';
        } else {
            verdict = 'human';
            verdictLabel = 'Likely Human-Written';
        }

        // Get highlighted suspicious sentences
        const highlightedSentences = highlightSuspiciousSentences(sentences);

        res.json({
            score: overallScore,
            verdict,
            verdictLabel,
            wordCount,
            sentenceCount: sentences.length,
            metrics: {
                ...(useML ? { roberta: { label: 'RoBERTa ML Model', weight: weights.roberta, ...roberta } } : {}),
                burstiness: { label: 'Sentence Uniformity', weight: weights.burstiness, ...burstiness },
                vocabulary: { label: 'Vocabulary Richness', weight: weights.vocabulary, ...vocabulary },
                openers: { label: 'Sentence Opener Variety', weight: weights.openers, ...openers },
                transitions: { label: 'Transition Word Density', weight: weights.transitions, ...transitions },
                punctuation: { label: 'Punctuation Variety', weight: weights.punctuation, ...punctuation },
                wordLength: { label: 'Word Length Uniformity', weight: weights.wordLength, ...wordLength },
            },
            highlightedSentences,
        });
    } catch (err) {
        console.error('AI Detection error:', err);
        res.status(500).json({ error: 'An error occurred during analysis. Please try again.' });
    }
});

module.exports = router;
