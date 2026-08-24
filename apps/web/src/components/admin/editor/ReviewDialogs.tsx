"use client";

import type { Editor } from "@tiptap/react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useAdminText } from "@/lib/admin-strings";

function Shell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ax = useAdminText();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded border border-[#d4d4d4] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#14181f] px-3 py-1.5">
          <span className="font-ui text-xs font-semibold text-white">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded-sm text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
        <div className="flex justify-end border-t border-[#e1dfdd] bg-[#f3f2f1] px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm bg-[#14181f] px-4 py-1 font-ui text-[11px] font-semibold text-white hover:bg-[#2a3240]"
          >
            {ax("বন্ধ করুন")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ word count */

export function WordCountDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const text = editor.state.doc.textBetween(
    0,
    editor.state.doc.content.size,
    "\n",
  );

  let paragraphs = 0;
  let headings = 0;
  let images = 0;
  let links = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === "paragraph" && node.textContent.trim()) paragraphs++;
    if (node.type.name === "heading") headings++;
    if (node.type.name === "figure" || node.type.name === "image") images++;
    if (node.marks?.some((m) => m.type.name === "link")) links++;
  });

  const words = editor.storage.characterCount.words() as number;
  const characters = editor.storage.characterCount.characters() as number;
  const withoutSpaces = text.replace(/\s/g, "").length;
  const minutes = Math.max(1, Math.round(words / 180));
  const bn = (n: number) => n.toLocaleString("bn-BD");

  const rows: [string, string][] = [
    ["শব্দ", bn(words)],
    ["অক্ষর (ফাঁকা সহ)", bn(characters)],
    ["অক্ষর (ফাঁকা ছাড়া)", bn(withoutSpaces)],
    ["অনুচ্ছেদ", bn(paragraphs)],
    ["শিরোনাম", bn(headings)],
    ["ছবি", bn(images)],
    ["লিংক", bn(links)],
    ["পড়তে লাগবে", `~${bn(minutes)} মিনিট`],
  ];

  return (
    <Shell title={ax("শব্দ গণনা")} onClose={onClose}>
      <table className="w-full font-ui text-[12px]">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-[#e1dfdd] last:border-0">
              <td className="py-1.5 text-[#555]">{label}</td>
              <td className="py-1.5 text-right font-semibold tabular-nums text-[#111]">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 font-ui text-[10px] leading-snug text-[#666]">
        {ax("পড়ার সময় বাংলা সংবাদের গড় গতি — মিনিটে ১৮০ শব্দ — ধরে হিসাব করা।")}
      </p>
    </Shell>
  );
}

/* --------------------------------------------------------- accessibility */

interface Issue {
  level: "error" | "warn";
  text: string;
}

/** Link text that tells a screen-reader user nothing about the destination. */
const VAGUE_LINKS = ["এখানে", "এখানে ক্লিক", "ক্লিক করুন", "click here", "here", "link", "লিংক"];

/**
 * Checks the article for the accessibility problems that actually happen in a
 * newsroom: photos with no alt text, headings that skip a level, and links
 * whose text is "click here".
 */
function findIssues(editor: Editor): Issue[] {
  const issues: Issue[] = [];
  let lastHeading = 0;
  let figures = 0;
  let missingAlt = 0;

  editor.state.doc.descendants((node) => {
    if (node.type.name === "heading") {
      const level = (node.attrs.level as number) ?? 1;
      if (lastHeading && level > lastHeading + 1) {
        issues.push({
          level: "warn",
          text: `শিরোনাম ${lastHeading} থেকে সরাসরি ${level}-এ লাফ দিয়েছে — মাঝের ধাপ বাদ পড়েছে।`,
        });
      }
      lastHeading = level;
      if (!node.textContent.trim())
        issues.push({ level: "error", text: "একটি শিরোনাম ফাঁকা।" });
    }

    if (node.type.name === "figure" || node.type.name === "image") {
      figures++;
      if (!String(node.attrs.alt ?? "").trim()) missingAlt++;
    }

    node.marks?.forEach((mark) => {
      if (mark.type.name !== "link") return;
      const label = node.textContent.trim().toLowerCase();
      if (VAGUE_LINKS.includes(label))
        issues.push({
          level: "warn",
          text: `“${node.textContent.trim()}” লেখা লিংক — কোথায় নিয়ে যাবে তা বোঝা যায় না।`,
        });
    });
  });

  if (missingAlt)
    issues.push({
      level: "error",
      text: `${missingAlt}টি ছবিতে alt লেখা নেই — অন্ধ পাঠক ও Google কিছুই বুঝবে না।`,
    });

  if (!figures)
    issues.push({ level: "warn", text: "খবরে কোনো ছবি নেই।" });

  if (!lastHeading)
    issues.push({
      level: "warn",
      text: "কোনো উপশিরোনাম নেই — লম্বা লেখা ভাগ করলে পড়তে সুবিধা হয়।",
    });

  return issues;
}

export function AccessibilityDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const issues = findIssues(editor);

  return (
    <Shell title={ax("অ্যাক্সেসিবিলিটি পরীক্ষা")} onClose={onClose}>
      {issues.length === 0 ? (
        <div className="flex items-start gap-2 rounded border border-green-300 bg-green-50 p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
          <p className="font-ui text-[12px] text-green-900">
            {ax("কোনো সমস্যা পাওয়া যায়নি — খবরটি প্রকাশের জন্য প্রস্তুত।")}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {issues.map((issue, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 rounded border p-2.5 ${
                issue.level === "error"
                  ? "border-[#d81f26]/40 bg-[#fbe3e4]"
                  : "border-amber-300 bg-amber-50"
              }`}
            >
              <AlertTriangle
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  issue.level === "error" ? "text-[#a8151b]" : "text-amber-700"
                }`}
              />
              <span className="font-ui text-[12px] leading-relaxed text-[#333]">
                {issue.text}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 font-ui text-[10px] leading-snug text-[#666]">
        লাল = ঠিক করা দরকার · হলুদ = ভেবে দেখুন। alt লেখা যোগ করতে ছবিতে ক্লিক
        করে Insert → Picture খুলুন।
      </p>
    </Shell>
  );
}
