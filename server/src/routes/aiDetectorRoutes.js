const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { authenticateUser, checkUsageLimit, incrementUsage } = require('../middleware/userAuth');

// Hugging Face Inference API config
const { HfInference } = require('@huggingface/inference');
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const hf = new HfInference(HF_TOKEN);

// File upload config
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

// ─── POST /check — Main ML Detection endpoint ───
router.post('/check', authenticateUser, checkUsageLimit('ai_detector'), upload.single('file'), async (req, res) => {
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
            return res.status(400).json({ error: 'Text is too short.' });
        }

        let mlScore = null;

        // ─── Hugging Face ML Classification ───
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
                            chunkScores.push(fakeEntry.score * 100);
                        }
                    }
                }

                if (chunkScores.length > 0) {
                    mlScore = Math.round(chunkScores.reduce((a, b) => a + b, 0) / chunkScores.length);
                }
            } catch (err) {
                console.error('[AI Detector] HF API:', err.message);
                // Fail silently and return null mlScore so frontend falls back to 100% heuristics
            }
        }

        // Increment usage for free users
        if (req.user && !req.user.is_premium) {
            await incrementUsage(req.user.id, 'ai_detector');
        }

        res.json({ mlScore });

    } catch (err) {
        console.error('AI ML error:', err);
        res.status(500).json({ error: 'API Error' });
    }
});

module.exports = router;
