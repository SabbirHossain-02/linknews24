import { Extension, type CommandProps } from "@tiptap/core";

/** Blocks that can carry Word-style paragraph formatting. */
const BLOCK_TYPES = ["paragraph", "heading", "blockquote"];

const INDENT_STEP = 32; // px per Word "increase indent" press
const MAX_INDENT = 8;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockAttributes: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
      setParagraphSpacing: (space: string | null) => ReturnType;
      toggleDropCap: () => ReturnType;
      /** Named `setBlockDirection` because TipTap already owns `setTextDirection`. */
      setBlockDirection: (dir: "ltr" | "rtl" | null) => ReturnType;
      /** Flow the block's text into 1, 2 or 3 newspaper columns. */
      setColumns: (count: 1 | 2 | 3) => ReturnType;
      /** Break long words at line ends, the way print does. */
      toggleHyphenation: () => ReturnType;
    };
  }
}

/**
 * Word-style paragraph attributes that TipTap has no built-in extension for:
 * left indent, space-after, drop cap and text direction.
 *
 * All four are stored as plain attributes and rendered as inline `style` /
 * `class` on the block, so the HTML the editor produces renders identically on
 * the public article page (which styles the same markup under `.ln-editor`).
 */
export const BlockAttributes = Extension.create({
  name: "blockAttributes",

  addGlobalAttributes() {
    return [
      {
        types: BLOCK_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const ml = element.style.marginLeft;
              if (!ml) return 0;
              return Math.min(
                Math.round(parseInt(ml, 10) / INDENT_STEP) || 0,
                MAX_INDENT,
              );
            },
            renderHTML: (attrs) =>
              attrs.indent
                ? { style: `margin-left:${attrs.indent * INDENT_STEP}px` }
                : {},
          },
          spacing: {
            default: null,
            parseHTML: (element) => element.style.marginBottom || null,
            renderHTML: (attrs) =>
              attrs.spacing ? { style: `margin-bottom:${attrs.spacing}` } : {},
          },
          dropcap: {
            default: false,
            parseHTML: (element) => element.classList.contains("ln-dropcap"),
            renderHTML: (attrs) =>
              attrs.dropcap ? { class: "ln-dropcap" } : {},
          },
          dir: {
            default: null,
            parseHTML: (element) => element.getAttribute("dir"),
            renderHTML: (attrs) => (attrs.dir ? { dir: attrs.dir } : {}),
          },
          columns: {
            default: 1,
            parseHTML: (element) =>
              parseInt(element.style.columnCount || "1", 10) || 1,
            renderHTML: (attrs) =>
              (attrs.columns as number) > 1
                ? {
                    style: `column-count:${attrs.columns};column-gap:2em`,
                  }
                : {},
          },
          hyphens: {
            default: false,
            parseHTML: (element) => element.style.hyphens === "auto",
            renderHTML: (attrs) =>
              attrs.hyphens ? { style: "hyphens:auto" } : {},
          },
          // Anchor target for in-article bookmarks (Insert → Bookmark).
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute("id"),
            renderHTML: (attrs) => (attrs.id ? { id: attrs.id } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    /** Apply `patch` to every formattable block touched by the selection. */
    const forEachBlock =
      (patch: (current: Record<string, unknown>) => Record<string, unknown>) =>
      ({ state, tr, dispatch }: CommandProps) => {
        const { from, to } = state.selection;
        let changed = false;
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!BLOCK_TYPES.includes(node.type.name)) return;
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            ...patch(node.attrs),
          });
          changed = true;
        });
        if (changed && dispatch) dispatch(tr);
        return changed;
      };

    return {
      indent: () =>
        forEachBlock((attrs) => ({
          indent: Math.min(((attrs.indent as number) ?? 0) + 1, MAX_INDENT),
        })),

      outdent: () =>
        forEachBlock((attrs) => ({
          indent: Math.max(((attrs.indent as number) ?? 0) - 1, 0),
        })),

      setParagraphSpacing: (space: string | null) =>
        forEachBlock(() => ({ spacing: space })),

      toggleDropCap: () =>
        forEachBlock((attrs) => ({ dropcap: !attrs.dropcap })),

      setBlockDirection: (dir: "ltr" | "rtl" | null) =>
        forEachBlock(() => ({ dir })),

      setColumns: (count: 1 | 2 | 3) => forEachBlock(() => ({ columns: count })),

      toggleHyphenation: () =>
        forEachBlock((attrs) => ({ hyphens: !attrs.hyphens })),
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Inside a list Tab must still nest the item, so only indent blocks
        // when the list extensions have not already handled the key.
        if (this.editor.isActive("listItem") || this.editor.isActive("taskItem"))
          return false;
        return this.editor.commands.indent();
      },
      "Shift-Tab": () => {
        if (this.editor.isActive("listItem") || this.editor.isActive("taskItem"))
          return false;
        return this.editor.commands.outdent();
      },
    };
  },
});
