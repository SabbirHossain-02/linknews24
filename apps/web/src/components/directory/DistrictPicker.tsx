"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { districts } from "@/lib/directory-data";
import { dhakaZone, districtOptionLabel } from "@/lib/dhaka-zones";

/**
 * Under a district picker: once one of Dhaka's four parts is chosen, the
 * areas it covers, so people can check they picked the right one.
 */
export function DhakaZoneHint({ slug }: { slug: string | null | undefined }) {
  const { locale } = useLocale();
  const zone = dhakaZone(slug);
  if (!zone) return null;
  const en = locale === "en";
  return (
    <p className="mt-1 flex gap-1.5 font-ui text-[11px] leading-snug text-foreground-muted">
      <MapPin className="mt-px h-3 w-3 shrink-0 text-brand-crimson" />
      <span>
        <b className="font-semibold text-foreground">
          {en ? `${zone.nameEn} covers:` : `${zone.name}-এর এলাকা:`}
        </b>{" "}
        {zone.areas.map((x) => (en ? x.en : x.bn)).join(", ")}
      </span>
    </p>
  );
}

/**
 * The district <select> for reader-submitted listings. A form field (it
 * posts the district slug as `name`), with Dhaka's parts labelled by the
 * areas they cover.
 */
export function DistrictPicker({
  name,
  defaultValue,
  placeholder,
  className,
  required,
}: {
  name: string;
  defaultValue?: string;
  placeholder: string;
  className?: string;
  required?: boolean;
}) {
  const { locale } = useLocale();
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <>
      <select
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={className}
      >
        <option value="">{placeholder}</option>
        {districts.map((d) => (
          <option key={d.slug} value={d.slug}>
            {districtOptionLabel(d, locale)}
          </option>
        ))}
      </select>
      <DhakaZoneHint slug={value} />
    </>
  );
}
