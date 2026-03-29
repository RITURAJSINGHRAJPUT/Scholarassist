'use client';

import { Editor } from '@tiptap/react';

interface DocumentStatsProps {
    editor: Editor | null;
}

const PRESET_CITATIONS = [
    {
        id: '1',
        author: 'Chen, X., & Roberts, J.',
        year: '2022',
        title: 'Spatial Immersion and Cognitive Load in Virtual Reality Learning Environments.'
    },
    {
        id: '2',
        author: 'Damasio, A.',
        year: '2018',
        title: 'The Strange Order of Things: Life, Feeling, and the Making of Cultures.'
    }
];

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

    const handleCite = (citation: typeof PRESET_CITATIONS[0]) => {
        editor.chain().focus().setCitation({
            id: citation.id,
            author: citation.author,
            year: citation.year,
            title: citation.title
        }).run();
    };

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
                        {PRESET_CITATIONS.map((cit) => (
                            <div key={cit.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-primary-200 transition-colors">
                                <h4 className="text-xs font-bold text-slate-800 mb-1">
                                    {cit.author} ({cit.year})
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {cit.title}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-primary-600">
                                    <button 
                                        onClick={() => handleCite(cit)}
                                        className="hover:text-primary-800 bg-primary-50 px-2 py-0.5 rounded"
                                    >
                                        CITE
                                    </button>
                                    <button className="hover:text-red-600 text-slate-400">REMOVE</button>
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            onClick={() => {
                                const author = window.prompt('Enter author name:');
                                const year = window.prompt('Enter year:');
                                const title = window.prompt('Enter title:');
                                if (author && year && title) {
                                    handleCite({ id: Date.now().toString(), author, year, title });
                                }
                            }}
                            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
                        >
                            + ADD NEW CITATION
                        </button>
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
