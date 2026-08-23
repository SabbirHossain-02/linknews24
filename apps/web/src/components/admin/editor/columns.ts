import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columnBlock: {
      /** Wrap the selected blocks in a 2- or 3-column section, or unwrap. */
      setColumnCount: (count: 1 | 2 | 3) => ReturnType;
    };
  }
}

/**
 * A multi-column section, the way a newspaper sets a feature.
 *
 * The first attempt put `column-count` on a single paragraph, which is almost
 * never what someone means by "two columns" — and with one short paragraph it
 * looked like the button did nothing. This wraps whatever blocks are selected,
 * so the text flows across the columns as it does in print.
 */
export const ColumnBlock = Node.create({
  name: "columnBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      count: {
        default: 2,
        parseHTML: (element) =>
          parseInt((element as HTMLElement).style.columnCount || "2", 10) || 2,
        renderHTML: (attrs) => ({
          style: `column-count:${attrs.count};column-gap:2.2em`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.ln-columns" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "ln-columns" }),
      0,
    ];
  },

  addCommands() {
    return {
      setColumnCount:
        (count) =>
        ({ editor, commands }) => {
          // One column means "not a column section" — unwrap it.
          if (count === 1)
            return editor.isActive(this.name) ? commands.lift(this.name) : true;

          return editor.isActive(this.name)
            ? commands.updateAttributes(this.name, { count })
            : commands.wrapIn(this.name, { count });
        },
    };
  },
});
