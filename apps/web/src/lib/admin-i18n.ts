import { useLocale } from "@/components/providers/LocaleProvider";

export const adminDict = {
  // Sidebar / shell
  dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  articles: { bn: "আর্টিকেল", en: "Articles" },
  categoriesTags: { bn: "ক্যাটাগরি ও ট্যাগ", en: "Categories & Tags" },
  breaking: { bn: "ব্রেকিং নিউজ", en: "Breaking News" },
  homepageBuilder: { bn: "হোমপেজ বিল্ডার", en: "Homepage Builder" },
  liveTv: { bn: "লাইভ টিভি", en: "Live TV" },
  media: { bn: "মিডিয়া", en: "Media" },
  lawyers: { bn: "আইনজীবী", en: "Lawyers" },
  donors: { bn: "রক্তদাতা", en: "Blood Donors" },
  newsletter: { bn: "নিউজলেটার", en: "Newsletter" },
  comments: { bn: "কমেন্ট", en: "Comments" },
  settings: { bn: "সেটিংস", en: "Settings" },
  usersRoles: { bn: "ইউজার ও রোল", en: "Users & Roles" },
  comingSoon: { bn: "শীঘ্রই", en: "Soon" },
  logout: { bn: "লগআউট", en: "Logout" },
  menu: { bn: "মেনু", en: "Menu" },

  roleSUPER_ADMIN: { bn: "সুপার অ্যাডমিন", en: "Super Admin" },
  roleADMIN: { bn: "অ্যাডমিন", en: "Admin" },
  roleEDITOR: { bn: "এডিটর", en: "Editor" },
  roleREPORTER: { bn: "রিপোর্টার", en: "Reporter" },
  roleMODERATOR: { bn: "মডারেটর", en: "Moderator" },

  // Dashboard
  dashWelcome: {
    bn: "স্বাগতম, {name} — এখান থেকে পুরো ওয়েবসাইট নিয়ন্ত্রণ করুন।",
    en: "Welcome, {name} — control the whole website from here.",
  },
  statTotalArticles: { bn: "মোট আর্টিকেল", en: "Total Articles" },
  statBreaking: { bn: "ব্রেকিং নিউজ", en: "Breaking News" },
  statLiveTv: { bn: "লাইভ টিভি", en: "Live TV" },
  statAdmins: { bn: "অ্যাডমিন ইউজার", en: "Admin Users" },
  dashNote: {
    bn: "অ্যাডমিন প্যানেল ধাপে ধাপে তৈরি হচ্ছে — পরের ধাপে আরও মডিউল যুক্ত হবে।",
    en: "The admin panel is being built step by step — more modules coming soon.",
  },

  // Articles list
  newArticle: { bn: "নতুন আর্টিকেল", en: "New Article" },
  colTitle: { bn: "শিরোনাম", en: "Title" },
  colCategory: { bn: "ক্যাটাগরি", en: "Category" },
  colStatus: { bn: "স্ট্যাটাস", en: "Status" },
  colBreaking: { bn: "ব্রেকিং", en: "Breaking" },
  colActions: { bn: "অ্যাকশন", en: "Actions" },
  statusDRAFT: { bn: "খসড়া", en: "Draft" },
  statusSCHEDULED: { bn: "শিডিউল", en: "Scheduled" },
  statusPUBLISHED: { bn: "প্রকাশিত", en: "Published" },
  loading: { bn: "লোড হচ্ছে…", en: "Loading…" },
  noArticles: {
    bn: "কোনো আর্টিকেল নেই। নতুন একটি তৈরি করুন।",
    en: "No articles yet. Create a new one.",
  },
  edit: { bn: "এডিট", en: "Edit" },
  delete: { bn: "ডিলিট", en: "Delete" },
  deleteTitle: { bn: "আর্টিকেল মুছবেন?", en: "Delete article?" },
  deleteMessage: {
    bn: "এই আর্টিকেলটি স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?",
    en: "This article will be permanently deleted. Are you sure?",
  },

  // Article form
  allArticles: { bn: "সব আর্টিকেল", en: "All articles" },
  editArticle: { bn: "আর্টিকেল এডিট", en: "Edit Article" },
  newArticleTitle: { bn: "নতুন আর্টিকেল", en: "New Article" },
  titleBnLabel: { bn: "শিরোনাম (বাংলা)", en: "Title (Bangla)" },
  titleEnLabel: { bn: "শিরোনাম (English)", en: "Title (English)" },
  excerptBnLabel: { bn: "সারসংক্ষেপ (বাংলা)", en: "Excerpt (Bangla)" },
  bodyBnLabel: { bn: "মূল লেখা (বাংলা)", en: "Body (Bangla)" },
  bodyEnLabel: { bn: "মূল লেখা (English)", en: "Body (English)" },
  publish: { bn: "প্রকাশ করুন", en: "Publish" },
  draft: { bn: "খসড়া", en: "Draft" },
  preview: { bn: "প্রিভিউ দেখুন", en: "Preview" },
  category: { bn: "ক্যাটাগরি", en: "Category" },
  selectOption: { bn: "নির্বাচন করুন", en: "Select" },
  slugUrl: { bn: "স্লাগ (URL)", en: "Slug (URL)" },
  coverTone: { bn: "কভার টোন", en: "Cover Tone" },
  featuredImage: { bn: "ফিচার্ড ইমেজ", en: "Featured Image" },
  urlOrUpload: { bn: "URL অথবা আপলোড", en: "URL or upload" },
  breakingNews: { bn: "ব্রেকিং নিউজ", en: "Breaking News" },
  featureHome: { bn: "হোমপেজে ফিচার", en: "Feature on homepage" },
  seo: { bn: "SEO", en: "SEO" },
  seoTitle: { bn: "SEO টাইটেল", en: "SEO title" },
  seoDesc: { bn: "SEO ডেসক্রিপশন", en: "SEO description" },
  errTitle: { bn: "শিরোনাম দিন", en: "Enter a title" },
  errCategory: { bn: "ক্যাটাগরি নির্বাচন করুন", en: "Select a category" },
  errSave: { bn: "সংরক্ষণ ব্যর্থ", en: "Save failed" },
  uploadFailed: { bn: "আপলোড ব্যর্থ", en: "Upload failed" },
  previewTitle: {
    bn: "প্রিভিউ — ফ্রন্টএন্ডে যেমন দেখাবে",
    en: "Preview — how it looks on the frontend",
  },
  noTitle: { bn: "শিরোনাম নেই", en: "No title" },
  noBody: { bn: "লেখা নেই", en: "No content" },
  titlePlaceholderBn: { bn: "আর্টিকেলের শিরোনাম", en: "Article title (Bangla)" },
  titlePlaceholderEn: { bn: "Article title", en: "Article title" },

  // Login
  loginSubtitle: {
    bn: "অ্যাডমিন প্যানেল — লগইন করুন",
    en: "Admin Panel — sign in",
  },
  emailPlaceholder: { bn: "ইমেইল ঠিকানা", en: "Email address" },
  passwordPlaceholder: { bn: "পাসওয়ার্ড", en: "Password" },
  loginBtn: { bn: "লগইন করুন", en: "Sign In" },
  loggingIn: { bn: "লগইন হচ্ছে…", en: "Signing in…" },
  loginFailed: { bn: "লগইন ব্যর্থ হয়েছে", en: "Login failed" },
  showPwd: { bn: "পাসওয়ার্ড দেখুন", en: "Show password" },
  hidePwd: { bn: "পাসওয়ার্ড লুকান", en: "Hide password" },

  // Modals / editor
  cancel: { bn: "বাতিল", en: "Cancel" },
  ok: { bn: "ঠিক আছে", en: "OK" },
  remove: { bn: "মুছুন", en: "Delete" },
  close: { bn: "বন্ধ", en: "Close" },
  font: { bn: "ফন্ট", en: "Font" },
  size: { bn: "সাইজ", en: "Size" },
  reset: { bn: "রিসেট", en: "Reset" },
  defaultFont: { bn: "ডিফল্ট", en: "Default" },
  addLink: { bn: "লিংক যুক্ত করুন", en: "Add link" },
  linkUrl: { bn: "URL", en: "URL" },
  add: { bn: "যুক্ত করুন", en: "Add" },
  writeHere: { bn: "এখানে লিখুন…", en: "Write here…" },
} as const;

export type AdminKey = keyof typeof adminDict;

export function useAdminT() {
  const { locale } = useLocale();
  return (key: AdminKey, vars?: Record<string, string | number>) => {
    let s: string = adminDict[key][locale];
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(`{${k}}`, String(vars[k]));
      }
    }
    return s;
  };
}
