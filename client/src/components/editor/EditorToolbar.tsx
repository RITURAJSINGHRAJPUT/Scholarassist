'use client';

import { Editor } from '@tiptap/react';
import {
    HiCode,
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

export default function EditorToolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

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
            {/* Font Family (Mock) */}
            <div className="flex items-center gap-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 mr-2 cursor-pointer hover:bg-slate-50 transition">
                <span className="font-serif">Newsreader</span>
                <span className="text-[10px] ml-4 text-slate-400">▼</span>
            </div>

            {/* Font Size (Mock) */}
            <div className="flex items-center gap-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 mr-2 cursor-pointer hover:bg-slate-50 transition">
                <span>12</span>
                <span className="text-[10px] ml-2 text-slate-400">▼</span>
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
