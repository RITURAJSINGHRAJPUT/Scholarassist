'use client';

import { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { HiPlus, HiDocumentText } from 'react-icons/hi';

const DEFAULT_SECTIONS = [
    'Title',
    'Abstract',
    'Introduction',
    'Literature Review',
    'Methodology',
    'Results',
    'Discussion',
    'Conclusion',
    'References',
];

interface SectionsSidebarProps {
    editor: Editor | null;
    sections: string[];
    onAddSection: (name: string) => void;
}

export default function SectionsSidebar({ editor, sections, onAddSection }: SectionsSidebarProps) {
    const scrollToSection = useCallback(
        (sectionName: string) => {
            if (!editor) return;

            const editorElement = editor.view.dom;
            const headings = editorElement.querySelectorAll('h1, h2, h3');
            
            for (const heading of headings) {
                if (heading.textContent?.trim().toLowerCase() === sectionName.toLowerCase()) {
                    heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
        },
        [editor]
    );

    const insertSection = useCallback(
        (sectionName: string) => {
            if (!editor) return;

            editor
                .chain()
                .focus()
                .insertContent([
                    {
                        type: 'heading',
                        attrs: { level: 2 },
                        content: [{ type: 'text', text: sectionName }],
                    },
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: '' }],
                    },
                ])
                .run();
        },
        [editor]
    );

    const handleAddCustomSection = useCallback(() => {
        const name = window.prompt('Enter section name:');
        if (name?.trim()) {
            onAddSection(name.trim());
            insertSection(name.trim());
        }
    }, [onAddSection, insertSection]);

    return (
        <aside className="w-56 bg-[#f8fafc] border-r border-slate-200 h-full overflow-y-auto flex-shrink-0">
            <div className="p-5">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Sections
                </h3>
                <nav className="space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section}
                            onClick={() => scrollToSection(section)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary-700 hover:bg-slate-100 rounded-lg transition-colors text-left group"
                        >
                            <HiDocumentText className="w-4 h-4 text-slate-400 group-hover:text-primary-500 flex-shrink-0" />
                            <span className="truncate">{section}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                        onClick={handleAddCustomSection}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                    >
                        <HiPlus className="w-4 h-4" />
                        Add Section
                    </button>
                </div>
            </div>
        </aside>
    );
}

export { DEFAULT_SECTIONS };
