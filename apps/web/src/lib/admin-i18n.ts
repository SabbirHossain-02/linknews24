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
  lawyers: { bn: "আইন সেবা", en: "Legal Service" },
  donors: { bn: "রক্ত সেবা", en: "Blood Service" },
  hospitals: { bn: "হাসপাতাল সেবা", en: "Hospital Service" },
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
  excerptEnLabel: { bn: "সারসংক্ষেপ (English)", en: "Excerpt (English)" },
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

  // Dashboard analytics
  dashToday: { bn: "আজকের ভিউ", en: "Today's views" },
  dashTotalViews: { bn: "মোট ভিউ", en: "Total views" },
  dashUniqueToday: { bn: "আজ অনন্য ভিজিটর", en: "Unique today" },
  dashOnline: { bn: "এখন অনলাইনে", en: "Online now" },
  dashHourly: { bn: "গত ২৪ ঘণ্টায় ভিজিটর", en: "Visitors — last 24h" },
  dashDevices: { bn: "ডিভাইস", en: "Devices" },
  dashBrowsers: { bn: "ব্রাউজার", en: "Browsers" },
  dashCountries: { bn: "দেশ ও লোকেশন", en: "Countries" },
  dashReferrers: { bn: "যেখান থেকে এসেছে", en: "Traffic sources" },
  dashRecent: { bn: "সর্বশেষ ভিজিটর", en: "Recent visitors" },
  dashAdPerf: { bn: "বিজ্ঞাপন পারফরম্যান্স", en: "Ad performance" },
  dashNoVisitors: { bn: "এখনো কোনো ভিজিটর ডেটা নেই।", en: "No visitor data yet." },
  dashLive: { bn: "লাইভ", en: "Live" },
  colVisitor: { bn: "ভিজিটর (IP)", en: "Visitor (IP)" },
  colPage: { bn: "পেজ", en: "Page" },
  colDevice: { bn: "ডিভাইস", en: "Device" },
  colLocation: { bn: "লোকেশন", en: "Location" },
  colTime: { bn: "সময়", en: "Time" },
  dashImpressions: { bn: "ইম্প্রেশন", en: "Impressions" },
  dashClicks: { bn: "ক্লিক", en: "Clicks" },
  dashCtr: { bn: "সিটিআর", en: "CTR" },
  pendingCommentsStat: { bn: "অপেক্ষমাণ কমেন্ট", en: "Pending comments" },
  pendingLawyersStat: { bn: "অপেক্ষমাণ আইনজীবী", en: "Pending lawyers" },
  pendingDonorsStat: { bn: "অপেক্ষমাণ রক্তদাতা", en: "Pending donors" },
  pendingHospitalsStat: { bn: "অপেক্ষমাণ হাসপাতাল", en: "Pending hospitals" },
  dashSubscribers: { bn: "নিউজলেটার গ্রাহক", en: "Newsletter subscribers" },

  // Ads management
  ads: { bn: "বিজ্ঞাপন", en: "Ads" },
  addAd: { bn: "নতুন বিজ্ঞাপন", en: "New ad" },
  adName: { bn: "বিজ্ঞাপনের নাম", en: "Ad name" },
  adReport: { bn: "দিন-ভিত্তিক হিসাব", en: "Daily performance" },
  adReportNote: {
    bn: "বিজ্ঞাপনের অন্তত অর্ধেক অংশ পর্দায় ১ সেকেন্ড (ভিডিও হলে ২ সেকেন্ড) থাকলে তবেই একটি ইম্প্রেশন গোনা হয়।",
    en: "An impression counts only after half the ad has been on screen for one second (two for video).",
  },
  adReportEmpty: {
    bn: "এই সময়ে কোনো ইম্প্রেশন বা ক্লিক হয়নি।",
    en: "No impressions or clicks in this period.",
  },
  adDays: { bn: "দিন", en: "days" },
  dashLast24Total: { bn: "মোট {n} ভিজিট", en: "{n} visits in total" },
  chartOther: { bn: "অন্যান্য", en: "Other" },

  // --- security ---
  securityLogins: { bn: "লগইনের হিসাব", en: "Sign-in activity" },
  securityLoginsNote: {
    bn: "কে কখন কোন ঠিকানা থেকে ঢুকেছে, আর কে ঢুকতে ব্যর্থ হয়েছে।",
    en: "Who signed in, when, from where — and who tried and failed.",
  },
  securityNoLogins: { bn: "এখনো কোনো হিসাব নেই।", en: "Nothing recorded yet." },
  securityFailedCount: {
    bn: "{n}টি ব্যর্থ চেষ্টা",
    en: "{n} failed attempts",
  },
  securityWhat: { bn: "কী হয়েছে", en: "What" },
  securityWho: { bn: "কে", en: "Who" },
  securityFrom: { bn: "কোথা থেকে", en: "From" },
  security_login: { bn: "ঢুকেছেন", en: "Signed in" },
  security_logout: { bn: "বেরিয়েছেন", en: "Signed out" },
  security_login_failed: { bn: "ভুল পাসওয়ার্ড", en: "Wrong password" },
  security_login_locked: {
    bn: "বারবার ভুল — সাময়িক বন্ধ",
    en: "Too many attempts — locked out",
  },

  // --- media actions ---
  mediaDownload: { bn: "ডাউনলোড করুন", en: "Download" },
  mediaCopyImage: { bn: "ছবিটি কপি করুন", en: "Copy the picture" },
  mediaDownloading: { bn: "ডাউনলোড হচ্ছে…", en: "Downloading…" },
  mediaDownloaded: { bn: "ডাউনলোড হয়েছে ✓", en: "Downloaded ✓" },
  mediaDownloadFailed: { bn: "ডাউনলোড করা যায়নি", en: "Could not download" },
  mediaCopying: { bn: "কপি হচ্ছে…", en: "Copying…" },
  mediaImageCopied: {
    bn: "ছবি কপি হয়েছে — এখন যেকোনো জায়গায় পেস্ট করুন",
    en: "Picture copied — paste it anywhere",
  },
  mediaCopyFailed: { bn: "কপি করা যায়নি", en: "Could not copy" },
  mediaNeedsHttps: {
    bn: "ছবি কপি করতে HTTPS লাগে। ডোমেইন যোগ করার পর কাজ করবে — আপাতত ডাউনলোড বা URL কপি করুন।",
    en: "Copying a picture needs HTTPS. It will work once a domain is attached — for now download it or copy the URL.",
  },

  // --- roles & permissions ---
  rolesNav: { bn: "রোল ও অনুমতি", en: "Roles & permissions" },
  rolesTitle: { bn: "রোল ও অনুমতি", en: "Roles & permissions" },
  rolesIntro: {
    bn: "কোন রোল কী কী করতে পারবে। এই তালিকাটি সার্ভারের আসল নিয়ম থেকেই তৈরি — যা এখানে ✓ নেই, সেটি সার্ভারও করতে দেবে না।",
    en: "What each role may do. This table is built from the server's own rules — anything without a ✓ here is refused by the server too.",
  },
  rolesCapability: { bn: "কাজ", en: "Capability" },
  rolesYou: { bn: "আপনি", en: "You" },
  rolesAllowed: { bn: "অনুমতি আছে", en: "Allowed" },
  rolesDeniedShort: { bn: "অনুমতি নেই", en: "Not allowed" },
  rolesDenied: {
    bn: "এই পাতা দেখার অনুমতি আপনার নেই।",
    en: "You do not have access to this page.",
  },
  rolesFooterNote: {
    bn: "রোল বদলাতে ইউজার ও রোল পাতায় যান। শুধু সুপার অ্যাডমিন রোল বদলাতে পারেন — এবং চাইলে অন্য কাউকে সুপার অ্যাডমিন করে একই ক্ষমতা দিতে পারেন।",
    en: "Change a role on the Users page. Only a Super Admin can do that — and may make someone else a Super Admin to share the same power.",
  },

  roleAboutSUPER_ADMIN: {
    bn: "সব কিছুতে অ্যাক্সেস, এবং একমাত্র যিনি ইউজার যোগ করতে বা রোল বদলাতে পারেন।",
    en: "Access to everything, and the only role that can add users or change roles.",
  },
  roleAboutADMIN: {
    bn: "সাইটের সব সেটিং, হোমপেজ, বিজ্ঞাপন ও SEO — শুধু ইউজার ব্যবস্থাপনা ছাড়া।",
    en: "All site settings, homepage, ads and SEO — everything except managing users.",
  },
  roleAboutEDITOR: {
    bn: "খবর প্রকাশ, ক্যাটাগরি, ব্রেকিং নিউজ, ই-পেপার ও কমেন্ট মডারেশন।",
    en: "Publishing, categories, breaking news, e-paper and comment moderation.",
  },
  roleAboutMODERATOR: {
    bn: "পাঠকের জমা দেওয়া আইন, রক্ত ও হাসপাতাল সেবার আবেদন এবং কমেন্ট দেখভাল।",
    en: "Reader submissions to the legal, blood and hospital directories, plus comments.",
  },
  roleAboutREPORTER: {
    bn: "খবর লিখতে ও ছবি আপলোড করতে পারেন, কিন্তু নিজে প্রকাশ করতে পারেন না।",
    en: "Can write articles and upload images, but cannot publish them.",
  },

  roleShortSUPER_ADMIN: { bn: "সুপার", en: "Super" },
  roleShortADMIN: { bn: "অ্যাডমিন", en: "Admin" },
  roleShortEDITOR: { bn: "এডিটর", en: "Editor" },
  roleShortMODERATOR: { bn: "মডারেটর", en: "Mod" },
  roleShortREPORTER: { bn: "রিপোর্টার", en: "Reporter" },

  capGroup_content: { bn: "কনটেন্ট", en: "Content" },
  capGroup_directory: { bn: "পাঠকের আবেদন", en: "Reader submissions" },
  capGroup_site: { bn: "সাইট", en: "The site" },
  capGroup_account: { bn: "অ্যাকাউন্ট", en: "Accounts" },

  cap_writeArticles: { bn: "খবর লেখা ও সম্পাদনা", en: "Write and edit articles" },
  cap_publishArticles: { bn: "খবর প্রকাশ করা", en: "Publish articles" },
  cap_deleteArticles: { bn: "খবর মুছে ফেলা", en: "Delete articles" },
  cap_manageCategories: { bn: "ক্যাটাগরি তৈরি ও সম্পাদনা", en: "Create and edit categories" },
  cap_deleteCategories: { bn: "ক্যাটাগরি মুছে ফেলা", en: "Delete categories" },
  cap_breakingNews: { bn: "ব্রেকিং নিউজ", en: "Breaking news" },
  cap_epaper: { bn: "ই-পেপার", en: "E-paper" },
  cap_media: { bn: "ছবি আপলোড", en: "Upload media" },
  cap_moderateComments: { bn: "কমেন্ট মডারেশন", en: "Moderate comments" },
  cap_reviewListings: {
    bn: "আবেদন অনুমোদন / বাতিল",
    en: "Approve or reject submissions",
  },
  cap_manageDirectories: {
    bn: "আইন, রক্ত ও হাসপাতাল তালিকা সম্পাদনা",
    en: "Edit the legal, blood and hospital directories",
  },
  cap_homepageBuilder: { bn: "হোমপেজ বিন্যাস", en: "Homepage builder" },
  cap_liveTv: { bn: "লাইভ টিভি", en: "Live TV" },
  cap_ads: { bn: "বিজ্ঞাপন", en: "Advertising" },
  cap_newsletter: { bn: "নিউজলেটার গ্রাহক", en: "Newsletter subscribers" },
  cap_seo: { bn: "SEO সেটিং", en: "SEO settings" },
  cap_siteSettings: { bn: "সাইট সেটিং", en: "Site settings" },
  cap_ownProfile: {
    bn: "নিজের নাম, ছবি, ইমেইল ও পাসওয়ার্ড",
    en: "Own name, picture, email and password",
  },
  cap_manageUsers: {
    bn: "ইউজার যোগ করা ও রোল বদলানো",
    en: "Add users and change roles",
  },

  // --- account settings ---
  accountSection: { bn: "লগইনের তথ্য", en: "Sign-in details" },
  accountNote: {
    bn: "ইমেইল বা পাসওয়ার্ড বদলাতে বর্তমান পাসওয়ার্ডটি দিতে হবে।",
    en: "Changing the email or password requires your current password.",
  },
  accountEmail: { bn: "ইমেইল", en: "Email" },
  accountCurrentPassword: { bn: "বর্তমান পাসওয়ার্ড", en: "Current password" },
  accountNewPassword: { bn: "নতুন পাসওয়ার্ড", en: "New password" },
  accountNewPasswordHint: {
    bn: "কমপক্ষে ৬ অক্ষর। খালি রাখলে পাসওয়ার্ড বদলাবে না।",
    en: "At least 6 characters. Leave blank to keep your current password.",
  },
  accountConfirmPassword: { bn: "নতুন পাসওয়ার্ড আবার", en: "Repeat new password" },
  accountMismatch: { bn: "দুইটি পাসওয়ার্ড মেলেনি", en: "The passwords do not match" },
  accountSaved: { bn: "লগইনের তথ্য বদলানো হয়েছে ✓", en: "Sign-in details updated ✓" },

  // --- notification bell ---
  notifications: { bn: "নোটিফিকেশন", en: "Notifications" },
  notifEmpty: {
    bn: "নতুন কিছু নেই। সব দেখা হয়ে গেছে।",
    en: "Nothing new. You are all caught up.",
  },
  notifPending: { bn: "{n}টি অপেক্ষমাণ", en: "{n} pending" },
  notif_lawyer: { bn: "আইন সেবায় নতুন আবেদন", en: "New legal listing submitted" },
  notif_donor: { bn: "রক্ত সেবায় নতুন আবেদন", en: "New blood donor submitted" },
  notif_hospital: { bn: "হাসপাতাল সেবায় নতুন আবেদন", en: "New hospital submitted" },
  notif_comment: { bn: "নতুন কমেন্ট অপেক্ষায়", en: "Comment awaiting moderation" },
  notif_ad: { bn: "নতুন বিজ্ঞাপনের আবেদন", en: "Ad booking awaiting approval" },
  notifJustNow: { bn: "এইমাত্র", en: "just now" },
  notifMinutes: { bn: "{n} মিনিট আগে", en: "{n} min ago" },
  notifHours: { bn: "{n} ঘণ্টা আগে", en: "{n} hr ago" },
  notifDays: { bn: "{n} দিন আগে", en: "{n} d ago" },

  // --- profile (Settings) ---
  profileSection: { bn: "আপনার প্রোফাইল", en: "Your profile" },
  profileNote: {
    bn: "উপরের ডানে যে নাম ও ছবি দেখায়, সেটাই। শুধু আপনার নিজের অ্যাকাউন্টে কাজ করে।",
    en: "The name and picture shown at the top right. Applies to your own account only.",
  },
  profileName: { bn: "আপনার নাম", en: "Your name" },
  profilePhoto: { bn: "প্রোফাইল ছবি", en: "Profile picture" },
  profileRemovePhoto: { bn: "ছবি সরান", en: "Remove picture" },
  profileSaved: { bn: "প্রোফাইল সংরক্ষিত হয়েছে ✓", en: "Profile saved ✓" },

  // --- footer blocks (Settings) ---
  footerBlocks: { bn: "ফুটারে কী কী দেখাবে", en: "What the footer shows" },
  footerBlocksNote: {
    bn: "বন্ধ করলে অংশটি সাইটের ফুটার থেকে সরে যাবে। একটি কলামের সব অংশ বন্ধ করলে কলামটিই থাকবে না।",
    en: "Switching one off removes it from the site's footer. Turn off everything in a column and the column goes too.",
  },
  footerBlock_tagline: { bn: "ট্যাগলাইন", en: "Tagline" },
  footerBlock_social: { bn: "সোশ্যাল আইকন", en: "Social icons" },
  footerBlock_app: { bn: "অ্যাপ ব্যাজ (Google Play / App Store)", en: "App badges" },
  footerBlock_categories: { bn: "ক্যাটাগরি তালিকা", en: "Category list" },
  footerBlock_company: { bn: "প্রতিষ্ঠান লিংক", en: "Company links" },
  footerBlock_newsletter: { bn: "নিউজলেটার ফর্ম", en: "Newsletter form" },
  footerBlock_contact: { bn: "যোগাযোগের তথ্য", en: "Contact details" },
  footerBlock_editor: { bn: "সম্পাদক ও প্রকাশক", en: "Editor & publisher" },

  // --- SEO page ---
  seoIntro: {
    bn: "এখানকার প্রতিটি সেটিং সরাসরি সাইটের <head>, robots.txt আর sitemap.xml-এ যায় — সার্চ ইঞ্জিন ঠিক এটাই পড়ে।",
    en: "Every setting here goes straight into the site's <head>, robots.txt and sitemap.xml — this is exactly what search engines read.",
  },
  seoScore: { bn: "SEO স্কোর", en: "SEO score" },
  seoChecked: { bn: "যাচাই করা খবর", en: "Articles checked" },
  seoErrors: { bn: "গুরুতর সমস্যা", en: "Errors" },
  seoWarnings: { bn: "সতর্কতা", en: "Warnings" },

  seoDefaults: { bn: "সাইটের ডিফল্ট", en: "Site defaults" },
  seoDefaultsNote: {
    bn: "হোমপেজে এবং যেসব পাতার নিজস্ব শিরোনাম-বর্ণনা নেই, সেখানে এগুলোই ব্যবহার হয়।",
    en: "Used on the home page and on any page without its own title and description.",
  },
  seoSiteName: { bn: "সাইটের নাম", en: "Site name" },
  seoTitleTemplate: { bn: "টাইটেল টেমপ্লেট", en: "Title template" },
  seoTitleTemplateHint: {
    bn: "%s-এর জায়গায় পাতার নিজের শিরোনাম বসবে। যেমন: %s | LinkNews24",
    en: "%s is replaced by the page's own title, e.g. %s | LinkNews24",
  },
  seoDefaultTitle: { bn: "ডিফল্ট শিরোনাম", en: "Default title" },
  seoDefaultDesc: { bn: "ডিফল্ট বর্ণনা", en: "Default description" },
  seoKeywords: { bn: "কীওয়ার্ড", en: "Keywords" },
  seoKeywordsHint: {
    bn: "কমা দিয়ে আলাদা। গুগল এটি আর র‍্যাঙ্কিংয়ে ব্যবহার করে না, কিছু ছোট সার্চ ইঞ্জিন করে।",
    en: "Comma separated. Google no longer uses this for ranking; some smaller engines still do.",
  },
  seoTwitter: { bn: "X / Twitter হ্যান্ডেল", en: "X / Twitter handle" },
  seoPreview: { bn: "গুগলে যেভাবে দেখাবে", en: "How it will look in Google" },

  seoImages: { bn: "শেয়ার করার ছবি", en: "Sharing images" },
  seoImagesNote: {
    bn: "ফেসবুক বা হোয়াটসঅ্যাপে লিংক দিলে যে ছবিটি দেখায়। নিজস্ব ছবি নেই এমন পাতায় এটিই যাবে। সুপারিশ: ১২০০×৬৩০ পিক্সেল।",
    en: "The image shown when a link is shared on Facebook or WhatsApp, for any page without its own. 1200×630 recommended.",
  },
  seoOgImage: { bn: "ডিফল্ট শেয়ার ছবি", en: "Default share image" },
  seoOrgLogo: { bn: "প্রতিষ্ঠানের লোগো", en: "Organisation logo" },
  seoOrgName: { bn: "প্রতিষ্ঠানের নাম", en: "Organisation name" },

  seoCrawling: { bn: "ক্রলিং ও যাচাই", en: "Crawling & verification" },
  seoCrawlingNote: {
    bn: "সার্চ ইঞ্জিন সাইটের কোন অংশ দেখবে, আর গুগল-বিং-এর মালিকানা যাচাই।",
    en: "What search engines may crawl, and ownership verification for Google and Bing.",
  },
  seoIndexable: { bn: "সার্চ ইঞ্জিনে দেখাবে", en: "Allow search engines" },
  seoIndexableOn: {
    bn: "চালু — গুগল সাইটটি খুঁজে পাবে ও দেখাবে।",
    en: "On — Google may find and list the site.",
  },
  seoIndexableOff: {
    bn: "বন্ধ — robots.txt সবকিছু আটকাবে এবং প্রতিটি পাতায় noindex বসবে।",
    en: "Off — robots.txt blocks everything and every page carries noindex.",
  },
  seoDisallow: { bn: "যেসব পাতা ক্রল করবে না", en: "Paths to disallow" },
  seoDisallowHint: {
    bn: "প্রতি লাইনে একটি পাথ। হুবহু robots.txt-এ Disallow হিসেবে যাবে।",
    en: "One path per line, written into robots.txt as Disallow.",
  },
  seoGoogleVerify: { bn: "Google Search Console কোড", en: "Google Search Console code" },
  seoVerifyHint: {
    bn: "Search Console-এর HTML ট্যাগ পদ্ধতিতে যে content মানটি দেয়, শুধু সেটি।",
    en: "Just the content value from Search Console's HTML tag method.",
  },
  seoBingVerify: { bn: "Bing Webmaster কোড", en: "Bing Webmaster code" },
  seoUrls: { bn: "ঠিকানা", en: "URLs" },
  seoSitemapBreakdown: {
    bn: "{a} খবর · {c} ক্যাটাগরি · {s} স্থির পাতা",
    en: "{a} articles · {c} categories · {s} static pages",
  },

  seoAudit: { bn: "প্রকাশিত খবরের SEO যাচাই", en: "Published article audit" },
  seoAuditNote: {
    bn: "প্রকাশিত প্রতিটি খবর সত্যিকারভাবে পরীক্ষা করা হয়েছে। খবর বদলালেই তালিকা নিজে থেকে হালনাগাদ হয়।",
    en: "Every published article is really checked. The list updates itself whenever an article changes.",
  },
  seoAllClear: { bn: "কোনো সমস্যা পাওয়া যায়নি।", en: "No issues found." },
  seoNoArticles: {
    bn: "এখনো কোনো খবর প্রকাশিত হয়নি, তাই যাচাই করার কিছু নেই।",
    en: "Nothing is published yet, so there is nothing to check.",
  },
  seoIssue_noDescription: {
    bn: "মেটা বর্ণনা নেই — গুগল নিজে থেকে লেখা কেটে বসাবে",
    en: "No meta description — Google will cut one from the body",
  },
  seoIssue_descriptionLong: {
    bn: "বর্ণনা বেশি লম্বা, শেষটা কেটে যাবে",
    en: "Description too long; the end will be cut off",
  },
  seoIssue_descriptionShort: {
    bn: "বর্ণনা বেশি ছোট",
    en: "Description is very short",
  },
  seoIssue_titleLong: {
    bn: "শিরোনাম বেশি লম্বা, ফলাফলে কেটে যাবে",
    en: "Title too long; it will be truncated in results",
  },
  seoIssue_titleShort: { bn: "শিরোনাম বেশি ছোট", en: "Title is very short" },
  seoIssue_noImage: {
    bn: "ফিচার্ড ইমেজ নেই — শেয়ার করলে ছবি ছাড়া লিংক যাবে",
    en: "No featured image — shares will be a bare link",
  },
  seoIssue_noTitleEn: {
    bn: "ইংরেজি শিরোনাম নেই — English ভিউতে ফাঁকা দেখাবে",
    en: "No English title — the English view will be blank",
  },
  seoIssue_noPublishedAt: {
    bn: "প্রকাশের তারিখ নেই",
    en: "No publish date",
  },
  seoIssue_duplicateTitle: {
    bn: "একই শিরোনামের আরেকটি খবর আছে — দুটি একে অন্যের সাথে প্রতিযোগিতা করবে",
    en: "Another article shares this title; they will compete with each other",
  },
  chartTotal: { bn: "মোট", en: "total" },
  adShowDaily: { bn: "প্রতিদিনের হিসাব দেখুন", en: "Show daily figures" },
  adHideDaily: { bn: "প্রতিদিনের হিসাব লুকান", en: "Hide daily figures" },
  adLifetime: { bn: "সর্বমোট (ইম্প্রেশন / ক্লিক)", en: "Lifetime (impr. / clicks)" },
  adImage: { bn: "ব্যানার ছবি", en: "Banner image" },
  adLink: { bn: "লিংক (URL)", en: "Link (URL)" },
  adPlacement: { bn: "অবস্থান", en: "Placement" },
  adActive: { bn: "সক্রিয়", en: "Active" },
  adStartsAt: { bn: "শুরুর তারিখ", en: "Start date" },
  adEndsAt: { bn: "শেষ তারিখ", en: "End date" },
  adImageRequired: { bn: "আগে ছবি আপলোড করুন", en: "Upload an image first" },
  noAds: { bn: "কোনো বিজ্ঞাপন নেই।", en: "No ads yet." },
  placeHEADER: { bn: "হেডার (উপরে)", en: "Header (top)" },
  placeSIDEBAR: { bn: "সাইডবার", en: "Sidebar" },
  placeIN_ARTICLE: { bn: "আর্টিকেলের ভিতরে", en: "In-article" },
  placeFOOTER: { bn: "ফুটার (নিচে)", en: "Footer" },
  placePOPUP: { bn: "পপআপ", en: "Popup" },
  adAdvertiser: { bn: "বিজ্ঞাপনদাতা", en: "Advertiser" },
  adPending: { bn: "অপেক্ষমাণ", en: "Pending" },
  adApprove: { bn: "অনুমোদন", en: "Approve" },
  adReject: { bn: "বাতিল", en: "Reject" },
  adExpired: { bn: "মেয়াদ শেষ", en: "Expired" },
  adScheduled: { bn: "আসন্ন", en: "Scheduled" },
  adNotShowing: {
    bn: "সাইটে দেখাচ্ছে না — মেয়াদ শেষ",
    en: "Not live — expired",
  },
  adRunsForever: { bn: "মেয়াদহীন (সবসময় চলবে)", en: "No end date (always on)" },
  // --- Service review desks ---
  svcPending: { bn: 'অপেক্ষমাণ', en: 'Pending' },
  svcApproved: { bn: 'প্রকাশিত', en: 'Published' },
  svcRejected: { bn: 'ফেরত', en: 'Sent back' },
  svcAll: { bn: 'সব', en: 'All' },
  svcApprove: { bn: 'অনুমোদন', en: 'Approve' },
  svcReject: { bn: 'ফেরত', en: 'Reject' },
  svcRejectReason: {
    bn: 'কেন ফেরত পাঠাচ্ছেন? (জমাদাতা দেখবেন)',
    en: 'Why are you sending it back? (the submitter will see this)',
  },
  svcSendBack: { bn: 'ফেরত পাঠান', en: 'Send back' },
  svcSubmittedBy: { bn: 'অ্যাডমিন যোগ করেছেন', en: 'Added by admin' },
  svcSearchName: { bn: 'নাম দিয়ে খুঁজুন', en: 'Search by name' },
  svcNothingPending: { bn: 'অপেক্ষমাণ কিছু নেই।', en: 'Nothing waiting.' },
  svcNoRecords: { bn: 'কোনো তথ্য নেই।', en: 'No records.' },
  svcReturnReason: { bn: 'ফেরতের কারণ', en: 'Reason' },
  svcLegalDesk: {
    bn: 'পাঠকদের জমা দেওয়া আইনজীবীর তথ্য। বার কাউন্সিলের সনদ মিলিয়ে দেখে অনুমোদন দিন।',
    en: 'Advocate listings submitted by readers. Check the Bar Council sanad before approving.',
  },
  svcBloodDesk: {
    bn: 'পাঠকদের জমা দেওয়া রক্তদাতার তথ্য। অনুমোদন দিলে রক্ত সেবার পাতায় দেখা যাবে।',
    en: 'Donor listings submitted by readers. Approving puts them on the Blood Service page.',
  },
  svcHospitalDesk: {
    bn: 'পাঠকদের জমা দেওয়া হাসপাতালের তথ্য। অনুমোদন দিলে হাসপাতাল সেবার পাতায় দেখা যাবে।',
    en: 'Hospital listings submitted by readers. Approving puts them on the Hospital Service page.',
  },
  svcEnrolment: { bn: 'এনরোলমেন্ট', en: 'Enrolment' },
  svcDate: { bn: 'তারিখ', en: 'Date' },
  svcMemberId: { bn: 'আইডি', en: 'ID' },
  svcViewSanad: { bn: 'সনদ দেখুন', en: 'View sanad' },
  svcNoSanad: { bn: 'সনদ দেওয়া হয়নি', en: 'No sanad provided' },
  svcChamberLbl: { bn: 'চেম্বার', en: 'Chamber' },
  svcDonations: { bn: 'রক্তদান', en: 'Donations' },
  svcDonorId: { bn: 'ডোনার আইডি', en: 'Donor ID' },
  svcBorn: { bn: 'জন্ম', en: 'Born' },
  svcEmergency: { bn: '২৪/৭ জরুরি', en: '24/7 emergency' },
  svcTypeGOVERNMENT: { bn: 'সরকারি', en: 'Government' },
  svcTypePRIVATE: { bn: 'বেসরকারি', en: 'Private' },
  svcTypeSPECIALIZED: { bn: 'বিশেষায়িত', en: 'Specialized' },
  svcTypeNGO: { bn: 'এনজিও', en: 'NGO' },
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
