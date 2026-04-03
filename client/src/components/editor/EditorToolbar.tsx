'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
    HiCode,
    HiOutlinePhotograph,
    HiOutlineTable,
} from 'react-icons/hi';

interface ToolbarProps {
    editor: Editor | null;
}

const FONTS = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Newsreader', value: 'var(--font-serif), Newsreader, serif' },
    { label: 'Roboto', value: 'var(--font-roboto), Roboto, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
];

const FONT_SIZES = [
    '8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '30pt', '36pt', '48pt', '60pt', '72pt'
];

const LINE_HEIGHTS = [
    { label: 'Single', value: '1.0' },
    { label: '1.15', value: '1.15' },
    { label: '1.5', value: '1.5' },
    { label: 'Double', value: '2.0' },
];

export default function EditorToolbar({ editor }: ToolbarProps) {
    const [, setUpdate] = useState(0);

    // Force re-render on editor transactions (selection change, content change)
    useEffect(() => {
        if (!editor) return;
        const handler = () => setUpdate(s => s + 1);
        editor.on('transaction', handler);
        return () => {
            editor.off('transaction', handler);
        };
    }, [editor]);

    if (!editor) return null;

    const currentFont = editor.getAttributes('textStyle').fontFamily || '"Times New Roman", serif';
    const currentSize = editor.getAttributes('textStyle').fontSize || '12pt';
    const currentLineHeight = editor.getAttributes('paragraph').lineHeight || '1.15';


    return (
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 flex items-center gap-1.5 flex-wrap border-b border-slate-200">
            {/* Font Control Group */}
            <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <div className="relative group">
                    <select
                        value={currentFont}
                        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 pr-8 text-xs font-medium text-slate-700 cursor-pointer hover:border-primary-300 transition focus:outline-none focus:ring-2 focus:ring-primary-500/10 min-w-[120px]"
                    >
                        {FONTS.map(f => (
                            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none group-hover:text-slate-600 transition">▼</span>
                </div>

                <div className="relative">
                    <select
                        value={currentSize}
                        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 cursor-pointer hover:border-primary-300 transition focus:outline-none focus:ring-2 focus:ring-primary-500/10 min-w-[60px]"
                    >
                        {FONT_SIZES.map(s => (
                            <option key={s} value={s}>{s.replace(/px|pt/g, '')}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-0.5" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive('bold') ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Bold"
                >
                    <span className="font-bold w-4 h-4 flex items-center justify-center text-[13px]">B</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive('italic') ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Italic"
                >
                    <span className="italic w-4 h-4 flex items-center justify-center text-[13px]">I</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive('underline') ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Underline"
                >
                    <span className="underline w-4 h-4 flex items-center justify-center text-[13px]">U</span>
                </button>
            </div>

            {/* Structure Group */}
            <div className="flex items-center gap-0.5 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Heading 1"
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Heading 2"
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive('bulletList') ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Bullet List"
                >
                    •≡
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive('orderedList') ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Numbered List"
                >
                    1≡
                </button>
            </div>

            {/* Alignment Group */}
            <div className="flex items-center gap-0.5 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Align Left"
                >
                    ←
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Align Center"
                >
                    ↔
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Align Right"
                >
                    →
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-0.5" />

            {/* Line Height Group */}
            <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <select
                    value={currentLineHeight}
                    onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 cursor-pointer hover:border-primary-300 transition focus:outline-none min-w-[70px]"
                >
                    {LINE_HEIGHTS.map(lh => (
                        <option key={lh.value} value={lh.value}>{lh.label}</option>
                    ))}
                </select>
            </div>

            {/* Advanced Inserts */}
            <div className="flex items-center gap-0.5 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                <button
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className="p-1.5 rounded-lg text-sm transition-all hover:bg-primary-50 text-slate-600 hover:text-primary-600"
                    title="Insert Table"
                >
                    <HiOutlineTable className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        const url = window.prompt('Enter image URL:');
                        if (url) editor.chain().focus().setImage({ src: url }).run();
                    }}
                    className="p-1.5 rounded-lg text-sm transition-all hover:bg-primary-50 text-slate-600 hover:text-primary-600"
                    title="Insert Image"
                >
                    <HiOutlinePhotograph className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-1.5 rounded-lg text-sm transition-all ${editor.isActive('codeBlock') ? 'bg-white shadow-sm text-primary-600 border border-slate-200' : 'text-slate-600 hover:bg-white/80'}`}
                    title="Code Block"
                >
                    <HiCode className="w-4 h-4" />
                </button>
            </div>

            {/* History Group */}
            <div className="flex items-center gap-0.5 bg-slate-50/50 p-1 rounded-xl border border-slate-100 ml-auto">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-1.5 rounded-lg text-sm text-slate-600 hover:bg-white/80 transition-all font-bold"
                    title="Undo"
                >
                    ↩
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-1.5 rounded-lg text-sm text-slate-600 hover:bg-white/80 transition-all font-bold"
                    title="Redo"
                >
                    ↪
                </button>
            </div>

        </div>
    );
}
