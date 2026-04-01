'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

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

export interface AIResult {
    score: number;
    verdict: 'human' | 'uncertain' | 'mixed' | 'ai';
    verdictLabel: string;
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
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const isPremium = user?.isPremium;

    const performAnalysis = useCallback(async (textToAnalyze: string) => {
        if (!textToAnalyze.trim() || textToAnalyze.trim().length < 50) return;
        if (!isAuthenticated || !isPremium) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const [plagiarismResponse, aiResponse] = await Promise.all([
                api.post('/plagiarism/check', { text: textToAnalyze }),
                api.post('/ai-detector/check', { text: textToAnalyze })
            ]);

            setPlagiarismResult(plagiarismResponse.data);
            setAiResult(aiResponse.data);
            lastAnalyzedText.current = textToAnalyze;
            
            // Refresh usage after automated check (if deduction is required)
            refreshUsage();
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

        // Avoid re-analyzing if the text hasn't changed meaningfully
        // A minimal check could just compare length or exact string
        if (text === lastAnalyzedText.current) {
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            performAnalysis(text);
        }, 3000); // 3-second debounce

    }, [text, sentenceCount, isPremium, isAuthenticated, performAnalysis]);

    const forceCheck = () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        performAnalysis(text);
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
