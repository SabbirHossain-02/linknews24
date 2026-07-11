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
  byline: { bn: "লেখক / বাইলাইন", en: "Author / Byline" },
  bylinePlaceholder: {
    bn: "যেমন: স্টাফ করেসপন্ডেন্ট",
    en: "e.g. Staff Correspondent",
  },
  selectOption: { bn: "নির্বাচন করুন", en: "Select" },
  slugUrl: { bn: "স্লাগ (URL)", en: "Slug (URL)" },
  coverTone: { bn: "কভার টোন", en: "Cover Tone" },
  featuredImage: { bn: "ফিচার্ড ইমেজ", en: "Featured Image" },
  urlOrUpload: { bn: "URL অথবা আপলোড", en: "URL or upload" },
  breakingNews: { bn: "ব্রেকিং নিউজ", en: "Breaking News" },
  featureHome: { bn: "আরও শীর্ষ খবরে দেখাও", en: "Show in Top Stories" },
  heroStory: { bn: "হিরো স্টোরি (উপরের বড়)", en: "Hero story (big top)" },
  heroStoryNote: {
    bn: "টিক দিলে ঠিক এই খবরটাই হোমপেজের উপরের বড় হিরোতে দেখাবে (একটাই থাকবে)।",
    en: "When ticked, exactly this article becomes the big hero on top (only one).",
  },
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

  // Common
  save: { bn: "সংরক্ষণ", en: "Save" },
  saving: { bn: "সংরক্ষণ হচ্ছে…", en: "Saving…" },
  create: { bn: "তৈরি করুন", en: "Create" },
  active: { bn: "সক্রিয়", en: "Active" },
  visible: { bn: "দৃশ্যমান", en: "Visible" },
  noItems: { bn: "কোনো আইটেম নেই।", en: "No items yet." },
  nameBn: { bn: "নাম (বাংলা)", en: "Name (Bangla)" },
  nameEn: { bn: "নাম (English)", en: "Name (English)" },

  // Live TV
  streamUrl: {
    bn: "স্ট্রিম URL (YouTube/HLS)",
    en: "Stream URL (YouTube/HLS)",
  },
  liveActive: { bn: "সক্রিয় — সাইটে দেখাবে", en: "Active — shown on site" },
  liveNote: {
    bn: "স্ট্রিম URL খালি রাখলে সাইটে 'শীঘ্রই আসছে' দেখাবে।",
    en: "Leave the URL empty to show 'coming soon' on the site.",
  },

  // Breaking
  addItem: { bn: "নতুন আইটেম", en: "New item" },
  textBn: { bn: "টেক্সট (বাংলা)", en: "Text (Bangla)" },
  textEnLabel: { bn: "টেক্সট (English)", en: "Text (English)" },

  // Categories
  addCategory: { bn: "নতুন ক্যাটাগরি", en: "New category" },
  colArticles: { bn: "আর্টিকেল", en: "Articles" },

  // Homepage builder
  addSection: { bn: "সেকশন যোগ করুন", en: "Add section" },
  cardCount: { bn: "কার্ড", en: "Cards" },
  homepageNote: {
    bn: "সেকশন যোগ না করলে হোমপেজ স্বয়ংক্রিয়ভাবে সব ক্যাটাগরি দেখায়। নিজে সাজাতে নিচে সেকশন যোগ করুন।",
    en: "Without sections the homepage auto-shows all categories. Add sections below to arrange it yourself.",
  },
  heroHint: {
    bn: "হিরো স্টোরি = যে আর্টিকেলে 'হোমপেজে ফিচার' টিক দেওয়া থাকে (সবচেয়ে সাম্প্রতিক)।",
    en: "The hero story is the most recent article marked 'Feature on homepage'.",
  },
  arrangeArticles: { bn: "খবর সাজান", en: "Arrange articles" },
  dragHint: {
    bn: "টেনে ক্রম বদলান · ⭐ দিয়ে বড় (lead) করুন",
    en: "Drag to reorder · ⭐ to set the big lead",
  },
  leadBadge: { bn: "বড়", en: "Lead" },

  // Users
  addUser: { bn: "নতুন ইউজার", en: "New user" },
  colName: { bn: "নাম", en: "Name" },
  colEmail: { bn: "ইমেইল", en: "Email" },
  colRole: { bn: "রোল", en: "Role" },
  userPassword: { bn: "পাসওয়ার্ড", en: "Password" },

  // Media
  uploadImages: { bn: "ছবি আপলোড", en: "Upload images" },
  copyUrl: { bn: "URL কপি", en: "Copy URL" },
  copied: { bn: "কপি হয়েছে!", en: "Copied!" },
  noMedia: { bn: "কোনো ছবি নেই। আপলোড করুন।", en: "No images yet. Upload some." },

  // Settings
  siteName: { bn: "সাইটের নাম", en: "Site name" },
  tagline: { bn: "ট্যাগলাইন", en: "Tagline" },
  socialLinks: { bn: "সোশ্যাল লিংক", en: "Social links" },
  contactInfo: { bn: "যোগাযোগ", en: "Contact" },
  addressLabel: { bn: "ঠিকানা", en: "Address" },
  emailLabel: { bn: "ইমেইল", en: "Email" },
  phoneLabel: { bn: "ফোন", en: "Phone" },
  editorLabel: { bn: "সম্পাদক ও প্রকাশক", en: "Editor & Publisher" },
  savedOk: { bn: "সংরক্ষিত হয়েছে ✓", en: "Saved ✓" },

  // Directories
  addLawyer: { bn: "যোগ করুন", en: "Add" },
  addDonor: { bn: "যোগ করুন", en: "Add" },
  selectDistrict: { bn: "জেলা নির্বাচন করুন", en: "Select district" },
  selectGroup: { bn: "গ্রুপ নির্বাচন করুন", en: "Select group" },
  searchByName: { bn: "নাম দিয়ে খুঁজুন…", en: "Search by name…" },
  specLabel: { bn: "বিশেষত্ব", en: "Specialization" },
  chamberLabel: { bn: "চেম্বার", en: "Chamber" },
  groupLabel: { bn: "গ্রুপ", en: "Group" },
  districtCol: { bn: "জেলা", en: "District" },

  // Newsletter
  subscriberCount: { bn: "জন সাবস্ক্রাইবার", en: "subscribers" },
  exportCsv: { bn: "CSV এক্সপোর্ট", en: "Export CSV" },
  noSubscribers: { bn: "কোনো সাবস্ক্রাইবার নেই।", en: "No subscribers yet." },

  // Article list filters
  searchByTitle: { bn: "শিরোনাম দিয়ে খুঁজুন…", en: "Search by title…" },
  allCategories: { bn: "সব ক্যাটাগরি", en: "All categories" },
  allStatus: { bn: "সব স্ট্যাটাস", en: "All status" },
  totalLabel: { bn: "মোট", en: "Total" },
  prev: { bn: "আগে", en: "Prev" },
  next: { bn: "পরে", en: "Next" },
  pageOf: { bn: "পৃষ্ঠা {p} / {t}", en: "Page {p} of {t}" },

  // Comments moderation
  commentsPending: { bn: "অপেক্ষমাণ", en: "Pending" },
  commentsApproved: { bn: "অনুমোদিত", en: "Approved" },
  commentsRejected: { bn: "প্রত্যাখ্যাত", en: "Rejected" },
  commentsSpam: { bn: "স্প্যাম", en: "Spam" },
  commentApprove: { bn: "অনুমোদন", en: "Approve" },
  commentReject: { bn: "প্রত্যাখ্যান", en: "Reject" },
  commentMarkSpam: { bn: "স্প্যাম", en: "Spam" },
  commentOn: { bn: "আর্টিকেল:", en: "On:" },
  noComments: { bn: "কোনো কমেন্ট নেই।", en: "No comments." },
  tagsLabel: { bn: "ট্যাগ", en: "Tags" },
  tagsPlaceholder: {
    bn: "কমা দিয়ে আলাদা করুন (যেমন: রাজনীতি, নির্বাচন)",
    en: "Comma-separated (e.g. politics, election)",
  },

  // E-Paper
  epaper: { bn: "ই-পেপার", en: "E-Paper" },
  addEdition: { bn: "নতুন সংস্করণ", en: "New edition" },
  editionDate: { bn: "প্রকাশের তারিখ", en: "Publish date" },
  uploadPdf: { bn: "PDF আপলোড", en: "Upload PDF" },
  pdfUploaded: { bn: "PDF আপলোড হয়েছে", en: "PDF uploaded" },
  uploadingPdf: { bn: "আপলোড হচ্ছে…", en: "Uploading…" },
  publishedLabel: { bn: "প্রকাশিত", en: "Published" },
  draftLabel: { bn: "খসড়া", en: "Draft" },
  noEditions: { bn: "কোনো সংস্করণ নেই।", en: "No editions yet." },
  epaperPdfRequired: { bn: "আগে PDF আপলোড করুন", en: "Upload a PDF first" },
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
