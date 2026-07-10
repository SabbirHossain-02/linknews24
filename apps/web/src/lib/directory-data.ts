// Helpline-style directories (lawyers by district, blood donors by group).
// All data is deterministic mock data — real listings come later via the CMS.

export interface Division {
  slug: string;
  name: string;
  nameEn: string;
}

export interface District {
  slug: string;
  name: string;
  nameEn: string;
  division: string; // division slug
}

export const divisions: Division[] = [
  { slug: "dhaka", name: "ঢাকা", nameEn: "Dhaka" },
  { slug: "chattogram", name: "চট্টগ্রাম", nameEn: "Chattogram" },
  { slug: "rajshahi", name: "রাজশাহী", nameEn: "Rajshahi" },
  { slug: "khulna", name: "খুলনা", nameEn: "Khulna" },
  { slug: "barishal", name: "বরিশাল", nameEn: "Barishal" },
  { slug: "sylhet", name: "সিলেট", nameEn: "Sylhet" },
  { slug: "rangpur", name: "রংপুর", nameEn: "Rangpur" },
  { slug: "mymensingh", name: "ময়মনসিংহ", nameEn: "Mymensingh" },
];

export const districts: District[] = [
  // Dhaka
  { slug: "dhaka", name: "ঢাকা", nameEn: "Dhaka", division: "dhaka" },
  { slug: "faridpur", name: "ফরিদপুর", nameEn: "Faridpur", division: "dhaka" },
  { slug: "gazipur", name: "গাজীপুর", nameEn: "Gazipur", division: "dhaka" },
  { slug: "gopalganj", name: "গোপালগঞ্জ", nameEn: "Gopalganj", division: "dhaka" },
  { slug: "kishoreganj", name: "কিশোরগঞ্জ", nameEn: "Kishoreganj", division: "dhaka" },
  { slug: "madaripur", name: "মাদারীপুর", nameEn: "Madaripur", division: "dhaka" },
  { slug: "manikganj", name: "মানিকগঞ্জ", nameEn: "Manikganj", division: "dhaka" },
  { slug: "munshiganj", name: "মুন্সিগঞ্জ", nameEn: "Munshiganj", division: "dhaka" },
  { slug: "narayanganj", name: "নারায়ণগঞ্জ", nameEn: "Narayanganj", division: "dhaka" },
  { slug: "narsingdi", name: "নরসিংদী", nameEn: "Narsingdi", division: "dhaka" },
  { slug: "rajbari", name: "রাজবাড়ী", nameEn: "Rajbari", division: "dhaka" },
  { slug: "shariatpur", name: "শরীয়তপুর", nameEn: "Shariatpur", division: "dhaka" },
  { slug: "tangail", name: "টাঙ্গাইল", nameEn: "Tangail", division: "dhaka" },
  // Chattogram
  { slug: "bandarban", name: "বান্দরবান", nameEn: "Bandarban", division: "chattogram" },
  { slug: "brahmanbaria", name: "ব্রাহ্মণবাড়িয়া", nameEn: "Brahmanbaria", division: "chattogram" },
  { slug: "chandpur", name: "চাঁদপুর", nameEn: "Chandpur", division: "chattogram" },
  { slug: "chattogram", name: "চট্টগ্রাম", nameEn: "Chattogram", division: "chattogram" },
  { slug: "cumilla", name: "কুমিল্লা", nameEn: "Cumilla", division: "chattogram" },
  { slug: "coxs-bazar", name: "কক্সবাজার", nameEn: "Cox's Bazar", division: "chattogram" },
  { slug: "feni", name: "ফেনী", nameEn: "Feni", division: "chattogram" },
  { slug: "khagrachhari", name: "খাগড়াছড়ি", nameEn: "Khagrachhari", division: "chattogram" },
  { slug: "lakshmipur", name: "লক্ষ্মীপুর", nameEn: "Lakshmipur", division: "chattogram" },
  { slug: "noakhali", name: "নোয়াখালী", nameEn: "Noakhali", division: "chattogram" },
  { slug: "rangamati", name: "রাঙ্গামাটি", nameEn: "Rangamati", division: "chattogram" },
  // Rajshahi
  { slug: "bogura", name: "বগুড়া", nameEn: "Bogura", division: "rajshahi" },
  { slug: "chapainawabganj", name: "চাঁপাইনবাবগঞ্জ", nameEn: "Chapainawabganj", division: "rajshahi" },
  { slug: "joypurhat", name: "জয়পুরহাট", nameEn: "Joypurhat", division: "rajshahi" },
  { slug: "naogaon", name: "নওগাঁ", nameEn: "Naogaon", division: "rajshahi" },
  { slug: "natore", name: "নাটোর", nameEn: "Natore", division: "rajshahi" },
  { slug: "pabna", name: "পাবনা", nameEn: "Pabna", division: "rajshahi" },
  { slug: "rajshahi", name: "রাজশাহী", nameEn: "Rajshahi", division: "rajshahi" },
  { slug: "sirajganj", name: "সিরাজগঞ্জ", nameEn: "Sirajganj", division: "rajshahi" },
  // Khulna
  { slug: "bagerhat", name: "বাগেরহাট", nameEn: "Bagerhat", division: "khulna" },
  { slug: "chuadanga", name: "চুয়াডাঙ্গা", nameEn: "Chuadanga", division: "khulna" },
  { slug: "jashore", name: "যশোর", nameEn: "Jashore", division: "khulna" },
  { slug: "jhenaidah", name: "ঝিনাইদহ", nameEn: "Jhenaidah", division: "khulna" },
  { slug: "khulna", name: "খুলনা", nameEn: "Khulna", division: "khulna" },
  { slug: "kushtia", name: "কুষ্টিয়া", nameEn: "Kushtia", division: "khulna" },
  { slug: "magura", name: "মাগুরা", nameEn: "Magura", division: "khulna" },
  { slug: "meherpur", name: "মেহেরপুর", nameEn: "Meherpur", division: "khulna" },
  { slug: "narail", name: "নড়াইল", nameEn: "Narail", division: "khulna" },
  { slug: "satkhira", name: "সাতক্ষীরা", nameEn: "Satkhira", division: "khulna" },
  // Barishal
  { slug: "barguna", name: "বরগুনা", nameEn: "Barguna", division: "barishal" },
  { slug: "barishal", name: "বরিশাল", nameEn: "Barishal", division: "barishal" },
  { slug: "bhola", name: "ভোলা", nameEn: "Bhola", division: "barishal" },
  { slug: "jhalokati", name: "ঝালকাঠি", nameEn: "Jhalokati", division: "barishal" },
  { slug: "patuakhali", name: "পটুয়াখালী", nameEn: "Patuakhali", division: "barishal" },
  { slug: "pirojpur", name: "পিরোজপুর", nameEn: "Pirojpur", division: "barishal" },
  // Sylhet
  { slug: "habiganj", name: "হবিগঞ্জ", nameEn: "Habiganj", division: "sylhet" },
  { slug: "moulvibazar", name: "মৌলভীবাজার", nameEn: "Moulvibazar", division: "sylhet" },
  { slug: "sunamganj", name: "সুনামগঞ্জ", nameEn: "Sunamganj", division: "sylhet" },
  { slug: "sylhet", name: "সিলেট", nameEn: "Sylhet", division: "sylhet" },
  // Rangpur
  { slug: "dinajpur", name: "দিনাজপুর", nameEn: "Dinajpur", division: "rangpur" },
  { slug: "gaibandha", name: "গাইবান্ধা", nameEn: "Gaibandha", division: "rangpur" },
  { slug: "kurigram", name: "কুড়িগ্রাম", nameEn: "Kurigram", division: "rangpur" },
  { slug: "lalmonirhat", name: "লালমনিরহাট", nameEn: "Lalmonirhat", division: "rangpur" },
  { slug: "nilphamari", name: "নীলফামারী", nameEn: "Nilphamari", division: "rangpur" },
  { slug: "panchagarh", name: "পঞ্চগড়", nameEn: "Panchagarh", division: "rangpur" },
  { slug: "rangpur", name: "রংপুর", nameEn: "Rangpur", division: "rangpur" },
  { slug: "thakurgaon", name: "ঠাকুরগাঁও", nameEn: "Thakurgaon", division: "rangpur" },
  // Mymensingh
  { slug: "jamalpur", name: "জামালপুর", nameEn: "Jamalpur", division: "mymensingh" },
  { slug: "mymensingh", name: "ময়মনসিংহ", nameEn: "Mymensingh", division: "mymensingh" },
  { slug: "netrokona", name: "নেত্রকোণা", nameEn: "Netrokona", division: "mymensingh" },
  { slug: "sherpur", name: "শেরপুর", nameEn: "Sherpur", division: "mymensingh" },
];

export interface BloodGroup {
  slug: string;
  label: string;
}

export const bloodGroups: BloodGroup[] = [
  { slug: "a-positive", label: "A+" },
  { slug: "a-negative", label: "A−" },
  { slug: "b-positive", label: "B+" },
  { slug: "b-negative", label: "B−" },
  { slug: "o-positive", label: "O+" },
  { slug: "o-negative", label: "O−" },
  { slug: "ab-positive", label: "AB+" },
  { slug: "ab-negative", label: "AB−" },
];

// --- Bilingual name pool for deterministic mock generation ---

const names: { bn: string; en: string }[] = [
  { bn: "মোহাম্মদ রফিকুল ইসলাম", en: "Mohammad Rafiqul Islam" },
  { bn: "আবদুল করিম", en: "Abdul Karim" },
  { bn: "শাহেদা বেগম", en: "Shaheda Begum" },
  { bn: "মোঃ জসিম উদ্দিন", en: "Md. Jashim Uddin" },
  { bn: "নাসরিন আক্তার", en: "Nasrin Akhter" },
  { bn: "তানভীর হাসান", en: "Tanvir Hasan" },
  { bn: "ফারুক আহমেদ", en: "Faruk Ahmed" },
  { bn: "সুমন মিয়া", en: "Suman Mia" },
  { bn: "রেহানা পারভীন", en: "Rehana Parvin" },
  { bn: "আনিসুর রহমান", en: "Anisur Rahman" },
  { bn: "মিজানুর রহমান", en: "Mizanur Rahman" },
  { bn: "সেলিনা হক", en: "Selina Haque" },
  { bn: "কামরুল হাসান", en: "Kamrul Hasan" },
  { bn: "শাহনাজ সুলতানা", en: "Shahnaz Sultana" },
  { bn: "আরিফুল ইসলাম", en: "Ariful Islam" },
  { bn: "দেলোয়ার হোসেন", en: "Delwar Hossain" },
  { bn: "নুসরাত জাহান", en: "Nusrat Jahan" },
  { bn: "হাবিবুর রহমান", en: "Habibur Rahman" },
  { bn: "মাহমুদা খাতুন", en: "Mahmuda Khatun" },
  { bn: "শফিকুল আলম", en: "Shafiqul Alam" },
  { bn: "রুবেল মাহমুদ", en: "Rubel Mahmud" },
  { bn: "তাহমিনা আক্তার", en: "Tahmina Akhter" },
  { bn: "জাহিদ হাসান", en: "Zahid Hasan" },
  { bn: "সাদিয়া ইসলাম", en: "Sadia Islam" },
];

const specializations: { bn: string; en: string }[] = [
  { bn: "ফৌজদারি", en: "Criminal" },
  { bn: "দেওয়ানি", en: "Civil" },
  { bn: "পারিবারিক", en: "Family" },
  { bn: "ভূমি আইন", en: "Land" },
  { bn: "কোম্পানি আইন", en: "Corporate" },
  { bn: "সাংবিধানিক", en: "Constitutional" },
  { bn: "শ্রম আইন", en: "Labour" },
];

function makePhone(seed: number): string {
  const tail = String(300000000 + (Math.abs(seed * 9301 + 49297) % 699999999)).padStart(
    9,
    "0",
  );
  return "01" + tail;
}

export interface Lawyer {
  nameBn: string;
  nameEn: string;
  specBn: string;
  specEn: string;
  phone: string;
}

export interface Donor {
  nameBn: string;
  nameEn: string;
  districtBn: string;
  districtEn: string;
  phone: string;
  months: number;
}

export function getDistrict(slug: string): District | undefined {
  return districts.find((d) => d.slug === slug);
}

export function getBloodGroup(slug: string): BloodGroup | undefined {
  return bloodGroups.find((g) => g.slug === slug);
}

export function getLawyersByDistrict(slug: string): Lawyer[] {
  const index = districts.findIndex((d) => d.slug === slug);
  if (index < 0) return [];
  const count = 8 + (index % 5);
  return Array.from({ length: count }, (_, i) => {
    const person = names[(index * 3 + i) % names.length];
    const spec = specializations[i % specializations.length];
    return {
      nameBn: person.bn,
      nameEn: person.en,
      specBn: spec.bn,
      specEn: spec.en,
      phone: makePhone(index * 137 + i + 11),
    };
  });
}

export function getDonorsByGroup(slug: string): Donor[] {
  const index = bloodGroups.findIndex((g) => g.slug === slug);
  if (index < 0) return [];
  const count = 12 + (index % 4);
  return Array.from({ length: count }, (_, i) => {
    const person = names[(index * 5 + i) % names.length];
    const district = districts[(index * 7 + i * 3) % districts.length];
    return {
      nameBn: person.bn,
      nameEn: person.en,
      districtBn: district.name,
      districtEn: district.nameEn,
      phone: makePhone(index * 911 + i + 5),
      months: ((i * 3 + index) % 11) + 1,
    };
  });
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{5})(\d{6})/, "$1-$2");
}
