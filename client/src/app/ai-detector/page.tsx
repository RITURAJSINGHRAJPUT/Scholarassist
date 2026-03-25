'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { HiSparkles, HiUpload, HiDocumentText, HiX, HiExclamation, HiCheckCircle, HiLightningBolt } from 'react-icons/hi';
import FAQAccordion from '@/components/FAQAccordion';
import api from '@/lib/api';

const faqs = [
    { question: 'How does the AI content detector work?', answer: 'Our tool analyzes your text using an advanced RoBERTa machine learning model powered by Hugging Face, combined with 6 statistical metrics: sentence uniformity, vocabulary richness, sentence opener variety, transition word density, punctuation patterns, and word length distribution. AI-generated text tends to score differently on these metrics compared to human writing.' },
    { question: 'How accurate is this detector?', answer: 'Our machine learning and heuristic-based detector provides a strong initial screening. It is best used as a first pass — for high-stakes decisions, combine this with professional review. The tool is continuously improving with each update.' },
    { question: 'What file formats are supported?', answer: 'You can upload PDF, DOCX (Microsoft Word), and TXT files up to 5MB. Alternatively, you can paste your text directly into the text box.' },
    { question: 'Is my content kept private?', answer: 'Absolutely. Your uploaded files and text are processed in real-time and are never stored on our servers. Once the analysis is complete, all data is immediately discarded.' },
    { question: 'Can it detect ChatGPT, Gemini, or Claude content?', answer: 'The detector identifies statistical patterns common to most large language models (LLMs), including ChatGPT, Gemini, Claude, and others. However, heavily edited AI text may be harder to detect.' },
];

interface HighlightedSentence {
    text: string;
    confidence: number;
    reasons: string[];
}

interface MetricData {
    label: string;
    score: number;
    weight: number;
    [key: string]: unknown;
}

interface CheckResult {
    score: number;
    verdict: 'human' | 'uncertain' | 'mixed' | 'ai';
    verdictLabel: string;
    wordCount: number;
    sentenceCount: number;
    metrics: Record<string, MetricData>;
    highlightedSentences: HighlightedSentence[];
}

export default function AIDetectorPage() {
    const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const ext = droppedFile.name.split('.').pop()?.toLowerCase();
            if (['pdf', 'docx', 'txt'].includes(ext || '')) {
                setFile(droppedFile);
                setError('');
            } else {
                setError('Only PDF, DOCX, and TXT files are supported.');
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleCheck = async () => {
        setError('');
        setResult(null);
        setProgress(0);

        if (activeTab === 'text' && (!text.trim() || text.trim().length < 100)) {
            setError('Please enter at least 100 characters of text to analyze.');
            return;
        }
        if (activeTab === 'file' && !file) {
            setError('Please upload a file to analyze.');
            return;
        }

        setLoading(true);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) { clearInterval(progressInterval); return 90; }
                return prev + Math.random() * 20;
            });
        }, 300);

        try {
            let response;
            if (activeTab === 'file' && file) {
                const formData = new FormData();
                formData.append('file', file);
                response = await api.post('/ai-detector/check', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await api.post('/ai-detector/check', { text });
            }

            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => {
                setResult(response.data);
                setLoading(false);
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }, 400);
        } catch (err: unknown) {
            clearInterval(progressInterval);
            setLoading(false);
            setProgress(0);
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || 'An error occurred. Please try again.');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return { ring: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-500 to-orange-500' };
        if (score >= 55) return { ring: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-500 to-yellow-500' };
        if (score >= 35) return { ring: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', gradient: 'from-sky-500 to-blue-500' };
        return { ring: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-500' };
    };

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'ai': return 'bg-red-100 text-red-800 border-red-200';
            case 'mixed': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'uncertain': return 'bg-sky-100 text-sky-800 border-sky-200';
            default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        }
    };

    const getMetricBarColor = (score: number) => {
        if (score >= 70) return 'bg-red-500';
        if (score >= 50) return 'bg-amber-500';
        if (score >= 30) return 'bg-sky-500';
        return 'bg-emerald-500';
    };

    const circumference = 2 * Math.PI * 54;
    const scoreOffset = result ? circumference - (result.score / 100) * circumference : circumference;

    return (
        <>
            {/* Hero */}
            <section className="hero-gradient pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
                        <HiSparkles className="w-4 h-4" />
                        Free Tool — No Login Required
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-[var(--font-heading)] mb-4">
                        AI Content Detector
                    </h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">
                        Analyze your text to detect AI-generated content. Our tool examines writing patterns using an advanced Machine Learning model and statistical heuristics to assess originality.
                    </p>
                </div>
            </section>

            {/* Main Tool Section */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Input Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => { setActiveTab('text'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'text'
                                    ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <HiDocumentText className="w-5 h-5" />
                                Paste Text
                            </button>
                            <button
                                onClick={() => { setActiveTab('file'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'file'
                                    ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <HiUpload className="w-5 h-5" />
                                Upload File
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {/* Text Tab */}
                            {activeTab === 'text' && (
                                <div>
                                    <textarea
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        placeholder="Paste your essay, article, or any text here to check if it was written by AI..."
                                        className="w-full h-56 p-4 border border-slate-200 rounded-xl text-slate-800 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                    />
                                    <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                                        <span>{text.split(/\s+/).filter(w => w).length} words</span>
                                        <span>Minimum 100 characters</span>
                                    </div>
                                </div>
                            )}

                            {/* File Tab */}
                            {activeTab === 'file' && (
                                <div>
                                    <div
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver
                                            ? 'border-primary-500 bg-primary-50/50 scale-[1.01]'
                                            : file
                                                ? 'border-emerald-300 bg-emerald-50/50'
                                                : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        {file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <HiDocumentText className="w-8 h-8 text-emerald-500" />
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <button
                                                    onClick={e => { e.stopPropagation(); setFile(null); }}
                                                    className="ml-4 p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <HiX className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <HiUpload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-600 font-medium">Drag & drop your file here</p>
                                                <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                                                <p className="text-slate-400 text-xs mt-3">Supports PDF, DOCX, TXT (Max 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <HiExclamation className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-primary-700">Analyzing writing patterns...</span>
                                        <span className="text-sm text-primary-600">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Running advanced ML and statistical analysis on your text...</p>
                                </div>
                            )}

                            {/* Check Button */}
                            {!loading && (
                                <button
                                    onClick={handleCheck}
                                    disabled={loading}
                                    className="mt-6 w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <HiLightningBolt className="w-5 h-5" />
                                    Detect AI Content
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div ref={resultRef} className="mt-10 animate-fade-in-up">
                            {/* Score Card */}
                            <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden ${getScoreColor(result.score).border}`}>
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        {/* Score Circle */}
                                        <div className="relative flex-shrink-0">
                                            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                                <circle
                                                    cx="60" cy="60" r="54" fill="none"
                                                    className={getScoreColor(result.score).ring}
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={scoreOffset}
                                                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-slate-800">{result.score}%</span>
                                                <span className="text-xs text-slate-500">AI Probability</span>
                                            </div>
                                        </div>

                                        {/* Verdict & Stats */}
                                        <div className="flex-1 text-center md:text-left">
                                            <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full border ${getVerdictStyle(result.verdict)}`}>
                                                {result.verdictLabel}
                                            </span>
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                                    <p className="text-xl font-bold text-slate-800">{result.wordCount.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500">Words</p>
                                                </div>
                                                <div className="text-center p-3 bg-slate-50 rounded-xl">
                                                    <p className="text-xl font-bold text-slate-800">{result.sentenceCount}</p>
                                                    <p className="text-xs text-slate-500">Sentences</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Breakdown */}
                                <div className="border-t border-slate-100">
                                    <div className="p-6 md:p-8">
                                        <h3 className="text-lg font-bold text-slate-900 mb-5 font-[var(--font-heading)]">Analysis Breakdown</h3>
                                        <div className="space-y-4">
                                            {Object.entries(result.metrics).map(([key, metric]) => (
                                                <div key={key}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                                                        <span className={`text-sm font-bold ${metric.score >= 70 ? 'text-red-600' : metric.score >= 50 ? 'text-amber-600' : metric.score >= 30 ? 'text-sky-600' : 'text-emerald-600'}`}>
                                                            {metric.score}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getMetricBarColor(metric.score)}`}
                                                            style={{ width: `${metric.score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Highlighted Sentences */}
                                {result.highlightedSentences.length > 0 && (
                                    <div className="border-t border-slate-100">
                                        <div className="p-6 md:p-8">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 font-[var(--font-heading)]">Suspicious Sentences</h3>
                                            <div className="space-y-4">
                                                {result.highlightedSentences.map((item, i) => (
                                                    <div key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                                        <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-amber-100/60">
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                                {item.confidence}% AI confidence
                                                            </span>
                                                            {item.reasons.map((reason, j) => (
                                                                <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                                    {reason}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* All Clear */}
                                {result.highlightedSentences.length === 0 && result.score < 35 && (
                                    <div className="border-t border-slate-100 p-8 text-center">
                                        <HiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-slate-900 font-[var(--font-heading)]">Looks Human-Written!</h3>
                                        <p className="text-sm text-slate-500 mt-1">Our analysis indicates this text was likely written by a human.</p>
                                    </div>
                                )}
                            </div>

                            {/* Disclaimer */}
                            <div className="mt-4 p-4 bg-slate-100 rounded-xl text-xs text-slate-500 text-center">
                                <strong>Disclaimer:</strong> This tool uses statistical heuristics combined with machine learning classification and is not 100% accurate. It should be used as a preliminary screening tool, not as definitive proof. Heavily edited AI text or creative human writing may be misclassified.
                            </div>

                            {/* New Check Button */}
                            <div className="text-center mt-6">
                                <button
                                    onClick={() => { setResult(null); setProgress(0); setText(''); setFile(null); }}
                                    className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-all shadow-sm"
                                >
                                    Analyze Another Document
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-8 font-[var(--font-heading)]">Frequently Asked Questions</h2>
                    <FAQAccordion items={faqs} />
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-[var(--font-heading)] mb-4">Need Expert Help With Your Academic Work?</h2>
                    <p className="text-primary-200 mb-8">Our academic advisors can help you improve originality, refine your writing, and achieve higher grades.</p>
                    <Link href="/consultation" className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl inline-block">
                        Get Free Consultation
                    </Link>
                </div>
            </section>
        </>
    );
}
