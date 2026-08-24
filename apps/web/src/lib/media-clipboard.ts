/**
 * Downloading and copying media, and being straight about what the browser
 * will actually allow.
 *
 * The clipboard APIs only exist in a "secure context" — HTTPS, or localhost.
 * This site is served over plain http for now, so `navigator.clipboard` is
 * simply not there. Code that calls it and swallows the error looks like it
 * worked and copies nothing, which is why every function here reports what
 * really happened instead of returning void.
 */

export type CopyResult =
  | { ok: true; how: "clipboard" | "execCommand" }
  | { ok: false; reason: "insecure" | "unsupported" | "failed" };

const secure = () =>
  typeof window !== "undefined" && window.isSecureContext;

/** Copies plain text — the modern API where it exists, the old trick where not. */
export async function copyText(text: string): Promise<CopyResult> {
  if (secure() && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, how: "clipboard" };
    } catch {
      /* fall through to the old way */
    }
  }

  // document.execCommand is deprecated but it is what works without HTTPS.
  try {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    const done = document.execCommand("copy");
    document.body.removeChild(box);
    return done ? { ok: true, how: "execCommand" } : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/** True when the browser can put an actual picture on the clipboard. */
export function canCopyImage(): boolean {
  return (
    secure() &&
    typeof ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  );
}

async function toPngBlob(blob: Blob): Promise<Blob> {
  // Chrome's clipboard only accepts PNG, so a JPEG has to be redrawn as one.
  if (blob.type === "image/png") return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (png) => (png ? resolve(png) : reject(new Error("encode failed"))),
      "image/png",
    ),
  );
}

/** Puts the picture itself on the clipboard, ready to paste into anything. */
export async function copyImage(url: string): Promise<CopyResult> {
  if (!canCopyImage()) return { ok: false, reason: "insecure" };
  try {
    const blob = await (await fetch(url, { mode: "cors" })).blob();
    const png = await toPngBlob(blob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
    return { ok: true, how: "clipboard" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/**
 * Saves the picture to the reader's computer.
 *
 * The file is fetched first and handed over as a blob: a plain `download`
 * attribute is ignored when the file lives on another origin — and the media
 * here is served from the API, not the site — so the browser would have opened
 * the image instead of saving it.
 */
export async function downloadImage(url: string): Promise<boolean> {
  try {
    const blob = await (await fetch(url, { mode: "cors" })).blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = url.split("/").pop()?.split("?")[0] || "image";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Give the download a moment to start before the URL is taken away.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    return true;
  } catch {
    return false;
  }
}
