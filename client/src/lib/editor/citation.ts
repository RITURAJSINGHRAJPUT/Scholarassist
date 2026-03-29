import { Node, mergeAttributes } from '@tiptap/core';

export interface CitationOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      /**
       * Add a citation
       */
      setCitation: (attributes: { id: string, author: string, year: string, title: string }) => ReturnType;
    };
  }
}

export const Citation = Node.create<CitationOptions>({
  name: 'citation',

  group: 'inline',

  inline: true,

  selectable: true,

  draggable: true,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      author: {
        default: null,
      },
      year: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="citation"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'citation',
        class: 'bg-primary-50 text-primary-700 px-1 rounded cursor-pointer hover:bg-primary-100 transition-colors border border-primary-200 text-[10px] font-bold mx-0.5 align-top',
      }),
      `${HTMLAttributes.author}, ${HTMLAttributes.year}`,
    ];
  },

  addCommands() {
    return {
      setCitation: (attributes) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: attributes,
          })
          .run();
      },
    };
  },
});
