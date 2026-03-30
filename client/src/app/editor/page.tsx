'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useRouter, useSearchParams } from 'next/navigation';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize } from '@/lib/editor/fontSize';
import { Citation } from '@/lib/editor/citation';
import { LineHeight } from '@/lib/editor/lineHeight';
import Link from 'next/link';
import { 
    HiPlus, 
    HiTrash, 
    HiDocumentText, 
    HiOutlineAcademicCap, 
    HiOutlineBeaker, 
    HiOutlineBookOpen,
    HiOutlineDocumentSearch,
    HiOutlineDocumentReport
} from 'react-icons/hi';
import type { Paragraph } from 'docx';

import EditorToolbar from '@/components/editor/EditorToolbar';
import SectionsSidebar, { DEFAULT_SECTIONS } from '@/components/editor/SectionsSidebar';
import DocumentStats from '@/components/editor/DocumentStats';
import { useDocuments, type DocumentListItem } from '@/lib/useDocuments';
import { useAutoSave } from '@/lib/useAutoSave';

const TEMPLATES = [
    {
        id: 'academic',
        title: 'Academic Paper',
        description: 'Standard research paper structure',
        icon: 'academic',
        content: {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Abstract' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Write your abstract here…' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Methodology' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Results' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Conclusion' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'References' }] },
                { type: 'paragraph' },
            ],
        },
        sections: ['Title', 'Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion', 'References']
    },
    {
        id: 'case-study',
        title: 'Case Study',
        description: 'Detailed analysis of a specific case',
        icon: 'case',
        content: {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Case Study Title' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Background' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Case Description' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Analysis' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Recommendations' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Conclusion' }] },
                { type: 'paragraph' },
            ],
        },
        sections: ['Title', 'Background', 'Case Description', 'Analysis', 'Recommendations', 'Conclusion']
    },
    {
        id: 'literature-review',
        title: 'Literature Review',
        description: 'Synthesis of existing research',
        icon: 'lit',
        content: {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Literature Review Title' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Search Strategy' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Literature Synthesis' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Critical Discussion' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Conclusion' }] },
                { type: 'paragraph' },
            ],
        },
        sections: ['Title', 'Introduction', 'Search Strategy', 'Literature Synthesis', 'Critical Discussion', 'Conclusion']
    },
    {
        id: 'lab-report',
        title: 'Lab Report',
        description: 'Scientific experimental results',
        icon: 'lab',
        content: {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Lab Report Title' }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Objective' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Materials & Methods' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Data & Results' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Analysis' }] },
                { type: 'paragraph' },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Conclusion' }] },
                { type: 'paragraph' },
            ],
        },
        sections: ['Title', 'Objective', 'Materials & Methods', 'Data & Results', 'Analysis', 'Conclusion']
    }
];

const DEFAULT_TEMPLATE_CONTENT = TEMPLATES[0].content;

export default function ResearchEditorPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
                <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        }>
            <EditorContentInternal />
        </Suspense>
    );
}

function EditorContentInternal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlId = searchParams.get('id');

    const [documents, setDocuments] = useState<DocumentListItem[]>([]);
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState('Untitled Document');
    const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
    const [showDocList, setShowDocList] = useState(true);
    const [loading, setLoading] = useState(true);

    // Document Settings State
    const [margins, setMargins] = useState('STANDARD');
    const [language, setLanguage] = useState('ENGLISH (US)');
    const [lineHeight, setLineHeight] = useState('1.5');

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
            TextStyle,
            FontFamily,
            Color,
            FontSize,
            Citation,
            LineHeight.configure({
                defaultLineHeight: '1.5',
            }),
        ],
        []
    );

    const editor = useEditor({
        extensions,
        content: DEFAULT_TEMPLATE_CONTENT,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `prose prose-slate max-w-none focus:outline-none min-h-[1050px] py-16 transition-all duration-300 bg-white ${
                    margins === 'NARROW' ? 'px-8' : margins === 'WIDE' ? 'px-32' : 'px-20'
                }`,
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

    const loadDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const docs = await listDocuments();
            setDocuments(docs || []);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    }, [listDocuments]);

    // Handle PDF Export
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
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        };

        html2pdf().set(opt).from(editorElement as HTMLElement).save();
    }, [currentTitle]);

    // Handle DOCX Export
    const handleExportDocx = useCallback(async () => {
        if (!editor) return;
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
        const { saveAs } = await import('file-saver');

        const json = editor.getJSON();
        const children: Paragraph[] = [];

        json.content?.forEach((node: any) => {
            if (node.type === 'heading') {
                const levelAttr = node.attrs?.level || 1;
                const level = levelAttr === 1 ? HeadingLevel.HEADING_1 : levelAttr === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
                children.push(new Paragraph({
                    text: node.content?.map((n: any) => n.text).join('') || '',
                    heading: level,
                }));
            } else if (node.type === 'paragraph') {
                children.push(new Paragraph({
                    children: node.content?.map((n: any) => new TextRun({ text: n.text || '' })) || [],
                    spacing: { line: lineHeight === '2.0' ? 480 : 360 }, // 240 is single space
                }));
            }
        });

        const doc = new Document({
            sections: [{ properties: {}, children }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${currentTitle || 'document'}.docx`);
    }, [editor, currentTitle, lineHeight]);

    // Event Listeners for Sidebar
    useEffect(() => {
        const pdfHandler = () => handleExportPDF();
        const docxHandler = () => handleExportDocx();
        document.addEventListener('export-pdf', pdfHandler);
        document.addEventListener('export-docx', docxHandler);
        return () => {
            document.removeEventListener('export-pdf', pdfHandler);
            document.removeEventListener('export-docx', docxHandler);
        };
    }, [handleExportPDF, handleExportDocx]);

    // Apply Line Height
    useEffect(() => {
        if (editor) {
            editor.commands.setLineHeight(lineHeight);
        }
    }, [lineHeight, editor]);

    // URL Synchronization Effect
    useEffect(() => {
        if (urlId) {
            if (urlId !== currentDocId) {
                handleOpenDocument(urlId);
            }
        } else if (!showDocList) {
            // If no ID in URL but we are in editor, go back to list
            setShowDocList(true);
            setCurrentDocId(null);
        }
    }, [urlId, currentDocId]);

    // Initial Load
    useEffect(() => {
        loadDocuments();
        
        const stashed = localStorage.getItem('editor_startup_content');
        if (stashed && editor) {
            editor.commands.setContent(stashed);
            setShowDocList(false);
            localStorage.removeItem('editor_startup_content');
            
            // Optionally set a title or trigger a save later
            setCurrentTitle('Imported Analysis Text');
        }
    }, [editor, loadDocuments]);

    const handleNewDocument = useCallback(async (templateId?: string) => {
        try {
            const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
            const doc = await createDocument('Untitled ' + template.title, template.content);
            
            // Navigate to new URL
            router.push(`/editor?id=${doc.id}`);
            
            setCurrentDocId(doc.id);
            setCurrentTitle(doc.title);
            setSections([...template.sections]);
            editor?.commands.setContent(template.content);
            setShowDocList(false);
            await loadDocuments();
        } catch (error) {
            console.error('Failed to create document:', error);
        }
    }, [createDocument, editor, loadDocuments, router]);

    const handleOpenDocument = useCallback(
        async (id: string) => {
            try {
                // Sync URL if needed
                if (searchParams.get('id') !== id) {
                    router.push(`/editor?id=${id}`);
                }

                cancelSave();
                const doc = await getDocument(id);
                setCurrentDocId(doc.id);
                setCurrentTitle(doc.title);

                const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
                if (content && Object.keys(content).length > 0) {
                    editor?.commands.setContent(content);
                } else {
                    editor?.commands.setContent(DEFAULT_TEMPLATE_CONTENT);
                }

                setShowDocList(false);
            } catch (error) {
                console.error('Failed to open document:', error);
            }
        },
        [getDocument, editor, cancelSave, searchParams, router]
    );

    const handleDeleteDocument = useCallback(
        async (id: string, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!confirm('Delete this document? This cannot be undone.')) return;

            try {
                await deleteDocument(id);
                if (currentDocId === id) {
                    router.push('/editor');
                    setCurrentDocId(null);
                    setShowDocList(true);
                    editor?.commands.setContent(DEFAULT_TEMPLATE_CONTENT);
                }
                await loadDocuments();
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        },
        [deleteDocument, currentDocId, editor, loadDocuments, router]
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

    const handleAddSection = useCallback((name: string) => {
        setSections((prev) => [...prev, name]);
    }, []);

    // Document list view
    if (showDocList) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center shadow-sm">
                    <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-xl font-bold text-primary-800">
                            Scholar<span className="text-primary-500">Assist</span>
                        </span>
                    </Link>
                </div>

                <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
                    {/* Templates Section */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Start with a Template</h2>
                                <p className="text-slate-400 text-sm font-medium">Choose a pre-structured research format</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleNewDocument(template.id)}
                                    className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                                        template.id === 'academic' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                                        template.id === 'case-study' ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white' :
                                        template.id === 'literature-review' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                                        'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                    }`}>
                                        {template.id === 'academic' && <HiOutlineAcademicCap className="w-6 h-6" />}
                                        {template.id === 'case-study' && <HiOutlineDocumentReport className="w-6 h-6" />}
                                        {template.id === 'literature-review' && <HiOutlineBookOpen className="w-6 h-6" />}
                                        {template.id === 'lab-report' && <HiOutlineBeaker className="w-6 h-6" />}
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary-700 transition-colors">{template.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{template.description}</p>
                                    <div className="mt-auto pt-4 flex items-center text-[10px] font-bold text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Use Template →
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-200 mb-12" />

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Documents</h2>
                            <p className="text-slate-400 text-sm font-medium">Continue working on your research</p>
                        </div>
                        <button
                            onClick={() => handleNewDocument()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                        >
                            <HiPlus className="w-4 h-4" />
                            Blank Page
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <HiDocumentText className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No documents yet</h3>
                                <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto font-medium">Choose a template above or start with a blank page to begin your research.</p>
                                <button
                                    onClick={() => handleNewDocument()}
                                    className="px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition shadow-lg shadow-primary-200"
                                >
                                    Create First Document
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleOpenDocument(doc.id)}
                                        className="bg-white p-5 hover:bg-slate-50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <HiDocumentText className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                        LAST EDITED • {new Date(doc.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleDeleteDocument(doc.id, e)}
                                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Document"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
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

    return (
        <div className="w-full h-screen">
            <div className="flex flex-col h-full bg-[#f8fafc] border-t border-slate-200 overflow-hidden font-sans">
                {/* Header */}
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { 
                                    cancelSave(); 
                                    router.push('/editor');
                                }}
                                className="flex items-center gap-2 group hover:opacity-80 transition"
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-lg shadow-sm">
                                    <span className="font-bold leading-none text-sm">S</span>
                                </div>
                                <span className="text-xl font-bold text-primary-800 hidden sm:block">ScholarAssist</span>
                            </button>
                            <div className="w-px h-6 bg-slate-200" />
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="text-sm font-extrabold text-[#0f172a] tracking-wide bg-transparent border-none outline-none hover:bg-slate-100 focus:bg-white px-2 py-1 rounded transition max-w-[200px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                            {saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'error' ? 'ERROR' : 'SAVED TO CLOUD'}
                        </div>
                        <button className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-md">
                            Publish
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden bg-[#e2e8f0]">
                    <SectionsSidebar editor={editor} sections={sections} onAddSection={handleAddSection} />

                    <div className="flex-1 flex flex-col relative h-full">
                        <div className="absolute top-4 inset-x-0 z-10 flex justify-center pointer-events-none">
                            <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl border border-slate-200 rounded-2xl">
                                <EditorToolbar editor={editor} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pt-24 pb-12 px-8 flex justify-center custom-scrollbar focus-within:bg-[#f1f5f9] transition-colors duration-500">
                            <div className="w-full max-w-[850px]">
                                <div
                                    className="bg-white rounded-sm mb-8"
                                    style={{
                                        minHeight: '1123px',
                                        boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase z-20">
                            <div>{editor?.getText()?.trim() ? editor!.getText().trim().split(/\s+/).length : 0} Words | 1 Page | 100% Zoom</div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    LIVE SYNC ACTIVE
                                </div>
                                <span>{language}</span>
                            </div>
                        </div>
                    </div>

                    <DocumentStats 
                        editor={editor} 
                        margins={margins} 
                        setMargins={setMargins} 
                        language={language} 
                        setLanguage={setLanguage}
                        lineHeight={lineHeight}
                        setLineHeight={setLineHeight}
                    />
                </div>
            </div>
        </div>
    );
}
