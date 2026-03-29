'use client';

import { Editor } from '@tiptap/react';
import {
    HiCode,
    HiOutlineBookOpen,
} from 'react-icons/hi';

interface ToolbarProps {
    editor: Editor | null;
}

interface ToolbarButton {
    icon: React.ReactNode;
    title: string;
    action: () => void;
    isActive?: boolean;
}

const FONTS = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Newsreader', value: 'Newsreader, serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
];

const FONT_SIZES = [
    '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'
];

export default function EditorToolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

    const currentFont = editor.getAttributes('textStyle').fontFamily || 'Inter, sans-serif';
    const currentSize = editor.getAttributes('textStyle').fontSize || '16px';

    const buttonGroups: ToolbarButton[][] = [
        // Text formatting
        [
            {
                icon: <span className="font-bold text-sm">B</span>,
                title: 'Bold',
                action: () => editor.chain().focus().toggleBold().run(),
                isActive: editor.isActive('bold'),
            },
            {
                icon: <span className="italic text-sm">I</span>,
                title: 'Italic',
                action: () => editor.chain().focus().toggleItalic().run(),
                isActive: editor.isActive('italic'),
            },
            {
                icon: <span className="underline text-sm">U</span>,
                title: 'Underline',
                action: () => editor.chain().focus().toggleUnderline().run(),
                isActive: editor.isActive('underline'),
            },
            {
                icon: <span className="line-through text-sm">S</span>,
                title: 'Strikethrough',
                action: () => editor.chain().focus().toggleStrike().run(),
                isActive: editor.isActive('strike'),
            },
        ],
        // Headings
        [
            {
                icon: <span className="text-xs font-bold">H1</span>,
                title: 'Heading 1',
                action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: editor.isActive('heading', { level: 1 }),
            },
            {
                icon: <span className="text-xs font-bold">H2</span>,
                title: 'Heading 2',
                action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                isActive: editor.isActive('heading', { level: 2 }),
            },
            {
                icon: <span className="text-xs font-bold">H3</span>,
                title: 'Heading 3',
                action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                isActive: editor.isActive('heading', { level: 3 }),
            },
        ],
        // Lists
        [
            {
                icon: <span className="text-sm">•≡</span>,
                title: 'Bullet List',
                action: () => editor.chain().focus().toggleBulletList().run(),
                isActive: editor.isActive('bulletList'),
            },
            {
                icon: <span className="text-sm">1≡</span>,
                title: 'Numbered List',
                action: () => editor.chain().focus().toggleOrderedList().run(),
                isActive: editor.isActive('orderedList'),
            },
        ],
        // Alignment
        [
            {
                icon: <span className="text-xs">≡←</span>,
                title: 'Align Left',
                action: () => editor.chain().focus().setTextAlign('left').run(),
                isActive: editor.isActive({ textAlign: 'left' }),
            },
            {
                icon: <span className="text-xs">≡↔</span>,
                title: 'Align Center',
                action: () => editor.chain().focus().setTextAlign('center').run(),
                isActive: editor.isActive({ textAlign: 'center' }),
            },
            {
                icon: <span className="text-xs">≡→</span>,
                title: 'Align Right',
                action: () => editor.chain().focus().setTextAlign('right').run(),
                isActive: editor.isActive({ textAlign: 'right' }),
            },
            {
                icon: <span className="text-xs">≡↕</span>,
                title: 'Justify',
                action: () => editor.chain().focus().setTextAlign('justify').run(),
                isActive: editor.isActive({ textAlign: 'justify' }),
            },
        ],
        // Inserts
        [
            {
                icon: <HiCode className="w-4 h-4" />,
                title: 'Code Block',
                action: () => editor.chain().focus().toggleCodeBlock().run(),
                isActive: editor.isActive('codeBlock'),
            },
            {
                icon: <span className="text-xs">▦</span>,
                title: 'Insert Table',
                action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            },
            {
                icon: <HiOutlineBookOpen className="w-4 h-4" />,
                title: 'Insert Citation',
                action: () => {
                    const author = window.prompt('Enter author name:');
                    const year = window.prompt('Enter year:');
                    const title = window.prompt('Enter title:');
                    if (author && year && title) {
                        editor.chain().focus().setCitation({ id: Date.now().toString(), author, year, title }).run();
                    }
                },
                isActive: editor.isActive('citation'),
            },
            {
                icon: <span className="text-xs">🖼</span>,
                title: 'Insert Image',
                action: () => {
                    const url = window.prompt('Enter image URL:');
                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                },
            },
        ],
        // Undo/Redo
        [
            {
                icon: <span className="text-sm">↩</span>,
                title: 'Undo',
                action: () => editor.chain().focus().undo().run(),
            },
            {
                icon: <span className="text-sm">↪</span>,
                title: 'Redo',
                action: () => editor.chain().focus().redo().run(),
            },
        ],
    ];

    return (
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 flex items-center gap-1 flex-wrap shadow-sm">
            {/* Font Family Dropdown */}
            <div className="relative mr-2 group">
                <select
                    value={currentFont}
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-2 py-1.5 pr-8 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                    {FONTS.map(f => (
                        <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                            {f.label}
                        </option>
                    ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none group-hover:text-slate-600 transition">▼</span>
            </div>

            {/* Font Size Dropdown */}
            <div className="relative mr-2 group">
                <select
                    value={currentSize}
                    onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-2 py-1.5 pr-6 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                    {FONT_SIZES.map(s => (
                        <option key={s} value={s}>{s.replace('px', '')}</option>
                    ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none group-hover:text-slate-600 transition">▼</span>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {buttonGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex items-center gap-0.5">
                    {group.map((btn, btnIndex) => (
                        <button
                            key={btnIndex}
                            onClick={btn.action}
                            title={btn.title}
                            className={`p-2 rounded-lg text-sm transition-all duration-150 hover:bg-primary-50 hover:text-primary-700 ${
                                btn.isActive
                                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                                    : 'text-slate-600'
                            }`}
                        >
                            {btn.icon}
                        </button>
                    ))}
                    {groupIndex < buttonGroups.length - 1 && (
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                    )}
                </div>
            ))}
        </div>
    );
}
