import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";
import { Mathematics } from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { CharacterCount } from "@tiptap/extensions";
import {
  TextStyle,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
} from "@tiptap/extension-text-style";
import { BlockAttributes } from "./block-attributes";
import { cleanPastedHTML } from "./paste-cleaner";

/** Fonts offered in the ribbon's font picker. */
export const FONTS = [
  { label: "Siyam Rupali", value: "var(--font-siyam-rupali)" },
  { label: "Hind Siliguri", value: "var(--font-hind-siliguri)" },
  { label: "Inter", value: "var(--font-inter)" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "monospace" },
];

/** Word's font-size dropdown values. */
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72,
];

export const LINE_HEIGHTS = ["1", "1.15", "1.5", "2", "2.5", "3"];

export function buildExtensions(placeholder: string) {
  return [
    // Link and underline ship in StarterKit but are configured separately here.
    StarterKit.configure({ link: false, underline: false }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    Image.configure({ inline: false, allowBase64: false }),

    TextStyle,
    Color,
    FontFamily,
    FontSize,
    LineHeight.configure({ types: ["paragraph", "heading"] }),

    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TextAlign.configure({ types: ["heading", "paragraph"] }),

    TaskList,
    TaskItem.configure({ nested: true }),

    TableKit.configure({ table: { resizable: true } }),
    Youtube.configure({ controls: true, nocookie: true, width: 640, height: 360 }),
    Mathematics,

    CharacterCount,
    BlockAttributes,
    Placeholder.configure({ placeholder }),
  ];
}

/**
 * Editor props shared by both language editors. `transformPastedHTML` strips
 * the junk Word and Google Docs put on the clipboard (mso-* styles, empty
 * spans, class soup) so pasted copy keeps its structure but picks up the
 * site's own typography.
 */
export const editorProps = {
  attributes: {
    class: "ln-editor ln-page focus:outline-none",
    spellcheck: "true",
  },
  transformPastedHTML: cleanPastedHTML,
};
