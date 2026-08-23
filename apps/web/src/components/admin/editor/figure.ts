import { Node, mergeAttributes } from "@tiptap/core";

export type FigureAlign = "left" | "center" | "right" | "wrap-left" | "wrap-right";

export interface FigureAttrs {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  align: FigureAlign;
  width: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      insertFigure: (attrs: Partial<FigureAttrs> & { src: string }) => ReturnType;
      updateFigure: (attrs: Partial<FigureAttrs>) => ReturnType;
    };
  }
}

/**
 * A news photo: image, caption and credit as one block.
 *
 * TipTap's built-in Image node emits a bare `<img>`, which loses the caption
 * and the credit line every published photo needs, and gives search engines and
 * screen readers nothing to work with. This emits real `<figure>` /
 * `<figcaption>` markup instead, with alignment and width as attributes so the
 * same HTML lays out identically on the public article page.
 */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      credit: { default: "" },
      align: { default: "center" as FigureAlign },
      width: { default: 100 },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const img = el.querySelector("img");
          if (!img) return false;
          const caption = el.querySelector("figcaption");
          const credit = el.querySelector(".ln-figure__credit");
          const width = parseInt(el.style.width || "100", 10);

          return {
            src: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt") ?? "",
            // The credit lives inside the caption element, so strip it out.
            caption: (caption?.firstChild?.textContent ?? "").trim(),
            credit: (credit?.textContent ?? "").trim(),
            align: (el.dataset.align as FigureAlign) ?? "center",
            width: Number.isFinite(width) ? width : 100,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, credit, align, width } =
      HTMLAttributes as unknown as FigureAttrs;

    const captionChildren: unknown[] = [];
    if (caption) captionChildren.push(["span", {}, caption]);
    if (credit)
      captionChildren.push(["span", { class: "ln-figure__credit" }, credit]);

    return [
      "figure",
      mergeAttributes({
        class: "ln-figure",
        "data-align": align,
        style: `width:${width}%`,
      }),
      ["img", { src, alt }],
      ...(captionChildren.length
        ? [["figcaption", {}, ...captionChildren]]
        : []),
    ] as never;
  },

  addCommands() {
    return {
      insertFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),

      updateFigure:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});
