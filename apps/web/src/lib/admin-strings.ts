"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * English for the admin panel's Bengali strings, keyed by the Bengali itself.
 *
 * The admin has hundreds of small labels — mostly tooltips in the Word-style
 * editor — that were written straight into the markup and so stayed Bengali
 * even with the panel switched to English. Naming a key for each of them would
 * have meant inventing three hundred names and touching every call site twice;
 * keying on the source string keeps the change to wrapping each literal, and
 * anything not listed here simply stays as it was rather than going blank.
 */
const EN: Record<string, string> = {
  // --- shared verbs and answers ---
  "ঠিক আছে": "OK",
  "বাতিল": "Cancel",
  "সংরক্ষণ": "Save",
  "যোগ করুন": "Add",
  "মুছে ফেলুন": "Delete",
  "বন্ধ করুন": "Close",
  "বেছে নিন": "Choose",
  "নেই": "None",
  "ডিফল্ট": "Default",
  "মোট": "total",
  "অন্যান্য": "Other",
  "লোড হচ্ছে…": "Loading…",
  "মোছা হচ্ছে…": "Deleting…",
  "শুরু হচ্ছে…": "Starting…",
  "আনা হচ্ছে…": "Loading…",
  "আপলোড ব্যর্থ": "Upload failed",
  "যোগ করা গেল না": "Could not add",
  "মুছতে পারা গেল না": "Could not delete",

  // --- alignment and direction ---
  "বাম": "Left",
  "মাঝ": "Centre",
  "ডান": "Right",
  "বামে": "Left",
  "মাঝে": "Centre",
  "ডানে": "Right",
  "জাস্টিফাই": "Justify",
  "অ্যালাইনমেন্ট": "Alignment",
  "লেখার দিক": "Text direction",
  "বাম → ডান": "Left to right",
  "ডান → বাম": "Right to left",
  "বাম → ডান (LTR)": "Left to right (LTR)",
  "ডান → বাম (RTL)": "Right to left (RTL)",

  // --- Home tab ---
  "পেস্ট (Ctrl+V)": "Paste (Ctrl+V)",
  "কাট (Ctrl+X)": "Cut (Ctrl+X)",
  "কপি (Ctrl+C)": "Copy (Ctrl+C)",
  "ফরম্যাট পেইন্টার — চাপুন, তারপর যেখানে বসাবেন সিলেক্ট করুন":
    "Format painter — press it, then select where to apply the formatting",
  "ফন্ট ডায়ালগ": "Font dialog",
  "ফন্ট সাইজ": "Font size",
  "ফন্ট বড় করুন": "Grow font",
  "ফন্ট ছোট করুন": "Shrink font",
  "ছোট/বড় হাতের অক্ষর": "Change case",
  "সব ফরম্যাট মুছুন": "Clear all formatting",
  "হাইলাইট": "Highlight",
  "হাইলাইট মুছুন": "Remove highlight",
  "ফন্টের রঙ": "Font colour",
  "স্বয়ংক্রিয় রঙ": "Automatic colour",
  "প্যারাগ্রাফ ডায়ালগ": "Paragraph dialog",
  "বুলেট তালিকা": "Bulleted list",
  "নম্বর তালিকা": "Numbered list",
  "চেকলিস্ট": "Checklist",
  "ইনডেন্ট কমান (Shift+Tab)": "Decrease indent (Shift+Tab)",
  "ইনডেন্ট বাড়ান (Tab)": "Increase indent (Tab)",
  "ইনডেন্ট কমান": "Decrease indent",
  "ইনডেন্ট বাড়ান": "Increase indent",
  "উদ্ধৃতি": "Quote",
  "লাইন ও প্যারা স্পেসিং": "Line and paragraph spacing",
  "লাইন স্পেসিং": "Line spacing",
  "প্যারার পরে ফাঁকা": "Space after paragraph",
  "খুঁজুন (Ctrl+F)": "Find (Ctrl+F)",
  "বদলান (Ctrl+H)": "Replace (Ctrl+H)",
  "সব সিলেক্ট করুন (Ctrl+A)": "Select all (Ctrl+A)",
  "পেস্ট করার ধরন": "Paste options",
  "ফরম্যাট সহ": "Keep formatting",
  "শুধু লেখা (ফরম্যাট ছাড়া)": "Text only (no formatting)",

  // --- Insert tab ---
  "টেবিল ডায়ালগ": "Table dialog",
  "টেবিল যোগ করুন": "Insert table",
  "টেবিল যোগ করুন…": "Insert table…",
  "উপরে সারি যোগ": "Insert row above",
  "নিচে সারি যোগ": "Insert row below",
  "সারি মুছুন": "Delete row",
  "হেডার সারি চালু/বন্ধ": "Toggle header row",
  "বামে কলাম যোগ": "Insert column left",
  "ডানে কলাম যোগ": "Insert column right",
  "কলাম মুছুন": "Delete column",
  "ঘর জোড়া / আলাদা করুন": "Merge or split cells",
  "পুরো টেবিল মুছুন": "Delete whole table",
  "ছবি — ক্যাপশন, কৃতিত্ব ও alt সহ":
    "Picture — with caption, credit and alt text",
  "YouTube ভিডিও বসান": "Insert a YouTube video",
  "লিংক (Ctrl+K)": "Link (Ctrl+K)",
  "বুকমার্ক — খবরের ভেতরে লাফ দেওয়ার জায়গা":
    "Bookmark — a place to jump to inside the story",
  "ফ্যাক্ট বক্স — খবরের পাশে আলাদা বাক্স":
    "Fact box — a separate panel beside the story",
  "ড্রপ ক্যাপ — অনুচ্ছেদের প্রথম অক্ষর বড়":
    "Drop cap — a large first letter for the paragraph",
  "বিভাজক রেখা": "Divider",
  "সিম্বল — ৳ ° ½ ইত্যাদি": "Symbol — ৳ ° ½ and so on",
  "ইমোজি": "Emoji",
  "ইকুয়েশন (LaTeX)": "Equation (LaTeX)",

  // --- Insert dialogs ---
  "ছবির সেটিংস": "Picture settings",
  "ছবি যোগ করুন": "Insert a picture",
  "ছবির URL": "Picture URL",
  "যেমন: রাজধানীর মিরপুরে নতুন উড়ালসড়ক":
    "e.g. New flyover opens in Mirpur, Dhaka",
  "ছবি: LinkNews24": "Photo: LinkNews24",
  "ছবিতে যা দেখা যাচ্ছে": "What the picture shows",
  "YouTube ভিডিও যোগ করুন": "Insert a YouTube video",
  "লিংক সম্পাদনা": "Edit link",
  "লিংক যোগ করুন": "Insert link",
  "বুকমার্ক (অ্যাংকর) বসান": "Insert a bookmark (anchor)",
  "যেমন: ঘটনার-বিবরণ": "e.g. what-happened",
  "ভগ্নাংশ": "Fraction",
  "বর্গমূল": "Square root",
  "যোগফল": "Sum",
  "শতকরা বৃদ্ধি": "Percentage increase",
  "ইকুয়েশন যোগ করুন": "Insert an equation",
  "ছবি": "Picture",
  "ক্যাপশন — ছবির নিচে ছাপা হবে": "Caption — printed under the picture",
  "ছবির কৃতিত্ব": "Picture credit",
  "Alt লেখা — SEO ও অন্ধ পাঠকের জন্য":
    "Alt text — for search engines and blind readers",
  "অবস্থান": "Position",
  "ভিডিওর লিংক": "Video link",
  "ঠিকানা": "Address",
  "নতুন ট্যাবে খুলবে": "Open in a new tab",
  "লিংক মুছে ফেলুন": "Remove link",
  "বুকমার্কের নাম": "Bookmark name",
  "নমুনা — চাপলে বসে যাবে": "Examples — click one to insert it",
  "সারি (rows)": "Rows",
  "কলাম (columns)": "Columns",
  "প্রথম সারিটি হেডার হবে": "Make the first row a header",
  "বামে, পাশে লেখা": "Left, text beside",
  "ডানে, পাশে লেখা": "Right, text beside",

  // --- Table tab ---
  "উপরে একটি সারি যোগ করুন": "Insert a row above",
  "উপরে সারি": "Row above",
  "নিচে একটি সারি যোগ করুন": "Insert a row below",
  "নিচে সারি": "Row below",
  "এই সারিটি মুছুন": "Delete this row",
  "বামে একটি কলাম যোগ করুন": "Insert a column to the left",
  "বামে কলাম": "Column left",
  "ডানে একটি কলাম যোগ করুন": "Insert a column to the right",
  "ডানে কলাম": "Column right",
  "এই কলামটি মুছুন": "Delete this column",
  "নির্বাচিত ঘরগুলো এক করুন": "Merge the selected cells",
  "জোড়া দিন": "Merge",
  "জোড়া ঘরটি আবার আলাদা করুন": "Split the merged cell again",
  "আলাদা করুন": "Split",
  "প্রথম সারিটি হেডার করুন / সরান": "Make the first row a header, or undo it",
  "হেডার সারি": "Header row",
  "প্রথম কলামটি হেডার করুন / সরান":
    "Make the first column a header, or undo it",
  "হেডার কলাম": "Header column",
  "পুরো টেবিলটি মুছে ফেলুন": "Delete the whole table",
  "টেবিল মুছুন": "Delete table",
  "পুরো টেবিলটি সিলেক্ট করুন": "Select the whole table",
  "সিলেক্ট": "Select",
  "টেবিলটি এক ধাপ উপরে নিন": "Move the table up one step",
  "উপরে সরান": "Move up",
  "টেবিলটি এক ধাপ নিচে নিন": "Move the table down one step",
  "নিচে সরান": "Move down",
  "টেবিলটি ধরে অন্য জায়গায় নিন": "Drag the table somewhere else",
  "টেবিলের আকার বদলাতে টানুন": "Drag to resize the table",
  "4 x 3 টেবিল": "4 × 3 table",
  "মাউস ঘুরিয়ে মাপ বাছুন": "Move the pointer to choose the size",

  // --- Layout tab ---
  "মাঝে, নিজের লাইনে": "Centred, on its own line",
  "বামে, চারপাশে লেখা": "Left, text wraps around",
  "ডানে, চারপাশে লেখা": "Right, text wraps around",
  "এক কলাম — স্বাভাবিক": "One column — normal",
  "বাছাই করা লেখাটি দুই কলামে সাজান":
    "Set the selected text in two columns",
  "বাছাই করা লেখাটি তিন কলামে সাজান":
    "Set the selected text in three columns",
  "হাইফেনেশন — লাইনের শেষে শব্দ ভাঙা":
    "Hyphenation — break words at the end of a line",
  "ছবির অবস্থান ও চারপাশে লেখা": "Picture position and text wrap",
  "আগে একটি ছবি সিলেক্ট করুন": "Select a picture first",
  "ছবির অবস্থান বদলাতে আগে খবরের ভেতরের একটি ছবিতে ক্লিক করুন।":
    "To move a picture, click one inside the story first.",
  "ছবির অবস্থান": "Picture position",
  "চওড়া": "Width",

  // --- Review tab and dialogs ---
  "শব্দ, অক্ষর, অনুচ্ছেদ ও পড়ার সময়":
    "Words, characters, paragraphs and reading time",
  "বানান পরীক্ষা চালু/বন্ধ": "Turn spell check on or off",
  "লেখা পড়ে শোনাবে — সিলেক্ট করা থাকলে শুধু সেটুকু":
    "Reads the text aloud — only the selection, if there is one",
  "মুখে বলুন, লেখা হয়ে যাবে (বাংলা)": "Speak and it types (Bengali)",
  "ছবিতে alt আছে কি না, শিরোনামের ক্রম ঠিক কি না — পরীক্ষা করুন":
    "Check that pictures have alt text and headings are in order",
  "শব্দ": "Words",
  "অক্ষর (ফাঁকা সহ)": "Characters (with spaces)",
  "অক্ষর (ফাঁকা ছাড়া)": "Characters (without spaces)",
  "অনুচ্ছেদ": "Paragraphs",
  "শিরোনাম": "Headings",
  "লিংক": "Links",
  "পড়তে লাগবে": "Reading time",
  "শব্দ গণনা": "Word count",
  "একটি শিরোনাম ফাঁকা।": "A heading is empty.",
  "খবরে কোনো ছবি নেই।": "The story has no pictures.",
  "কোনো উপশিরোনাম নেই — লম্বা লেখা ভাগ করলে পড়তে সুবিধা হয়।":
    "No sub-headings — breaking up a long piece makes it easier to read.",
  "অ্যাক্সেসিবিলিটি পরীক্ষা": "Accessibility check",
  "পড়ার সময় বাংলা সংবাদের গড় গতি — মিনিটে ১৮০ শব্দ — ধরে হিসাব করা।":
    "Reading time assumes the average pace for Bengali news — 180 words a minute.",
  "কোনো সমস্যা পাওয়া যায়নি — খবরটি প্রকাশের জন্য প্রস্তুত।":
    "Nothing found — the story is ready to publish.",

  // --- View tab, title bar, outline ---
  "পেজ ভিউ — Word-এর মতো সাদা কাগজে": "Page view — white paper, as in Word",
  "ওয়েব ভিউ — সাইটে যে প্রস্থে দেখাবে":
    "Web view — the width it will have on the site",
  "জুম": "Zoom",
  "জুম কমান": "Zoom out",
  "জুম বাড়ান": "Zoom in",
  "ডকুমেন্ট আউটলাইন — শিরোনামের তালিকা":
    "Document outline — the list of headings",
  "ফুল স্ক্রিন (Esc দিয়ে বেরোন)": "Full screen (Esc to leave)",
  "খসড়া সেভ করুন (Ctrl+S)": "Save draft (Ctrl+S)",
  "আন্ডু (Ctrl+Z)": "Undo (Ctrl+Z)",
  "রিডু (Ctrl+Y)": "Redo (Ctrl+Y)",
  "খুঁজুন ও বদলান (Ctrl+F)": "Find and replace (Ctrl+F)",
  "প্রিন্ট (Ctrl+P)": "Print (Ctrl+P)",
  "(শিরোনামহীন)": "(untitled)",
  "আউটলাইন": "Outline",
  "কোনো শিরোনাম নেই। স্টাইল গ্যালারি থেকে শিরোনাম দিলে এখানে দেখা যাবে।":
    "No headings yet. Apply one from the style gallery and it will appear here.",
  "এখানে লিখুন…": "Write here…",
  "নতুন আর্টিকেল": "New article",
  "রিবন গুটিয়ে ফেলুন": "Collapse the ribbon",
  "রিবন দেখান": "Show the ribbon",

  // --- find & replace ---
  "যা খুঁজবেন…": "Find what…",
  "যা বসাবেন…": "Replace with…",
  "আগেরটি (Shift+Enter)": "Previous (Shift+Enter)",
  "পরেরটি (Enter)": "Next (Enter)",
  "বন্ধ করুন (Esc)": "Close (Esc)",
  "বদলান": "Replace",
  "সব বদলান": "Replace all",
  "ছোট/বড় হাতের মিল": "Match case",
  "পুরো শব্দ": "Whole word",

  // --- style gallery ---
  "¶ সাধারণ": "¶ Normal",
  "¶ ফাঁকা ছাড়া": "¶ No spacing",
  "গাঢ়": "Bold",
  "তির্যক": "Italic",
  "কোড": "Code",

  // --- font picker ---
  "ফন্ট": "Font",
  "সাইজ": "Size",
  "সাইটের নিজের ফন্ট — সব পাঠক দেখবে":
    "The site's own fonts — every reader sees these",
  "বাংলা — পাঠকের কম্পিউটারে থাকলে দেখাবে":
    "Bengali — shown only if the reader has the font",
  "ইংরেজি — পাঠকের কম্পিউটারে থাকলে দেখাবে":
    "Latin — shown only if the reader has the font",
  "＋ এই কম্পিউটারের সব ফন্ট আনুন": "＋ Load every font on this computer",
  "Default (সাইটের ফন্ট)": "Default (site font)",
  "স্টাইল ও ইফেক্ট": "Style and effects",
  "প্রিভিউ": "Preview",
  "আমার সোনার বাংলা — AaBbCcD": "The quick brown fox — AaBbCcD",
  "প্যারাগ্রাফ": "Paragraph",
  "ইনডেন্ট (ধাপ)": "Indent (steps)",

  // --- symbol picker ---
  "টাকা ও মুদ্রা": "Taka and currency",
  "বাংলা সংখ্যা": "Bengali numerals",
  "গণিত": "Maths",
  "বিরাম ও চিহ্ন": "Punctuation and marks",
  "তীর ও অন্যান্য": "Arrows and others",
  "মুখভঙ্গি": "Faces",
  "খবর ও কাজ": "News and work",
  "খেলা ও আবহাওয়া": "Sport and weather",

  // --- clipboard ---
  "আগে লেখা সিলেক্ট করুন": "Select some text first",
  "কাট হয়েছে": "Cut",
  "কপি হয়েছে": "Copied",
  "পেস্ট হয়েছে": "Pasted",
  "সাইটে HTTPS নেই বলে ব্রাউজার পেস্ট আটকে দিচ্ছে — Ctrl+V চাপুন":
    "The browser blocks pasting without HTTPS — press Ctrl+V instead",
  "ব্রাউজার অনুমতি দেয়নি — Ctrl+V চাপুন":
    "The browser refused — press Ctrl+V instead",

  // --- translation bar ---
  "এই ব্রাউজারে অনুবাদ সুবিধাটি নেই।":
    "This browser has no built-in translator.",
  "অনুবাদ করা যায়নি। আবার চেষ্টা করুন।":
    "The translation failed. Please try again.",
  "আগে বাংলায় শিরোনাম ও লেখা দিন":
    "Write the Bengali headline and body first",
  "প্রথমবার ভাষা প্যাক নামবে (একবারই)":
    "The language pack downloads the first time (once only)",
  "এটি যন্ত্রে করা অনুবাদ — প্রকাশের আগে পড়ে দেখুন":
    "This is a machine translation — read it before publishing",
  "দেখেছি": "Got it",

  // --- categories page ---
  "মূল মেনুতে ফিরিয়ে নিন": "Move back to the main menu",
  "বের করুন": "Move out",
  "সাব-ক্যাটাগরি": "Sub-category",
  "এই ক্যাটাগরিতে কোনো আর্টিকেল নেই। মুছে ফেলবেন?":
    "This category holds no articles. Delete it?",
  "অন্য ক্যাটাগরিতে সরিয়ে নিন": "Move them to another category",
  "আর্টিকেলগুলো থেকে যাবে, শুধু ক্যাটাগরিটা বদলাবে।":
    "The articles stay; only their category changes.",
  "ক্যাটাগরি বাছুন…": "Choose a category…",
  "সরিয়ে মুছুন": "Move, then delete",
  "আর্টিকেলসহ মুছে ফেলুন": "Delete with the articles",
  "ফেরত আনা যাবে না।": "This cannot be undone.",

  // --- admin shell and pages ---
  "ফন্ট ছোট": "Smaller text",
  "ফন্ট বড": "Larger text",
  "ফন্ট বড়": "Larger text",
  "অ−": "A−",
  "অ+": "A+",
  "লাইভ টিভি": "Live TV",
  "নাম, ইমেইল ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন":
    "Enter a name, an email and a password of at least 6 characters",
};

/** Translate one admin string for a known locale. */
export function adminText(bn: string, locale: "bn" | "en"): string {
  return locale === "en" ? EN[bn] ?? bn : bn;
}

/** The hook every admin component uses: `ax("বোল্ড")`. */
export function useAdminText() {
  const { locale } = useLocale();
  return (bn: string) => adminText(bn, locale);
}
