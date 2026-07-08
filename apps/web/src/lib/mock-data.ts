import type { Article, Category } from "@/types/content";

export const categories: Category[] = [
  { id: "national", name: "জাতীয়", slug: "national" },
  { id: "politics", name: "রাজনীতি", slug: "politics" },
  { id: "special-report", name: "বিশেষ প্রতিবেদন", slug: "special-report" },
  { id: "secretariat", name: "সচিবালয়", slug: "secretariat" },
  { id: "nationwide", name: "দেশজুড়ে", slug: "nationwide" },
  { id: "business", name: "অর্থনীতি", slug: "business" },
  { id: "world", name: "আন্তর্জাতিক", slug: "world" },
  { id: "sports", name: "খেলাধুলা", slug: "sports" },
  { id: "jobs", name: "চাকরি", slug: "jobs" },
  { id: "top-ten", name: "টপ টেন", slug: "top-ten" },
  { id: "entertainment", name: "বিনোদন", slug: "entertainment" },
  { id: "features", name: "ফিচার", slug: "features" },
  { id: "education", name: "শিক্ষা", slug: "education" },
  { id: "health", name: "স্বাস্থ্য", slug: "health" },
  { id: "diaspora", name: "প্রবাস", slug: "diaspora" },
  { id: "lifestyle", name: "লাইফস্টাইল", slug: "lifestyle" },
  { id: "technology", name: "প্রযুক্তি", slug: "technology" },
  { id: "opinion", name: "মতামত", slug: "opinion" },
  { id: "religion", name: "ধর্ম", slug: "religion" },
  { id: "crime", name: "আইন-আদালত", slug: "crime" },
  { id: "environment", name: "পরিবেশ", slug: "environment" },
  { id: "video", name: "ভিডিও", slug: "video" },
  { id: "gallery", name: "ফটো গ্যালারি", slug: "gallery" },
];

const findCategory = (slug: string): Category =>
  categories.find((c) => c.slug === slug)!;

export interface NavItem {
  label: string;
  href?: string;
  children?: Category[];
}

export const navItems: NavItem[] = [
  {
    label: "বাংলাদেশ",
    children: [
      findCategory("national"),
      findCategory("politics"),
      findCategory("special-report"),
      findCategory("secretariat"),
    ],
  },
  { label: "দেশজুড়ে", href: "/nationwide" },
  { label: "অর্থনীতি", href: "/business" },
  { label: "আন্তর্জাতিক", href: "/world" },
  { label: "খেলাধুলা", href: "/sports" },
  { label: "চাকরি", href: "/jobs" },
  { label: "টপ টেন", href: "/top-ten" },
  { label: "বিনোদন", href: "/entertainment" },
  { label: "প্রযুক্তি", href: "/technology" },
  { label: "মতামত", href: "/opinion" },
  { label: "ধর্ম", href: "/religion" },
  { label: "আইন-আদালত", href: "/crime" },
  { label: "পরিবেশ", href: "/environment" },
  { label: "ফিচার", href: "/features" },
  {
    label: "অন্যান্য",
    children: [
      findCategory("education"),
      findCategory("health"),
      findCategory("diaspora"),
      findCategory("lifestyle"),
    ],
  },
];

export const breakingNewsItems: string[] = [
  "ঢাকায় মেট্রোরেলের নতুন লাইন উদ্বোধন করলেন সংশ্লিষ্ট কর্তৃপক্ষ",
  "জাতীয় বাজেট নিয়ে সংসদে আলোচনা শুরু",
  "উপকূলীয় অঞ্চলে ঘূর্ণিঝড় সতর্কতা জারি, সরে যাচ্ছে হাজারো মানুষ",
];

export const heroArticle: Article = {
  id: "hero-1",
  title: "রাজধানীতে নতুন এক্সপ্রেসওয়ে প্রকল্পের কাজ শুরু, যানজট কমার আশা",
  slug: "capital-expressway-project-begins",
  excerpt:
    "নগর পরিকল্পনাবিদদের মতে, প্রকল্পটি সম্পন্ন হলে রাজধানীর পূর্ব-পশ্চিম সংযোগে যাতায়াতের সময় উল্লেখযোগ্যভাবে কমে আসবে।",
  category: findCategory("national"),
  author: "স্টাফ করেসপন্ডেন্ট",
  publishedAt: "২ ঘণ্টা আগে",
  imageTone: "navy",
  isBreaking: true,
};

export const nationalArticles: Article[] = [
  {
    id: "nat-1",
    title: "বন্যা পরিস্থিতির উন্নতি, ঘরে ফিরছে ক্ষতিগ্রস্ত পরিবারগুলো",
    slug: "flood-situation-improves",
    excerpt: "ত্রাণ কার্যক্রম অব্যাহত রয়েছে জেলা প্রশাসনের তত্ত্বাবধানে।",
    category: findCategory("national"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nat-2",
    title: "সরকারি হাসপাতালে বিনামূল্যে স্বাস্থ্যসেবা কর্মসূচি সম্প্রসারণ",
    slug: "free-healthcare-program-expansion",
    excerpt: "প্রান্তিক জনগোষ্ঠীর জন্য নতুন সুবিধা যুক্ত হয়েছে কর্মসূচিতে।",
    category: findCategory("national"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "nat-3",
    title: "গ্রামীণ সড়ক উন্নয়ন প্রকল্পে বরাদ্দ বাড়াল পরিকল্পনা মন্ত্রণালয়",
    slug: "rural-road-development-budget",
    excerpt: "আগামী অর্থবছরে দেশজুড়ে প্রায় দুই হাজার কিলোমিটার সড়ক সংস্কার হবে।",
    category: findCategory("national"),
    author: "অর্থনৈতিক প্রতিবেদক",
    publishedAt: "৭ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "nat-4",
    title: "শীতের শুরুতেই রাজধানীতে বায়ুদূষণ বৃদ্ধি, সতর্ক থাকার পরামর্শ",
    slug: "air-pollution-rises-in-capital",
    excerpt: "পরিবেশ অধিদপ্তর জানিয়েছে বায়ুমান সূচক ঝুঁকিপূর্ণ পর্যায়ে পৌঁছেছে।",
    category: findCategory("national"),
    author: "পরিবেশ প্রতিবেদক",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nat-5",
    title: "রাজধানীর তিনটি ওয়ার্ডে বিশুদ্ধ পানি সরবরাহ প্রকল্প উদ্বোধন",
    slug: "clean-water-project-inaugurated",
    excerpt: "প্রায় দুই লাখ বাসিন্দা সরাসরি উপকৃত হবেন বলে জানিয়েছে সিটি কর্পোরেশন।",
    category: findCategory("national"),
    author: "নগর প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "nat-6",
    title: "দুর্যোগ মোকাবিলায় নতুন আগাম সতর্কীকরণ ব্যবস্থা চালু",
    slug: "new-early-warning-system-launched",
    excerpt: "উপকূলীয় ১২ জেলায় প্রথম পর্যায়ে বাস্তবায়ন হচ্ছে ব্যবস্থাটি।",
    category: findCategory("national"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nat-7",
    title: "সরকারি চাকরিতে নতুন নিয়োগবিধি জারি",
    slug: "new-recruitment-rules-issued",
    excerpt: "স্বচ্ছতা বাড়াতে ডিজিটাল যাচাই প্রক্রিয়া বাধ্যতামূলক করা হয়েছে।",
    category: findCategory("national"),
    author: "প্রশাসন প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "nat-8",
    title: "শীতকালীন স্বাস্থ্যসতর্কতা জারি করল স্বাস্থ্য অধিদপ্তর",
    slug: "winter-health-advisory-issued",
    excerpt: "শিশু ও প্রবীণদের বাড়তি সতর্কতা নেওয়ার পরামর্শ দেওয়া হয়েছে।",
    category: findCategory("national"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "১৬ ঘণ্টা আগে",
    imageTone: "crimson",
  },
];

export const politicsArticles: Article[] = [
  {
    id: "pol-1",
    title: "আসন্ন নির্বাচন নিয়ে দলগুলোর মধ্যে আলোচনা অব্যাহত",
    slug: "election-discussions-continue",
    excerpt: "নির্বাচন কমিশনের সঙ্গে বৈঠকের পর নতুন সময়সূচি প্রকাশ।",
    category: findCategory("politics"),
    author: "রাজনৈতিক প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "pol-2",
    title: "সংসদে পাস হলো নতুন তথ্য সুরক্ষা বিল",
    slug: "data-protection-bill-passed",
    excerpt: "বিলটি নাগরিকদের ডিজিটাল তথ্যের সুরক্ষা নিশ্চিত করবে বলে জানানো হয়েছে।",
    category: findCategory("politics"),
    author: "সংসদ প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "pol-3",
    title: "স্থানীয় সরকার নির্বাচনের তফসিল ঘোষণা",
    slug: "local-government-election-schedule",
    excerpt: "আগামী মাসে দেশের ৬৪ জেলায় পর্যায়ক্রমে ভোটগ্রহণ অনুষ্ঠিত হবে।",
    category: findCategory("politics"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "pol-4",
    title: "প্রধান বিরোধী দলের সংবাদ সম্মেলন আজ",
    slug: "opposition-press-conference-today",
    excerpt: "সাম্প্রতিক ইস্যু নিয়ে প্রতিক্রিয়া জানাবে দলটি বলে সূত্রে জানা গেছে।",
    category: findCategory("politics"),
    author: "রাজনৈতিক প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "pol-5",
    title: "সংসদীয় কমিটির প্রতিবেদন জমা, সুপারিশ একাধিক সংস্কারের",
    slug: "parliamentary-committee-report-submitted",
    excerpt: "প্রশাসনিক জবাবদিহিতা বাড়াতে নতুন কাঠামোর প্রস্তাব দেওয়া হয়েছে।",
    category: findCategory("politics"),
    author: "সংসদ প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "pol-6",
    title: "উপনির্বাচনে প্রার্থী তালিকা চূড়ান্ত করল প্রধান দলগুলো",
    slug: "by-election-candidate-list-finalized",
    excerpt: "আগামী সপ্তাহে মনোনয়নপত্র জমা দেওয়ার শেষ দিন নির্ধারিত হয়েছে।",
    category: findCategory("politics"),
    author: "রাজনৈতিক প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "pol-7",
    title: "স্থানীয় সরকার আইনে সংশোধনী প্রস্তাব মন্ত্রিসভায়",
    slug: "local-government-act-amendment-proposal",
    excerpt: "প্রস্তাবিত সংশোধনী জনপ্রতিনিধিদের ক্ষমতা পুনর্বিন্যাস করবে বলে জানা গেছে।",
    category: findCategory("politics"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৭ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const sportsArticles: Article[] = [
  {
    id: "spo-1",
    title: "এশিয়া কাপে বাংলাদেশের দুর্দান্ত জয়",
    slug: "bangladesh-asia-cup-win",
    excerpt: "শেষ ওভারের নাটকীয়তায় ৩ উইকেটের জয় তুলে নিল টাইগাররা।",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "spo-2",
    title: "ঘরোয়া ফুটবল লিগে চ্যাম্পিয়ন হলো আবাহনী",
    slug: "abahani-wins-domestic-league",
    excerpt: "মৌসুমের শেষ ম্যাচে প্রতিদ্বন্দ্বী দলকে ২-০ গোলে হারিয়ে শিরোপা নিশ্চিত।",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "spo-3",
    title: "সাফ চ্যাম্পিয়নশিপের দল ঘোষণা করল ফুটবল ফেডারেশন",
    slug: "saff-championship-squad-announced",
    excerpt: "নতুন কয়েকজন তরুণ খেলোয়াড়কে দলে জায়গা দেওয়া হয়েছে।",
    category: findCategory("sports"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "spo-4",
    title: "অনূর্ধ্ব-১৯ ক্রিকেট বিশ্বকাপে সেমিফাইনালে বাংলাদেশ",
    slug: "u19-world-cup-semifinal",
    excerpt: "গ্রুপ পর্বে অপরাজিত থেকে শেষ চারে জায়গা করে নিল যুব দল।",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "spo-5",
    title: "জাতীয় দলের নতুন প্রধান কোচ নিয়োগ দিল ক্রিকেট বোর্ড",
    slug: "new-head-coach-appointed",
    excerpt: "আসন্ন সিরিজ থেকেই দায়িত্ব নেবেন নতুন কোচ।",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "spo-6",
    title: "হকি টুর্নামেন্টে রানার্সআপ বাংলাদেশ",
    slug: "hockey-tournament-runners-up",
    excerpt: "ফাইনালে টাইব্রেকারে হেরে শিরোপা হাতছাড়া করে দল।",
    category: findCategory("sports"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৬ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "spo-7",
    title: "অ্যাথলেটিক্সে জাতীয় রেকর্ড গড়লেন তরুণ দৌড়বিদ",
    slug: "national-record-in-athletics",
    excerpt: "১০০ মিটার স্প্রিন্টে ১১ বছরের পুরনো রেকর্ড ভাঙলেন তিনি।",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১৮ ঘণ্টা আগে",
    imageTone: "crimson",
  },
];

export const entertainmentArticles: Article[] = [
  {
    id: "ent-1",
    title: "ঈদে মুক্তি পাচ্ছে বছরের সবচেয়ে বড় বাজেটের চলচ্চিত্র",
    slug: "eid-release-biggest-budget-film",
    excerpt: "নির্মাতা জানিয়েছেন, দর্শকদের জন্য থাকছে ভিন্নধর্মী গল্প।",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "ent-2",
    title: "নতুন অ্যালবাম প্রকাশ করলেন জনপ্রিয় ব্যান্ড",
    slug: "popular-band-new-album",
    excerpt: "স্ট্রিমিং প্ল্যাটফর্মে প্রকাশের কয়েক ঘণ্টায় শীর্ষে উঠে আসে অ্যালবামটি।",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "ent-3",
    title: "ওটিটি প্ল্যাটফর্মে আসছে বহুল প্রতীক্ষিত সিরিজ",
    slug: "ott-anticipated-series-release",
    excerpt: "প্রথম সিজনের সাফল্যের পর দ্বিতীয় সিজন নিয়ে দর্শকদের আগ্রহ তুঙ্গে।",
    category: findCategory("entertainment"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "ent-4",
    title: "জাতীয় চলচ্চিত্র পুরস্কারের মনোনয়ন তালিকা প্রকাশ",
    slug: "national-film-award-nominations",
    excerpt: "সেরা চলচ্চিত্র বিভাগে লড়াই হবে পাঁচটি প্রশংসিত কাজের মধ্যে।",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "ent-5",
    title: "কনসার্ট ট্যুর ঘোষণা করলেন জনপ্রিয় কণ্ঠশিল্পী",
    slug: "popular-singer-announces-tour",
    excerpt: "পাঁচটি শহরে টিকিট বিক্রি শুরু হবে আগামী সপ্তাহে।",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "ent-6",
    title: "টিভি নাটকে ফিরছেন জনপ্রিয় জুটি",
    slug: "popular-duo-returns-to-tv-drama",
    excerpt: "দীর্ঘ বিরতির পর একসঙ্গে কাজ করছেন তারা।",
    category: findCategory("entertainment"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "ent-7",
    title: "আন্তর্জাতিক চলচ্চিত্র উৎসবে জায়গা পেল দেশীয় সিনেমা",
    slug: "local-film-selected-international-festival",
    excerpt: "প্রধান বিভাগে প্রদর্শিত হবে ছবিটি, জানালেন পরিচালক।",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "১৭ ঘণ্টা আগে",
    imageTone: "navy",
  },
];

export const specialReportArticles: Article[] = [
  {
    id: "sr-1",
    title: "অনুসন্ধান: সরকারি প্রকল্পে ব্যয় বৃদ্ধির নেপথ্যে যা ঘটছে",
    slug: "investigation-project-cost-overrun",
    excerpt: "একাধিক প্রকল্প নথি পর্যালোচনা করে উঠে এসেছে ব্যয় বৃদ্ধির কারণ।",
    category: findCategory("special-report"),
    author: "অনুসন্ধানী প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "sr-2",
    title: "বিশেষ প্রতিবেদন: নদীভাঙনে বদলে যাচ্ছে উপকূলের মানচিত্র",
    slug: "special-report-river-erosion",
    excerpt: "গত এক দশকে কয়েকটি চর সম্পূর্ণ বিলীন হয়ে গেছে বলে জানা গেছে।",
    category: findCategory("special-report"),
    author: "বিশেষ প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "sr-3",
    title: "খাদ্যপণ্যের সরবরাহ চক্রে কোথায় দাম বাড়ছে, অনুসন্ধানে যা মিলল",
    slug: "special-report-food-supply-chain",
    excerpt: "পাইকারি থেকে খুচরা বাজার পর্যন্ত মূল্য পরিবর্তনের চিত্র তুলে ধরা হয়েছে।",
    category: findCategory("special-report"),
    author: "অর্থনৈতিক প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "sr-4",
    title: "প্রত্যন্ত অঞ্চলে শিক্ষার হার নিয়ে বিশেষ অনুসন্ধান প্রতিবেদন",
    slug: "special-report-rural-education-rate",
    excerpt: "শিক্ষক সংকট ও অবকাঠামোর অভাবকে দায়ী করছেন বিশেষজ্ঞরা।",
    category: findCategory("special-report"),
    author: "শিক্ষা প্রতিবেদক",
    publishedAt: "১৮ ঘণ্টা আগে",
    imageTone: "crimson",
  },
];

export const secretariatArticles: Article[] = [
  {
    id: "sec-1",
    title: "সচিবালয়ে নতুন প্রশাসনিক নির্দেশনা জারি",
    slug: "secretariat-new-administrative-directive",
    excerpt: "সব মন্ত্রণালয়কে দ্রুত বাস্তবায়নের নির্দেশ দেওয়া হয়েছে।",
    category: findCategory("secretariat"),
    author: "প্রশাসন প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "sec-2",
    title: "আন্তঃমন্ত্রণালয় বৈঠকে সমন্বয় বাড়ানোর সিদ্ধান্ত",
    slug: "secretariat-inter-ministry-meeting",
    excerpt: "প্রকল্প বাস্তবায়নে দেরি কমাতে নতুন কাঠামো অনুমোদিত হয়েছে।",
    category: findCategory("secretariat"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "sec-3",
    title: "সচিব পর্যায়ে রদবদল, দায়িত্ব বদলাচ্ছেন কয়েকজন কর্মকর্তা",
    slug: "secretariat-officer-reshuffle",
    excerpt: "প্রজ্ঞাপন জারি হয়েছে জনপ্রশাসন মন্ত্রণালয় থেকে।",
    category: findCategory("secretariat"),
    author: "প্রশাসন প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "sec-4",
    title: "ই-নথি ব্যবস্থাপনা সম্প্রসারণে সচিবালয়ের নতুন উদ্যোগ",
    slug: "secretariat-e-file-initiative",
    excerpt: "সব দপ্তরে ডিজিটাল ফাইল ব্যবস্থাপনা বাধ্যতামূলক করা হচ্ছে।",
    category: findCategory("secretariat"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৭ ঘণ্টা আগে",
    imageTone: "crimson",
  },
];

export const nationwideArticles: Article[] = [
  {
    id: "nw-1",
    title: "রাজশাহীতে আমের বাম্পার ফলন, দাম নিয়ে চাষিদের স্বস্তি",
    slug: "rajshahi-mango-bumper-harvest",
    excerpt: "গত বছরের তুলনায় এবার ফলন প্রায় ২০ শতাংশ বেশি হয়েছে।",
    category: findCategory("nationwide"),
    author: "জেলা প্রতিনিধি",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "nw-2",
    title: "সিলেটে পাথর কোয়ারি নিয়ে স্থানীয়দের মধ্যে উদ্বেগ",
    slug: "sylhet-quarry-local-concerns",
    excerpt: "পরিবেশ ছাড়পত্র নিয়ে প্রশ্ন তুলেছেন এলাকাবাসী।",
    category: findCategory("nationwide"),
    author: "জেলা প্রতিনিধি",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nw-3",
    title: "খুলনায় নতুন শিল্প এলাকা স্থাপনের উদ্যোগ",
    slug: "khulna-new-industrial-zone",
    excerpt: "কয়েক হাজার কর্মসংস্থান তৈরি হবে বলে আশা করছে স্থানীয় প্রশাসন।",
    category: findCategory("nationwide"),
    author: "জেলা প্রতিনিধি",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "navy",
  },
];

export const jobsArticles: Article[] = [
  {
    id: "job-1",
    title: "সরকারি ব্যাংকে ৮০০ পদে নিয়োগ বিজ্ঞপ্তি প্রকাশ",
    slug: "government-bank-recruitment-notice",
    excerpt: "আবেদনের শেষ তারিখ আগামী মাসের ১৫ তারিখ।",
    category: findCategory("jobs"),
    author: "চাকরি ডেস্ক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "job-2",
    title: "প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার ফল প্রকাশ",
    slug: "primary-teacher-exam-result",
    excerpt: "ফল দেখা যাবে সংশ্লিষ্ট ওয়েবসাইটে রোল নম্বর দিয়ে।",
    category: findCategory("jobs"),
    author: "চাকরি ডেস্ক",
    publishedAt: "৭ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "job-3",
    title: "বেসরকারি প্রতিষ্ঠানে ফ্রেশারদের জন্য বড় নিয়োগ উদ্যোগ",
    slug: "private-sector-fresher-hiring-drive",
    excerpt: "প্রযুক্তি ও ব্যাংকিং খাতে সবচেয়ে বেশি পদ খালি রয়েছে।",
    category: findCategory("jobs"),
    author: "চাকরি ডেস্ক",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const topTenArticles: Article[] = [
  {
    id: "top-1",
    title: "টপ টেন: এই সপ্তাহের সবচেয়ে আলোচিত ১০ ঘটনা",
    slug: "top-ten-most-discussed-this-week",
    excerpt: "রাজনীতি থেকে খেলা — সপ্তাহজুড়ে যা নিয়ে সবচেয়ে বেশি আলোচনা হয়েছে।",
    category: findCategory("top-ten"),
    author: "নিউজরুম ডেস্ক",
    publishedAt: "২ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "top-2",
    title: "টপ টেন: বছরের সেরা ১০ প্রযুক্তি পণ্য",
    slug: "top-ten-tech-products-of-the-year",
    excerpt: "দাম ও পারফরম্যান্সের ভিত্তিতে তৈরি তালিকা।",
    category: findCategory("top-ten"),
    author: "নিউজরুম ডেস্ক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "navy",
  },
];

export const technologyArticles: Article[] = [
  {
    id: "tech-1",
    title: "দেশীয় স্টার্টআপের তৈরি অ্যাপ ছড়িয়ে পড়ছে দক্ষিণ এশিয়ায়",
    slug: "local-startup-app-expands-south-asia",
    excerpt: "ছয় মাসে ব্যবহারকারী বেড়েছে তিন গুণেরও বেশি।",
    category: findCategory("technology"),
    author: "প্রযুক্তি প্রতিবেদক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "tech-2",
    title: "৫জি নেটওয়ার্ক সম্প্রসারণে নতুন উদ্যোগ নিল টেলিকম নিয়ন্ত্রক",
    slug: "5g-network-expansion-initiative",
    excerpt: "প্রথম পর্যায়ে বিভাগীয় শহরগুলোকে অন্তর্ভুক্ত করা হচ্ছে।",
    category: findCategory("technology"),
    author: "প্রযুক্তি প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "tech-3",
    title: "কৃত্রিম বুদ্ধিমত্তা ব্যবহারে সতর্কতামূলক নীতিমালা প্রকাশ",
    slug: "ai-usage-policy-guidelines",
    excerpt: "সরকারি-বেসরকারি প্রতিষ্ঠানের জন্য নির্দেশিকা জারি করা হয়েছে।",
    category: findCategory("technology"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
];

export const opinionArticles: Article[] = [
  {
    id: "op-1",
    title: "মতামত: শহরের যানজট সমস্যার দীর্ঘমেয়াদি সমাধান কোন পথে",
    slug: "opinion-traffic-congestion-solution",
    excerpt: "অবকাঠামোর পাশাপাশি নীতিগত সংস্কারের প্রয়োজনীয়তা তুলে ধরেছেন লেখক।",
    category: findCategory("opinion"),
    author: "ড. রফিকুল আলম",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "op-2",
    title: "উপ-সম্পাদকীয়: শিক্ষাব্যবস্থায় প্রযুক্তির যথাযথ ব্যবহার",
    slug: "opinion-technology-in-education",
    excerpt: "শ্রেণিকক্ষে ডিজিটাল টুল ব্যবহারের সুফল ও ঝুঁকি নিয়ে আলোচনা।",
    category: findCategory("opinion"),
    author: "নাসরিন সুলতানা",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "op-3",
    title: "মতামত: জলবায়ু ঝুঁকি মোকাবিলায় স্থানীয় উদ্যোগের গুরুত্ব",
    slug: "opinion-local-climate-resilience",
    excerpt: "কেন্দ্রীয় পরিকল্পনার পাশাপাশি কমিউনিটি-ভিত্তিক পদক্ষেপের পক্ষে যুক্তি।",
    category: findCategory("opinion"),
    author: "ইঞ্জি. তানভীর হাসান",
    publishedAt: "১৬ ঘণ্টা আগে",
    imageTone: "amber",
  },
];

export const religionArticles: Article[] = [
  {
    id: "rel-1",
    title: "পবিত্র রমজান উপলক্ষে ইফতার বিতরণ কর্মসূচি শুরু",
    slug: "ramadan-iftar-distribution-program",
    excerpt: "বিভিন্ন এলাকায় সামাজিক সংগঠনগুলো এ কর্মসূচিতে অংশ নিচ্ছে।",
    category: findCategory("religion"),
    author: "ধর্ম প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "rel-2",
    title: "হজ প্যাকেজের নিবন্ধন শুরু, সময়সীমা ঘোষণা",
    slug: "hajj-package-registration-begins",
    excerpt: "ধর্ম মন্ত্রণালয় জানিয়েছে এবার প্যাকেজ মূল্যে সামান্য পরিবর্তন হয়েছে।",
    category: findCategory("religion"),
    author: "ধর্ম প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "rel-3",
    title: "ধর্মীয় সম্প্রীতি বজায় রাখতে জেলা প্রশাসনের বিশেষ সভা",
    slug: "interfaith-harmony-district-meeting",
    excerpt: "স্থানীয় ধর্মীয় নেতাদের নিয়ে সচেতনতামূলক আলোচনা অনুষ্ঠিত হয়েছে।",
    category: findCategory("religion"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const crimeArticles: Article[] = [
  {
    id: "crime-1",
    title: "মাদক চোরাচালান চক্রের পাঁচ সদস্য গ্রেপ্তার",
    slug: "drug-trafficking-ring-arrests",
    excerpt: "অভিযানে বিপুল পরিমাণ মাদকদ্রব্য জব্দ করা হয়েছে বলে জানিয়েছে পুলিশ।",
    category: findCategory("crime"),
    author: "অপরাধ প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "crime-2",
    title: "প্রতারণা মামলায় আদালতে রায় ঘোষণা আগামী সপ্তাহে",
    slug: "fraud-case-verdict-next-week",
    excerpt: "দীর্ঘ শুনানির পর মামলাটি রায়ের জন্য অপেক্ষমাণ ছিল।",
    category: findCategory("crime"),
    author: "আদালত প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "crime-3",
    title: "সাইবার প্রতারণা রোধে বিশেষ সেল গঠন করল পুলিশ সদর দপ্তর",
    slug: "cyber-fraud-prevention-cell-formed",
    excerpt: "অভিযোগ জানানোর জন্য চালু হচ্ছে হটলাইন নম্বর।",
    category: findCategory("crime"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const environmentArticles: Article[] = [
  {
    id: "env-1",
    title: "উপকূলীয় এলাকায় ম্যানগ্রোভ বনায়ন কর্মসূচি সম্প্রসারণ",
    slug: "mangrove-afforestation-program-expansion",
    excerpt: "লবণাক্ততা প্রতিরোধে নতুন করে যুক্ত হচ্ছে আরও কয়েকটি উপজেলা।",
    category: findCategory("environment"),
    author: "পরিবেশ প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "env-2",
    title: "নদী দূষণ রোধে শিল্প কারখানার বর্জ্য ব্যবস্থাপনায় কড়াকড়ি",
    slug: "river-pollution-industrial-waste-crackdown",
    excerpt: "নির্ধারিত মান না মানলে জরিমানার মুখে পড়বে প্রতিষ্ঠান।",
    category: findCategory("environment"),
    author: "পরিবেশ প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "env-3",
    title: "জলবায়ু পরিবর্তনের প্রভাবে ফসলের ধরন বদলাচ্ছেন কৃষকরা",
    slug: "climate-change-crop-pattern-shift",
    excerpt: "লবণসহিষ্ণু ও খরা-সহনশীল জাতের দিকে ঝুঁকছেন অনেকে।",
    category: findCategory("environment"),
    author: "কৃষি প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
];

export const featuresArticles: Article[] = [
  {
    id: "feat-1",
    title: "ফিচার: শহরের ছাদকৃষি যেভাবে বদলে দিচ্ছে জীবনযাত্রা",
    slug: "feature-rooftop-farming-lifestyle",
    excerpt: "সীমিত জায়গাতেও সবজি চাষ করে স্বাবলম্বী হচ্ছেন অনেকে।",
    category: findCategory("features"),
    author: "ফিচার প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "feat-2",
    title: "ফিচার: প্রবীণদের একাকীত্ব ঘোচাতে তরুণদের উদ্যোগ",
    slug: "feature-youth-initiative-elderly-loneliness",
    excerpt: "সপ্তাহান্তে নিয়মিত সময় কাটাতে যাচ্ছেন একদল স্বেচ্ছাসেবী।",
    category: findCategory("features"),
    author: "ফিচার প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "feat-3",
    title: "ফিচার: হারিয়ে যাওয়া হস্তশিল্প ফিরিয়ে আনার গল্প",
    slug: "feature-reviving-lost-handicrafts",
    excerpt: "নতুন প্রজন্মের কারিগরদের হাত ধরে ফিরছে পুরনো ঐতিহ্য।",
    category: findCategory("features"),
    author: "ফিচার প্রতিবেদক",
    publishedAt: "১৬ ঘণ্টা আগে",
    imageTone: "navy",
  },
];

export const educationArticles: Article[] = [
  {
    id: "edu-1",
    title: "উচ্চ মাধ্যমিক পরীক্ষার ফলাফল প্রকাশ আগামী সপ্তাহে",
    slug: "hsc-result-next-week",
    excerpt: "শিক্ষা বোর্ড জানিয়েছে, ফল দেখা যাবে অনলাইনে ও এসএমএসে।",
    category: findCategory("education"),
    author: "শিক্ষা প্রতিবেদক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "edu-2",
    title: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সময়সূচি ঘোষণা",
    slug: "university-admission-test-schedule",
    excerpt: "গুচ্ছ পদ্ধতিতে এবার অংশ নিচ্ছে অতিরিক্ত দুটি বিশ্ববিদ্যালয়।",
    category: findCategory("education"),
    author: "শিক্ষা প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "edu-3",
    title: "শিক্ষাক্রমে পরিবর্তন আনছে মাধ্যমিক ও উচ্চশিক্ষা বোর্ড",
    slug: "curriculum-changes-secondary-board",
    excerpt: "আগামী শিক্ষাবর্ষ থেকে নতুন পাঠ্যক্রম কার্যকর হবে।",
    category: findCategory("education"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const healthArticles: Article[] = [
  {
    id: "health-1",
    title: "ডেঙ্গু প্রতিরোধে বিশেষ কর্মসূচি নিল স্বাস্থ্য অধিদপ্তর",
    slug: "dengue-prevention-special-program",
    excerpt: "নগর এলাকায় বাড়তি নজরদারি চালানো হচ্ছে বলে জানানো হয়েছে।",
    category: findCategory("health"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "health-2",
    title: "প্রাথমিক স্বাস্থ্যকেন্দ্রে বিনামূল্যে টিকাদান কর্মসূচি শুরু",
    slug: "free-vaccination-program-launched",
    excerpt: "শিশু ও গর্ভবতী মায়েদের অগ্রাধিকার দেওয়া হচ্ছে।",
    category: findCategory("health"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "health-3",
    title: "মানসিক স্বাস্থ্য সচেতনতায় নতুন হেল্পলাইন চালু",
    slug: "mental-health-helpline-launched",
    excerpt: "সপ্তাহে সাত দিন, ২৪ ঘণ্টা সেবা পাওয়া যাবে বলে জানানো হয়েছে।",
    category: findCategory("health"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const diasporaArticles: Article[] = [
  {
    id: "dia-1",
    title: "প্রবাসী আয়ে রেকর্ড প্রবৃদ্ধি, স্বস্তিতে অর্থনীতি",
    slug: "remittance-record-growth",
    excerpt: "গত মাসের তুলনায় প্রবাসী আয় বেড়েছে উল্লেখযোগ্য হারে।",
    category: findCategory("diaspora"),
    author: "প্রবাস প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "dia-2",
    title: "মধ্যপ্রাচ্যে শ্রমবাজার সম্প্রসারণে নতুন সমঝোতা",
    slug: "middle-east-labor-market-agreement",
    excerpt: "নতুন করে কয়েক হাজার কর্মী পাঠানোর সুযোগ তৈরি হয়েছে।",
    category: findCategory("diaspora"),
    author: "প্রবাস প্রতিবেদক",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "dia-3",
    title: "প্রবাসীদের জন্য ডিজিটাল সেবা চালু করল দূতাবাস",
    slug: "embassy-digital-service-for-expats",
    excerpt: "পাসপোর্ট ও সনদ সংক্রান্ত সেবা এখন থেকে অনলাইনেই মিলবে।",
    category: findCategory("diaspora"),
    author: "প্রবাস প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "slate",
  },
];

export const videoArticles: Article[] = [
  {
    id: "vid-1",
    title: "সরাসরি: বাজেট অধিবেশনের গুরুত্বপূর্ণ মুহূর্ত",
    slug: "live-budget-session-highlights",
    excerpt: "সংসদের ভেতরের সরাসরি দৃশ্য।",
    category: findCategory("national"),
    author: "ভিডিও ডেস্ক",
    publishedAt: "১ ঘণ্টা আগে",
    imageTone: "navy",
    isVideo: true,
    videoDuration: "৪:১২",
  },
  {
    id: "vid-2",
    title: "ম্যাচ হাইলাইটস: শেষ ওভারের রোমাঞ্চ",
    slug: "match-highlights-final-over",
    excerpt: "একনজরে পুরো ম্যাচের সেরা মুহূর্তগুলো।",
    category: findCategory("sports"),
    author: "ভিডিও ডেস্ক",
    publishedAt: "২ ঘণ্টা আগে",
    imageTone: "crimson",
    isVideo: true,
    videoDuration: "৬:৪৫",
  },
  {
    id: "vid-3",
    title: "প্রতিবেদন: উপকূলীয় এলাকায় প্রস্তুতি পরিদর্শন",
    slug: "coastal-preparation-report",
    excerpt: "মাঠপর্যায়ের প্রস্তুতি নিয়ে বিস্তারিত প্রতিবেদন।",
    category: findCategory("nationwide"),
    author: "ভিডিও ডেস্ক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "slate",
    isVideo: true,
    videoDuration: "৩:৩০",
  },
  {
    id: "vid-4",
    title: "সাক্ষাৎকার: নতুন উদ্যোক্তাদের সাফল্যের গল্প",
    slug: "entrepreneurs-success-interview",
    excerpt: "তরুণ উদ্যোক্তাদের অভিজ্ঞতা নিয়ে বিশেষ আয়োজন।",
    category: findCategory("business"),
    author: "ভিডিও ডেস্ক",
    publishedAt: "৭ ঘণ্টা আগে",
    imageTone: "amber",
    isVideo: true,
    videoDuration: "৮:০৯",
  },
];

export const galleryArticles: Article[] = [
  {
    id: "gal-1",
    title: "ছবিতে: শীতের সকালে গ্রামীণ জনজীবন",
    slug: "photo-story-winter-morning",
    excerpt: "",
    category: findCategory("lifestyle"),
    author: "ফটো ডেস্ক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "amber",
    isGallery: true,
  },
  {
    id: "gal-2",
    title: "ছবিতে: বৈশাখী মেলার রঙিন মুহূর্ত",
    slug: "photo-story-boishakhi-mela",
    excerpt: "",
    category: findCategory("lifestyle"),
    author: "ফটো ডেস্ক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "crimson",
    isGallery: true,
  },
  {
    id: "gal-3",
    title: "ছবিতে: নির্মাণাধীন এক্সপ্রেসওয়ের অগ্রগতি",
    slug: "photo-story-expressway-progress",
    excerpt: "",
    category: findCategory("national"),
    author: "ফটো ডেস্ক",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "navy",
    isGallery: true,
  },
  {
    id: "gal-4",
    title: "ছবিতে: স্টেডিয়ামে সমর্থকদের উচ্ছ্বাস",
    slug: "photo-story-stadium-fans",
    excerpt: "",
    category: findCategory("sports"),
    author: "ফটো ডেস্ক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "slate",
    isGallery: true,
  },
  {
    id: "gal-5",
    title: "ছবিতে: ঈদ জামাতে মুসল্লিদের ঢল",
    slug: "photo-story-eid-jamaat",
    excerpt: "",
    category: findCategory("religion"),
    author: "ফটো ডেস্ক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "crimson",
    isGallery: true,
  },
  {
    id: "gal-6",
    title: "ছবিতে: হাওরে বর্ষার রূপ",
    slug: "photo-story-haor-monsoon",
    excerpt: "",
    category: findCategory("environment"),
    author: "ফটো ডেস্ক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "navy",
    isGallery: true,
  },
];

export const trendingArticles: Article[] = [
  { ...politicsArticles[0], viewCount: 18400 },
  { ...sportsArticles[0], viewCount: 15200 },
  { ...heroArticle, viewCount: 12800 },
  { ...entertainmentArticles[0], viewCount: 9600 },
  { ...nationalArticles[1], viewCount: 8100 },
];

export const latestReadArticles: Article[] = [
  jobsArticles[0],
  nationalArticles[0],
  specialReportArticles[0],
  sportsArticles[0],
  entertainmentArticles[0],
  healthArticles[0],
];

export const allArticles: Article[] = [
  heroArticle,
  ...nationalArticles,
  ...politicsArticles,
  ...specialReportArticles,
  ...secretariatArticles,
  ...nationwideArticles,
  ...jobsArticles,
  ...topTenArticles,
  ...sportsArticles,
  ...entertainmentArticles,
  ...technologyArticles,
  ...opinionArticles,
  ...religionArticles,
  ...crimeArticles,
  ...environmentArticles,
  ...featuresArticles,
  ...educationArticles,
  ...healthArticles,
  ...diasporaArticles,
  ...videoArticles,
  ...galleryArticles,
];

export function getArticlesByCategory(slug: string): Article[] {
  if (slug === "video") {
    return allArticles.filter((article) => article.isVideo);
  }
  if (slug === "gallery") {
    return allArticles.filter((article) => article.isGallery);
  }
  return allArticles.filter((article) => article.category.slug === slug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find((article) => article.slug === slug);
}

export function searchArticles(query: string): Article[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return allArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(normalized) ||
      article.excerpt.toLowerCase().includes(normalized) ||
      article.category.name.toLowerCase().includes(normalized),
  );
}

const BENGALI_TO_ARABIC_DIGIT: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function parseHoursAgo(publishedAt: string): number {
  const arabic = publishedAt.replace(
    /[০-৯]/g,
    (digit) => BENGALI_TO_ARABIC_DIGIT[digit],
  );
  const match = arabic.match(/(\d+)/);
  return match ? Number(match[1]) : Infinity;
}

export function getLatestHeadlines(count = 10): Article[] {
  return [...allArticles]
    .filter((article) => !article.isGallery)
    .sort((a, b) => parseHoursAgo(a.publishedAt) - parseHoursAgo(b.publishedAt))
    .slice(0, count);
}

const GENERIC_BODY_PARAGRAPHS = [
  "ঘটনার সাথে সংশ্লিষ্ট কর্তৃপক্ষ বিষয়টি খতিয়ে দেখছে বলে জানা গেছে। প্রাথমিক পর্যায়ে সংগৃহীত তথ্য অনুযায়ী পরিস্থিতি পর্যবেক্ষণে রাখা হচ্ছে।",
  "সংশ্লিষ্টরা বলছেন, আগামী কয়েক দিনের মধ্যে এ বিষয়ে আরও বিস্তারিত তথ্য জানানো হতে পারে। প্রয়োজনীয় পদক্ষেপ নেওয়ার আশ্বাস দিয়েছেন দায়িত্বশীলরা।",
  "স্থানীয় সূত্র জানিয়েছে, বিষয়টি নিয়ে সাধারণ মানুষের মধ্যে আগ্রহ তৈরি হয়েছে। পরবর্তী অগ্রগতি এলে তা যথাসময়ে জানানো হবে।",
];

export function getArticleBody(article: Article): string[] {
  return [article.excerpt || article.title, ...GENERIC_BODY_PARAGRAPHS];
}

export function getRelatedArticles(article: Article, count = 4): Article[] {
  return allArticles
    .filter(
      (a) => a.id !== article.id && a.category.slug === article.category.slug,
    )
    .slice(0, count);
}

export const ARTICLES_PER_PAGE = 6;

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = ARTICLES_PER_PAGE,
): { items: T[]; totalPages: number; currentPage: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    currentPage,
  };
}
