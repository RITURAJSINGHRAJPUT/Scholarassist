'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from 'next/link';
import { HiArrowLeft, HiPlus, HiTrash, HiDocumentText } from 'react-icons/hi';

import EditorToolbar from '@/components/editor/EditorToolbar';
import SectionsSidebar, { DEFAULT_SECTIONS } from '@/components/editor/SectionsSidebar';
import DocumentStats from '@/components/editor/DocumentStats';
import { useDocuments, type DocumentListItem } from '@/lib/useDocuments';
import { useAutoSave } from '@/lib/useAutoSave';

const ACADEMIC_TEMPLATE = {
    type: 'doc',
    content: [
        {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Title' }],
        },
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Abstract' }],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Write your abstract here…' }],
        },
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Introduction' }],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
        },
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Methodology' }],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
        },
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Results' }],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
        },
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Conclusion' }],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
        },
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'References' }],
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
        },
    ],
};

export default function ResearchEditorPage() {
    const [documents, setDocuments] = useState<DocumentListItem[]>([]);
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState('Untitled Document');
    const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
    const [showDocList, setShowDocList] = useState(true);
    const [loading, setLoading] = useState(true);

    const { createDocument, listDocuments, getDocument, updateDocument, deleteDocument } = useDocuments();
    const { saveStatus, triggerSave, cancelSave } = useAutoSave(currentDocId);

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Image,
            Placeholder.configure({
                placeholder: 'Start writing your research paper…',
            }),
        ],
        []
    );

    const editor = useEditor({
        extensions,
        content: ACADEMIC_TEMPLATE,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[1000px] px-16 py-12',
            },
        },
        onUpdate: ({ editor }) => {
            if (currentDocId) {
                triggerSave({
                    title: currentTitle,
                    content: editor.getJSON(),
                });
            }
        },
    });

    // Load documents on mount
    useEffect(() => {
        loadDocuments();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const docs = await listDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    }, [listDocuments]);

    const handleNewDocument = useCallback(async () => {
        try {
            const doc = await createDocument('Untitled Document', ACADEMIC_TEMPLATE);
            setCurrentDocId(doc.id);
            setCurrentTitle(doc.title);
            setSections([...DEFAULT_SECTIONS]);
            editor?.commands.setContent(ACADEMIC_TEMPLATE);
            setShowDocList(false);
            await loadDocuments();
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    }, [createDocument, editor, loadDocuments]);

    const handleOpenDocument = useCallback(
        async (id: string) => {
            try {
                cancelSave();
                const doc = await getDocument(id);
                setCurrentDocId(doc.id);
                setCurrentTitle(doc.title);

                const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
                if (content && Object.keys(content).length > 0) {
                    editor?.commands.setContent(content);
                } else {
                    editor?.commands.setContent(ACADEMIC_TEMPLATE);
                }

                setShowDocList(false);
            } catch (error) {
                console.error('Failed to open document:', error);
            }
        },
        [getDocument, editor, cancelSave]
    );

    const handleDeleteDocument = useCallback(
        async (id: string, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!confirm('Delete this document? This cannot be undone.')) return;

            try {
                await deleteDocument(id);
                if (currentDocId === id) {
                    setCurrentDocId(null);
                    setShowDocList(true);
                    editor?.commands.setContent(ACADEMIC_TEMPLATE);
                }
                await loadDocuments();
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        },
        [deleteDocument, currentDocId, editor, loadDocuments]
    );

    const handleTitleChange = useCallback(
        (newTitle: string) => {
            setCurrentTitle(newTitle);
            if (currentDocId) {
                triggerSave({ title: newTitle });
            }
        },
        [currentDocId, triggerSave]
    );

    const handleExportPDF = useCallback(async () => {
        const editorElement = document.querySelector('.ProseMirror');
        if (!editorElement) return;

        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default;

        const opt = {
            margin: [20, 15, 20, 15] as [number, number, number, number],
            filename: `${currentTitle || 'document'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        };

        html2pdf().set(opt).from(editorElement as HTMLElement).save();
    }, [currentTitle]);

    const handleAddSection = useCallback((name: string) => {
        setSections((prev) => [...prev, name]);
    }, []);

    // Listen for PDF export from the sidebar
    useEffect(() => {
        const handler = () => handleExportPDF();
        document.addEventListener('export-pdf', handler);
        return () => document.removeEventListener('export-pdf', handler);
    }, [handleExportPDF]);

    // Document list view
    if (showDocList) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
                {/* Header for Document List */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center shadow-sm">
                    <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                            <span className="text-white font-bold text-sm font-[var(--font-heading)]">S</span>
                        </div>
                        <span className="text-xl font-bold font-[var(--font-heading)] text-primary-800">
                            Scholar<span className="text-primary-500">Assist</span>
                        </span>
                    </Link>
                </div>

                <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-[var(--font-heading)] mb-2">
                            Research Documents
                        </h1>
                        <p className="text-slate-500 text-sm">Create and manage your academic papers.</p>
                    </div>
                    <button
                        onClick={handleNewDocument}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5"
                    >
                        <HiPlus className="w-5 h-5 flex-shrink-0" />
                        New Document
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-16">
                                <HiDocumentText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                                    No documents yet
                                </h3>
                                <p className="text-sm text-slate-400 mb-6">
                                    Create your first research paper to get started
                                </p>
                                <button
                                    onClick={handleNewDocument}
                                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
                                >
                                    Create Document
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleOpenDocument(doc.id)}
                                        className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                                    <HiDocumentText className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Last edited: {new Date(doc.updated_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteDocument(doc.id, e)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete document"
                                            >
                                                <HiTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Editor view
    return (
        <div className="w-full h-screen">
            <div className="flex flex-col h-full bg-[#f8fafc] border-t border-slate-200 overflow-hidden font-sans">
                {/* Header matching ScholarAssist UI */}
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    cancelSave();
                                    setShowDocList(true);
                                    loadDocuments();
                                }}
                                className="flex items-center gap-2 group hover:opacity-80 transition"
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-lg shadow-sm">
                                    <span className="font-bold font-[var(--font-heading)] leading-none text-sm">S</span>
                                </div>
                                <span className="text-xl font-bold font-[var(--font-heading)] text-primary-800 hidden sm:block">
                                    Scholar<span className="text-primary-500">Assist</span>
                                </span>
                            </button>
                            <div className="w-px h-6 bg-slate-200 ml-2" />
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="text-sm font-extrabold text-[#0f172a] tracking-wide bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-white px-2 py-1 rounded transition max-w-[200px]"
                                placeholder="Untitled Document"
                            />
                        </div>
                        <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                            <button className="px-2 py-1 hover:text-slate-800 hover:bg-slate-100 rounded">File</button>
                            <button className="px-2 py-1 hover:text-slate-800 hover:bg-slate-100 rounded">Edit</button>
                            <button className="px-2 py-1 hover:text-slate-800 hover:bg-slate-100 rounded">Insert</button>
                            <button className="px-2 py-1 hover:text-slate-800 hover:bg-slate-100 rounded">Format</button>
                            <button className="px-2 py-1 hover:text-slate-800 hover:bg-slate-100 rounded">Tools</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Save Status matching right side */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            {saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'error' ? 'ERROR' : 'SAVED TO CLOUD'}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                            <button onClick={() => editor?.chain().focus().undo().run()} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:text-slate-600" title="Undo">↩</button>
                            <button onClick={() => editor?.chain().focus().redo().run()} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:text-slate-600" title="Redo">↪</button>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:text-slate-600" title="History (Coming Soon)">◷</button>
                            <button onClick={() => window.print()} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg hover:text-slate-600" title="Print">🖨</button>
                        </div>
                        <button onClick={() => alert('Document published successfully!')} className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-md">
                            Publish
                        </button>
                    </div>
                </div>

                {/* Main editor area */}
                <div className="flex flex-1 overflow-hidden bg-[#e2e8f0]">
                    {/* Left sidebar - Sections */}
                    <SectionsSidebar
                        editor={editor}
                        sections={sections}
                        onAddSection={handleAddSection}
                    />

                    {/* Editor content - Floating Paper */}
                    <div className="flex-1 flex flex-col relative h-full">
                        {/* Floating Toolbar */}
                        <div className="absolute top-4 inset-x-0 z-10 flex justify-center pointer-events-none">
                            <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 rounded-2xl overflow-hidden">
                                <EditorToolbar editor={editor} />
                            </div>
                        </div>

                        {/* Paper Scroll Area */}
                        <div className="flex-1 overflow-y-auto pt-24 pb-12 px-8 flex justify-center custom-scrollbar">
                            <div className="w-full max-w-[850px]">
                                <div
                                    className="bg-white rounded-sm mb-8"
                                    style={{
                                        minHeight: '1123px',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 12px 24px -4px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Status Bar */}
                        <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider z-20">
                            <div className="flex items-center gap-4">
                                <span>{editor?.getText()?.trim() ? editor!.getText().trim().split(/\s+/).length : 0} Words</span>
                                <span>|</span>
                                <span>8 Pages</span>
                                <span>|</span>
                                <span>Zoom 100%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>UTF-8</span>
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    LIVE SYNC ACTIVE
                                </div>
                                <span>English (US)</span>
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar - Stats/Settings */}
                    <DocumentStats editor={editor} />
                </div>
            </div>
        </div>
    );
}
