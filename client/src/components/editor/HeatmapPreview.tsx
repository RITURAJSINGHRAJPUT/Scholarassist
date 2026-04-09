import React from 'react';
import { AIResult } from '@/lib/aiHeuristics';
import { PlagiarismResult } from '@/lib/useContentAnalysis';
import { HiOutlineLightBulb, HiX } from 'react-icons/hi';

interface HeatmapPreviewProps {
    aiResult: AIResult | null;
    plagiarismResult?: PlagiarismResult | null;
    isAnalyzing: boolean;
    onClose: () => void;
}

export default function HeatmapPreview({ aiResult, plagiarismResult, isAnalyzing, onClose }: HeatmapPreviewProps) {
    if (!aiResult) {
        return (
            <div className="w-full h-full bg-white flex flex-col pt-24 px-8 border-l border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                            <HiOutlineLightBulb className="w-4 h-4" />
                        </span>
                        Analysis Heatmap
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                {isAnalyzing ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="text-center py-20 text-sm font-medium text-slate-400">
                        Type at least 20 sentences to generate a highly detailed heatmap analysis.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-slate-50 flex flex-col pt-[5rem] overflow-hidden border-l border-slate-200 relative">
            {/* Header & Controls */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm flex-shrink-0 flex justify-between items-center z-10 sticky top-0">
                <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center">
                            <HiOutlineLightBulb className="w-4 h-4" />
                        </span>
                        Analysis Heatmap
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">
                        Document Breakdown
                    </p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                    <HiX className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Heatmap Canvas */}
            <div className="flex-1 overflow-y-auto px-10 py-12 custom-scrollbar">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 leading-loose text-slate-800 text-[15px] font-sans">
                    {aiResult.sentenceAnalysis?.length === 0 && (
                        <p className="text-slate-400 italic">No valid sentences detected for mapping.</p>
                    )}
                    {aiResult.sentenceAnalysis?.map((sa, i) => {
                        // Check for Plagiarism match
                        const plagged = plagiarismResult?.flaggedSentences?.find(f => 
                            f.text.toLowerCase().trim() === sa.text.toLowerCase().trim() || 
                            sa.text.includes(f.text) || 
                            f.text.includes(sa.text)
                        );

                        // Tailwind gradients and indicators
                        let spanClass = "px-1 rounded transition-colors duration-200 cursor-help relative group";
                        
                        // We give visual priority to plagiarism
                        if (plagged) {
                            spanClass += " bg-fuchsia-100/90 hover:bg-fuchsia-200 text-fuchsia-900 border-b-2 border-fuchsia-400 font-medium";
                        } else if (sa.label === 'AI') {
                            spanClass += " bg-red-100/80 hover:bg-red-200 text-red-900 border-b border-red-300";
                        } else if (sa.label === 'Mixed') {
                            spanClass += " bg-amber-100/70 hover:bg-amber-200 text-amber-900 border-b border-amber-300";
                        } else {
                            spanClass += " hover:bg-emerald-50 text-slate-700";
                        }

                        // Determine severity weight for displaying AI info string visually
                        const reasonsStr = sa.reasons.join(' • ');
                        const tooltipContent = `AI Probability: ${sa.score}%\nReason: ${reasonsStr}`;

                        return (
                            <React.Fragment key={i}>
                                <span className={spanClass} title={tooltipContent}>
                                    {sa.text}
                                    {/* Advanced Custom Tooltip on Hover */}
                                    <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-max max-w-xs text-left">
                                        <div className="bg-slate-900 text-white text-[11px] p-2 rounded shadow-xl leading-tight border border-slate-700">
                                            {plagged && (
                                                <div className="bg-fuchsia-900/50 p-1.5 rounded mb-2 border border-fuchsia-500/30">
                                                    <div className="font-bold text-fuchsia-300 mb-1">PLAGIARISM FLAG: {Math.round(plagged.similarity)}% Match</div>
                                                    <div className="text-fuchsia-200/80 text-[10px] break-words">Source: {plagged.source.title}</div>
                                                </div>
                                            )}
                                            <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-200">
                                                AI Output: {sa.score}% <span className="opacity-70 font-normal">({sa.label})</span>
                                            </div>
                                            <div className="text-slate-400">{reasonsStr}</div>
                                        </div>
                                        <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b border-slate-700"></div>
                                    </div>
                                </span>
                                <span> </span>{/* space between sentences */}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {/* Visual Sticky Legend */}
            <div className="bg-white px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex-shrink-0 z-10 w-full">
                <div className="flex items-center gap-2 text-fuchsia-700">
                    <span className="w-3 h-3 rounded bg-fuchsia-100 border border-fuchsia-400"></span> Plagiarism
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> Human
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                    <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span> Mixed
                </div>
                <div className="flex items-center gap-2 text-red-700">
                    <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span> AI
                </div>
            </div>
            
        </div>
    );
}
