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
    HiOutlineDocumentReport,
    HiSave,
    HiOutlineArrowLeft,
    HiCheck,
    HiX
} from 'react-icons/hi';
import api from '@/lib/api';
import type { Paragraph } from 'docx';

import EditorToolbar from '@/components/editor/EditorToolbar';
import SectionsSidebar, { DEFAULT_SECTIONS } from '@/components/editor/SectionsSidebar';
import DocumentStats from '@/components/editor/DocumentStats';
import { useDocuments, type DocumentListItem } from '@/lib/useDocuments';
import { useAutoSave } from '@/lib/useAutoSave';
import { useContentAnalysis } from '@/lib/useContentAnalysis';
import HeatmapPreview from '@/components/editor/HeatmapPreview';
import { useAuth } from '@/lib/AuthContext';

// Standard hardcoded templates as a robust fallback
const FALLBACK_TEMPLATES = [
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
        layout: 'single',
    },
    {
        id: 'ieee-journal',
        title: 'IEEE conference paper',
        description: 'Official format for IEEE conference proceedings including multi-column authors and centered headings.',
        icon: 'academic',
        content: {
            type: 'doc',
            content: [
                { type: 'heading', attrs: { level: 1, textAlign: 'center' }, content: [{ type: 'text', text: 'Paper Title* (use style: paper title)' }] },
                {
                    type: 'paragraph',
                    attrs: { textAlign: 'center' },
                    content: [{ type: 'text', text: '*Note: Sub-titles are not captured in Xplore and should not be used', marks: [{ type: 'italic' }] }]
                },
                {
                    type: 'table',
                    content: [
                        {
                            type: 'tableRow',
                            content: [
                                {
                                    type: 'tableCell',
                                    content: [
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '1st Given Name Surname', marks: [{ type: 'bold' }] }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'dept. name of organization', marks: [{ type: 'italic' }] }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '(of Affiliation)' }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'City, Country' }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'email address or ORCID' }] },
                                    ]
                                },
                                {
                                    type: 'tableCell',
                                    content: [
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '2nd Given Name Surname', marks: [{ type: 'bold' }] }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'dept. name of organization', marks: [{ type: 'italic' }] }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '(of Affiliation)' }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'City, Country' }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'email address or ORCID' }] },
                                    ]
                                },
                                {
                                    type: 'tableCell',
                                    content: [
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '3rd Given Name Surname', marks: [{ type: 'bold' }] }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'dept. name of organization', marks: [{ type: 'italic' }] }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '(of Affiliation)' }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'City, Country' }] },
                                        { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'email address or ORCID' }] },
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { type: 'paragraph', content: [{ type: 'text', text: 'Abstract---This electronic document is a “live” template and already defines the components of your paper [title, text, heads, etc.] in its style sheet. *CRITICAL: Do Not Use Symbols, Special Characters, Footnotes, or Math in Paper Title or Abstract. (Abstract)', marks: [{ type: 'bold' }, { type: 'italic' }] }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'Keywords---component, formatting, style, styling, insert (key words)', marks: [{ type: 'bold' }, { type: 'italic' }] }] },
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'I. INTRODUCTION' }] },
                { type: 'paragraph', content: [{ type: 'text', text: 'This template, modified in MS Word 2007 and saved as a “Word 97-2003 Document” for the PC, provides authors with most of the formatting specifications needed for preparing electronic versions of their papers. All standard paper components have been specified for three reasons: (1) ease of use when formatting individual papers, (2) automatic compliance to electronic requirements that facilitate concurrent or later production of electronic products, and (3) conformity of style throughout a conference proceedings. Margins, column widths, line spacing, and type styles are built-in; examples of the type styles are provided throughout this document and are identified in italic type, within parentheses, following the example. Some components, such as multi-leveled equations, graphics, and tables are not prescribed, although the various table text styles are provided. The formatter will need to create these components, incorporating the applicable criteria that follow.' }] },
            ],
        },
        layout: 'ieee-journal',
    }
];

const DEFAULT_TEMPLATE_CONTENT = FALLBACK_TEMPLATES[0].content;

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
    const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
    const [editorText, setEditorText] = useState('');
    const [activeLayout, setActiveLayout] = useState('single');
    const [templateLoading, setTemplateLoading] = useState<string | null>(null);
    const [templates, setTemplates] = useState<any[]>(FALLBACK_TEMPLATES);

    // Fetch dynamic templates
    const fetchTemplates = useCallback(async () => {
        try {
            const res = await api.get('/templates');
            if (res.data && res.data.length > 0) {
                setTemplates(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch dynamic templates, using fallbacks:', error);
            // Stay with FALLBACK_TEMPLATES
        }
    }, []);

    const getTemplateIcon = (iconName: string) => {
        switch (iconName) {
            case 'academic': return <HiOutlineAcademicCap className="w-6 h-6" />;
            case 'case':
            case 'case-study': return <HiOutlineDocumentReport className="w-6 h-6" />;
            case 'lit':
            case 'literature-review': return <HiOutlineBookOpen className="w-6 h-6" />;
            case 'lab':
            case 'lab-report': return <HiOutlineBeaker className="w-6 h-6" />;
            case 'ieee':
            case 'ieee-journal': return <HiDocumentText className="w-6 h-6" />;
            default: return <HiDocumentText className="w-6 h-6" />;
        }
    };

    const isIEEE = useMemo(() => {
        return activeLayout === 'ieee-journal' || 
               activeLayout === 'ieee-conference' || 
               activeLayout === 'academic' || 
               currentTitle.toLowerCase().includes('ieee');
    }, [activeLayout, currentTitle]);

    // Force line-height for IEEE
    useEffect(() => {
        if (isIEEE) {
            setLineHeight('1.0');
        }
    }, [isIEEE]);

    const { isAuthenticated, setShowAuthModal } = useAuth();

    // Document Settings State
    const [margins, setMargins] = useState('STANDARD');
    const [language, setLanguage] = useState('ENGLISH (US)');
    const [lineHeight, setLineHeight] = useState('1.5');

    // Manual Save & Exit States
    const [isDirty, setIsDirty] = useState(false);
    const [isSavedInDB, setIsSavedInDB] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

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
                class: `prose prose-slate max-w-none focus:outline-none min-h-[1050px] transition-all duration-300 bg-white py-16 ${
                    activeLayout === 'ieee-journal' 
                        ? 'px-16' // Strict IEEE padding
                        : `${margins === 'NARROW' ? 'px-8' : margins === 'WIDE' ? 'px-32' : 'px-20'} ${activeLayout === 'two-column' ? 'two-column-editor' : ''}`
                }`,
            },
        },
        onUpdate: ({ editor }) => {
            setEditorText(editor.getText() || '');
            setIsDirty(true);
            if (currentDocId) {
                triggerSave({
                    title: currentTitle,
                    content: editor.getJSON(),
                    layout: activeLayout,
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

    const contentData = useContentAnalysis(editorText);

    // Handle PDF Export
    const handleExportPDF = useCallback(async () => {
        const editorElement = document.querySelector('.ProseMirror');
        if (!editorElement) return;

        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default;

        const opt = {
            margin: (activeLayout === 'ieee-journal' ? [19, 16, 25, 16] : [20, 15, 20, 15]) as [number, number, number, number],
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
        
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('export-pdf', pdfHandler);
            document.removeEventListener('export-docx', docxHandler);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleExportPDF, handleExportDocx, isDirty]);

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
        fetchTemplates();
        
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
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            setTemplateLoading(templateId || 'blank');
            const template = templates.find(t => t.id === templateId) || templates[0];
            const layout = template.layout || 'single';
            const doc = await createDocument('Untitled ' + template.title, template.content, layout);
            
            // Navigate to new URL
            router.push(`/editor?id=${doc.id}`);
            
            setCurrentDocId(doc.id);
            setCurrentTitle(doc.title);
            setIsSavedInDB(false);
            setIsDirty(false);
            setActiveLayout(layout);
            if (layout === 'ieee-journal') setLineHeight('1.0');
            setSections(template.sections || []);
            editor?.commands.setContent(template.content);
            setShowDocList(false);
            await loadDocuments();
        } catch (error) {
            console.error('Failed to create document:', error);
            alert('Failed to create document. Please ensure you are logged in.');
        } finally {
            setTemplateLoading(null);
        }
    }, [createDocument, editor, loadDocuments, router, isAuthenticated, setShowAuthModal]);

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
                setIsSavedInDB(doc.is_saved);
                setIsDirty(false);
                const layout = doc.layout || 'single';
                setActiveLayout(layout);
                if (layout === 'ieee-journal') setLineHeight('1.0');

                const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
                if (content && Object.keys(content).length > 0) {
                    editor?.commands.setContent(content);
                } else {
                    editor?.commands.setContent(DEFAULT_TEMPLATE_CONTENT);
                }
                setEditorText(editor?.getText() || '');

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
            setIsDirty(true);
            if (currentDocId) {
                triggerSave({ title: newTitle });
            }
        },
        [currentDocId, triggerSave]
    );

    const handleSaveManual = useCallback(async () => {
        if (!currentDocId || !editor) return;
        try {
            await updateDocument(currentDocId, {
                title: currentTitle,
                content: editor.getJSON(),
                layout: activeLayout,
                is_saved: true
            });
            setIsDirty(false);
            setIsSavedInDB(true);
            await loadDocuments(); // Refresh history
        } catch (error) {
            console.error('Failed to manual save:', error);
        }
    }, [currentDocId, editor, currentTitle, activeLayout, updateDocument, loadDocuments]);

    const handleExitEditor = useCallback(() => {
        if (isDirty) {
            setShowExitModal(true);
        } else {
            router.push('/editor');
            setShowDocList(true);
            setCurrentDocId(null);
        }
    }, [isDirty, router]);

    const handleConfirmExit = useCallback((save: boolean) => {
        if (save) {
            handleSaveManual().then(() => {
                setShowExitModal(false);
                router.push('/editor');
                setShowDocList(true);
                setCurrentDocId(null);
            });
        } else {
            setShowExitModal(false);
            setIsDirty(false); // Reset dirty so unload doesn't trigger
            router.push('/editor');
            setShowDocList(true);
            setCurrentDocId(null);
        }
    }, [handleSaveManual, router]);

    const handleAddSection = useCallback((name: string) => {
        setSections((prev) => [...prev, name]);
    }, []);

    // Document list view
    if (showDocList) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f8f9fc] pt-16">


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
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleNewDocument(template.id)}
                                    disabled={templateLoading !== null}
                                    className={`group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 text-left flex flex-col h-full ${templateLoading === template.id ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                                        template.icon === 'academic' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                                        template.icon === 'case' || template.icon === 'case-study' ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white' :
                                        template.icon === 'lit' || template.icon === 'literature-review' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                                        template.icon === 'lab' || template.icon === 'lab-report' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                        'bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white'
                                    }`}>
                                        {getTemplateIcon(template.icon)}
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary-700 transition-colors">{template.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{template.description}</p>
                                    <div className="mt-auto pt-4 flex items-center text-[10px] font-bold text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        {templateLoading === template.id ? 'Loading...' : 'Use Template →'}
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
        <div className="w-full h-screen pt-16">
            <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-sans">
                {/* Header */}
                <div className="bg-[#f8fafc] border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExitEditor}
                                className="flex items-center gap-2 group hover:opacity-80 transition"
                            >
                                <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm group-hover:border-primary-400 transition">
                                    <HiOutlineArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 hidden sm:block uppercase tracking-widest group-hover:text-slate-600">Exit Editor</span>
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
                            {saveStatus === 'saving' ? 'AUTO-SAVING...' : 'CLOUD SYNC READY'}
                        </div>
                        <button 
                            onClick={handleSaveManual}
                            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2 ${
                                isDirty 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse-subtle' 
                                    : 'bg-white border border-slate-200 text-slate-500 cursor-default'
                            }`}
                        >
                            {isDirty ? <HiSave className="w-4 h-4" /> : <HiCheck className="w-4 h-4" />}
                            {isSavedInDB ? (isDirty ? 'Save Changes' : 'Already Saved') : 'Save to History'}
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

                        {/* Split Pane View Structure */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Editor Pane */}
                            <div className={`flex-1 overflow-y-auto pt-24 pb-12 flex justify-center custom-scrollbar focus-within:bg-[#f1f5f9] transition-colors duration-500 ${isHeatmapOpen ? 'px-4' : 'px-8'}`}>
                                <div className="w-full max-w-[850px]">
                                    <div
                                        className={`bg-white rounded-sm mb-8 ${isIEEE ? 'ieee-format' : ''}`}
                                        style={{
                                            minHeight: activeLayout === 'ieee-journal' ? 'auto' : '1123px',
                                            boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap Pane */}
                            {isHeatmapOpen && (
                                <div className="w-1/2 h-full border-l border-slate-200 shadow-xl z-10 bg-white">
                                    <HeatmapPreview 
                                        aiResult={contentData.aiResult} 
                                        isAnalyzing={contentData.isAnalyzing}
                                        onClose={() => setIsHeatmapOpen(false)}
                                    />
                                </div>
                            )}
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
                        contentData={contentData}
                        isHeatmapOpen={isHeatmapOpen}
                        onToggleHeatmap={() => setIsHeatmapOpen(!isHeatmapOpen)}
                    />
                </div>
            </div>

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-md w-full p-10 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                            <HiSave className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 text-center tracking-tight">Unsaved Changes</h3>
                        <p className="text-slate-500 mb-10 leading-relaxed text-center font-medium">
                            You have made changes to your research paper. Would you like to save them before leaving?
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => handleConfirmExit(true)}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <HiCheck className="w-5 h-5" />
                                Save and Exit
                            </button>
                            <button
                                onClick={() => handleConfirmExit(false)}
                                className="w-full py-4 bg-white text-slate-500 font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <HiTrash className="w-5 h-5" />
                                Discard Changes
                            </button>
                            <button
                                onClick={() => setShowExitModal(false)}
                                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                            >
                                Keep Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
