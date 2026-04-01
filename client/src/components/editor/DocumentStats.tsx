'use client';

import { useState, useEffect, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import CitationModal from './CitationModal';
import LiveAnalysisReport from './LiveAnalysisReport';

interface DocumentStatsProps {
    editor: Editor | null;
    margins: string;
    setMargins: (m: string) => void;
    language: string;
    setLanguage: (l: string) => void;
    lineHeight: string;
    setLineHeight: (h: string) => void;
}

interface CitationItem {
    id: string;
    author: string;
    year: string;
    title: string;
    type?: string;
}

export default function DocumentStats({ 
    editor, 
    margins, 
    setMargins, 
    language, 
    setLanguage, 
    lineHeight, 
    setLineHeight 
}: DocumentStatsProps) {
    const [libraryCitations, setLibraryCitations] = useState<CitationItem[]>([]);
    const [docCitations, setDocCitations] = useState<CitationItem[]>([]);
    const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);

    // Sync citations from document content
    useEffect(() => {
        if (!editor) return;

        const updateCitations = () => {
            const json = editor.getJSON();
            const found: CitationItem[] = [];
            const seenIds = new Set<string>();

            const traverse = (node: any) => {
                if (node.type === 'citation' && node.attrs) {
                    const { id, author, year, title } = node.attrs;
                    if (id && !seenIds.has(id)) {
                        found.push({ id, author, year, title });
                        seenIds.add(id);
                    }
                }
                if (node.content) {
                    node.content.forEach(traverse);
                }
            };

            traverse(json);
            setDocCitations(found);
        };

        editor.on('update', updateCitations);
        updateCitations();

        return () => { editor.off('update', updateCitations); };
    }, [editor]);

    const allCitations = useMemo(() => {
        const combined = [...libraryCitations];
        const seenIds = new Set(combined.map(c => c.id));
        docCitations.forEach(cit => {
            if (!seenIds.has(cit.id)) {
                combined.push(cit);
                seenIds.add(cit.id);
            }
        });
        return combined;
    }, [libraryCitations, docCitations]);

    if (!editor) return null;

    const handleCite = (citation: CitationItem, index: number) => {
        editor.chain().focus().setCitation({
            ...citation,
            number: index + 1
        }).run();
    };

    const handleRemoveCitation = (id: string) => {
        setLibraryCitations(prev => prev.filter(c => c.id !== id));
    };

    const handleAddNewCitation = (data: any) => {
        const newCitation: CitationItem = {
            id: Date.now().toString(),
            ...data
        };
        setLibraryCitations(prev => [...prev, newCitation]);
    };

    return (
        <aside className="w-72 bg-[#f8fafc] border-l border-slate-200 h-full overflow-y-auto flex-shrink-0 flex flex-col custom-scrollbar">
            <div className="p-5 flex-1">
                {/* Citations Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <h3>Citations</h3>
                        <span className="bg-slate-200 px-1.5 py-0.5 rounded">APA (7TH)</span>
                    </div>

                    <div className="space-y-3">
                        {allCitations.length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-4 italic border border-dashed border-slate-200 rounded-xl">No citations added yet.</p>
                        ) : (
                            allCitations.map((cit, index) => (
                                <div key={cit.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-primary-200 transition-colors group relative">
                                    <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-300">[{index + 1}]</div>
                                    <h4 className="text-xs font-bold text-slate-800 mb-1 pr-6">{cit.author} ({cit.year})</h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">{cit.title}</p>
                                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase">
                                        <button onClick={() => handleCite(cit, index)} className="text-primary-600 hover:text-primary-800 bg-primary-50 px-2 py-0.5 rounded transition">Cite</button>
                                        <button onClick={() => handleRemoveCitation(cit.id)} className="text-slate-400 hover:text-red-600 transition">Remove</button>
                                    </div>
                                </div>
                            ))
                        )}
                        <button onClick={() => setIsCitationModalOpen(true)} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-all flex items-center justify-center gap-2">
                            + ADD NEW CITATION
                        </button>
                    </div>
                </div>

                {/* Document Settings Section */}
                <div>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Document Settings</h3>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                        <div className="flex items-center justify-between p-3">
                            <span className="text-xs font-bold text-slate-600">Line Spacing</span>
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                <button 
                                    onClick={() => setLineHeight('1.5')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm transition ${lineHeight === '1.5' ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >1.5</button>
                                <button 
                                    onClick={() => setLineHeight('2.0')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm transition ${lineHeight === '2.0' ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >2.0</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3">
                            <span className="text-xs font-bold text-slate-600">Margins</span>
                            <select 
                                value={margins}
                                onChange={(e) => setMargins(e.target.value)}
                                className="text-[10px] font-bold text-primary-600 bg-transparent uppercase outline-none cursor-pointer"
                            >
                                <option value="STANDARD">Standard</option>
                                <option value="NARROW">Narrow</option>
                                <option value="WIDE">Wide</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-3">
                            <span className="text-xs font-bold text-slate-600">Language</span>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="text-[10px] font-bold text-primary-600 bg-transparent uppercase outline-none cursor-pointer"
                            >
                                <option value="ENGLISH (US)">English (US)</option>
                                <option value="ENGLISH (UK)">English (UK)</option>
                                <option value="HINDI">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Live Analysis Panel built into sidebar */}
                <LiveAnalysisReport text={editor.getText()} editor={editor} />
            </div>

            {/* Export Section */}
            <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-2 gap-2">
                <button 
                    onClick={() => document.dispatchEvent(new CustomEvent('export-docx'))}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase"
                >DOCX</button>
                <button 
                    onClick={() => document.dispatchEvent(new CustomEvent('export-pdf'))}
                    className="flex items-center justify-center gap-2 py-2.5 bg-primary-800 text-white text-xs font-bold rounded-xl shadow-lg hover:-translate-y-0.5 hover:bg-black transition-all uppercase"
                >PDF</button>
            </div>

            <CitationModal isOpen={isCitationModalOpen} onClose={() => setIsCitationModalOpen(false)} onSubmit={handleAddNewCitation} />
        </aside>
    );
}
