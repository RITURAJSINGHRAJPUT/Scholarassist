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
      setCitation: (attributes: { 
        id: string, 
        author: string, 
        year: string, 
        title: string, 
        type?: string,
        journal?: string,
        doi?: string,
        volumeIssue?: string,
        pages?: string,
        number?: number 
      }) => ReturnType;
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
      type: {
        default: 'Journal',
      },
      journal: {
        default: null,
      },
      doi: {
        default: null,
      },
      volumeIssue: {
        default: null,
      },
      pages: {
        default: null,
      },
      number: {
        default: 1,
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
        class: 'cursor-pointer hover:underline antialiased',
      }),
      `[${HTMLAttributes.number}]`,
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
