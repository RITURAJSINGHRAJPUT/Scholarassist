import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      /**
       * Set the line height
       */
      setLineHeight: (lineHeight: string) => ReturnType;
      /**
       * Unset the line height
       */
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: 'normal',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: attributes => {
              if (attributes.lineHeight === this.options.defaultLineHeight) {
                return {};
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ commands }) => {
        this.options.types.forEach((type: string) => commands.updateAttributes(type, { lineHeight }));
        return true;
      },
      unsetLineHeight: () => ({ commands }) => {
        this.options.types.forEach((type: string) => commands.resetAttributes(type, 'lineHeight'));
        return true;
      },
    };
  },
});
