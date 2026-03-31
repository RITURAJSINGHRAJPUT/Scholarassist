'use client';
'use client';
'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiSparkles, HiUpload, HiDocumentText, HiX, HiExclamation, HiCheckCircle, HiLightningBolt, HiExternalLink } from 'react-icons/hi';
import FAQAccordion from '@/components/FAQAccordion';
import api from '@/lib/api';
import ProtectedToolWrapper from '@/components/ProtectedToolWrapper';
import UsageIndicator from '@/components/UsageIndicator';
import { useAuth } from '@/lib/AuthContext';

const faqs = [
    { question: 'How does the AI content detector work?', answer: 'Our tool analyzes your text using an advanced RoBERTa machine learning model powered by Hugging Face, combined with 6 statistical metrics: sentence uniformity, vocabulary richness, sentence opener variety, transition word density, punctuation patterns, and word length distribution.' },
    { question: 'How accurate is this detector?', answer: 'The detector identified statistical patterns common to most large language models. It is best used as a first pass — for high-stakes decisions, combine this with professional review.' },
    { question: 'What file formats are supported?', answer: 'You can upload PDF, DOCX, and TXT files up to 5MB.' },
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
}

interface CheckResult {
    score: number;
    verdict: 'human' | 'uncertain' | 'mixed' | 'ai';
    verdictLabel: string;
    wordCount: number;
    sentenceCount: number;
    metrics: Record<string, MetricData>;
    highlightedSentences: HighlightedSentence[];
    text?: string;
}

export default function AIDetectorPage() {
    const router = useRouter();
    const { isAuthenticated, refreshUsage, setShowUpgradeModal } = useAuth();
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
                refreshUsage();
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }, 400);
        } catch (err: unknown) {
            clearInterval(progressInterval);
            setLoading(false);
            setProgress(0);
            const axiosErr = err as { response?: { data?: { error?: string; code?: string } } };
            if (axiosErr.response?.data?.code === 'USAGE_LIMIT_EXCEEDED') {
                setShowUpgradeModal(true);
            }
            setError(axiosErr.response?.data?.error || 'An error occurred. Please try again.');
        }
    };

    const handleContinueToEditor = () => {
        const contentToEdit = result?.text || text;
        if (!contentToEdit) return;
        localStorage.setItem('editor_startup_content', contentToEdit);
        router.push('/editor');
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return { ring: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
        if (score >= 55) return { ring: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
        if (score >= 35) return { ring: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' };
        return { ring: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
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
            <section className="hero-gradient pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-white blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-400 blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
                        <HiSparkles className="w-4 h-4" /> {isAuthenticated ? 'Logged In' : 'Login Required'}
                    </div>
                    {isAuthenticated && (
                        <div className="mb-4">
                            <UsageIndicator />
                        </div>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Content Detector</h1>
                    <p className="text-primary-200 text-lg max-w-2xl mx-auto">Analyze writing patterns using an advanced Machine Learning model and statistical heuristics.</p>
                </div>
            </section>

            <section className="py-16 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <ProtectedToolWrapper toolName="AI content detector">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => { setActiveTab('text'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'text' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500'}`}
                            >
                                <HiDocumentText className="w-5 h-5" /> Paste Text
                            </button>
                            <button
                                onClick={() => { setActiveTab('file'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'file' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50' : 'text-slate-500'}`}
                            >
                                <HiUpload className="w-5 h-5" /> Upload File
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {activeTab === 'text' ? (
                                <div>
                                    <textarea
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        placeholder="Paste your essay here to check if it was written by AI..."
                                        className="w-full h-56 p-4 border border-slate-200 rounded-xl text-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-primary-500 transition-all"
                                    />
                                    <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                                        <span>{text.split(/\s+/).filter(w => w).length} words</span>
                                        <span>Minimum 100 characters</span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleFileDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? 'border-primary-500 bg-primary-50/50' : file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}
                                >
                                    <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
                                    {file ? <p className="text-sm font-bold text-slate-800">{file.name}</p> : <p className="text-slate-400">Click to upload PDF, DOCX or TXT</p>}
                                </div>
                            )}

                            {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

                            {loading ? (
                                <div className="mt-6 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            ) : (
                                <button onClick={handleCheck} className="mt-6 w-full py-4 bg-primary-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                    <HiLightningBolt className="w-5 h-5" /> Detect AI Content
                                </button>
                            )}
                        </div>
                    </div>

                    {result && (
                        <div ref={resultRef} className="mt-10 animate-fade-in-up">
                            <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden ${getScoreColor(result.score).border}`}>
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative">
                                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                                <circle cx="60" cy="60" r="54" fill="none" className={getScoreColor(result.score).ring} stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={scoreOffset} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold">{result.score}%</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">AI Score</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <span className={`inline-block px-4 py-1.5 text-sm font-bold rounded-full border ${getVerdictStyle(result.verdict)}`}>
                                                {result.verdictLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button onClick={() => { setResult(null); setText(''); setFile(null); }} className="text-slate-500 font-bold text-sm">Analyze Another</button>
                                    <button
                                        onClick={handleContinueToEditor}
                                        className="w-full sm:w-auto px-8 py-3 bg-[#0f172a] text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <HiExternalLink className="w-5 h-5" /> Continue to Editor
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                  </ProtectedToolWrapper>
                </div>
            </section>
        </>
    );
}
