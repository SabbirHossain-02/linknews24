/**
 * Bangladeshi news glossary for Bangla → English machine translation.
 *
 * A general-purpose translation engine gets everyday Bangla right but reliably
 * mangles the vocabulary that matters most in a newsroom: legal status words,
 * administrative titles, and the South Asian number scale. Some of those
 * mistakes are not cosmetic — rendering "অভিযুক্ত" as "guilty" is a libel risk.
 *
 * Rather than trusting the engine, each entry declares the wrong English the
 * engine tends to produce, and we correct it **only when the Bangla source
 * sentence actually contained that term** and no conflicting term. That keeps a
 * genuine "arrested" (from গ্রেপ্তার) intact while fixing a wrong "arrested"
 * that came from আটক.
 */

export interface GlossaryEntry {
  /** Bangla term that must appear in the source sentence for this to apply. */
  bn: string[];
  /** The English wording LinkNews24 wants. */
  en: string;
  /** Wrong English the engine commonly emits for `bn`. */
  wrong: string[];
  /**
   * Bangla terms that, if also present, make the correction ambiguous —
   * the sentence is left alone rather than risk a wrong "fix".
   */
  conflicts?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  // --- Legal status: the highest-risk group ---
  {
    bn: ["আটক"],
    en: "detained",
    wrong: ["arrested", "apprehended", "captured"],
    conflicts: ["গ্রেপ্তার", "গ্রেফতার"],
  },
  {
    bn: ["গ্রেপ্তার", "গ্রেফতার"],
    en: "arrested",
    wrong: ["detained", "caught"],
    conflicts: ["আটক"],
  },
  {
    bn: ["অভিযুক্ত"],
    en: "accused",
    wrong: ["guilty", "convict", "convicted", "culprit"],
    conflicts: ["দোষী"],
  },
  {
    bn: ["দোষী সাব্যস্ত"],
    en: "convicted",
    wrong: ["accused", "guilty person"],
  },
  {
    bn: ["সন্দেহভাজন"],
    en: "suspect",
    wrong: ["accused", "criminal"],
  },
  {
    bn: ["রিমান্ড"],
    en: "remand",
    wrong: ["custody hearing"],
  },
  {
    bn: ["জামিন"],
    en: "bail",
    wrong: ["guarantee", "surety"],
  },
  {
    bn: ["মামলা"],
    en: "case",
    wrong: ["lawsuit filed", "litigation"],
  },
  {
    bn: ["এজাহার"],
    en: "First Information Report (FIR)",
    wrong: ["complaint letter", "statement"],
  },

  // --- Numbers: South Asian scale, kept as-is in Bangladeshi English ---
  {
    bn: ["কোটি"],
    en: "crore",
    wrong: ["10 million", "ten million", "million"],
  },
  {
    bn: ["লাখ", "লক্ষ"],
    en: "lakh",
    wrong: ["100 thousand", "hundred thousand", "0.1 million"],
  },
  {
    bn: ["হাজার"],
    en: "thousand",
    wrong: ["k"],
  },

  // --- Administration: titles a generic engine has never seen ---
  {
    bn: ["ইউএনও", "উপজেলা নির্বাহী অফিসার"],
    en: "Upazila Nirbahi Officer (UNO)",
    wrong: ["UNO", "United Nations Organization", "U.N.O."],
  },
  {
    bn: ["ওসি", "অফিসার ইনচার্জ"],
    en: "Officer-in-Charge (OC)",
    wrong: ["OC", "officer in charge of"],
  },
  {
    bn: ["জেলা প্রশাসক", "ডিসি"],
    en: "Deputy Commissioner (DC)",
    wrong: ["district administrator", "DC", "district commissioner"],
  },
  {
    bn: ["উপজেলা"],
    en: "upazila",
    wrong: ["sub-district", "subdistrict", "sub district"],
  },
  {
    bn: ["ইউনিয়ন পরিষদ"],
    en: "union parishad",
    wrong: ["union council", "union committee"],
  },
  {
    bn: ["পৌরসভা"],
    en: "municipality",
    wrong: ["town council"],
  },
  {
    bn: ["সিটি করপোরেশন", "সিটি কর্পোরেশন"],
    en: "city corporation",
    wrong: ["city council"],
  },
  {
    bn: ["থানা"],
    en: "police station",
    wrong: ["thana", "precinct"],
  },
  {
    bn: ["সচিবালয়"],
    en: "Secretariat",
    wrong: ["secretary office", "secretariat building"],
  },

  // --- Institutions and parties: proper nouns, never translate literally ---
  {
    bn: ["আওয়ামী লীগ"],
    en: "Awami League",
    wrong: ["Awami Alliance", "People's League", "Awami party"],
  },
  {
    bn: ["বিএনপি", "বাংলাদেশ জাতীয়তাবাদী দল"],
    en: "BNP",
    wrong: ["Bangladesh Nationalist Party BNP", "B.N.P."],
  },
  {
    bn: ["জাতীয় সংসদ"],
    en: "Jatiya Sangsad (national parliament)",
    wrong: ["National Assembly", "national council"],
  },
  {
    bn: ["নির্বাচন কমিশন"],
    en: "Election Commission",
    wrong: ["electoral commission"],
  },
  {
    bn: ["হাইকোর্ট"],
    en: "High Court",
    wrong: ["high court division", "supreme court"],
  },
  {
    bn: ["র‍্যাব", "র‌্যাব"],
    en: "RAB",
    wrong: ["Rab", "rab"],
  },
  {
    bn: ["বিজিবি"],
    en: "BGB",
    wrong: ["Bangladesh border guard"],
  },
  {
    bn: ["টাকা"],
    en: "Tk",
    wrong: ["taka rupees", "rupees"],
  },
];

/** Bengali digits ০-৯ → Latin 0-9. */
export function bengaliDigitsToLatin(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Applies the glossary to one translated sentence, using the Bangla source to
 * decide which corrections are safe.
 *
 * Only entries whose Bangla term appears in `source` are considered, and an
 * entry is skipped when a conflicting Bangla term is also present — with both
 * আটক and গ্রেপ্তার in one sentence there is no way to tell which English word
 * came from which, so nothing is touched.
 */
export function applyGlossary(source: string, translated: string): string {
  let result = translated;

  for (const entry of GLOSSARY) {
    const present = entry.bn.some((term) => source.includes(term));
    if (!present) continue;

    const conflicted = entry.conflicts?.some((term) => source.includes(term));
    if (conflicted) continue;

    // Longest first, so "100 thousand" is replaced before "thousand".
    const wrongs = [...entry.wrong].sort((a, b) => b.length - a.length);
    for (const wrong of wrongs) {
      if (wrong.toLowerCase() === entry.en.toLowerCase()) continue;
      const pattern = new RegExp(`\\b${escapeRegExp(wrong)}\\b`, "gi");
      result = result.replace(pattern, entry.en);
    }
  }

  return result;
}
