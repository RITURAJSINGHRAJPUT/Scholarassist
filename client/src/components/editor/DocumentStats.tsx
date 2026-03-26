'use client';

import { Editor } from '@tiptap/react';

interface DocumentStatsProps {
    editor: Editor | null;
}

export default function DocumentStats({ editor }: DocumentStatsProps) {
    if (!editor) return null;

    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter((s) => s.trim()).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    // Count headings as sections
    const editorElement = editor.view?.dom;
    const sections = editorElement
        ? editorElement.querySelectorAll('h1, h2, h3').length
        : 0;

    const stats = [
        { label: 'Words', value: words.toLocaleString() },
        { label: 'Characters', value: characters.toLocaleString() },
        { label: 'Sentences', value: sentences.toLocaleString() },
        { label: 'Paragraphs', value: paragraphs.toLocaleString() },
        { label: 'Sections', value: sections },
        { label: 'Read Time', value: `${readTime} min` },
    ];

    return (
        <aside className="w-72 bg-[#f8fafc] border-l border-slate-200 h-full overflow-y-auto flex-shrink-0 flex flex-col">
            <div className="p-5 flex-1">
                {/* Citations Card */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Citations
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                            APA (7TH ED.)
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-800 mb-1">
                                Chen, X., & Roberts, J. (2022)
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                Spatial Immersion and Cognitive Load in Virtual Reality Learning Environments.
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-primary-600">
                                <button className="hover:text-primary-800">EDIT</button>
                                <button className="hover:text-red-600 text-slate-400">REMOVE</button>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-800 mb-1">
                                Damasio, A. (2018)
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                The Strange Order of Things: Life, Feeling, and the Making of Cultures.
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-primary-600">
                                <button className="hover:text-primary-800">EDIT</button>
                                <button className="hover:text-red-600 text-slate-400">REMOVE</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Settings Card */}
                <div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Document Settings
                    </h3>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                        <div className="flex items-center justify-between p-3">
                            <span className="text-xs font-medium text-slate-600">Line Spacing</span>
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                <button className="px-3 py-1 text-xs font-semibold bg-white rounded-md shadow-sm text-slate-800">1.5</button>
                                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800">2.0</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3">
                            <span className="text-xs font-medium text-slate-600">Margins</span>
                            <span className="text-[10px] font-bold text-primary-600 tracking-wider">STANDARD</span>
                        </div>
                        <div className="flex items-center justify-between p-3">
                            <span className="text-xs font-medium text-slate-600">Language</span>
                            <span className="text-[10px] font-bold text-primary-600 tracking-wider">ENGLISH (US)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    <span className="text-[10px] bg-slate-300 text-slate-600 px-1 rounded font-mono">D</span> DOCX
                </button>
                <button onClick={() => {
                        const evt = new CustomEvent('export-pdf');
                        document.dispatchEvent(evt);
                    }} 
                    className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-0.5">
                    <span className="text-[10px] bg-primary-800 text-white px-1 rounded font-mono">P</span> PDF
                </button>
            </div>
        </aside>
    );
}
