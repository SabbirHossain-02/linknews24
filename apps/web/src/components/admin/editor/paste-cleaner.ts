/**
 * Cleans HTML pasted from Microsoft Word, Google Docs and web pages.
 *
 * Word puts a huge amount of junk on the clipboard — `mso-*` styles, `<o:p>`
 * tags, conditional comments, `MsoNormal` classes, nested empty spans and
 * hard-coded fonts/sizes from the author's machine. Pasting that straight in
 * makes articles look nothing like the rest of the site.
 *
 * The rule here: keep *structure* and *intent* (headings, lists, tables,
 * bold/italic, links, alignment), drop everything cosmetic so the pasted text
 * inherits LinkNews24's own typography.
 */

/** Inline styles worth keeping — everything else is dropped. */
const KEEP_STYLES = new Set([
  "font-weight",
  "font-style",
  "text-decoration",
  "text-decoration-line",
  "text-align",
  "color",
  "background-color",
  "vertical-align",
]);

/** Tags that carry no meaning once Word's styling is gone. */
const DROP_TAGS = ["META", "LINK", "STYLE", "SCRIPT", "XML", "O:P", "V:SHAPE"];

function isWordJunkClass(value: string): boolean {
  return /(^|\s)(Mso|xl|font\d)/i.test(value);
}

/** Word marks bold/italic with styles rather than tags — preserve that. */
function styleToTags(el: HTMLElement) {
  const weight = el.style.fontWeight;
  const style = el.style.fontStyle;
  const decoration = el.style.textDecoration || el.style.textDecorationLine;

  const wrap = (tag: string) => {
    const node = document.createElement(tag);
    while (el.firstChild) node.appendChild(el.firstChild);
    el.appendChild(node);
  };

  if (weight === "bold" || Number(weight) >= 600) wrap("strong");
  if (style === "italic") wrap("em");
  if (decoration.includes("underline")) wrap("u");
  if (decoration.includes("line-through")) wrap("s");
}

function cleanElement(el: HTMLElement) {
  // Strip Word/Docs classes and every proprietary attribute.
  if (el.className && isWordJunkClass(String(el.className)))
    el.removeAttribute("class");
  for (const attr of [...el.attributes]) {
    if (/^(lang|xmlns|v:|o:|w:|data-(list|font|docs|sheets))/i.test(attr.name))
      el.removeAttribute(attr.name);
  }

  // Rewrite the style attribute down to the few properties worth keeping.
  const style = el.getAttribute("style");
  if (style) {
    styleToTags(el);
    const kept = style
      .split(";")
      .map((rule) => rule.trim())
      .filter((rule) => {
        const prop = rule.split(":")[0]?.trim().toLowerCase();
        if (!prop || prop.startsWith("mso-")) return false;
        return KEEP_STYLES.has(prop);
      });
    // font-weight/style became real tags above, so drop them from the style.
    const remaining = kept.filter(
      (rule) => !/^(font-weight|font-style|text-decoration)/i.test(rule),
    );
    if (remaining.length) el.setAttribute("style", remaining.join("; "));
    else el.removeAttribute("style");
  }

  // Unwrap spans and fonts that no longer carry anything.
  if (
    (el.tagName === "SPAN" || el.tagName === "FONT") &&
    !el.getAttribute("style")
  ) {
    el.replaceWith(...el.childNodes);
  }
}

export function cleanPastedHTML(html: string): string {
  // Not a Word/Docs paste and no styling to strip — leave it alone.
  if (typeof document === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Drop conditional comments (`<!--[if gte mso 9]>…`) and other comment nodes.
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as Comment);
  comments.forEach((c) => c.remove());

  DROP_TAGS.forEach((tag) =>
    doc.body.querySelectorAll(tag.toLowerCase()).forEach((n) => n.remove()),
  );

  // Deepest-first so unwrapping a span cannot skip its children.
  const elements = [...doc.body.querySelectorAll<HTMLElement>("*")].reverse();
  elements.forEach(cleanElement);

  // Word emits `<p>&nbsp;</p>` for every blank line — collapse those away.
  doc.body.querySelectorAll("p").forEach((p) => {
    if (!p.textContent?.replace(/ /g, "").trim() && !p.querySelector("img"))
      p.remove();
  });

  return doc.body.innerHTML;
}
