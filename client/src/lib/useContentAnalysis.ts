'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

import { analyzeOfflineAI, AIResult } from './aiHeuristics';

export interface FlaggedSentence {
    text: string;
    similarity: number;
    source: { title: string; url: string };
}

export interface PlagiarismResult {
    score: number;
    verdict: 'original' | 'low' | 'moderate' | 'high';
    verdictLabel: string;
    flaggedSentences: FlaggedSentence[];
}

// Ultra-fast heuristic delta check to avoid blocking the main thread
function calculateChangePercentage(oldText: string, newText: string): number {
    if (!oldText) return 100; // 100% changed if old text is empty

    const oldLen = oldText.length;
    const newLen = newText.length;
    
    // Quick length-based boundary check (if size mutated by > 15%, it definitely changed > 15%)
    const lengthDiff = Math.abs(oldLen - newLen) / Math.max(oldLen, 1);
    if (lengthDiff > 0.15) return lengthDiff * 100;

    // Token overlap approximation (ignores exact ordering, but very fast)
    const oldTokens = new Set(oldText.split(/\s+/).filter(w => w.length > 3));
    const newTokens = new Set(newText.split(/\s+/).filter(w => w.length > 3));
    
    if (newTokens.size === 0) return 0;

    let overlap = 0;
    newTokens.forEach(t => { if (oldTokens.has(t)) overlap++; });
    
    const overlapRatio = overlap / Math.max(newTokens.size, 1);
    const changeRatio = 1 - overlapRatio;

    return changeRatio * 100;
}

export function useContentAnalysis(text: string) {
    const { user, refreshUsage, isAuthenticated } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
    const [aiResult, setAiResult] = useState<AIResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Compute sentences count
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const sentenceCount = sentences.length;

    const lastAnalyzedText = useRef<string>('');
    const lastPlagiarismText = useRef<string>('');
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const isPremium = user?.isPremium;

    const performAnalysis = useCallback(async (textToAnalyze: string, forcePlagCheck: boolean = false) => {
        if (!textToAnalyze.trim() || textToAnalyze.trim().length < 50) return;
        if (!isAuthenticated || !isPremium) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            // ─── Simplifed Local AI Engine ───
            // Runs synchronously and immediately updates the state and Heatmap preview models
            const localAIResult = analyzeOfflineAI(textToAnalyze);
            if (localAIResult) setAiResult(localAIResult);
            lastAnalyzedText.current = textToAnalyze;


            // ─── Asynchronous Plagiarism Engine ───
            // Plagiarism is very intensive. Only hit it if text changed significantly or forced.
            if (forcePlagCheck || calculateChangePercentage(lastPlagiarismText.current, textToAnalyze) > 15) {
                try {
                    const res = await api.post('/plagiarism/check', { text: textToAnalyze });
                    setPlagiarismResult(res.data);
                    lastPlagiarismText.current = textToAnalyze;
                    refreshUsage();
                } catch (pxErr) {
                    console.error('Plagiarism check async failure:', pxErr);
                }
            }
            
        } catch (err: any) {
            console.error('Content analysis failed:', err);
            // Handle limits gracefully, avoid spamming error popups while typing
            if (err.response?.data?.code === 'USAGE_LIMIT_EXCEEDED') {
                setError('Usage limit exceeded for automated checks.');
            } else {
                setError('Analysis failed. Connection error.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAuthenticated, isPremium, refreshUsage]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    // Effect to track text changes and trigger debounced analysis
    useEffect(() => {
        // Only run for premium users, and if content >= 20 sentences
        if (!isPremium || !isAuthenticated || sentenceCount < 20) {
            return;
        }

        // Extremely minor debounce cancellation
        if (text === lastAnalyzedText.current && text === lastPlagiarismText.current) {
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Standard 3 second debounce
        debounceTimer.current = setTimeout(() => {
            performAnalysis(text, false);
        }, 3000);

    }, [text, sentenceCount, isPremium, isAuthenticated, performAnalysis]);

    const forceCheck = () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        performAnalysis(text, true); // Force full re-evaluation
    };

    return {
        isAnalyzing,
        plagiarismResult,
        aiResult,
        error,
        sentenceCount,
        forceCheck,
        isActive: isPremium && sentenceCount >= 20
    };
}
