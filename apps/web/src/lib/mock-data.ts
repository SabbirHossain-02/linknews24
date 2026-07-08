import type { Article, Category } from "@/types/content";
import type { Locale } from "@/lib/i18n";

export const categories: Category[] = [
  { id: "national", name: "জাতীয়", nameEn: "National", slug: "national" },
  { id: "politics", name: "রাজনীতি", nameEn: "Politics", slug: "politics" },
  {
    id: "special-report",
    name: "বিশেষ প্রতিবেদন",
    nameEn: "Special Report",
    slug: "special-report",
  },
  { id: "secretariat", name: "সচিবালয়", nameEn: "Secretariat", slug: "secretariat" },
  { id: "nationwide", name: "দেশজুড়ে", nameEn: "Nationwide", slug: "nationwide" },
  { id: "business", name: "অর্থনীতি", nameEn: "Business", slug: "business" },
  { id: "world", name: "আন্তর্জাতিক", nameEn: "World", slug: "world" },
  { id: "sports", name: "খেলাধুলা", nameEn: "Sports", slug: "sports" },
  { id: "jobs", name: "চাকরি", nameEn: "Jobs", slug: "jobs" },
  { id: "top-ten", name: "টপ টেন", nameEn: "Top Ten", slug: "top-ten" },
  {
    id: "entertainment",
    name: "বিনোদন",
    nameEn: "Entertainment",
    slug: "entertainment",
  },
  { id: "features", name: "ফিচার", nameEn: "Features", slug: "features" },
  { id: "education", name: "শিক্ষা", nameEn: "Education", slug: "education" },
  { id: "health", name: "স্বাস্থ্য", nameEn: "Health", slug: "health" },
  { id: "diaspora", name: "প্রবাস", nameEn: "Diaspora", slug: "diaspora" },
  { id: "lifestyle", name: "লাইফস্টাইল", nameEn: "Lifestyle", slug: "lifestyle" },
  { id: "technology", name: "প্রযুক্তি", nameEn: "Technology", slug: "technology" },
  { id: "opinion", name: "মতামত", nameEn: "Opinion", slug: "opinion" },
  { id: "religion", name: "ধর্ম", nameEn: "Religion", slug: "religion" },
  { id: "crime", name: "আইন-আদালত", nameEn: "Law & Crime", slug: "crime" },
  {
    id: "environment",
    name: "পরিবেশ",
    nameEn: "Environment",
    slug: "environment",
  },
  { id: "video", name: "ভিডিও", nameEn: "Video", slug: "video" },
  {
    id: "gallery",
    name: "ফটো গ্যালারি",
    nameEn: "Photo Gallery",
    slug: "gallery",
  },
];

const findCategory = (slug: string): Category =>
  categories.find((c) => c.slug === slug)!;

export interface NavItem {
  label: string;
  labelEn: string;
  href?: string;
  children?: Category[];
}

export const navItems: NavItem[] = [
  {
    label: "বাংলাদেশ",
    labelEn: "Bangladesh",
    children: [
      findCategory("national"),
      findCategory("politics"),
      findCategory("special-report"),
      findCategory("secretariat"),
    ],
  },
  { label: "দেশজুড়ে", labelEn: "Nationwide", href: "/nationwide" },
  { label: "অর্থনীতি", labelEn: "Business", href: "/business" },
  { label: "আন্তর্জাতিক", labelEn: "World", href: "/world" },
  { label: "খেলাধুলা", labelEn: "Sports", href: "/sports" },
  { label: "চাকরি", labelEn: "Jobs", href: "/jobs" },
  { label: "টপ টেন", labelEn: "Top Ten", href: "/top-ten" },
  { label: "বিনোদন", labelEn: "Entertainment", href: "/entertainment" },
  { label: "প্রযুক্তি", labelEn: "Technology", href: "/technology" },
  { label: "মতামত", labelEn: "Opinion", href: "/opinion" },
  { label: "ধর্ম", labelEn: "Religion", href: "/religion" },
  { label: "আইন-আদালত", labelEn: "Law & Crime", href: "/crime" },
  { label: "পরিবেশ", labelEn: "Environment", href: "/environment" },
  { label: "ফিচার", labelEn: "Features", href: "/features" },
  {
    label: "অন্যান্য",
    labelEn: "Others",
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

export const breakingNewsItemsEn: string[] = [
  "Authorities inaugurate new metro rail line in Dhaka",
  "Parliament begins debate on the national budget",
  "Cyclone warning issued for coastal areas, thousands evacuated",
];

export const heroArticle: Article = {
  id: "hero-1",
  title: "রাজধানীতে নতুন এক্সপ্রেসওয়ে প্রকল্পের কাজ শুরু, যানজট কমার আশা",
  titleEn: "Work begins on new capital expressway project, easing traffic hopes",
  slug: "capital-expressway-project-begins",
  excerpt:
    "নগর পরিকল্পনাবিদদের মতে, প্রকল্পটি সম্পন্ন হলে রাজধানীর পূর্ব-পশ্চিম সংযোগে যাতায়াতের সময় উল্লেখযোগ্যভাবে কমে আসবে।",
  excerptEn:
    "Urban planners say the project, once complete, will significantly cut travel time on the capital's east-west corridor.",
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
    titleEn: "Flood situation improves, affected families return home",
    slug: "flood-situation-improves",
    excerpt: "ত্রাণ কার্যক্রম অব্যাহত রয়েছে জেলা প্রশাসনের তত্ত্বাবধানে।",
    excerptEn: "Relief operations continue under district administration oversight.",
    category: findCategory("national"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nat-2",
    title: "সরকারি হাসপাতালে বিনামূল্যে স্বাস্থ্যসেবা কর্মসূচি সম্প্রসারণ",
    titleEn: "Free healthcare program expanded at government hospitals",
    slug: "free-healthcare-program-expansion",
    excerpt: "প্রান্তিক জনগোষ্ঠীর জন্য নতুন সুবিধা যুক্ত হয়েছে কর্মসূচিতে।",
    excerptEn: "New benefits have been added to the program for marginalized communities.",
    category: findCategory("national"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "nat-3",
    title: "গ্রামীণ সড়ক উন্নয়ন প্রকল্পে বরাদ্দ বাড়াল পরিকল্পনা মন্ত্রণালয়",
    titleEn: "Planning ministry raises funding for rural road development project",
    slug: "rural-road-development-budget",
    excerpt: "আগামী অর্থবছরে দেশজুড়ে প্রায় দুই হাজার কিলোমিটার সড়ক সংস্কার হবে।",
    excerptEn:
      "Nearly two thousand kilometers of roads nationwide will be repaired in the next fiscal year.",
    category: findCategory("national"),
    author: "অর্থনৈতিক প্রতিবেদক",
    publishedAt: "৭ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "nat-4",
    title: "শীতের শুরুতেই রাজধানীতে বায়ুদূষণ বৃদ্ধি, সতর্ক থাকার পরামর্শ",
    titleEn: "Air pollution rises in capital as winter begins, caution advised",
    slug: "air-pollution-rises-in-capital",
    excerpt: "পরিবেশ অধিদপ্তর জানিয়েছে বায়ুমান সূচক ঝুঁকিপূর্ণ পর্যায়ে পৌঁছেছে।",
    excerptEn:
      "The Department of Environment says the air quality index has reached a risky level.",
    category: findCategory("national"),
    author: "পরিবেশ প্রতিবেদক",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nat-5",
    title: "রাজধানীর তিনটি ওয়ার্ডে বিশুদ্ধ পানি সরবরাহ প্রকল্প উদ্বোধন",
    titleEn: "Clean water supply project launched in three capital wards",
    slug: "clean-water-project-inaugurated",
    excerpt: "প্রায় দুই লাখ বাসিন্দা সরাসরি উপকৃত হবেন বলে জানিয়েছে সিটি কর্পোরেশন।",
    excerptEn:
      "The city corporation says nearly two hundred thousand residents will directly benefit.",
    category: findCategory("national"),
    author: "নগর প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "nat-6",
    title: "দুর্যোগ মোকাবিলায় নতুন আগাম সতর্কীকরণ ব্যবস্থা চালু",
    titleEn: "New early warning system launched for disaster response",
    slug: "new-early-warning-system-launched",
    excerpt: "উপকূলীয় ১২ জেলায় প্রথম পর্যায়ে বাস্তবায়ন হচ্ছে ব্যবস্থাটি।",
    excerptEn: "The system is being rolled out first across 12 coastal districts.",
    category: findCategory("national"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nat-7",
    title: "সরকারি চাকরিতে নতুন নিয়োগবিধি জারি",
    titleEn: "New recruitment rules issued for government jobs",
    slug: "new-recruitment-rules-issued",
    excerpt: "স্বচ্ছতা বাড়াতে ডিজিটাল যাচাই প্রক্রিয়া বাধ্যতামূলক করা হয়েছে।",
    excerptEn: "A digital verification process has been made mandatory to improve transparency.",
    category: findCategory("national"),
    author: "প্রশাসন প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "nat-8",
    title: "শীতকালীন স্বাস্থ্যসতর্কতা জারি করল স্বাস্থ্য অধিদপ্তর",
    titleEn: "Health department issues winter health advisory",
    slug: "winter-health-advisory-issued",
    excerpt: "শিশু ও প্রবীণদের বাড়তি সতর্কতা নেওয়ার পরামর্শ দেওয়া হয়েছে।",
    excerptEn: "Children and the elderly are advised to take extra precautions.",
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
    titleEn: "Talks continue among parties over upcoming election",
    slug: "election-discussions-continue",
    excerpt: "নির্বাচন কমিশনের সঙ্গে বৈঠকের পর নতুন সময়সূচি প্রকাশ।",
    excerptEn: "A new schedule was released after a meeting with the Election Commission.",
    category: findCategory("politics"),
    author: "রাজনৈতিক প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "pol-2",
    title: "সংসদে পাস হলো নতুন তথ্য সুরক্ষা বিল",
    titleEn: "Parliament passes new data protection bill",
    slug: "data-protection-bill-passed",
    excerpt: "বিলটি নাগরিকদের ডিজিটাল তথ্যের সুরক্ষা নিশ্চিত করবে বলে জানানো হয়েছে।",
    excerptEn: "The bill is said to ensure the security of citizens' digital data.",
    category: findCategory("politics"),
    author: "সংসদ প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "pol-3",
    title: "স্থানীয় সরকার নির্বাচনের তফসিল ঘোষণা",
    titleEn: "Local government election schedule announced",
    slug: "local-government-election-schedule",
    excerpt: "আগামী মাসে দেশের ৬৪ জেলায় পর্যায়ক্রমে ভোটগ্রহণ অনুষ্ঠিত হবে।",
    excerptEn: "Voting will be held in phases across all 64 districts next month.",
    category: findCategory("politics"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "pol-4",
    title: "প্রধান বিরোধী দলের সংবাদ সম্মেলন আজ",
    titleEn: "Main opposition party's press conference today",
    slug: "opposition-press-conference-today",
    excerpt: "সাম্প্রতিক ইস্যু নিয়ে প্রতিক্রিয়া জানাবে দলটি বলে সূত্রে জানা গেছে।",
    excerptEn: "Sources say the party will respond to recent developments.",
    category: findCategory("politics"),
    author: "রাজনৈতিক প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "pol-5",
    title: "সংসদীয় কমিটির প্রতিবেদন জমা, সুপারিশ একাধিক সংস্কারের",
    titleEn: "Parliamentary committee submits report, recommends several reforms",
    slug: "parliamentary-committee-report-submitted",
    excerpt: "প্রশাসনিক জবাবদিহিতা বাড়াতে নতুন কাঠামোর প্রস্তাব দেওয়া হয়েছে।",
    excerptEn: "A new framework has been proposed to strengthen administrative accountability.",
    category: findCategory("politics"),
    author: "সংসদ প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "pol-6",
    title: "উপনির্বাচনে প্রার্থী তালিকা চূড়ান্ত করল প্রধান দলগুলো",
    titleEn: "Major parties finalize candidate lists for by-election",
    slug: "by-election-candidate-list-finalized",
    excerpt: "আগামী সপ্তাহে মনোনয়নপত্র জমা দেওয়ার শেষ দিন নির্ধারিত হয়েছে।",
    excerptEn: "The nomination filing deadline has been set for next week.",
    category: findCategory("politics"),
    author: "রাজনৈতিক প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "pol-7",
    title: "স্থানীয় সরকার আইনে সংশোধনী প্রস্তাব মন্ত্রিসভায়",
    titleEn: "Cabinet reviews proposed amendment to local government act",
    slug: "local-government-act-amendment-proposal",
    excerpt: "প্রস্তাবিত সংশোধনী জনপ্রতিনিধিদের ক্ষমতা পুনর্বিন্যাস করবে বলে জানা গেছে।",
    excerptEn:
      "The proposed amendment is said to restructure the powers of elected representatives.",
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
    titleEn: "Bangladesh's stunning win at the Asia Cup",
    slug: "bangladesh-asia-cup-win",
    excerpt: "শেষ ওভারের নাটকীয়তায় ৩ উইকেটের জয় তুলে নিল টাইগাররা।",
    excerptEn: "The Tigers pulled off a dramatic 3-wicket win in the final over.",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "spo-2",
    title: "ঘরোয়া ফুটবল লিগে চ্যাম্পিয়ন হলো আবাহনী",
    titleEn: "Abahani crowned champions of the domestic football league",
    slug: "abahani-wins-domestic-league",
    excerpt: "মৌসুমের শেষ ম্যাচে প্রতিদ্বন্দ্বী দলকে ২-০ গোলে হারিয়ে শিরোপা নিশ্চিত।",
    excerptEn: "They sealed the title with a 2-0 win over their rivals in the final match.",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "spo-3",
    title: "সাফ চ্যাম্পিয়নশিপের দল ঘোষণা করল ফুটবল ফেডারেশন",
    titleEn: "Football federation announces squad for SAFF Championship",
    slug: "saff-championship-squad-announced",
    excerpt: "নতুন কয়েকজন তরুণ খেলোয়াড়কে দলে জায়গা দেওয়া হয়েছে।",
    excerptEn: "Several young players have been given a place in the squad.",
    category: findCategory("sports"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "spo-4",
    title: "অনূর্ধ্ব-১৯ ক্রিকেট বিশ্বকাপে সেমিফাইনালে বাংলাদেশ",
    titleEn: "Bangladesh reach semifinal of U-19 Cricket World Cup",
    slug: "u19-world-cup-semifinal",
    excerpt: "গ্রুপ পর্বে অপরাজিত থেকে শেষ চারে জায়গা করে নিল যুব দল।",
    excerptEn:
      "The junior team went unbeaten in the group stage to reach the final four.",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "spo-5",
    title: "জাতীয় দলের নতুন প্রধান কোচ নিয়োগ দিল ক্রিকেট বোর্ড",
    titleEn: "Cricket board appoints new head coach for national team",
    slug: "new-head-coach-appointed",
    excerpt: "আসন্ন সিরিজ থেকেই দায়িত্ব নেবেন নতুন কোচ।",
    excerptEn: "The new coach will take charge starting with the upcoming series.",
    category: findCategory("sports"),
    author: "ক্রীড়া প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "spo-6",
    title: "হকি টুর্নামেন্টে রানার্সআপ বাংলাদেশ",
    titleEn: "Bangladesh finish runners-up in hockey tournament",
    slug: "hockey-tournament-runners-up",
    excerpt: "ফাইনালে টাইব্রেকারে হেরে শিরোপা হাতছাড়া করে দল।",
    excerptEn: "The team lost the title on a tie-breaker in the final.",
    category: findCategory("sports"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৬ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "spo-7",
    title: "অ্যাথলেটিক্সে জাতীয় রেকর্ড গড়লেন তরুণ দৌড়বিদ",
    titleEn: "Young sprinter sets new national record in athletics",
    slug: "national-record-in-athletics",
    excerpt: "১০০ মিটার স্প্রিন্টে ১১ বছরের পুরনো রেকর্ড ভাঙলেন তিনি।",
    excerptEn: "He broke an 11-year-old record in the 100-meter sprint.",
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
    titleEn: "Year's biggest-budget film to release on Eid",
    slug: "eid-release-biggest-budget-film",
    excerpt: "নির্মাতা জানিয়েছেন, দর্শকদের জন্য থাকছে ভিন্নধর্মী গল্প।",
    excerptEn: "The filmmaker says audiences can expect a distinctly different story.",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "ent-2",
    title: "নতুন অ্যালবাম প্রকাশ করলেন জনপ্রিয় ব্যান্ড",
    titleEn: "Popular band releases new album",
    slug: "popular-band-new-album",
    excerpt: "স্ট্রিমিং প্ল্যাটফর্মে প্রকাশের কয়েক ঘণ্টায় শীর্ষে উঠে আসে অ্যালবামটি।",
    excerptEn: "The album topped streaming charts within hours of release.",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "ent-3",
    title: "ওটিটি প্ল্যাটফর্মে আসছে বহুল প্রতীক্ষিত সিরিজ",
    titleEn: "Highly anticipated series arrives on OTT platform",
    slug: "ott-anticipated-series-release",
    excerpt: "প্রথম সিজনের সাফল্যের পর দ্বিতীয় সিজন নিয়ে দর্শকদের আগ্রহ তুঙ্গে।",
    excerptEn:
      "After the first season's success, viewer anticipation for season two is at a peak.",
    category: findCategory("entertainment"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "ent-4",
    title: "জাতীয় চলচ্চিত্র পুরস্কারের মনোনয়ন তালিকা প্রকাশ",
    titleEn: "National Film Award nominations announced",
    slug: "national-film-award-nominations",
    excerpt: "সেরা চলচ্চিত্র বিভাগে লড়াই হবে পাঁচটি প্রশংসিত কাজের মধ্যে।",
    excerptEn: "Five acclaimed films will compete in the Best Picture category.",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "ent-5",
    title: "কনসার্ট ট্যুর ঘোষণা করলেন জনপ্রিয় কণ্ঠশিল্পী",
    titleEn: "Popular singer announces concert tour",
    slug: "popular-singer-announces-tour",
    excerpt: "পাঁচটি শহরে টিকিট বিক্রি শুরু হবে আগামী সপ্তাহে।",
    excerptEn: "Ticket sales begin next week across five cities.",
    category: findCategory("entertainment"),
    author: "বিনোদন প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "ent-6",
    title: "টিভি নাটকে ফিরছেন জনপ্রিয় জুটি",
    titleEn: "Popular on-screen duo returns to TV drama",
    slug: "popular-duo-returns-to-tv-drama",
    excerpt: "দীর্ঘ বিরতির পর একসঙ্গে কাজ করছেন তারা।",
    excerptEn: "They're working together again after a long hiatus.",
    category: findCategory("entertainment"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "১৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "ent-7",
    title: "আন্তর্জাতিক চলচ্চিত্র উৎসবে জায়গা পেল দেশীয় সিনেমা",
    titleEn: "Local film selected for international film festival",
    slug: "local-film-selected-international-festival",
    excerpt: "প্রধান বিভাগে প্রদর্শিত হবে ছবিটি, জানালেন পরিচালক।",
    excerptEn: "The director says the film will screen in the main competition category.",
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
    titleEn: "Investigation: what's driving cost overruns in government projects",
    slug: "investigation-project-cost-overrun",
    excerpt: "একাধিক প্রকল্প নথি পর্যালোচনা করে উঠে এসেছে ব্যয় বৃদ্ধির কারণ।",
    excerptEn: "A review of several project documents reveals the causes behind rising costs.",
    category: findCategory("special-report"),
    author: "অনুসন্ধানী প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "sr-2",
    title: "বিশেষ প্রতিবেদন: নদীভাঙনে বদলে যাচ্ছে উপকূলের মানচিত্র",
    titleEn: "Special report: river erosion is redrawing the coastal map",
    slug: "special-report-river-erosion",
    excerpt: "গত এক দশকে কয়েকটি চর সম্পূর্ণ বিলীন হয়ে গেছে বলে জানা গেছে।",
    excerptEn: "Several river islands have completely disappeared over the past decade.",
    category: findCategory("special-report"),
    author: "বিশেষ প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "sr-3",
    title: "খাদ্যপণ্যের সরবরাহ চক্রে কোথায় দাম বাড়ছে, অনুসন্ধানে যা মিলল",
    titleEn: "Where prices rise in the food supply chain, an investigation finds",
    slug: "special-report-food-supply-chain",
    excerpt: "পাইকারি থেকে খুচরা বাজার পর্যন্ত মূল্য পরিবর্তনের চিত্র তুলে ধরা হয়েছে।",
    excerptEn: "The report traces price changes from wholesale through to retail markets.",
    category: findCategory("special-report"),
    author: "অর্থনৈতিক প্রতিবেদক",
    publishedAt: "১৪ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "sr-4",
    title: "প্রত্যন্ত অঞ্চলে শিক্ষার হার নিয়ে বিশেষ অনুসন্ধান প্রতিবেদন",
    titleEn: "Special investigation into education rates in remote areas",
    slug: "special-report-rural-education-rate",
    excerpt: "শিক্ষক সংকট ও অবকাঠামোর অভাবকে দায়ী করছেন বিশেষজ্ঞরা।",
    excerptEn: "Experts blame teacher shortages and lack of infrastructure.",
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
    titleEn: "New administrative directive issued from the secretariat",
    slug: "secretariat-new-administrative-directive",
    excerpt: "সব মন্ত্রণালয়কে দ্রুত বাস্তবায়নের নির্দেশ দেওয়া হয়েছে।",
    excerptEn: "All ministries have been instructed to implement it promptly.",
    category: findCategory("secretariat"),
    author: "প্রশাসন প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "sec-2",
    title: "আন্তঃমন্ত্রণালয় বৈঠকে সমন্বয় বাড়ানোর সিদ্ধান্ত",
    titleEn: "Inter-ministry meeting decides to boost coordination",
    slug: "secretariat-inter-ministry-meeting",
    excerpt: "প্রকল্প বাস্তবায়নে দেরি কমাতে নতুন কাঠামো অনুমোদিত হয়েছে।",
    excerptEn: "A new framework has been approved to cut delays in project implementation.",
    category: findCategory("secretariat"),
    author: "নিজস্ব প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "sec-3",
    title: "সচিব পর্যায়ে রদবদল, দায়িত্ব বদলাচ্ছেন কয়েকজন কর্মকর্তা",
    titleEn: "Reshuffle at secretary level, several officials changing posts",
    slug: "secretariat-officer-reshuffle",
    excerpt: "প্রজ্ঞাপন জারি হয়েছে জনপ্রশাসন মন্ত্রণালয় থেকে।",
    excerptEn: "The notification was issued by the Ministry of Public Administration.",
    category: findCategory("secretariat"),
    author: "প্রশাসন প্রতিবেদক",
    publishedAt: "১৩ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "sec-4",
    title: "ই-নথি ব্যবস্থাপনা সম্প্রসারণে সচিবালয়ের নতুন উদ্যোগ",
    titleEn: "Secretariat launches new push to expand e-file management",
    slug: "secretariat-e-file-initiative",
    excerpt: "সব দপ্তরে ডিজিটাল ফাইল ব্যবস্থাপনা বাধ্যতামূলক করা হচ্ছে।",
    excerptEn: "Digital file management is being made mandatory across all offices.",
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
    titleEn: "Bumper mango harvest in Rajshahi brings relief to farmers over prices",
    slug: "rajshahi-mango-bumper-harvest",
    excerpt: "গত বছরের তুলনায় এবার ফলন প্রায় ২০ শতাংশ বেশি হয়েছে।",
    excerptEn: "This year's yield is about 20 percent higher than last year's.",
    category: findCategory("nationwide"),
    author: "জেলা প্রতিনিধি",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "nw-2",
    title: "সিলেটে পাথর কোয়ারি নিয়ে স্থানীয়দের মধ্যে উদ্বেগ",
    titleEn: "Locals raise concerns over stone quarry in Sylhet",
    slug: "sylhet-quarry-local-concerns",
    excerpt: "পরিবেশ ছাড়পত্র নিয়ে প্রশ্ন তুলেছেন এলাকাবাসী।",
    excerptEn: "Residents have raised questions over its environmental clearance.",
    category: findCategory("nationwide"),
    author: "জেলা প্রতিনিধি",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "nw-3",
    title: "খুলনায় নতুন শিল্প এলাকা স্থাপনের উদ্যোগ",
    titleEn: "Initiative launched to set up new industrial zone in Khulna",
    slug: "khulna-new-industrial-zone",
    excerpt: "কয়েক হাজার কর্মসংস্থান তৈরি হবে বলে আশা করছে স্থানীয় প্রশাসন।",
    excerptEn: "Local authorities expect it to create several thousand jobs.",
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
    titleEn: "Government bank publishes recruitment notice for 800 posts",
    slug: "government-bank-recruitment-notice",
    excerpt: "আবেদনের শেষ তারিখ আগামী মাসের ১৫ তারিখ।",
    excerptEn: "The application deadline is the 15th of next month.",
    category: findCategory("jobs"),
    author: "চাকরি ডেস্ক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "job-2",
    title: "প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার ফল প্রকাশ",
    titleEn: "Primary teacher recruitment exam results published",
    slug: "primary-teacher-exam-result",
    excerpt: "ফল দেখা যাবে সংশ্লিষ্ট ওয়েবসাইটে রোল নম্বর দিয়ে।",
    excerptEn: "Results can be checked on the official website using the roll number.",
    category: findCategory("jobs"),
    author: "চাকরি ডেস্ক",
    publishedAt: "৭ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "job-3",
    title: "বেসরকারি প্রতিষ্ঠানে ফ্রেশারদের জন্য বড় নিয়োগ উদ্যোগ",
    titleEn: "Major hiring drive for freshers launched at private firms",
    slug: "private-sector-fresher-hiring-drive",
    excerpt: "প্রযুক্তি ও ব্যাংকিং খাতে সবচেয়ে বেশি পদ খালি রয়েছে।",
    excerptEn: "Technology and banking sectors have the most open positions.",
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
    titleEn: "Top Ten: the 10 most talked-about stories this week",
    slug: "top-ten-most-discussed-this-week",
    excerpt: "রাজনীতি থেকে খেলা — সপ্তাহজুড়ে যা নিয়ে সবচেয়ে বেশি আলোচনা হয়েছে।",
    excerptEn: "From politics to sports — what got everyone talking this week.",
    category: findCategory("top-ten"),
    author: "নিউজরুম ডেস্ক",
    publishedAt: "২ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "top-2",
    title: "টপ টেন: বছরের সেরা ১০ প্রযুক্তি পণ্য",
    titleEn: "Top Ten: the year's best 10 tech products",
    slug: "top-ten-tech-products-of-the-year",
    excerpt: "দাম ও পারফরম্যান্সের ভিত্তিতে তৈরি তালিকা।",
    excerptEn: "A list ranked by price and performance.",
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
    titleEn: "Local startup's app is spreading across South Asia",
    slug: "local-startup-app-expands-south-asia",
    excerpt: "ছয় মাসে ব্যবহারকারী বেড়েছে তিন গুণেরও বেশি।",
    excerptEn: "Its user base has more than tripled in six months.",
    category: findCategory("technology"),
    author: "প্রযুক্তি প্রতিবেদক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "tech-2",
    title: "৫জি নেটওয়ার্ক সম্প্রসারণে নতুন উদ্যোগ নিল টেলিকম নিয়ন্ত্রক",
    titleEn: "Telecom regulator launches new push to expand 5G network",
    slug: "5g-network-expansion-initiative",
    excerpt: "প্রথম পর্যায়ে বিভাগীয় শহরগুলোকে অন্তর্ভুক্ত করা হচ্ছে।",
    excerptEn: "Divisional cities are being covered in the first phase.",
    category: findCategory("technology"),
    author: "প্রযুক্তি প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "tech-3",
    title: "কৃত্রিম বুদ্ধিমত্তা ব্যবহারে সতর্কতামূলক নীতিমালা প্রকাশ",
    titleEn: "Cautionary guidelines published on AI use",
    slug: "ai-usage-policy-guidelines",
    excerpt: "সরকারি-বেসরকারি প্রতিষ্ঠানের জন্য নির্দেশিকা জারি করা হয়েছে।",
    excerptEn: "Guidance has been issued for both public and private organizations.",
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
    titleEn: "Opinion: what's the long-term fix for the city's traffic problem",
    slug: "opinion-traffic-congestion-solution",
    excerpt: "অবকাঠামোর পাশাপাশি নীতিগত সংস্কারের প্রয়োজনীয়তা তুলে ধরেছেন লেখক।",
    excerptEn: "The author argues for policy reform alongside infrastructure investment.",
    category: findCategory("opinion"),
    author: "ড. রফিকুল আলম",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "op-2",
    title: "উপ-সম্পাদকীয়: শিক্ষাব্যবস্থায় প্রযুক্তির যথাযথ ব্যবহার",
    titleEn: "Op-ed: using technology responsibly in education",
    slug: "opinion-technology-in-education",
    excerpt: "শ্রেণিকক্ষে ডিজিটাল টুল ব্যবহারের সুফল ও ঝুঁকি নিয়ে আলোচনা।",
    excerptEn: "A look at the benefits and risks of digital tools in the classroom.",
    category: findCategory("opinion"),
    author: "নাসরিন সুলতানা",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "op-3",
    title: "মতামত: জলবায়ু ঝুঁকি মোকাবিলায় স্থানীয় উদ্যোগের গুরুত্ব",
    titleEn: "Opinion: why local initiative matters in facing climate risk",
    slug: "opinion-local-climate-resilience",
    excerpt: "কেন্দ্রীয় পরিকল্পনার পাশাপাশি কমিউনিটি-ভিত্তিক পদক্ষেপের পক্ষে যুক্তি।",
    excerptEn: "A case for community-based action alongside central planning.",
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
    titleEn: "Iftar distribution program begins for the holy month of Ramadan",
    slug: "ramadan-iftar-distribution-program",
    excerpt: "বিভিন্ন এলাকায় সামাজিক সংগঠনগুলো এ কর্মসূচিতে অংশ নিচ্ছে।",
    excerptEn: "Community organizations across several areas are taking part.",
    category: findCategory("religion"),
    author: "ধর্ম প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "rel-2",
    title: "হজ প্যাকেজের নিবন্ধন শুরু, সময়সীমা ঘোষণা",
    titleEn: "Hajj package registration begins, deadline announced",
    slug: "hajj-package-registration-begins",
    excerpt: "ধর্ম মন্ত্রণালয় জানিয়েছে এবার প্যাকেজ মূল্যে সামান্য পরিবর্তন হয়েছে।",
    excerptEn: "The religious affairs ministry says package prices have changed slightly this year.",
    category: findCategory("religion"),
    author: "ধর্ম প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "rel-3",
    title: "ধর্মীয় সম্প্রীতি বজায় রাখতে জেলা প্রশাসনের বিশেষ সভা",
    titleEn: "District administration holds special meeting to preserve religious harmony",
    slug: "interfaith-harmony-district-meeting",
    excerpt: "স্থানীয় ধর্মীয় নেতাদের নিয়ে সচেতনতামূলক আলোচনা অনুষ্ঠিত হয়েছে।",
    excerptEn: "An awareness discussion was held with local religious leaders.",
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
    titleEn: "Five members of drug trafficking ring arrested",
    slug: "drug-trafficking-ring-arrests",
    excerpt: "অভিযানে বিপুল পরিমাণ মাদকদ্রব্য জব্দ করা হয়েছে বলে জানিয়েছে পুলিশ।",
    excerptEn: "Police say a large quantity of drugs was seized in the operation.",
    category: findCategory("crime"),
    author: "অপরাধ প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "crime-2",
    title: "প্রতারণা মামলায় আদালতে রায় ঘোষণা আগামী সপ্তাহে",
    titleEn: "Court to announce verdict in fraud case next week",
    slug: "fraud-case-verdict-next-week",
    excerpt: "দীর্ঘ শুনানির পর মামলাটি রায়ের জন্য অপেক্ষমাণ ছিল।",
    excerptEn: "The case has been awaiting verdict after lengthy hearings.",
    category: findCategory("crime"),
    author: "আদালত প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "crime-3",
    title: "সাইবার প্রতারণা রোধে বিশেষ সেল গঠন করল পুলিশ সদর দপ্তর",
    titleEn: "Police headquarters forms special cell to prevent cyber fraud",
    slug: "cyber-fraud-prevention-cell-formed",
    excerpt: "অভিযোগ জানানোর জন্য চালু হচ্ছে হটলাইন নম্বর।",
    excerptEn: "A hotline number is being launched for filing complaints.",
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
    titleEn: "Mangrove afforestation program expanded in coastal areas",
    slug: "mangrove-afforestation-program-expansion",
    excerpt: "লবণাক্ততা প্রতিরোধে নতুন করে যুক্ত হচ্ছে আরও কয়েকটি উপজেলা।",
    excerptEn: "Several more upazilas are being added to combat salinity.",
    category: findCategory("environment"),
    author: "পরিবেশ প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "env-2",
    title: "নদী দূষণ রোধে শিল্প কারখানার বর্জ্য ব্যবস্থাপনায় কড়াকড়ি",
    titleEn: "Crackdown on industrial waste management to curb river pollution",
    slug: "river-pollution-industrial-waste-crackdown",
    excerpt: "নির্ধারিত মান না মানলে জরিমানার মুখে পড়বে প্রতিষ্ঠান।",
    excerptEn: "Firms that fail to meet the required standards will face fines.",
    category: findCategory("environment"),
    author: "পরিবেশ প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "env-3",
    title: "জলবায়ু পরিবর্তনের প্রভাবে ফসলের ধরন বদলাচ্ছেন কৃষকরা",
    titleEn: "Farmers shift crop varieties as climate change takes hold",
    slug: "climate-change-crop-pattern-shift",
    excerpt: "লবণসহিষ্ণু ও খরা-সহনশীল জাতের দিকে ঝুঁকছেন অনেকে।",
    excerptEn: "Many are turning to salt- and drought-tolerant varieties.",
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
    titleEn: "Feature: how rooftop farming is changing city life",
    slug: "feature-rooftop-farming-lifestyle",
    excerpt: "সীমিত জায়গাতেও সবজি চাষ করে স্বাবলম্বী হচ্ছেন অনেকে।",
    excerptEn: "Many are becoming self-sufficient growing vegetables even in limited space.",
    category: findCategory("features"),
    author: "ফিচার প্রতিবেদক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "feat-2",
    title: "ফিচার: প্রবীণদের একাকীত্ব ঘোচাতে তরুণদের উদ্যোগ",
    titleEn: "Feature: young volunteers work to ease loneliness among the elderly",
    slug: "feature-youth-initiative-elderly-loneliness",
    excerpt: "সপ্তাহান্তে নিয়মিত সময় কাটাতে যাচ্ছেন একদল স্বেচ্ছাসেবী।",
    excerptEn: "A group of volunteers regularly spends weekends with them.",
    category: findCategory("features"),
    author: "ফিচার প্রতিবেদক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "slate",
  },
  {
    id: "feat-3",
    title: "ফিচার: হারিয়ে যাওয়া হস্তশিল্প ফিরিয়ে আনার গল্প",
    titleEn: "Feature: the story of reviving a lost handicraft",
    slug: "feature-reviving-lost-handicrafts",
    excerpt: "নতুন প্রজন্মের কারিগরদের হাত ধরে ফিরছে পুরনো ঐতিহ্য।",
    excerptEn: "A new generation of artisans is bringing an old tradition back to life.",
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
    titleEn: "HSC exam results to be published next week",
    slug: "hsc-result-next-week",
    excerpt: "শিক্ষা বোর্ড জানিয়েছে, ফল দেখা যাবে অনলাইনে ও এসএমএসে।",
    excerptEn: "The education board says results can be checked online and via SMS.",
    category: findCategory("education"),
    author: "শিক্ষা প্রতিবেদক",
    publishedAt: "৪ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "edu-2",
    title: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সময়সূচি ঘোষণা",
    titleEn: "University admission test schedule announced",
    slug: "university-admission-test-schedule",
    excerpt: "গুচ্ছ পদ্ধতিতে এবার অংশ নিচ্ছে অতিরিক্ত দুটি বিশ্ববিদ্যালয়।",
    excerptEn: "Two additional universities are joining the cluster system this year.",
    category: findCategory("education"),
    author: "শিক্ষা প্রতিবেদক",
    publishedAt: "৯ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "edu-3",
    title: "শিক্ষাক্রমে পরিবর্তন আনছে মাধ্যমিক ও উচ্চশিক্ষা বোর্ড",
    titleEn: "Secondary and higher education board revises curriculum",
    slug: "curriculum-changes-secondary-board",
    excerpt: "আগামী শিক্ষাবর্ষ থেকে নতুন পাঠ্যক্রম কার্যকর হবে।",
    excerptEn: "The new curriculum takes effect from next academic year.",
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
    titleEn: "Health department launches special dengue prevention program",
    slug: "dengue-prevention-special-program",
    excerpt: "নগর এলাকায় বাড়তি নজরদারি চালানো হচ্ছে বলে জানানো হয়েছে।",
    excerptEn: "Extra surveillance is being carried out in urban areas.",
    category: findCategory("health"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "crimson",
  },
  {
    id: "health-2",
    title: "প্রাথমিক স্বাস্থ্যকেন্দ্রে বিনামূল্যে টিকাদান কর্মসূচি শুরু",
    titleEn: "Free vaccination program begins at primary health centers",
    slug: "free-vaccination-program-launched",
    excerpt: "শিশু ও গর্ভবতী মায়েদের অগ্রাধিকার দেওয়া হচ্ছে।",
    excerptEn: "Children and expectant mothers are being given priority.",
    category: findCategory("health"),
    author: "স্বাস্থ্য প্রতিবেদক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "health-3",
    title: "মানসিক স্বাস্থ্য সচেতনতায় নতুন হেল্পলাইন চালু",
    titleEn: "New helpline launched for mental health awareness",
    slug: "mental-health-helpline-launched",
    excerpt: "সপ্তাহে সাত দিন, ২৪ ঘণ্টা সেবা পাওয়া যাবে বলে জানানো হয়েছে।",
    excerptEn: "The service will be available 24 hours a day, seven days a week.",
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
    titleEn: "Record growth in remittances brings relief to the economy",
    slug: "remittance-record-growth",
    excerpt: "গত মাসের তুলনায় প্রবাসী আয় বেড়েছে উল্লেখযোগ্য হারে।",
    excerptEn: "Remittances rose significantly compared to last month.",
    category: findCategory("diaspora"),
    author: "প্রবাস প্রতিবেদক",
    publishedAt: "৬ ঘণ্টা আগে",
    imageTone: "amber",
  },
  {
    id: "dia-2",
    title: "মধ্যপ্রাচ্যে শ্রমবাজার সম্প্রসারণে নতুন সমঝোতা",
    titleEn: "New agreement to expand labor market in the Middle East",
    slug: "middle-east-labor-market-agreement",
    excerpt: "নতুন করে কয়েক হাজার কর্মী পাঠানোর সুযোগ তৈরি হয়েছে।",
    excerptEn: "The opportunity has opened up to send several thousand more workers.",
    category: findCategory("diaspora"),
    author: "প্রবাস প্রতিবেদক",
    publishedAt: "১১ ঘণ্টা আগে",
    imageTone: "navy",
  },
  {
    id: "dia-3",
    title: "প্রবাসীদের জন্য ডিজিটাল সেবা চালু করল দূতাবাস",
    titleEn: "Embassy launches digital services for expatriates",
    slug: "embassy-digital-service-for-expats",
    excerpt: "পাসপোর্ট ও সনদ সংক্রান্ত সেবা এখন থেকে অনলাইনেই মিলবে।",
    excerptEn: "Passport and certificate services will now be available online.",
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
    titleEn: "Live: key moments from the budget session",
    slug: "live-budget-session-highlights",
    excerpt: "সংসদের ভেতরের সরাসরি দৃশ্য।",
    excerptEn: "Live footage from inside parliament.",
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
    titleEn: "Match highlights: thrills of the final over",
    slug: "match-highlights-final-over",
    excerpt: "একনজরে পুরো ম্যাচের সেরা মুহূর্তগুলো।",
    excerptEn: "The best moments of the match, at a glance.",
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
    titleEn: "Report: inspecting readiness in coastal areas",
    slug: "coastal-preparation-report",
    excerpt: "মাঠপর্যায়ের প্রস্তুতি নিয়ে বিস্তারিত প্রতিবেদন।",
    excerptEn: "A detailed report on preparations on the ground.",
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
    titleEn: "Interview: the success stories of new entrepreneurs",
    slug: "entrepreneurs-success-interview",
    excerpt: "তরুণ উদ্যোক্তাদের অভিজ্ঞতা নিয়ে বিশেষ আয়োজন।",
    excerptEn: "A special feature on the experiences of young entrepreneurs.",
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
    titleEn: "In pictures: rural life on a winter morning",
    slug: "photo-story-winter-morning",
    excerpt: "",
    excerptEn: "",
    category: findCategory("lifestyle"),
    author: "ফটো ডেস্ক",
    publishedAt: "৩ ঘণ্টা আগে",
    imageTone: "amber",
    isGallery: true,
  },
  {
    id: "gal-2",
    title: "ছবিতে: বৈশাখী মেলার রঙিন মুহূর্ত",
    titleEn: "In pictures: colorful moments from the Boishakhi fair",
    slug: "photo-story-boishakhi-mela",
    excerpt: "",
    excerptEn: "",
    category: findCategory("lifestyle"),
    author: "ফটো ডেস্ক",
    publishedAt: "৫ ঘণ্টা আগে",
    imageTone: "crimson",
    isGallery: true,
  },
  {
    id: "gal-3",
    title: "ছবিতে: নির্মাণাধীন এক্সপ্রেসওয়ের অগ্রগতি",
    titleEn: "In pictures: progress on the expressway under construction",
    slug: "photo-story-expressway-progress",
    excerpt: "",
    excerptEn: "",
    category: findCategory("national"),
    author: "ফটো ডেস্ক",
    publishedAt: "৮ ঘণ্টা আগে",
    imageTone: "navy",
    isGallery: true,
  },
  {
    id: "gal-4",
    title: "ছবিতে: স্টেডিয়ামে সমর্থকদের উচ্ছ্বাস",
    titleEn: "In pictures: fans' excitement at the stadium",
    slug: "photo-story-stadium-fans",
    excerpt: "",
    excerptEn: "",
    category: findCategory("sports"),
    author: "ফটো ডেস্ক",
    publishedAt: "১০ ঘণ্টা আগে",
    imageTone: "slate",
    isGallery: true,
  },
  {
    id: "gal-5",
    title: "ছবিতে: ঈদ জামাতে মুসল্লিদের ঢল",
    titleEn: "In pictures: worshippers gather for Eid prayers",
    slug: "photo-story-eid-jamaat",
    excerpt: "",
    excerptEn: "",
    category: findCategory("religion"),
    author: "ফটো ডেস্ক",
    publishedAt: "১২ ঘণ্টা আগে",
    imageTone: "crimson",
    isGallery: true,
  },
  {
    id: "gal-6",
    title: "ছবিতে: হাওরে বর্ষার রূপ",
    titleEn: "In pictures: the haor wetlands in monsoon",
    slug: "photo-story-haor-monsoon",
    excerpt: "",
    excerptEn: "",
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

const GENERIC_BODY_PARAGRAPHS: Record<Locale, string[]> = {
  bn: [
    "ঘটনার সাথে সংশ্লিষ্ট কর্তৃপক্ষ বিষয়টি খতিয়ে দেখছে বলে জানা গেছে। প্রাথমিক পর্যায়ে সংগৃহীত তথ্য অনুযায়ী পরিস্থিতি পর্যবেক্ষণে রাখা হচ্ছে।",
    "সংশ্লিষ্টরা বলছেন, আগামী কয়েক দিনের মধ্যে এ বিষয়ে আরও বিস্তারিত তথ্য জানানো হতে পারে। প্রয়োজনীয় পদক্ষেপ নেওয়ার আশ্বাস দিয়েছেন দায়িত্বশীলরা।",
    "স্থানীয় সূত্র জানিয়েছে, বিষয়টি নিয়ে সাধারণ মানুষের মধ্যে আগ্রহ তৈরি হয়েছে। পরবর্তী অগ্রগতি এলে তা যথাসময়ে জানানো হবে।",
  ],
  en: [
    "Authorities involved in the matter are reportedly looking into it. Based on preliminary information gathered, the situation is being monitored.",
    "Officials say more detailed information may be shared in the coming days, and have assured that necessary steps will be taken.",
    "Local sources say the matter has generated public interest, and further updates will be shared as they become available.",
  ],
};

export function getArticleBody(article: Article, locale: Locale = "bn"): string[] {
  const lead =
    locale === "en"
      ? article.excerptEn || article.titleEn
      : article.excerpt || article.title;
  return [lead, ...GENERIC_BODY_PARAGRAPHS[locale]];
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
