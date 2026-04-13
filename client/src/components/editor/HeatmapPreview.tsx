import React, { useState, useRef } from 'react';
import { AIResult } from '@/lib/aiHeuristics';
import { PlagiarismResult } from '@/lib/useContentAnalysis';
import { HiOutlineLightBulb, HiX, HiDownload } from 'react-icons/hi';
import ForensicReportTemplate from './ForensicReportTemplate';

interface HeatmapPreviewProps {
    aiResult: AIResult | null;
    plagiarismResult?: PlagiarismResult | null;
    docTitle: string;
    isAnalyzing: boolean;
    onClose: () => void;
}

export default function HeatmapPreview({ aiResult, plagiarismResult, docTitle, isAnalyzing, onClose }: HeatmapPreviewProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleDownloadReport = async () => {
        console.log('Download started...');
        if (isGeneratingPDF) return;
        
        if (!aiResult || !plagiarismResult) {
            console.error('Data missing:', { aiResult, plagiarismResult });
            alert('Analysis data is still loading. Please wait.');
            return;
        }

        if (!reportRef.current) {
            console.error('Report ref missing. Current state:', reportRef.current);
            alert('Render error: Template not found. Please try refreshing the sidebar.');
            return;
        }

        setIsGeneratingPDF(true);
        
        try {
            console.log('Importing html2pdf...');
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default;
            console.log('html2pdf imported successfully');
            
            await new Promise(resolve => setTimeout(resolve, 500));

            const opt = {
                margin: [10, 10, 10, 10], // 10mm margins on all sides
                filename: `ScholarAssist-Report-${(docTitle || 'Analysis').replace(/[^a-z0-9]/gi, '-')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: true, // Enable html2canvas logging
                    letterRendering: true,
                    onclone: (clonedDoc: Document) => {
                        const element = clonedDoc.getElementById('sa-forensic-report-capture');
                        if (element) {
                            element.style.display = 'block';
                            element.style.visibility = 'visible';
                            element.style.position = 'relative';
                            element.style.left = '0';
                            element.style.top = '0';
                            element.style.height = 'auto';
                            element.style.width = '718px';
                            element.style.padding = '0'; // Let html2pdf margins handle white space
                            element.style.margin = '0';
                        }
                    }
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };
            
            console.log('Starting PDF generation...');
            await html2pdf().set(opt).from(reportRef.current).save();
            console.log('PDF generation complete');
            
        } catch (error: any) {
            console.error('PDF Error:', error);
            alert(`ScholarAssist: ${error?.message || 'Download failed'}`);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (!aiResult) {
        return (
            <div className="w-full h-full bg-white flex flex-col border-l border-slate-200">
                <div className="flex justify-between items-center mb-6 px-8 pt-8">
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
        <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden border-l border-slate-200 relative">
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
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleDownloadReport} 
                        disabled={isGeneratingPDF}
                        className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${
                            isGeneratingPDF 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`} 
                        title="Download Report"
                    >
                        {isGeneratingPDF ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full" />
                        ) : (
                            <HiDownload className="w-5 h-5" />
                        )}
                        <span className="hidden sm:inline">{isGeneratingPDF ? 'Preparing PDF...' : 'Export PDF'}</span>
                    </button>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Scrollable Heatmap Canvas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div id="heatmap-report-content" className="p-8 sm:p-12 leading-loose text-[15px] font-sans" style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
                    <div className="mb-8 pb-4 flex justify-between items-end" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: '#0f172a' }}>Analysis Report</h3>
                            <p className="text-xs font-medium mt-1" style={{ color: '#64748b' }}>Plagiarism & AI Content Highlights</p>
                        </div>
                        <div className="text-right text-[10px] font-bold uppercase tracking-widest space-y-1.5 hidden sm:block" style={{ color: '#94a3b8' }}>
                            <div className="flex items-center justify-end gap-2"><span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ backgroundColor: '#f5d0fe', border: '1px solid #e879f9' }}></span>Plagiarism</div>
                            <div className="flex items-center justify-end gap-2"><span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ backgroundColor: '#fecaca', border: '1px solid #fca5a5' }}></span>AI Gen</div>
                        </div>
                    </div>
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
                        let customInlineStyle: React.CSSProperties = {};
                        
                        // We give visual priority to plagiarism
                        if (plagged) {
                            spanClass += " hover:bg-fuchsia-200 font-medium";
                            customInlineStyle = { backgroundColor: 'rgba(250, 232, 255, 0.9)', color: '#701a75', borderBottom: '2px solid #e879f9' };
                        } else if (sa.label === 'AI') {
                            spanClass += " hover:bg-red-200";
                            customInlineStyle = { backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#7f1d1d', borderBottom: '1px solid #fca5a5' };
                        } else if (sa.label === 'Mixed') {
                            spanClass += " hover:bg-amber-200";
                            customInlineStyle = { backgroundColor: 'rgba(254, 243, 199, 0.7)', color: '#78350f', borderBottom: '1px solid #fcd34d' };
                        } else {
                            spanClass += " hover:bg-emerald-50";
                            customInlineStyle = { color: '#334155' };
                        }

                        // Determine severity weight for displaying AI info string visually
                        const reasonsStr = sa.reasons.join(' • ');
                        const tooltipContent = `AI Probability: ${sa.score}%\nReason: ${reasonsStr}`;

                        return (
                            <React.Fragment key={i}>
                                <span className={spanClass} style={customInlineStyle}>
                                    {sa.text}
                                    {/* Advanced Custom Tooltip on Hover */}
                                    <div data-html2canvas-ignore="true" className="absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-max max-w-xs text-left">
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

            {/* Hidden PDF Template for Capture - Keep it off-screen but with auto height */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0', overflow: 'hidden', height: 'auto', minHeight: '1120px', width: '718px', pointerEvents: 'none' }}>
                <div id="sa-forensic-report-capture" ref={reportRef}>
                    {aiResult && plagiarismResult && (
                        <ForensicReportTemplate 
                            docTitle={docTitle}
                            aiResult={aiResult}
                            plagiarismResult={plagiarismResult}
                        />
                    )}
                </div>
            </div>
            
        </div>
    );
}
