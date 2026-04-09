'use client';
import { useState } from 'react';
import { HiShieldCheck, HiSparkles, HiRefresh, HiCheckCircle, HiExclamation, HiOutlineEye, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useAuth } from '@/lib/AuthContext';
import { PlagiarismResult } from '@/lib/useContentAnalysis';
import { AIResult } from '@/lib/aiHeuristics';

interface LiveAnalysisReportProps {
    isAnalyzing: boolean;
    plagiarismResult: PlagiarismResult | null;
    aiResult: AIResult | null;
    error: string | null;
    sentenceCount: number;
    forceCheck: () => void;
    onToggleHeatmap: () => void;
    isHeatmapOpen: boolean;
}

export default function LiveAnalysisReport({
    isAnalyzing,
    plagiarismResult,
    aiResult,
    error,
    sentenceCount,
    forceCheck,
    onToggleHeatmap,
    isHeatmapOpen
}: LiveAnalysisReportProps) {
    const { user } = useAuth();
    const [showFlagged, setShowFlagged] = useState(false);

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
                        <div className="mt-2">
                            <button 
                                onClick={() => setShowFlagged(!showFlagged)}
                                className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors px-2 py-1 rounded"
                            >
                                {plagiarismResult.flaggedSentences.length} Flagged Sentences
                                {showFlagged ? <HiChevronUp className="w-3 h-3" /> : <HiChevronDown className="w-3 h-3" />}
                            </button>
                            {showFlagged && (
                                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1">
                                    {plagiarismResult.flaggedSentences.map((sent, idx) => (
                                        <div key={idx} className="bg-red-50/50 p-2 rounded text-[10px] border border-red-100">
                                            <p className="text-slate-700 italic border-l-2 border-red-300 pl-2">"{sent.text}"</p>
                                            <div className="flex justify-between mt-1 items-center">
                                                <span className="text-red-600 font-bold">{Math.round(sent.similarity)}% Match</span>
                                                <a href={sent.source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline truncate ml-2 max-w-[120px]" title={sent.source.title}>
                                                    {sent.source.title}
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100" />

                {/* AI Detection Section */}
                <div>
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Probability</span>
                            {aiResult && !isAnalyzing && (
                                <div className={`text-[10px] uppercase font-bold mt-1 ${
                                    aiResult.score > 60 ? 'text-red-500' :
                                    aiResult.score > 30 ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                    Confidence: {aiResult.confidenceLevel}
                                </div>
                            )}
                        </div>
                        {isAnalyzing ? (
                            <div className="w-10 h-4 bg-slate-200 animate-pulse rounded" />
                        ) : (
                            <span className={`text-xl font-black ${
                                !aiResult ? 'text-slate-300' :
                                aiResult.score > 60 ? 'text-red-500' :
                                aiResult.score > 30 ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                                {aiResult ? `${aiResult.score}%` : '--'}
                            </span>
                        )}
                    </div>
                    {aiResult && !isAnalyzing && (
                        <div className="mt-2 text-[10px] text-slate-400 font-medium italic">
                            {aiResult.verdict === 'Likely Human' ? (
                                'Writing exhibits natural variation and unpredictability.'
                            ) : aiResult.verdict === 'Mixed/Uncertain' ? (
                                'Contains a mix of predictable structure and human variance.'
                            ) : (
                                'High structural uniformity, predictable flow, or repetitive n-grams.'
                            )}
                        </div>
                    )}
                    
                    {/* Heatmap Toggle Button */}
                    <button 
                        onClick={onToggleHeatmap}
                        className={`w-full mt-3 py-2 px-3 rounded-lg border text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                            isHeatmapOpen 
                            ? 'bg-slate-100 border-slate-200 text-slate-600 shadow-inner' 
                            : 'bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100'
                        }`}
                    >
                        <HiOutlineEye className="w-4 h-4" />
                        {isHeatmapOpen ? 'Close Heatmap' : 'Open Heatmap'}
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-2">
                    <p className="text-[9px] text-slate-500 leading-tight">
                        <span className="font-bold text-slate-700">Disclaimer:</span> This analysis is based on mathematical heuristics and ML probability. It may falsely flag well-written human content as AI. Use as a guide.
                    </p>
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
