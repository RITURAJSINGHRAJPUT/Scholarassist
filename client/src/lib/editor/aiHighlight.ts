import { Mark, mergeAttributes } from '@tiptap/core';

export interface AIHighlightOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        aiHighlight: {
            setAIHighlight: (attributes?: { reason?: string }) => ReturnType;
            toggleAIHighlight: (attributes?: { reason?: string }) => ReturnType;
            unsetAIHighlight: () => ReturnType;
        };
    }
}

export const AIHighlight = Mark.create<AIHighlightOptions>({
    name: 'aiHighlight',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'ai-flagged cursor-help border-b-2 border-red-400 bg-red-50 relative group transition-colors hover:bg-red-100',
            },
        };
    },

    addAttributes() {
        return {
            reason: {
                default: null,
                parseHTML: element => element.getAttribute('data-reason'),
                renderHTML: attributes => {
                    if (!attributes.reason) return {};
                    return {
                        'data-reason': attributes.reason,
                        'title': attributes.reason, // Native tooltip for hover
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span.ai-flagged',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setAIHighlight: attributes => ({ commands }) => {
                return commands.setMark(this.name, attributes);
            },
            toggleAIHighlight: attributes => ({ commands }) => {
                return commands.toggleMark(this.name, attributes);
            },
            unsetAIHighlight: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },
});

export function applyAIHighlights(editor: any, sentences: Array<{text: string; reasons: string[]}>) {
    if (!editor) return;

    // First unset all existing highlights
    const { state, view } = editor;
    const { tr, doc } = state;

    doc.descendants((node: any, pos: number) => {
        if (!node.isText) return;
        const marks = node.marks.filter((m: any) => m.type.name === 'aiHighlight');
        if (marks.length > 0) {
            tr.removeMark(pos, pos + node.nodeSize, state.schema.marks.aiHighlight);
        }
    });

    if (sentences.length === 0) {
        view.dispatch(tr);
        return;
    }

    // Now apply new highlights
    sentences.forEach((flag) => {
        const textToFind = flag.text;
        
        doc.descendants((node: any, pos: number) => {
            if (!node.isText) return;

            const text = node.text;
            const index = text.indexOf(textToFind);
            
            if (index !== -1) {
                const mark = state.schema.marks.aiHighlight.create({
                    reason: flag.reasons.join(', ')
                });
                tr.addMark(pos + index, pos + index + textToFind.length, mark);
            } else {
                // Handle cases where the sentence might be split across multiple text nodes (optional/complex)
                // For simplicity, we just check direct matches in single paragraphs.
            }
        });
    });

    view.dispatch(tr);
}
