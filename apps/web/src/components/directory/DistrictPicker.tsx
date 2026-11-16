"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { districts } from "@/lib/directory-data";
import { districtOptions, pickedDistrict } from "@/lib/dhaka-zones";

/**
 * The district <select> for reader-submitted listings. Dhaka's four parts
 * are followed by their areas, one per row; picking an area files the
 * listing under its part. The form receives the district slug as `name`
 * through a hidden field, since the visible value may be an area row.
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
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={className}
      >
        <option value="">{placeholder}</option>
        {districtOptions(districts, locale, (d) => d.slug).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input type="hidden" name={name} value={pickedDistrict(value)} />
    </>
  );
}
