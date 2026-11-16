/**
 * Dhaka, split into four parts.
 *
 * A single "ঢাকা" entry was too coarse for the directories: a reader in
 * Uttara looking for a blood donor does not want one in Keraniganj. Dhaka is
 * therefore offered everywhere as four districts — north, south, east and
 * west — and the areas listed under each tell people which one they are in.
 *
 * Areas were placed from their map position (OpenStreetMap coordinates,
 * bearing from Kawran Bazar at the centre of the city), with the boundaries
 * following the usual way the city is spoken of: Mirpur goes west with
 * Mohammadpur, not north with Uttara; Tejgaon–Farmgate sit with the north
 * (Dhaka North City Corporation); old Dhaka is south. The outer upazilas of
 * Dhaka district are included so that nobody there is left without a choice.
 *
 * The slugs are stored in the database (District.slug) — do not rename them.
 */

export interface DhakaArea {
  bn: string;
  en: string;
}

export interface DhakaZone {
  slug: string;
  name: string;
  nameEn: string;
  /** A few names everyone knows, shown beside the zone in pickers. */
  landmarks: DhakaArea[];
  /** Everything in this part, shown once the zone is picked. */
  areas: DhakaArea[];
}

const a = (bn: string, en: string): DhakaArea => ({ bn, en });

export const DHAKA_ZONES: DhakaZone[] = [
  {
    slug: "dhaka-north",
    name: "ঢাকা উত্তর",
    nameEn: "Dhaka North",
    landmarks: [a("উত্তরা", "Uttara"), a("গুলশান", "Gulshan"), a("বনানী", "Banani")],
    areas: [
      a("উত্তরা", "Uttara"),
      a("তুরাগ", "Turag"),
      a("দক্ষিণখান", "Dakshinkhan"),
      a("উত্তরখান", "Uttarkhan"),
      a("বিমানবন্দর", "Airport"),
      a("খিলক্ষেত", "Khilkhet"),
      a("নিকুঞ্জ", "Nikunja"),
      a("বসুন্ধরা", "Bashundhara"),
      a("ভাটারা", "Vatara"),
      a("বারিধারা", "Baridhara"),
      a("গুলশান", "Gulshan"),
      a("বনানী", "Banani"),
      a("ক্যান্টনমেন্ট", "Cantonment"),
      a("মহাখালী", "Mohakhali"),
      a("তেজগাঁও", "Tejgaon"),
      a("তেজগাঁও শিল্পাঞ্চল", "Tejgaon Industrial Area"),
      a("ফার্মগেট", "Farmgate"),
      a("কারওয়ান বাজার", "Kawran Bazar"),
    ],
  },
  {
    slug: "dhaka-south",
    name: "ঢাকা দক্ষিণ",
    nameEn: "Dhaka South",
    landmarks: [a("মতিঝিল", "Motijheel"), a("পুরান ঢাকা", "Old Dhaka"), a("যাত্রাবাড়ী", "Jatrabari")],
    areas: [
      a("মতিঝিল", "Motijheel"),
      a("পল্টন", "Paltan"),
      a("রমনা", "Ramna"),
      a("কাকরাইল", "Kakrail"),
      a("শাহবাগ", "Shahbag"),
      a("নিউমার্কেট", "New Market"),
      a("আজিমপুর", "Azimpur"),
      a("লালবাগ", "Lalbagh"),
      a("চকবাজার", "Chawkbazar"),
      a("বংশাল", "Bangshal"),
      a("কোতোয়ালি", "Kotwali"),
      a("সূত্রাপুর", "Sutrapur"),
      a("ওয়ারী", "Wari"),
      a("গেন্ডারিয়া", "Gendaria"),
      a("যাত্রাবাড়ী", "Jatrabari"),
      a("কদমতলী", "Kadamtali"),
      a("শ্যামপুর", "Shyampur"),
      a("কামরাঙ্গীরচর", "Kamrangirchar"),
      a("কেরানীগঞ্জ", "Keraniganj"),
    ],
  },
  {
    slug: "dhaka-east",
    name: "ঢাকা পূর্ব",
    nameEn: "Dhaka East",
    landmarks: [a("বাড্ডা", "Badda"), a("রামপুরা", "Rampura"), a("খিলগাঁও", "Khilgaon")],
    areas: [
      a("বাড্ডা", "Badda"),
      a("রামপুরা", "Rampura"),
      a("বনশ্রী", "Banasree"),
      a("আফতাবনগর", "Aftabnagar"),
      a("বেরাইদ", "Beraid"),
      a("হাতিরঝিল", "Hatirjheel"),
      a("মগবাজার", "Moghbazar"),
      a("মালিবাগ", "Malibagh"),
      a("শান্তিনগর", "Shantinagar"),
      a("খিলগাঁও", "Khilgaon"),
      a("বাসাবো", "Basabo"),
      a("সবুজবাগ", "Sabujbagh"),
      a("মুগদা", "Mugda"),
      a("শাহজাহানপুর", "Shahjahanpur"),
      a("ডেমরা", "Demra"),
    ],
  },
  {
    slug: "dhaka-west",
    name: "ঢাকা পশ্চিম",
    nameEn: "Dhaka West",
    landmarks: [a("মিরপুর", "Mirpur"), a("মোহাম্মদপুর", "Mohammadpur"), a("ধানমন্ডি", "Dhanmondi")],
    areas: [
      a("মিরপুর", "Mirpur"),
      a("পল্লবী", "Pallabi"),
      a("কাফরুল", "Kafrul"),
      a("শাহ আলী", "Shah Ali"),
      a("রূপনগর", "Rupnagar"),
      a("দারুস সালাম", "Darus Salam"),
      a("ভাষানটেক", "Bhashantek"),
      a("আগারগাঁও", "Agargaon"),
      a("শেরেবাংলা নগর", "Sher-e-Bangla Nagar"),
      a("শ্যামলী", "Shyamoli"),
      a("আদাবর", "Adabor"),
      a("মোহাম্মদপুর", "Mohammadpur"),
      a("লালমাটিয়া", "Lalmatia"),
      a("গাবতলী", "Gabtoli"),
      a("ধানমন্ডি", "Dhanmondi"),
      a("কলাবাগান", "Kalabagan"),
      a("জিগাতলা", "Jigatola"),
      a("হাজারীবাগ", "Hazaribagh"),
      a("সাভার", "Savar"),
      a("আশুলিয়া", "Ashulia"),
      a("ধামরাই", "Dhamrai"),
      a("দোহার", "Dohar"),
      a("নবাবগঞ্জ", "Nawabganj"),
    ],
  },
];

/**
 * "All of Dhaka", for the directory filters only: someone browsing donors may
 * well want the whole city. Never offered where a listing is being entered —
 * a listing belongs to one part.
 */
export const DHAKA_ALL = {
  slug: "dhaka",
  name: "ঢাকা (সব অংশ)",
  nameEn: "Dhaka (all parts)",
  division: "dhaka",
};

export function dhakaZone(slug: string | null | undefined): DhakaZone | undefined {
  return slug ? DHAKA_ZONES.find((z) => z.slug === slug) : undefined;
}

/** "ঢাকা উত্তর — উত্তরা, গুলশান, বনানী…" for a zone; the plain name otherwise. */
export function districtOptionLabel(
  d: { slug: string; name: string; nameEn?: string | null },
  locale: "bn" | "en",
): string {
  const name = locale === "en" ? d.nameEn || d.name : d.name;
  const z = dhakaZone(d.slug);
  if (!z) return name;
  const marks = z.landmarks.map((m) => (locale === "en" ? m.en : m.bn)).join(", ");
  return `${name} — ${marks}…`;
}
