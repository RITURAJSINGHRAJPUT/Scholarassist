const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

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

// ─── Extract text from uploaded file ───
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

// ─── Split text into sentences (min 20 chars) ───
function splitIntoSentences(text) {
    return text
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);
}

// ════════════════════════════════════════════════════
// WEB SEARCH — DuckDuckGo HTML + CrossRef API
// Both free, zero API keys needed
// ════════════════════════════════════════════════════
async function searchWeb(query) {
    const urls = [];

    // 1) DuckDuckGo HTML search (free, no API key)
    try {
        const searchQuery = encodeURIComponent(query.slice(0, 200));
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;

        const response = await fetch(ddgUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        const html = await response.text();
        const resultMatches = html.match(/uddg=([^"&]+)/g) || [];
        const ddgUrls = resultMatches
            .map(match => {
                const encoded = match.replace('uddg=', '');
                try { return decodeURIComponent(encoded); } catch { return null; }
            })
            .filter(url => url && url.startsWith('http') && !url.includes('duckduckgo.com'))
            .slice(0, 8);

        urls.push(...ddgUrls.filter(u => u !== null));
    } catch (error) {
        console.error('DuckDuckGo search error:', error.message);
    }

    // 2) CrossRef API (free, no API key — academic papers)
    try {
        const searchQuery = encodeURIComponent(query.slice(0, 150));
        const crossrefUrl = `https://api.crossref.org/works?query=${searchQuery}&rows=5`;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@scholarassist.com';

        const response = await fetch(crossrefUrl, {
            headers: {
                'User-Agent': `ScholarAssist/1.0 (https://scholarassist.com; mailto:${adminEmail})`,
            }
        });

        if (!response.ok) {
            console.warn(`CrossRef search failed (${response.status}): ${response.statusText}`);
            return urls;
        }

        const data = await response.json().catch(() => null);
        if (data && data.message?.items) {
            for (const item of data.message.items) {
                if (item.URL) urls.push(item.URL);
            }
        }
    } catch (error) {
        console.error('CrossRef search error:', error.message);
    }

    return [...new Set(urls)].slice(0, 10);
}

// ════════════════════════════════════════════════════
// FETCH PAGE CONTENT — strips HTML to plain text
// ════════════════════════════════════════════════════
async function fetchPageContent(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!response.ok) return '';

        const html = await response.text();

        // Strip HTML tags, scripts, styles, nav, footer etc.
        const text = html
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
            .replace(/<header[^>]*>.*?<\/header>/gis, '')
            .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
            .replace(/<aside[^>]*>.*?<\/aside>/gis, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[a-z]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return text.slice(0, 5000);
    } catch (error) {
        return '';
    }
}

const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing']);

function cleanTextForSimilarity(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
        .join(' ');
}

// ════════════════════════════════════════════════════
// SIMILARITY — Cosine + N-Gram (with Stop-Word Filtering)
// ════════════════════════════════════════════════════
function calculateSimilarity(text1, text2) {
    const cleaned1 = cleanTextForSimilarity(text1);
    const cleaned2 = cleanTextForSimilarity(text2);
    
    if (cleaned1.length < 5 || cleaned2.length < 5) return 0;

    const words1 = cleaned1.split(/\s+/);
    const words2 = cleaned2.split(/\s+/);

    const allWords = [...new Set([...words1, ...words2])];

    const vector1 = allWords.map(word => words1.filter(w => w === word).length);
    const vector2 = allWords.map(word => words2.filter(w => w === word).length);

    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
}

function nGramSimilarity(text1, text2, n = 3) { // Reduced n for better fuzzy matching
    const createNGrams = (text) => {
        const cleaned = cleanTextForSimilarity(text);
        const words = cleaned.split(/\s+/);
        const ngrams = new Set();
        if (words.length < n) return ngrams;
        for (let i = 0; i <= words.length - n; i++) {
            ngrams.add(words.slice(i, i + n).join(' '));
        }
        return ngrams;
    };

    const ngrams1 = createNGrams(text1);
    const ngrams2 = createNGrams(text2);

    if (ngrams1.size === 0 || ngrams2.size === 0) return 0;

    let matches = 0;
    for (const gram of ngrams1) {
        if (ngrams2.has(gram)) matches++;
    }

    return matches / Math.max(ngrams1.size, ngrams2.size);
}

// ─── Extract page title from URL for display ───
function extractTitleFromUrl(url) {
    try {
        const parsed = new URL(url);
        let host = parsed.hostname.replace('www.', '');
        // Capitalize first letter
        host = host.charAt(0).toUpperCase() + host.slice(1);
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
            const last = pathParts[pathParts.length - 1]
                .replace(/[-_]/g, ' ')
                .replace(/\.[^.]+$/, '') // remove extension
                .replace(/\b\w/g, c => c.toUpperCase());
            return `${host} — ${last}`.substring(0, 60);
        }
        return host;
    } catch {
        return url.substring(0, 50);
    }
}

// ════════════════════════════════════════════════════
// POST /check — Main plagiarism check endpoint
// ════════════════════════════════════════════════════
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

        if (text.length < 50) {
            return res.status(400).json({ error: 'Text is too short. Please provide at least 50 characters.' });
        }

        const words = text.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const sentences = splitIntoSentences(text);

        if (sentences.length < 1) {
            return res.status(400).json({ error: 'Not enough sentences for analysis.' });
        }

        // Dynamic sentence limit based on word count (scale from 15 to 150)
        let maxSentencesToCheck = 15;
        if (wordCount > 4000) maxSentencesToCheck = 150;
        else if (wordCount > 2000) maxSentencesToCheck = 100;
        else if (wordCount > 500) maxSentencesToCheck = 40;

        // Intelligent Sentence Selection (Rank by Information Density)
        const rankedSentences = sentences
            .map(s => {
                const words = s.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w));
                const density = (words.length * new Set(words).size) / (s.length || 1);
                return { text: s, density };
            })
            .sort((a, b) => b.density - a.density)
            .slice(0, maxSentencesToCheck)
            .map(item => item.text);

        const results = [];
        console.log(`[Plagiarism] ULTRA ANALYSIS: Checking ${rankedSentences.length} segments with 10 concurrent threads...`);

        // Concurrent processing with a limit (batching)
        const concurrencyLimit = 10;
        for (let i = 0; i < rankedSentences.length; i += concurrencyLimit) {
            const batch = rankedSentences.slice(i, i + concurrencyLimit);
            
            const batchResults = await Promise.all(batch.map(async (sentence) => {
                const urls = await searchWeb(sentence);
                let maxSimilarity = 0;
                const matchedSources = [];

                for (const url of urls) {
                    const content = await fetchPageContent(url);
                    if (content && content.length > 200) { // Increased min content length for better accuracy
                        const cosineSim = calculateSimilarity(sentence, content);
                        const ngramSim = nGramSimilarity(sentence, content, 5);
                        const similarity = Math.max(cosineSim, ngramSim);

                        if (similarity > maxSimilarity) {
                            maxSimilarity = similarity;
                        }

                        if (similarity > 0.15) {
                            matchedSources.push({
                                url,
                                title: extractTitleFromUrl(url),
                                similarity: Math.round(similarity * 100),
                            });
                        }
                    }
                }

                matchedSources.sort((a, b) => b.similarity - a.similarity);

                return {
                    text: sentence,
                    similarity: Math.round(maxSimilarity * 100),
                    sources: matchedSources.slice(0, 3),
                    isPlagiarized: maxSimilarity > 0.5,
                };
            }));

            results.push(...batchResults);
        }

        // Calculate overall score
        const totalSimilarity = results.reduce((sum, r) => sum + r.similarity, 0);
        const overallScore = Math.round(totalSimilarity / results.length);

        // Flagged sentences (similarity > 20%)
        const flaggedSentences = results
            .filter(r => r.similarity > 20 && r.sources.length > 0)
            .map(r => ({
                text: r.text,
                similarity: r.similarity,
                source: r.sources[0], // top source
            }));

        // Determine verdict
        let verdict, verdictLabel;
        if (overallScore >= 50) {
            verdict = 'high';
            verdictLabel = 'High Plagiarism Detected';
        } else if (overallScore >= 20) {
            verdict = 'moderate';
            verdictLabel = 'Moderate Similarity Found';
        } else if (overallScore >= 10) {
            verdict = 'low';
            verdictLabel = 'Low Similarity — Mostly Original';
        } else {
            verdict = 'original';
            verdictLabel = 'Original Content';
        }

        res.json({
            score: overallScore,
            verdict,
            verdictLabel,
            wordCount,
            sentencesAnalyzed: results.length,
            totalSentences: sentences.length,
            flaggedSentences,
            text,
        });
    } catch (err) {
        console.error('Plagiarism check error:', err);
        res.status(500).json({ error: 'An error occurred during analysis. Please try again.' });
    }
});

module.exports = router;
