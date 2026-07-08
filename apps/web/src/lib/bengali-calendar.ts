const BENGALI_MONTHS = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumeral(value: number): string {
  return String(value)
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? BENGALI_DIGITS[Number(ch)] : ch))
    .join("");
}

function bengaliOrdinalSuffix(day: number): string {
  if (day === 1) return "লা";
  if (day === 2 || day === 3) return "রা";
  if (day === 4) return "ঠা";
  if (day >= 5 && day <= 18) return "ই";
  return "শে";
}

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Fixed-date Bengali calendar (Bangladesh, 2019 reform): Poyla Boishakh is
 * always April 14, and Falgun absorbs the leap-day adjustment instead.
 */
export function toBengaliDate(date: Date): {
  day: number;
  month: string;
  year: number;
} {
  const gYear = date.getFullYear();
  const newYearThisGYear = new Date(gYear, 3, 14);

  let bengaliYear: number;
  let epochStart: Date;
  if (date.getTime() >= newYearThisGYear.getTime()) {
    bengaliYear = gYear - 593;
    epochStart = newYearThisGYear;
  } else {
    bengaliYear = gYear - 594;
    epochStart = new Date(gYear - 1, 3, 14);
  }

  const falgunGregorianYear = epochStart.getFullYear() + 1;
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
  monthLengths[10] = isGregorianLeapYear(falgunGregorianYear) ? 31 : 30;

  let daysSinceNewYear = Math.floor(
    (date.getTime() - epochStart.getTime()) / 86400000,
  );
  let monthIndex = 0;
  while (daysSinceNewYear >= monthLengths[monthIndex]) {
    daysSinceNewYear -= monthLengths[monthIndex];
    monthIndex++;
  }

  return {
    day: daysSinceNewYear + 1,
    month: BENGALI_MONTHS[monthIndex],
    year: bengaliYear,
  };
}

export function formatBengaliDate(date: Date): string {
  const { day, month, year } = toBengaliDate(date);
  return `${toBengaliNumeral(day)}${bengaliOrdinalSuffix(day)} ${month} ${toBengaliNumeral(year)} বঙ্গাব্দ`;
}
