import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /** Wraps the selection in a boxed aside, or unwraps it if already in one. */
      toggleCallout: () => ReturnType;
    };
  }
}

/**
 * Word's Text Box, in the shape a news page actually uses it: the boxed
 * "fact box" or pull-out that sits beside a story.
 *
 * Content is editable inside the box rather than being a separate overlay, so
 * it flows with the article and reads correctly on mobile — a floating,
 * absolutely-positioned text box would not.
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "aside.ln-callout" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { class: "ln-callout" }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleCallout:
        () =>
        ({ commands, editor }) =>
          editor.isActive(this.name)
            ? commands.lift(this.name)
            : commands.wrapIn(this.name),
    };
  },
});
