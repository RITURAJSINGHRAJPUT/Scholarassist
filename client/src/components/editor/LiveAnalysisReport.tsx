'use client';
import { useEffect } from 'react';
import { useContentAnalysis } from '@/lib/useContentAnalysis';
import { HiShieldCheck, HiSparkles, HiRefresh, HiCheckCircle, HiExclamation } from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';
import { applyAIHighlights } from '@/lib/editor/aiHighlight';

export default function LiveAnalysisReport({ text, editor }: { text: string; editor?: any }) {
    const { user } = useAuth();
    const { isAnalyzing, plagiarismResult, aiResult, error, sentenceCount, forceCheck } = useContentAnalysis(text);

    useEffect(() => {
        if (editor && aiResult && !isAnalyzing) {
            applyAIHighlights(editor, aiResult.highlightedSentences);
        } else if (editor && (isAnalyzing || !aiResult)) {
            // clear highlights on new analysis or reset
            applyAIHighlights(editor, []);
        }
    }, [editor, aiResult, isAnalyzing]);

    if (!user?.isPremium) return null;

    if (sentenceCount < 20 && !isAnalyzing && !plagiarismResult) {
        return (
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <HiSparkles className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-slate-800 text-xs tracking-tight">AI & Plagiarism</h3>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Auto-analysis starts after {20 - sentenceCount} more sentences (Premium).</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${(sentenceCount / 20) * 100}%` }} />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-500">
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HiShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm tracking-wide">Live Analysis</h3>
                </div>
                <button 
                    onClick={forceCheck}
                    disabled={isAnalyzing}
                    className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-md transition-all disabled:opacity-50"
                    title="Recheck Now"
                >
                    <HiRefresh className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg flex gap-2 items-center">
                        <HiExclamation className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
                
                {/* Plagiarism Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plagiarism Limit</span>
                        {isAnalyzing ? (
                            <div className="w-10 h-4 bg-slate-200 animate-pulse rounded" />
                        ) : (
                            <span className={`text-sm font-black ${
                                !plagiarismResult ? 'text-slate-300' :
                                plagiarismResult.score > 20 ? 'text-amber-500' :
                                plagiarismResult.score > 50 ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                                {plagiarismResult ? `${plagiarismResult.score}%` : '--'}
                            </span>
                        )}
                    </div>
                    {plagiarismResult?.flaggedSentences && plagiarismResult.flaggedSentences.length > 0 && (
                        <div className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded inline-block">
                            {plagiarismResult.flaggedSentences.length} Flagged Sentences
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100" />

                {/* AI Detection Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Probability</span>
                        {isAnalyzing ? (
                            <div className="w-10 h-4 bg-slate-200 animate-pulse rounded" />
                        ) : (
                            <span className={`text-sm font-black ${
                                !aiResult ? 'text-slate-300' :
                                aiResult.score > 50 ? 'text-amber-500' :
                                aiResult.score > 75 ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                                {aiResult ? `${aiResult.score}%` : '--'}
                            </span>
                        )}
                    </div>
                </div>

            </div>

            {/* Footer Status */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {isAnalyzing ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <HiCheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Monitored</span>
                        </>
                    )}
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                    {sentenceCount} Sentences
                </div>
            </div>
        </div>
    );
}
